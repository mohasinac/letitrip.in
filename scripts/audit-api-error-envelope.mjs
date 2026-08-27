#!/usr/bin/env node
/**
 * audit-api-error-envelope.mjs — producer/consumer parity for the HTTP error
 * body. Strict-zero, both directions, no suppression marker.
 *
 * WHY
 * ---
 * Four independent producers emitted an error body, and `ApiClientError` read
 * three keys off it. Nobody checked that those two sets matched, and they did
 * not: `api-response.ts` emitted `details` (which nothing read) while
 * `code`/`issues`/`requestId` (which everything read) were never emitted.
 *
 * The failure was silent and app-wide. On every `createApiHandler` route a Zod
 * rejection reached the user as a bare "Validation failed" with no field name,
 * `surfaceError` could never take its ERROR_DISPLAY_MAP branch, and
 * `applyZodIssues(err.issues, …)` was dead code. Found 2026-08-27 from a
 * profile page showing three identical banners.
 *
 * A key that no consumer reads is dead weight on the wire; a key a consumer
 * reads that some producer never emits is a feature that works on some routes
 * and silently does not on others. Both fail here.
 *
 * NOT folded into audit-server-action-envelope.mjs on purpose: that audit is
 * designed to START failing once `success` can be dropped, i.e. it
 * self-terminates. Mixing a permanent bidirectional rule into a
 * self-terminating one would make both unreadable.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Closed registry. A new producer is added HERE, with a reason — that edit is
 *  reviewable source, which is why this audit needs no suppression comment. */
const PRODUCERS = [
  { file: "appkit/src/errors/error-envelope.ts", fn: "buildErrorEnvelope", why: "the definition" },
  { file: "appkit/src/next/api/api-response.ts", fn: "errorResponse", why: "createApiHandler routes + ApiErrors.*" },
  { file: "appkit/src/next/api/routeHandler.ts", fn: "errorJson", why: "createRouteHandler routes" },
  { file: "appkit/src/errors/error-handler.ts", fn: "handleApiError", why: "thrown-error catch blocks" },
];

const CONSUMER = {
  file: "appkit/src/http/ApiClient.ts",
  cls: "ApiClientError",
};

/** Keys that are pure transport/discriminator and need no reader. */
const TRANSPORT_KEYS = new Set(["ok", "success", "error", "data"]);

// ---------------------------------------------------------------------------

/** Blank out comments and string bodies, preserving offsets and line count. */
function stripComments(src) {
  let out = "";
  let str = null, inLine = false, inBlock = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === "\n") { inLine = false; out += c; } else out += " "; continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; out += "  "; i++; } else out += c === "\n" ? c : " "; continue; }
    if (str) { out += c; if (c === "\\") { out += src[++i] ?? ""; continue; } if (c === str) str = null; continue; }
    if (c === "/" && n === "/") { inLine = true; out += "  "; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; out += "  "; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; out += c; continue; }
    out += c;
  }
  return out;
}

function bracketSpan(src, openIdx) {
  const open = src[openIdx];
  const close = open === "(" ? ")" : open === "{" ? "}" : null;
  if (!close) return null;
  let depth = 0, str = null, inLine = false, inBlock = false;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === "\n") inLine = false; continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; i++; } continue; }
    if (str) { if (c === "\\") { i++; continue; } if (c === str) str = null; continue; }
    if (c === "/" && n === "/") { inLine = true; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return { start: openIdx, end: i }; }
  }
  return null;
}

/** Top-level keys of an object literal, including `...(x ? { k } : {})` forms. */
function topLevelKeys(objSrc) {
  const keys = new Set();
  let depth = 0, str = null, inLine = false, inBlock = false;
  for (let i = 0; i < objSrc.length; i++) {
    const c = objSrc[i], n = objSrc[i + 1];
    if (inLine) { if (c === "\n") inLine = false; continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; i++; } continue; }
    if (str) { if (c === "\\") { i++; continue; } if (c === str) str = null; continue; }
    if (c === "/" && n === "/") { inLine = true; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "{" || c === "(" || c === "[") { depth++; continue; }
    if (c === "}" || c === ")" || c === "]") { depth--; continue; }
    // A key at depth 1 (inside the outer brace) followed by a colon.
    if (depth === 1 && /[A-Za-z_$]/.test(c)) {
      const m = /^([A-Za-z_$][\w$]*)\s*:/.exec(objSrc.slice(i));
      if (m) { keys.add(m[1]); i += m[0].length - 1; }
    }
  }
  // Spread-conditional keys live one level deeper: `...(x ? { k: v } : {})`.
  for (const m of objSrc.matchAll(/\.\.\.\([^)]*\?\s*\{\s*([A-Za-z_$][\w$]*)\s*[:,}]/g)) keys.add(m[1]);
  for (const m of objSrc.matchAll(/\.\.\.\([^)]*&&\s*\{\s*([A-Za-z_$][\w$]*)\s*[:,}]/g)) keys.add(m[1]);
  return keys;
}

