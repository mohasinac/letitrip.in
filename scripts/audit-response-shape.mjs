#!/usr/bin/env node
/**
 * audit-response-shape.mjs — a consumer may only read keys its route emits,
 * and it may not take the page down when one is missing.
 *
 * ## The incident this exists to prevent
 *
 * `GET /api/user/bids` was converted to the shared list envelope
 * (`{ items, total, page, pageSize, totalPages, hasMore }`) on 2026-10-17 by
 * the audit-baseline sweep. Its one consumer, `ProfileActivityPanel`, still
 * read `.bids`. So `bidsData.bids` was `undefined`, `.length` threw, and the
 * error boundary replaced the ENTIRE `/user/profile` page with "Something
 * went wrong" in production. Recorded as `CLIENT_UNKNOWN_HIGH`.
 *
 * Nothing could catch it. The consumer declared its OWN response type
 * (`apiClient.get<{ bids: BidLite[]; total: number }>`), so `tsc` checked the
 * body against that declaration and never against the route — a hand-written
 * generic is an assertion about a remote shape, and the compiler cannot see
 * the far end of an HTTP call. `audit-list-envelope` watches the route side
 * and `mapRows`, which this call site is not.
 *
 * ## Rules
 *
 * R1  RESPONSE_KEY_NOT_EMITTED — a consumer's response generic names a
 *     top-level key the resolved route never puts in its success payload.
 *     This is the rename half that gets forgotten.
 *
 * R2  PARENT_GUARD_NESTED_DEREF — `!x || x.y.length` (same identifier):
 *     a guard that tests the PARENT while dereferencing a nested array.
 *     It covers "the response is absent" and not "the response is a
 *     different shape", which is the case that actually happens during a
 *     rename — and the difference between the two is an empty panel versus
 *     a dead page. Both of the crash's call sites had exactly this shape.
 *
 * R2 is what makes R1 survivable: R1 catches the rename, R2 ensures that the
 * NEXT shape change nobody catches degrades to "No bids yet" instead of a
 * blank page. Neither alone is enough.
 *
 * ## What it refuses to guess
 *
 * A call whose URL or whose route payload cannot be resolved statically is
 * REPORTED under "unresolved", never silently skipped. `lister-opts-forwarding`
 * shipped a first draft that resolved receivers loosely and produced nine
 * false findings out of eleven; an audit that guesses is worse than no audit,
 * because the two real findings get dismissed with the rest. Unresolved
 * entries do not fail the build — they are the honest statement of this
 * rule's reach.
 *
 * Suppression: `// audit-response-shape-ok: <reason>`.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "audit-response-shape-ok";

/**
 * Keys every route may emit regardless of its own literal: `successResponse`
 * wraps the payload, and a few envelope fields are added by shared helpers.
 */
const ALWAYS_PRESENT = new Set(["ok", "success", "data", "message", "meta"]);

// ---------------------------------------------------------------------------
// file walking

function walk(dir, out = [], filter = /\.(ts|tsx)$/) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === "dist" || e === ".next") continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out, filter);
    else if (filter.test(e)) out.push(p);
  }
  return out;
}

const rel = (p) => relative(ROOT, p).split(sep).join("/");

// ---------------------------------------------------------------------------
// balanced-delimiter scanning
//
// 🛑 Not a regex. `<{ orders: X[]; total: number }>` and
// `(`${A.B}?x=${y}`)` both contain the delimiter a naive pattern would stop
// at — the same false-negative that made audit-select-wrapper-classname miss
// the live cart violation (Root Cause #29).

const OPEN = { "{": "}", "(": ")", "[": "]", "<": ">" };

function matchFrom(text, start) {
  const close = OPEN[text[start]];
  if (!close) return -1;
  const stack = [close];
  let quote = null;
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    // `=>` and comparisons would corrupt a `<` stack; only track `<` when the
    // stack is already inside a generic.
    if (c === "<" && stack[stack.length - 1] !== ">") continue;
    if (OPEN[c]) stack.push(OPEN[c]);
    else if (c === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return i;
    }
  }
  return -1;
}

