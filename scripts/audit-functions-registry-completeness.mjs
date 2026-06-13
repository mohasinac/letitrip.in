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

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

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

function stripComments(source) {
  // Remove /* ... */ block comments and // line comments. Naive — does not
  // attempt to preserve regex literals or strings, sufficient for our audit
  // which only needs identifier presence outside comments.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
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
    const namesInArray = collectionMatch[2]
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean).length;
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

violations.push(
  ...findDefineFunctionCallsites().map(
    (f) => `defineFunction outside the registry directory: ${relative(ROOT, f)}`,
  ),
);
violations.push(...findHttpsDefinitionsMissingSecret());
violations.push(...checkConsumerIndex());
violations.push(...checkManifestReachability());

if (violations.length === 0) {
  process.exit(0);
}

console.error("\n[audit-functions-registry-completeness] STRICT-ZERO violation(s):\n");
for (const v of violations) {
  console.error(`  - ${v}`);
}
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
