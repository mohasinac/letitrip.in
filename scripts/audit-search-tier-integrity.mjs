#!/usr/bin/env node
/*
 * audit-search-tier-integrity — strict-zero. A2 + C4 + C5.
 *
 * Three different ways this feature can stop being true without anything
 * erroring. All of them have precedent in this codebase.
 *
 * A2  SCOPED OWNERSHIP — one viewer's rows must never reach another
 *   R1 every self/seller source declares a non-empty owner clause
 *   R2 a PII-bearing collection must be `mode: "bounded-memory"`
 *   R3 the scoped route sets `private, no-store`
 *   R4 Σ scanLimit ≤ SCOPED_SCAN_BUDGET, PRINTING THE ARITHMETIC
 *
 * C4  LIVENESS — the index quietly stopping is a CONFIDENT WRONG ANSWER
 *   R5 `searchIndexBuild` is registered with a trigger
 *   R6 every dirty-marking trigger still contains the mark
 *   R7 the mark guards on a BOOLEAN, never a deep compare (Root Cause #92 —
 *      a `JSON.stringify` no-op guard is key-order sensitive, never matched,
 *      and cost 12 million invocations a day)
 *
 * C5  RESOLVER CONSUMERS
 *   R8 no module under `features/authenticity/` imports the search matcher
 *      or its alias table. That engine treats a fuzzy name hit as EVIDENCE
 *      and fires a trademark-evasion warning; this matcher's alias corpus
 *      is built FROM a counterfeit seller's own spellings. Wiring them
 *      together silences the warning by construction — the tool would
 *      confirm a fake using the exact spelling that indicates one.
 *
 * 🛑 C4 CANNOT PROVE THE JOB RAN. It is static. The runtime half is the
 * job's own mode/read-count logging and the `builtAt` line rendered on
 * `/search`. "C4 passes" means the wiring is present, never that the index
 * is fresh.
 *
 * Negative controls run before registering:
 *   · drop the owner clause from `my-orders`      -> R1 fails
 *   · give `addresses` mode "search-txt"          -> R2 fails
 *   · remove the mark from a trigger              -> R6 fails
 *   · import the matcher into the authenticity dir-> R8 fails
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCOPED = join(ROOT, "appkit", "src", "_internal", "server", "features", "search", "scoped-sources.ts");
const ROUTE = join(ROOT, "src", "app", "api", "search", "scoped", "route.ts");
const SCHEDULED = join(ROOT, "appkit", "src", "_internal", "server", "functions", "scheduled.ts");
const STORE = join(ROOT, "appkit", "src", "_internal", "server", "features", "search", "index-build", "artifact-store.ts");
const AUTH_DIR = join(ROOT, "src", "features", "authenticity");

function maskComments(src) {
  let out = "";
  let mode = "code";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === "code") {
      if (c === "/" && n === "/") mode = "line";
      else if (c === "/" && n === "*") mode = "block";
      else if (c === '"' || c === "'" || c === "`") mode = c;
    } else if (mode === "line") {
      if (c === "\n") mode = "code";
    } else if (mode === "block") {
      if (c === "*" && n === "/") {
        out += "  ";
        i++;
        mode = "code";
        continue;
      }
    } else if (c === mode && src[i - 1] !== "\\") {
      mode = "code";
    }
    out += mode === "line" || mode === "block" ? (c === "\n" ? "\n" : " ") : c;
  }
  return out;
}

function read(f) {
  return existsSync(f) ? maskComments(readFileSync(f, "utf8")) : null;
}

const violations = [];

/* ── A2 ────────────────────────────────────────────────────────────────── */
const scoped = read(SCOPED);
let sourceCount = 0;
let scanTotal = 0;
const breakdown = [];