/**
 * Split an object literal's body on its TOP-LEVEL commas/semicolons.
 *
 * Shared by the type-literal reader and the value-literal reader, because the
 * two disagree in exactly one place — a value literal allows SHORTHAND
 * (`{ eventId, customToken }`) and a type literal does not. The first draft of
 * this audit read only `key:` and therefore scored every shorthand payload as
 * emitting nothing, which turned four correct routes into fourteen
 * violations. A rule that fires on everything is not stricter than one that
 * fires on nothing; it is the same defect wearing the opposite sign.
 */
function topLevelSegments(objText) {
  const segments = [];
  const inner = objText.slice(1, -1);
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (quote) {
      cur += c;
      if (c === "\\") cur += inner[++i] ?? "";
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      cur += c;
      continue;
    }
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    else if (depth === 0 && (c === "," || c === ";")) {
      segments.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) segments.push(cur);
  return segments;
}

/**
 * Top-level keys of a VALUE object literal — `{ a: 1, b, ...rest, [k]: v }`.
 * Returns `null` when the literal can emit keys this rule cannot enumerate
 * (a spread or a computed key), so the caller reports it rather than
 * concluding the key is absent.
 */
function valueLiteralKeys(objText) {
  const keys = [];
  for (const seg of topLevelSegments(objText)) {
    const s = seg.trim();
    if (!s) continue;
    if (s.startsWith("...") || s.startsWith("[")) return null;
    const kv = /^([A-Za-z_$][\w$]*)\s*:/.exec(s);
    if (kv) {
      keys.push(kv[1]);
      continue;
    }
    const shorthand = /^([A-Za-z_$][\w$]*)$/.exec(s);
    if (shorthand) {
      keys.push(shorthand[1]);
      continue;
    }
    const quoted = /^["']([^"']+)["']\s*:/.exec(s);
    if (quoted) {
      keys.push(quoted[1]);
      continue;
    }
    return null; // a method, a nested call — unenumerable
  }
  return keys;
}

/** Top-level `key:` / `key?:` names of an object type literal `{ ... }`. */
function topLevelKeys(objText) {
  const keys = [];
  const inner = objText.slice(1, -1);
  let depth = 0;
  let quote = null;
  let token = "";
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (OPEN[c] && !(c === "<" && depth === 0 && !/\w$/.test(token))) depth++;
    else if (c === "}" || c === ")" || c === "]" || c === ">") depth--;
    else if (depth === 0) {
      if (c === ";" || c === ",") token = "";
      else if (c === ":") {
        const m = /([A-Za-z_$][\w$]*)\s*\??\s*$/.exec(token);
        if (m) keys.push(m[1]);
        token = "";
      } else token += c;
      continue;
    }
    if (depth < 0) depth = 0;
  }
  return keys;
}

// ---------------------------------------------------------------------------
// endpoint constant resolution
//
// Every endpoint in this codebase bottoms out at a literal path; the layering
// is `API_ROUTES.USER.BIDS -> API_ENDPOINTS.ACCOUNT.BIDS -> "/api/user/bids"`.
// Resolve the whole chain rather than special-casing one hop.

/** `GROUP.KEY` -> url pattern, for every `*_ENDPOINTS` object. */
const endpointGroups = new Map(); // groupConstName -> Map(key -> url)
const aggregateAlias = new Map(); // API_ENDPOINTS.<alias> -> groupConstName
const apiRoutesAlias = new Map(); // API_ROUTES.<alias> -> objectConstName
const plainObjects = new Map(); // objectConstName -> Map(key -> url | "ref:GROUP.KEY")