function producerKeys(file, fn) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) return { missing: true, keys: new Set() };
  const src = readFileSync(abs, "utf8");
  const decl = new RegExp(`function\\s+${fn}\\b|(?:const|export const)\\s+${fn}\\s*[=:]`);
  const m = decl.exec(src);
  if (!m) return { missing: true, keys: new Set() };
  // Body of the function: the first `{` after its parameter list.
  const parenIdx = src.indexOf("(", m.index);
  const params = bracketSpan(src, parenIdx);
  const bodyOpen = src.indexOf("{", params ? params.end : m.index);
  const body = bracketSpan(src, bodyOpen);
  const bodySrc = body ? src.slice(body.start, body.end + 1) : "";

  const keys = new Set();
  // A producer that delegates to buildErrorEnvelope inherits the wire shape
  // from it. Its own literal is that function's INPUT (`{ message, status }`),
  // not the body — reading it would flag `message` as an unread wire key.
  if (/\bbuildErrorEnvelope\s*\(/.test(bodySrc)) {
    return { missing: false, keys, delegates: true };
  }
  // Object literals handed to NextResponse.json( / JSON.stringify( / returned.
  for (const call of bodySrc.matchAll(/(?:NextResponse\.json|JSON\.stringify)\s*\(/g)) {
    const sp = bracketSpan(bodySrc, call.index + call[0].length - 1);
    if (!sp) continue;
    const argSrc = bodySrc.slice(sp.start, sp.end + 1);
    const objOpen = argSrc.indexOf("{");
    if (objOpen < 0) continue;
    const obj = bracketSpan(argSrc, objOpen);
    if (obj) for (const k of topLevelKeys(argSrc.slice(obj.start, obj.end + 1))) keys.add(k);
  }
  // A `return { … }` (buildErrorEnvelope's shape).
  for (const r of bodySrc.matchAll(/return\s*\{/g)) {
    const obj = bracketSpan(bodySrc, r.index + r[0].length - 1);
    if (obj) for (const k of topLevelKeys(bodySrc.slice(obj.start, obj.end + 1))) keys.add(k);
  }
  // Delegation: a producer that calls buildErrorEnvelope inherits its keys.
  const delegates = /\bbuildErrorEnvelope\s*\(/.test(bodySrc);
  return { missing: false, keys, delegates };
}

function consumerKeys() {
  const abs = join(ROOT, CONSUMER.file);
  const src = readFileSync(abs, "utf8");
  const clsIdx = src.indexOf(`class ${CONSUMER.cls}`);
  if (clsIdx < 0) return { missing: true, keys: new Set() };
  const body = bracketSpan(src, src.indexOf("{", clsIdx));
  const bodySrc = body ? src.slice(body.start, body.end + 1) : "";
  const keys = new Set();
  for (const m of bodySrc.matchAll(/\bbody\s*(?:\?\.|\.)\s*([A-Za-z_$][\w$]*)/g)) keys.add(m[1]);
  return { missing: false, keys };
}

// ---------------------------------------------------------------------------

const violations = [];
const consumer = consumerKeys();
if (consumer.missing) {
  violations.push({
    rule: "CONSUMER_NOT_FOUND",
    detail: `${CONSUMER.file}: class ${CONSUMER.cls} not found — this audit can no longer verify the contract.`,
  });
}

const producerResults = [];
for (const p of PRODUCERS) {
  const r = producerKeys(p.file, p.fn);
  if (r.missing) {
    violations.push({ rule: "PRODUCER_NOT_FOUND", detail: `${p.file}: ${p.fn}() not found — update the PRODUCERS registry.` });
    continue;
  }
  producerResults.push({ ...p, ...r });
}

const envelopeKeys =
  producerResults.find((p) => p.fn === "buildErrorEnvelope")?.keys ?? new Set();

for (const p of producerResults) {
  // A delegating producer inherits the definition's keys.
  const effective = p.delegates ? new Set([...p.keys, ...envelopeKeys]) : p.keys;

  for (const k of effective) {
    if (TRANSPORT_KEYS.has(k) || consumer.keys.has(k)) continue;
    violations.push({
      rule: "UNREAD_PRODUCER_KEY",
      detail: `${p.file}: ${p.fn}() emits \`${k}\`, which ${CONSUMER.cls} never reads. Dead weight on the wire.`,
    });
  }
  for (const k of consumer.keys) {
    if (effective.has(k)) continue;
    violations.push({
      rule: "UNPRODUCED_CONSUMER_KEY",
      detail: `${p.file}: ${p.fn}() never emits \`${k}\`, but ${CONSUMER.cls} reads it — the feature behind it is dead on this producer's routes.`,
    });
  }
}

// Call-site rules.
const CALLSITE_ROOTS = ["src", "appkit/src"];
function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (p.includes("node_modules") || p.includes(".next") || p.includes("__tests__")) continue;
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, out);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}
for (const root of CALLSITE_ROOTS) {
  for (const file of walkFiles(join(ROOT, root))) {
    // Comments blanked, offsets preserved: without this the NESTED_ISSUES rule
    // matched the prose in this audit's own header, which describes the very
    // `data.issues` bug it looks for.
    const src = stripComments(readFileSync(file, "utf8"));
    const rel = file.slice(ROOT.length + 1).replace(/\\/g, "/");

    // POSITIONAL_DETAILS — a third argument that is not an options object.
    for (const m of src.matchAll(/\berrorResponse\s*\(/g)) {
      const sp = bracketSpan(src, m.index + m[0].length - 1);
      if (!sp) continue;
      const args = src.slice(sp.start + 1, sp.end);
      // Split top-level commas.
      const parts = [];
      let depth = 0, last = 0, str = null;
      for (let i = 0; i < args.length; i++) {
        const c = args[i];
        if (str) { if (c === "\\") { i++; continue; } if (c === str) str = null; continue; }
        if (c === '"' || c === "'" || c === "`") { str = c; continue; }
        if ("({[".includes(c)) depth++;
        else if (")}]".includes(c)) depth--;
        else if (c === "," && depth === 0) { parts.push(args.slice(last, i)); last = i + 1; }
      }
      parts.push(args.slice(last));
      if (parts.length < 3) continue;
      const third = parts[2].trim();
      if (!third) continue;
      if (third.startsWith("{") || /^opts\b/.test(third)) continue;
      violations.push({
        rule: "POSITIONAL_DETAILS",
        detail: `${rel}:${src.slice(0, m.index).split("\n").length} — errorResponse()'s 3rd argument must be an options object ({ code?, issues?, requestId? }), got \`${third.slice(0, 40)}\`.`,
      });
    }

    // NESTED_ISSUES — issues buried where ApiClientError cannot see them.
    for (const m of src.matchAll(/\bdata\s*:\s*\{\s*issues\b/g)) {
      violations.push({
        rule: "NESTED_ISSUES",
        detail: `${rel}:${src.slice(0, m.index).split("\n").length} — \`issues\` nested under \`data\`; ${CONSUMER.cls} reads \`body.issues\` at the top level.`,
      });
    }
  }
}

// ---------------------------------------------------------------------------

if (violations.length === 0) {
  console.log(
    `[audit-api-error-envelope] OK — ${producerResults.length} producer(s) agree with ` +
      `${CONSUMER.cls} on {${[...consumer.keys].sort().join(", ")}}.`,
  );
  process.exit(0);
}

console.error("[audit-api-error-envelope] FAIL — the error envelope's producers and consumer disagree:\n");
const byRule = {};
for (const v of violations) (byRule[v.rule] ||= []).push(v.detail);
for (const [rule, items] of Object.entries(byRule)) {
  console.error(`  ${rule} (${items.length})`);
  for (const d of items.slice(0, 40)) console.error(`    • ${d}`);
  if (items.length > 40) console.error(`    ... and ${items.length - 40} more`);
  console.error("");
}
console.error(
  "  Every key a producer emits must be one ApiClientError reads (or a declared\n" +
    "  transport key), and every key it reads must be emitted by every producer.\n" +
    "  Build the body with buildErrorEnvelope() rather than a fresh literal.\n" +
    "  There is no suppression marker — add a producer to the registry instead.\n",
);
process.exit(1);