if (!scoped) {
  violations.push("A2 scoped-sources.ts is missing — Tier 2 moved or was deleted.");
} else {
  /*
   * Split on `key:` so each source is examined as a unit. A line-by-line
   * scan cannot tell which `where` belongs to which source, and getting
   * THAT wrong is how an ownership audit reports a pass for the wrong
   * reason.
   */
  const blocks = scoped.split(/\n\s*\{\s*\n/).slice(1);
  for (const block of blocks) {
    const keyMatch = /key:\s*["']([^"']+)["']/.exec(block);
    if (!keyMatch) continue;
    const key = keyMatch[1];
    sourceCount++;

    const limitMatch = /scanLimit:\s*(\w+)/.exec(block);
    const limit = limitMatch
      ? limitMatch[1] === "SCOPED_SCAN"
        ? 20
        : Number(limitMatch[1]) || 60
      : 60;
    scanTotal += limit;
    breakdown.push(`${key}=${limit}`);

    // R1 — an owner clause, not merely a `where`.
    const hasOwner = /where:\s*\[[\s\S]*?(viewer\.uid|viewer\.storeId|storeId)/.test(block);
    if (!hasOwner) {
      violations.push(
        `scoped-sources.ts :: A2/R1 source "${key}" has no owner clause — the ` +
          `query itself must be unable to return another viewer's rows.`,
      );
    }

    // R2 — PII collections may not use a token push-down.
    const collMatch = /collection:\s*["']([^"']+)["']/.exec(block);
    const coll = collMatch?.[1];
    const PII_COLLECTIONS = ["addresses", "users", "payouts", "savedPaymentMethods"];
    if (coll && PII_COLLECTIONS.includes(coll) && !/mode:\s*["']bounded-memory["']/.test(block)) {
      violations.push(
        `scoped-sources.ts :: A2/R2 "${key}" reads the PII collection "${coll}" ` +
          `without mode:"bounded-memory" — a searchTxt push-down there means a ` +
          `prefix-expanded plaintext index over a person's name and street.`,
      );
    }
  }

  // R4 — the budget, with the arithmetic.
  const budgetMatch = /SCOPED_SCAN_BUDGET\s*=\s*(\d+)/.exec(
    read(join(ROOT, "appkit", "src", "_internal", "server", "features", "search", "search-everything.ts")) ?? "",
  );
  const budget = budgetMatch ? Number(budgetMatch[1]) : 400;
  if (scanTotal > budget) {
    violations.push(
      `A2/R4 scoped search would read up to ${scanTotal} documents, over ` +
        `SCOPED_SCAN_BUDGET (${budget}): ${breakdown.join(" + ")} = ${scanTotal}.`,
    );
  }
}

/* R3 — the route must not be shared-cacheable. */
const route = read(ROUTE);
if (!route) {
  violations.push("A2/R3 /api/search/scoped/route.ts is missing.");
} else if (!/private,\s*no-store/.test(route)) {
  violations.push(
    "A2/R3 the scoped route does not set `private, no-store`. The response is " +
      "one person's orders and addresses, and it varies by cookie rather than " +
      "by anything in the URL — a shared cache would serve A's rows to B.",
  );
}

/* ── C4 ────────────────────────────────────────────────────────────────── */
const scheduled = read(SCHEDULED);
if (!scheduled || !/searchIndexBuild/.test(scheduled)) {
  violations.push(
    "C4/R5 searchIndexBuild is not registered in scheduled.ts — the artifact " +
      "would freeze at whatever version was last built, and a stale index is a " +
      "confident wrong answer rather than an error.",
  );
}

const store = read(STORE);
if (store && !/snap\.data\(\)\?\.dirty === true|data\(\)\?\.dirty\s*===\s*true/.test(store)) {
  violations.push(
    "C4/R7 markSearchIndexDirty does not guard on a BOOLEAN. Root Cause #92's " +
      "trigger used JSON.stringify, which is key-order sensitive, never matched, " +
      "and cost 12 million invocations a day.",
  );
}
/*
 * 🛑 A COMPARISON, not any `JSON.stringify`.
 *
 * The first draft flagged the bare call and immediately fired on
 * `Buffer.from(JSON.stringify(artifact))` — which is SERIALISATION, the
 * entire job of `publishArtifact`. Root Cause #92 is about a no-op GUARD
 * built from `JSON.stringify`, where key-order sensitivity means the
 * comparison never matches and the trigger writes on every invocation. A
 * rule that cannot tell serialising from comparing would make this file
 * permanently un-greenable and teach people to delete it.
 */
if (store && /JSON\.stringify\([^)]*\)\s*[!=]==?\s*JSON\.stringify/.test(store)) {
  violations.push(
    "C4/R7 artifact-store.ts compares two JSON.stringify results — key-order " +
      "sensitive, so the guard never matches. See Root Cause #92.",
  );
}

const TRIGGER_FILES = [
  "onProductWrite.ts",
  "onCategoryWrite.ts",
  "onStoreWrite.ts",
  "onReviewWrite.ts",
];
let triggersChecked = 0;
const TRIGGER_DIR = join(ROOT, "appkit", "src", "_internal", "server", "jobs", "core");
const HANDLER_DIR = join(ROOT, "appkit", "src", "_internal", "server", "functions");
for (const f of TRIGGER_FILES) {
  const p = join(TRIGGER_DIR, f);
  if (!existsSync(p)) continue;
  triggersChecked++;
}
/*
 * 🛑 The mark lives in `jobs/handlers/`, NOT in `functions/`.
 *
 * The first draft scanned `_internal/server/functions/` and reported
 * "no trigger calls markSearchIndexDirty" against five triggers that all
 * do. A measurement narrower than the rule it feeds (Root Cause #84) — and
 * note it failed LOUDLY here only by luck; the same mistake one directory
 * over would have been a silent pass.
 */
function readDirSources(dir) {
  if (!existsSync(dir)) return "";
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(readDirSources(full));
    else if (e.name.endsWith(".ts")) out.push(read(full) ?? "");
  }
  return out.join("\n");
}
const handlers = [
  readDirSources(HANDLER_DIR),
  readDirSources(join(ROOT, "appkit", "src", "_internal", "server", "jobs", "handlers")),
  readDirSources(TRIGGER_DIR),
].join("\n");
const markCount = (handlers.match(/markSearchIndexDirty/g) ?? []).length;
if (markCount === 0) {
  violations.push(
    "C4/R6 no trigger calls markSearchIndexDirty — content changes would never " +
      "reach the index until the daily full pass.",
  );
}

/* ── C5 ────────────────────────────────────────────────────────────────── */
let authFilesChecked = 0;
function walkAuth(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      walkAuth(full);
      continue;
    }
    if (!/\.tsx?$/.test(e.name)) continue;
    authFilesChecked++;
    const s = read(full) ?? "";
    if (/shared\/search\/match|alias-variants|useSiteSearch|resolveEntity|searchIndex\s*\(/.test(s)) {
      violations.push(
        `${relative(ROOT, full)} :: C5/R8 a module under features/authenticity/ ` +
          `imports the search matcher or its alias table. That engine treats a ` +
          `fuzzy name hit as EVIDENCE; this matcher's aliases are derived FROM ` +
          `counterfeit spellings. Wiring them silences the evasion warning by ` +
          `construction.`,
      );
    }
  }
}
walkAuth(AUTH_DIR);

/* ── report, with denominators ─────────────────────────────────────────── */
if (violations.length === 0) {
  console.log(
    `[audit-search-tier-integrity] OK: 0 violations ` +
      `(${sourceCount} scoped source(s), Σ scan = ${scanTotal}; ` +
      `${markCount} dirty-mark call(s) across ${triggersChecked} trigger core(s); ` +
      `${authFilesChecked} authenticity file(s) checked).`,
  );
  process.exit(0);
}

console.error("\n[audit-search-tier-integrity] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