function urlOf(valueText) {
  const lit = /^\s*["'`]([^"'`]+)["'`]/.exec(valueText);
  if (lit) return lit[1];
  // `(id: string) => `/api/user/orders/${id}``
  const arrow = /=>\s*`([^`]+)`/.exec(valueText);
  if (arrow) return arrow[1].replace(/\$\{[^}]*\}/g, "*");
  const ref = /^\s*([A-Z][\w]*)\.([A-Z0-9_]+)(?:\.([A-Z0-9_]+))?/.exec(valueText);
  if (ref) return `ref:${ref[1]}.${ref[2]}${ref[3] ? `.${ref[3]}` : ""}`;
  return null;
}

/** Parse every `const NAME = { ... }` / `export const NAME = { ... }` block. */
function parseObjectConsts(src, into) {
  const re = /(?:export\s+)?const\s+([A-Z][\w]*)\s*=\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const open = src.indexOf("{", m.index);
    const close = matchFrom(src, open);
    if (close === -1) continue;
    const body = src.slice(open + 1, close);
    const entries = new Map();
    const er = /(?:^|[\n,])\s*([A-Z0-9_]+)\s*:\s*/g;
    let e;
    while ((e = er.exec(body))) {
      const after = body.slice(e.index + e[0].length);
      const u = urlOf(after);
      if (u) entries.set(e[1], u);
    }
    into.set(m[1], entries);
    re.lastIndex = close;
  }
}

function loadEndpointMaps() {
  const appkitSrc = stripComments(
    readFileSync(join(ROOT, "appkit/src/constants/api-endpoints.ts"), "utf8"),
  );
  parseObjectConsts(appkitSrc, endpointGroups);

  // `export const API_ENDPOINTS = { ACCOUNT: ACCOUNT_ENDPOINTS, ... }`
  const agg = /const\s+API_ENDPOINTS\s*=\s*\{/.exec(appkitSrc);
  if (agg) {
    const open = appkitSrc.indexOf("{", agg.index);
    const body = appkitSrc.slice(open + 1, matchFrom(appkitSrc, open));
    for (const m of body.matchAll(/([A-Z0-9_]+)\s*:\s*([A-Z][\w]*_ENDPOINTS)/g)) {
      aggregateAlias.set(m[1], m[2]);
    }
  }

  const consumerSrc = stripComments(readFileSync(join(ROOT, "src/constants/api.ts"), "utf8"));
  parseObjectConsts(consumerSrc, plainObjects);
  const ar = /export\s+const\s+API_ROUTES\s*=\s*\{/.exec(consumerSrc);
  if (ar) {
    const open = consumerSrc.indexOf("{", ar.index);
    const body = consumerSrc.slice(open + 1, matchFrom(consumerSrc, open));
    for (const m of body.matchAll(/([A-Z0-9_]+)\s*:\s*([A-Z][\w]*)\s*,/g)) {
      apiRoutesAlias.set(m[1], m[2]);
    }
    // `USER: { ... }` written inline rather than via a named const.
    for (const m of body.matchAll(/([A-Z0-9_]+)\s*:\s*\{/g)) {
      const o = body.indexOf("{", m.index + m[1].length);
      const c = matchFrom(body, o);
      if (c === -1) continue;
      const entries = new Map();
      for (const e of body.slice(o + 1, c).matchAll(/(?:^|[\n,])\s*([A-Z0-9_]+)\s*:\s*/g)) {
        const u = urlOf(body.slice(o + 1 + e.index + e[0].length));
        if (u) entries.set(e[1], u);
      }
      const name = `__INLINE_${m[1]}`;
      plainObjects.set(name, entries);
      apiRoutesAlias.set(m[1], name);
    }
  }
}

/** `API_ROUTES.USER.BIDS` / `ACCOUNT_ENDPOINTS.CATALOGUE` -> "/api/user/bids" */
function resolveEndpoint(expr, seen = 0) {
  if (seen > 6) return null;
  let m = /^API_ROUTES\.([A-Z0-9_]+)\.([A-Z0-9_]+)$/.exec(expr);
  if (m) {
    const obj = plainObjects.get(apiRoutesAlias.get(m[1]));
    const v = obj?.get(m[2]);
    return v?.startsWith("ref:") ? resolveEndpoint(v.slice(4), seen + 1) : (v ?? null);
  }
  m = /^API_ENDPOINTS\.([A-Z0-9_]+)\.([A-Z0-9_]+)$/.exec(expr);
  if (m) {
    const v = endpointGroups.get(aggregateAlias.get(m[1]))?.get(m[2]);
    return v?.startsWith("ref:") ? resolveEndpoint(v.slice(4), seen + 1) : (v ?? null);
  }
  m = /^([A-Z][\w]*_ENDPOINTS)\.([A-Z0-9_]+)$/.exec(expr);
  if (m) {
    const v = endpointGroups.get(m[1])?.get(m[2]);
    return v?.startsWith("ref:") ? resolveEndpoint(v.slice(4), seen + 1) : (v ?? null);
  }
  return null;
}

// ---------------------------------------------------------------------------
// route payload keys

const routeKeys = new Map(); // "/api/user/bids" (segments, * for dynamic) -> {keys:Set|null, file}

function routePathOf(file) {
  const r = rel(file);
  const m = /^src\/app\/api\/(.*)\/route\.tsx?$/.exec(r);
  if (!m) return null;
  return `/api/${m[1]}`
    .split("/")
    .map((s) => (/^\[.*\]$/.test(s) ? "*" : s))
    .join("/");
}

function loadRouteKeys() {
  for (const file of walk(join(ROOT, "src/app/api"))) {
    if (!/[\\/]route\.tsx?$/.test(file)) continue;
    const p = routePathOf(file);
    if (!p) continue;
    const src = stripComments(readFileSync(file, "utf8"));
    const keys = new Set();
    let resolvedAll = true;
    let sawAny = false;
    for (const m of src.matchAll(/successResponse\s*\(/g)) {
      sawAny = true;
      const open = src.indexOf("(", m.index);
      const close = matchFrom(src, open);
      if (close === -1) {
        resolvedAll = false;
        continue;
      }
      const arg = src.slice(open + 1, close).trim();
      if (arg.startsWith("{")) {
        const end = matchFrom(arg, 0);
        const emitted = valueLiteralKeys(arg.slice(0, end + 1));
        // null = a spread or a computed key: the literal can carry names this
        // rule cannot enumerate, so it must not conclude anything is absent.
        if (emitted === null) resolvedAll = false;
        else for (const k of emitted) keys.add(k);
      } else {
        // `successResponse(result)` — the payload is a variable; its shape is
        // not visible here and must not be guessed.
        resolvedAll = false;
      }
    }
    routeKeys.set(p, { keys: sawAny ? keys : null, resolvedAll: sawAny && resolvedAll, file: rel(file) });
  }
}

function lookupRoute(url) {
  const clean = url.split("?")[0].replace(/\/+$/, "") || "/";
  if (routeKeys.has(clean)) return routeKeys.get(clean);
  const want = clean.split("/");
  for (const [p, v] of routeKeys) {
    const got = p.split("/");
    if (got.length !== want.length) continue;
    if (got.every((s, i) => s === "*" || want[i] === "*" || s === want[i])) return v;
  }
  return null;
}

// ---------------------------------------------------------------------------
// rules

const violations = [];
const unresolved = [];

function suppressed(lines, idx) {
  return (lines[idx] ?? "").includes(MARKER) || (lines[idx - 1] ?? "").includes(MARKER);
}

function checkR1(file, raw) {
  const src = stripComments(raw);
  const lines = raw.split("\n");
  for (const m of src.matchAll(/apiClient\s*\.\s*(get|post|put|patch|delete)\s*</g)) {
    const lt = src.indexOf("<", m.index + "apiClient".length);
    const gt = matchFrom(src, lt);
    if (gt === -1) continue;
    const generic = src.slice(lt + 1, gt).trim();
    if (!generic.startsWith("{")) continue; // a named type — nothing to compare here
    const objEnd = matchFrom(generic, 0);
    const keys = topLevelKeys(generic.slice(0, objEnd + 1));
    if (keys.length === 0) continue;

    const paren = src.indexOf("(", gt);
    if (paren === -1) continue;
    const argEnd = matchFrom(src, paren);
    const args = src.slice(paren + 1, argEnd === -1 ? paren + 1 : argEnd);
    const line = src.slice(0, m.index).split("\n").length;
    if (suppressed(lines, line - 1)) continue;

    const ref = /((?:API_ROUTES|API_ENDPOINTS)\.[A-Z0-9_]+\.[A-Z0-9_]+|[A-Z][\w]*_ENDPOINTS\.[A-Z0-9_]+)/.exec(args);
    const where = `${rel(file)}:${line}`;
    if (!ref) {
      unresolved.push(`${where}  url not a known endpoint constant`);
      continue;
    }
    const url = resolveEndpoint(ref[1]);
    if (!url) {
      unresolved.push(`${where}  ${ref[1]} did not resolve to a path`);
      continue;
    }
    const route = lookupRoute(url);
    if (!route) {
      unresolved.push(`${where}  ${url} matched no route file`);
      continue;
    }
    if (!route.keys || !route.resolvedAll) {
      unresolved.push(`${where}  ${url} payload not statically resolvable (${route.file})`);
      continue;
    }
    for (const k of keys) {
      if (ALWAYS_PRESENT.has(k) || route.keys.has(k)) continue;
      violations.push({
        rule: "RESPONSE_KEY_NOT_EMITTED",
        where,
        detail: `reads "${k}" — ${url} emits { ${[...route.keys].join(", ")} }  (${route.file})`,
      });
    }
  }
}

function checkR2(file, raw) {
  const src = stripComments(raw);
  const lines = raw.split("\n");
  const re = /!\s*([A-Za-z_$][\w$]*)\s*\|\|\s*\1\s*\.\s*([A-Za-z_$][\w$]*)\s*\.\s*(length|map|slice|filter|reduce|forEach|some|every)\b/g;
  let m;
  while ((m = re.exec(src))) {
    const line = src.slice(0, m.index).split("\n").length;
    if (suppressed(lines, line - 1)) continue;
    violations.push({
      rule: "PARENT_GUARD_NESTED_DEREF",
      where: `${rel(file)}:${line}`,
      detail: `!${m[1]} || ${m[1]}.${m[2]}.${m[3]} — the guard tests ${m[1]}, the deref needs ${m[1]}.${m[2]}`,
    });
  }
}

// ---------------------------------------------------------------------------

loadEndpointMaps();
loadRouteKeys();

const files = [...walk(join(ROOT, "src")), ...walk(join(ROOT, "appkit/src"))];
for (const f of files) {
  const raw = readFileSync(f, "utf8");
  if (raw.includes("apiClient")) checkR1(f, raw);
  if (raw.includes("||")) checkR2(f, raw);
}

const label = "audit-response-shape";
if (unresolved.length) {
  console.log(`${label}: ${unresolved.length} call site(s) this rule could not resolve (not failures):`);
  for (const u of unresolved) console.log(`  · ${u}`);
  console.log("");
}

if (violations.length === 0) {
  console.log(
    `${label}: 0 violations ✓  (${routeKeys.size} routes, ${files.length} files scanned)`,
  );
  process.exit(0);
}

console.log(`${label}: ${violations.length} violation(s).\n`);
for (const v of violations) {
  console.log(`  • ${v.where}  [${v.rule}]`);
  console.log(`      ${v.detail}`);
}
console.log(`
  RESPONSE_KEY_NOT_EMITTED: a hand-written response generic is an ASSERTION
  about a remote shape — tsc checks the body against it and never against the
  route, so a renamed key is invisible until it reaches a browser. Read the
  key the route emits.

  PARENT_GUARD_NESTED_DEREF: guard what you dereference. \`!x || x.y.length\`
  survives an absent response and throws on a reshaped one, which is the case
  that actually happens. Derive the array once with an empty fallback.

  Suppression: // ${MARKER}: <reason>
`);
process.exit(1);
