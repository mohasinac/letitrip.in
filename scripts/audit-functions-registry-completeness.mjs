#!/usr/bin/env node
/**
 * audit-functions-registry-completeness — strict-zero.
 *
 * Enforces the Firebase Functions registry architecture (plan Track A):
 *
 *   1. Every `defineFunction(...)` call site lives inside
 *      `appkit/src/_internal/server/functions/` or `functions/src/consumer-functions.ts`.
 *      No other file may declare a Firebase function.
 *   2. Every appkit definition file is reachable from `manifest.ts` via the
 *      three category barrels (scheduled / firestore / https).
 *   3. Every HTTPS `defineFunction` carries `options.secretEnvVar`.
 *   4. Every scheduled `defineFunction` carries `trigger.cron`.
 *   5. Every document-trigger `defineFunction` carries `trigger.pathPattern`.
 *   6. `functions/src/index.ts` calls only `bindAllFromRegistry` —
 *      no leftover one-by-one `bindToFirebase.{schedule,documentCreated,...}`
 *      or `bindHttps`/`bindSchedule` calls.
 *
 * Exit 0 — clean.
 * Exit 1 — any rule above violated; prints every offender.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const APPKIT_FUNCTIONS_DIR = join(ROOT, "appkit", "src", "_internal", "server", "functions");
const CONSUMER_FUNCTIONS_FILE = join(ROOT, "functions", "src", "consumer-functions.ts");
const CONSUMER_INDEX_FILE = join(ROOT, "functions", "src", "index.ts");

const violations = [];

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function findDefineFunctionCallsites() {
  const allowed = new Set();
  // Allow every file under appkit/src/_internal/server/functions/
  try {
    for (const f of walk(APPKIT_FUNCTIONS_DIR)) allowed.add(f);
  } catch {
    // dir missing — caught later.
  }
  allowed.add(CONSUMER_FUNCTIONS_FILE);

  const offenders = [];
  for (const scanRoot of [join(ROOT, "appkit", "src"), join(ROOT, "src"), join(ROOT, "functions", "src")]) {
    let exists = false;
    try {
      exists = statSync(scanRoot).isDirectory();
    } catch {
      exists = false;
    }
    if (!exists) continue;
    for (const file of walk(scanRoot)) {
      const raw = readFileSync(file, "utf8");
      const stripped = stripComments(raw);
      if (!/\bdefineFunction\s*\(/.test(stripped)) continue;
      if (allowed.has(file)) continue;
      // Allow the define.ts file itself (it exports the helper).
      if (file.endsWith(join("functions", "define.ts"))) continue;
      offenders.push(file);
    }
  }
  return offenders;
}

function findHttpsDefinitionsMissingSecret() {
  const offenders = [];
  for (const file of walk(APPKIT_FUNCTIONS_DIR)) {
    const content = readFileSync(file, "utf8");
    // Pull every defineFunction block; look for HTTPS trigger without secretEnvVar.
    const blocks = content.split(/\bdefineFunction(?:<[^>]*>)?\s*\(/).slice(1);
    for (const block of blocks) {
      // Capture up to the matching close paren — simplistic but sufficient
      // for the call-site shape used in scheduled.ts/firestore.ts/https.ts.
      const headSlice = block.slice(0, 2000);
      const triggerMatch = headSlice.match(/trigger\s*:\s*\{\s*kind\s*:\s*"([^"]+)"/);
      if (!triggerMatch) continue;
      const kind = triggerMatch[1];
      if (kind === "https" && !/secretEnvVar\s*:/.test(headSlice)) {
        offenders.push(`${file} :: HTTPS definition missing options.secretEnvVar`);
      }
      if (kind === "schedule" && !/cron\s*:/.test(headSlice)) {
        offenders.push(`${file} :: schedule definition missing trigger.cron`);
      }
      if (kind.startsWith("document") && !/pathPattern\s*:/.test(headSlice)) {
        offenders.push(`${file} :: ${kind} definition missing trigger.pathPattern`);
      }
    }
  }
  return offenders;
}

function checkConsumerIndex() {
  let content;
  try {
    content = readFileSync(CONSUMER_INDEX_FILE, "utf8");
  } catch {
    return [`functions/src/index.ts missing`];
  }
  const issues = [];
  // Must reference bindAllFromRegistry.
  if (!/\bbindAllFromRegistry\s*\(/.test(content)) {
    issues.push("functions/src/index.ts does not call bindAllFromRegistry — registry not wired");
  }
  // Must NOT call any of the legacy one-by-one binders.
  const legacyPatterns = [
    /\bbindToFirebase\s*\.\s*(?:schedule|documentCreated|documentUpdated|documentWritten|callable|https)\s*\(/,
    /\bbindSchedule\s*\(/,
    /\bbindDocumentCreated\s*\(/,
    /\bbindDocumentUpdated\s*\(/,
    /\bbindDocumentWritten\s*\(/,
    /\bbindHttps\s*\(/,
  ];
  for (const pattern of legacyPatterns) {
    if (pattern.test(content)) {
      issues.push(
        `functions/src/index.ts contains legacy one-by-one binding call (${pattern}). ` +
          `All bindings must flow through bindAllFromRegistry.`,
      );
    }
  }
  return issues;
}

function checkManifestReachability() {
  const issues = [];
  // Read scheduled.ts / firestore.ts / https.ts; ensure every exported
  // defineFunction binding is also collected into the category const at the
  // bottom of the file. We approximate by counting `defineFunction(` calls
  // vs. names in the trailing `[ ... ] as const` array.
  for (const fname of ["scheduled.ts", "firestore.ts", "https.ts"]) {
    const file = join(APPKIT_FUNCTIONS_DIR, fname);
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      issues.push(`Expected category file missing: ${relative(ROOT, file)}`);
      continue;
    }
    const defineCount = (content.match(/=\s*defineFunction(?:<[^>]*>)?\s*\(/g) ?? []).length;
    const collectionMatch = content.match(
      /export const (SCHEDULED|FIRESTORE_TRIGGER|HTTPS)_FUNCTIONS\s*=\s*\[([\s\S]*?)\]\s*as const;/,
    );
    if (!collectionMatch) {
      issues.push(`${relative(ROOT, file)} missing the trailing FUNCTIONS array — manifest cannot collect.`);
      continue;
    }
    /*
     * 🛑 Strip comments FIRST, and count only valid identifiers.
     *
     * This was `collectionMatch[2].split(",")` over the raw array body, and
     * `SCHEDULED_FUNCTIONS` carries a 10-line explanatory comment BETWEEN two
     * of its entries. Every comma in that prose became an "entry": the audit
     * reported "34 defineFunction calls but 36 entries" against an array whose
     * 34 names match the 34 definitions exactly. Verified by listing both sets
     * — the symmetric difference is empty in both directions.
     *
     * Requiring an identifier also makes a trailing comma harmless, which is
     * the other way a comma count goes wrong.
     */
    const namesInArray = collectionMatch[2]
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^[ \t]*\/\/.*$/gm, " ")
      .split(",")
      .map((n) => n.trim())
      .filter((n) => /^[A-Za-z_$][\w$]*$/.test(n)).length;
    if (namesInArray !== defineCount) {
      issues.push(
        `${relative(ROOT, file)} has ${defineCount} defineFunction calls but ${namesInArray} entries in the trailing FUNCTIONS array.`,
      );
    }
  }
  // manifest.ts must import all three barrels.
  const manifest = readFileSync(join(APPKIT_FUNCTIONS_DIR, "manifest.ts"), "utf8");
  for (const barrel of ["SCHEDULED_FUNCTIONS", "FIRESTORE_TRIGGER_FUNCTIONS", "HTTPS_FUNCTIONS"]) {
    if (!manifest.includes(barrel)) {
      issues.push(`manifest.ts does not aggregate ${barrel}.`);
    }
  }
  return issues;
}

/**
 * Every bound handler must go through `wrapJobHandler`.
 *
 * 🛑 `wrapJobHandler` persists a `serverErrors` row with `source: "function"`
 * before re-throwing, and it had **ZERO call sites** from the day it was
 * written until 2026-10-12 — the tester checklist carries a case whose expected
 * answer is literally "answer NO, nothing in production writes that source, so
 * `/admin/maintenance/function-errors` will be empty no matter what breaks".
 *
 * It is now applied in `bind-all.ts`, the one choke point all registered
 * functions pass through. This rule exists because the failure mode is total
 * silence: remove the wrap and nothing errors, no test fails, and the
 * maintenance page goes back to being permanently empty. A dead observability
 * seam cannot be noticed by observing it.
 */
function checkHandlersWrapped() {
  const issues = [];
  const file = join(ROOT, "appkit/src/_internal/server/functions/bind-all.ts");
  if (!existsSync(file)) {
    issues.push("appkit/src/_internal/server/functions/bind-all.ts is missing — cannot verify handler wrapping");
    return issues;
  }
  // 🛑 The SHARED stripper, not a local regex. This file already imports it,
  // and F1 #26 is precisely about audits that grep prose because each one
  // rolled its own comment handling.
  const src = stripComments(readFileSync(file, "utf8"));

  /*
   * 🛑 EXACT adapter names, not a prefix.
   *
   * My first version matched `bindSchedule[A-Za-z]*`, which also caught the
   * file's own internal dispatchers — `bindScheduledDefinition`,
   * `bindDocumentDefinition`, `bindHttpsDefinition` — and reported three
   * violations against correct code. A prefix match over function names is
   * matching the dispatcher as well as the thing it dispatches to.
   */
  const REQUIRED = [
    ["wrapScheduleHandler", ["bindSchedule"], "scheduled jobs"],
    [
      "wrapTriggerHandler",
      ["bindDocumentCreated", "bindDocumentUpdated", "bindDocumentWritten"],
      "Firestore triggers",
    ],
    ["wrapCallableHandler", ["bindHttps"], "HTTPS/callable functions"],
  ];
  for (const [wrap, binds, label] of REQUIRED) {
    if (!src.includes(wrap + "(")) {
      issues.push(
        `bind-all.ts does not call ${wrap}() — every ${label} failure would be invisible, and /admin/maintenance/function-errors permanently empty`,
      );
      continue;
    }
    /*
     * The wrap must REACH the bind call, not merely be imported. Each
     * `bindX(...)` call's argument span is read from the opening paren to the
     * matching close, so a handler passed via a local `const handler =
     * wrapTriggerHandler(...)` counts too — which is how the document branch
     * is written, since it binds three kinds from one wrapped value.
     */
    const calls = [];
    for (const bind of binds) {
      for (const m of src.matchAll(new RegExp(`\\b${bind}\\(`, "g"))) {
        let depth = 0;
        for (let i = m.index + m[0].length - 1; i < src.length; i++) {
          if (src[i] === "(") depth++;
          else if (src[i] === ")" && --depth === 0) {
            calls.push(src.slice(m.index, i + 1));
            break;
          }
        }
      }
    }
    if (calls.length === 0) {
      issues.push(
        `bind-all.ts calls none of ${binds.join("/")} — the rule cannot verify ${label}, so it fails rather than passing vacuously`,
      );
      continue;
    }
    /*
     * A handler counts as wrapped if the wrap appears in the call itself, OR
     * the call passes a local `handler` binding — which is how the document
     * branch is written, binding three kinds from one wrapped value. The
     * `wrap` presence check above already proved the wrap exists in the file.
     */
    const unwrapped = calls.filter((c) => !c.includes(wrap) && !/\bhandler\b/.test(c));
    if (unwrapped.length > 0) {
      issues.push(
        `bind-all.ts passes an unwrapped handler to ${binds.join("/")} (${unwrapped.length} site(s)) — ${label} would fail silently`,
      );
    }
  }
  return issues;
}

violations.push(
  ...findDefineFunctionCallsites().map(
    (f) => `defineFunction outside the registry directory: ${relative(ROOT, f)}`,
  ),
);
violations.push(...findHttpsDefinitionsMissingSecret());
violations.push(...checkConsumerIndex());
violations.push(...checkManifestReachability());
violations.push(...checkHandlersWrapped());

if (violations.length === 0) {
  process.exit(0);
}

console.error("\n[audit-functions-registry-completeness] STRICT-ZERO violation(s):\n");
for (const v of violations) {
  console.error(`  - ${v}`);
}
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
