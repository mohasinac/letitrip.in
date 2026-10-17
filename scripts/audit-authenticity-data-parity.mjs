#!/usr/bin/env node
/*
 * WHY: The authenticity knowledge base is emitted TWICE from one parse — bundled
 *      TypeScript for the engine (zero Firestore reads) and a Firestore seed
 *      collection for access. Two renderings of one source are fine; two
 *      renderings that have silently stopped agreeing are Root Cause #42, and
 *      the way they stop agreeing is mundane: somebody re-runs one generator and
 *      not the other, or hand-edits a "generated" file.
 *
 * WHAT: Strict-zero audit.
 *
 *   R1 · CODE_SET_PARITY   — every code in the bundled tables exists in the seed
 *                            collection with the same verdict, and vice versa.
 *   R2 · FIELD_PARITY      — matching codes agree on derivedDate,
 *                            sourceDateDiffers and the product list.
 *   R3 · FRESH_VS_SOURCE   — both emitted files still match what the shared
 *                            parse produces RIGHT NOW. This is what catches a
 *                            stale generator run after a source edit.
 *   R4 · COUNT_ASSERTION   — the seed file's own AUTHENTICITY_KNOWLEDGE_COUNT
 *                            equals the rows it actually declares.
 *
 * 🛑 R3 is the rule that matters, and it is the one a "compare the two files"
 *    audit would miss entirely: both files can agree with each other perfectly
 *    while both being a source edit behind. That is exactly the shape of Root
 *    Cause #105 — a derived artefact compared against another copy of itself
 *    rather than against its source.
 *
 * No suppression marker. A disagreement here is always a stale run or a hand
 * edit, and both have the same fix: re-run the three generators.
 */
import fs from "node:fs";
import path from "node:path";
import { buildCanonicalIndex, buildDateCodeTables } from "./lib/authenticity-sources.mjs";

const ROOT = process.cwd();
const BUNDLED_CODES = path.join(ROOT, "src/features/authenticity/data/date-codes.generated.ts");
const BUNDLED_INDEX = path.join(ROOT, "src/features/authenticity/data/canonical-index.generated.ts");
const SEED = path.join(ROOT, "appkit/src/seed/authenticity-knowledge-seed-data.ts");

const violations = [];
const fail = (rule, message, fix) => violations.push({ rule, message, fix });

const REGEN = "Re-run: node scripts/gen-authenticity-index.mjs && node scripts/gen-authenticity-date-codes.mjs && node scripts/gen-authenticity-seed.mjs";

for (const f of [BUNDLED_CODES, BUNDLED_INDEX, SEED]) {
  if (!fs.existsSync(f)) {
    fail("MISSING_FILE", `${path.relative(ROOT, f)} does not exist`, REGEN);
  }
}
if (violations.length > 0) report();

const bundledSrc = fs.readFileSync(BUNDLED_CODES, "utf8");
const indexSrc = fs.readFileSync(BUNDLED_INDEX, "utf8");
const seedSrc = fs.readFileSync(SEED, "utf8");

/** Slice one exported array literal out of a generated file. */
function sliceArray(src, name) {
  const start = src.indexOf(`${name}`);
  if (start < 0) return "";
  const open = src.indexOf("[", start);
  const close = src.indexOf("\n];", open);
  return open < 0 || close < 0 ? "" : src.slice(open, close);
}

/** Parse `{ code: "X", products: [...], derivedDate: ..., sourceDateDiffers: b }`. */
function parseBundled(block) {
  const out = new Map();
  const rowRe = /\{\s*code:\s*"([A-Z0-9]+)",\s*products:\s*(\[[^\]]*\]),\s*distributors:\s*(\[[^\]]*\]),\s*derivedDate:\s*(null|"[^"]*"),\s*sourceDateDiffers:\s*(true|false)\s*\}/g;
  for (const m of block.matchAll(rowRe)) {
    out.set(m[1], {
      products: JSON.parse(m[2]),
      derivedDate: m[4] === "null" ? null : JSON.parse(m[4]),
      sourceDateDiffers: m[5] === "true",
    });
  }
  return out;
}

const bundled = {
  "recorded-original": parseBundled(sliceArray(bundledSrc, "ORIGINAL_DATE_CODES")),
  "recorded-midfake": parseBundled(sliceArray(bundledSrc, "MIDFAKE_DATE_CODES")),
  unresolved: parseBundled(sliceArray(bundledSrc, "UNCLEAR_DATE_CODES")),
};

/** Parse the seed collection's date-code documents. */
const seedCodes = new Map();
const seedDocRe =
  /id:\s*"authknow-code-[a-z0-9]+",\s*\n\s*kind:\s*"date-code",\s*\n\s*code:\s*"([A-Z0-9]+)",\s*\n\s*verdict:\s*"([a-z-]+)",\s*\n\s*products:\s*(\[[\s\S]*?\]),\s*\n\s*distributors:\s*(\[[^\]]*\]),\s*\n\s*derivedDate:\s*(null|"[^"]*"),\s*\n\s*sourceDateDiffers:\s*(true|false)/g;
for (const m of seedSrc.matchAll(seedDocRe)) {
  seedCodes.set(m[1], {
    verdict: m[2],
    products: JSON.parse(m[3]),
    derivedDate: m[5] === "null" ? null : JSON.parse(m[5]),
    sourceDateDiffers: m[6] === "true",
  });
}

const bundledFlat = new Map();
for (const [verdict, table] of Object.entries(bundled)) {
  for (const [code, row] of table) bundledFlat.set(code, { verdict, ...row });
}

if (bundledFlat.size === 0 || seedCodes.size === 0) {
  fail(
    "PARSE_FAILED",
    `parsed ${bundledFlat.size} bundled and ${seedCodes.size} seed codes — at least one emitter's format changed, so this audit is no longer reading it`,
    "Fix the regexes in this audit, then re-verify by breaking a row on purpose and watching it fail.",
  );
  report();
}

/* R1 — set parity, both directions. */
for (const code of bundledFlat.keys()) {
  if (!seedCodes.has(code)) {
    fail("CODE_SET_PARITY", `${code} is in the bundled tables but not in the Firestore seed`, REGEN);
  }
}
for (const code of seedCodes.keys()) {
  if (!bundledFlat.has(code)) {
    fail("CODE_SET_PARITY", `${code} is in the Firestore seed but not in the bundled tables`, REGEN);
  }
}

/* R2 — field parity on the codes both carry. */
for (const [code, b] of bundledFlat) {
  const s = seedCodes.get(code);
  if (!s) continue;
  if (s.verdict !== b.verdict) {
    fail("FIELD_PARITY", `${code}: bundled says ${b.verdict}, seed says ${s.verdict}`, REGEN);
  }
  if (s.derivedDate !== b.derivedDate) {
    fail("FIELD_PARITY", `${code}: derivedDate ${b.derivedDate} vs ${s.derivedDate}`, REGEN);
  }
  if (s.sourceDateDiffers !== b.sourceDateDiffers) {
    fail("FIELD_PARITY", `${code}: sourceDateDiffers ${b.sourceDateDiffers} vs ${s.sourceDateDiffers}`, REGEN);
  }
  if (JSON.stringify(s.products) !== JSON.stringify(b.products)) {
    fail("FIELD_PARITY", `${code}: product lists differ`, REGEN);
  }
}

/* R3 — both files still match the live parse of the sources. */
const fresh = buildDateCodeTables();
const freshFlat = new Map();
for (const [verdict, list] of [
  ["recorded-original", fresh.original],
  ["recorded-midfake", fresh.midfake],
  ["unresolved", fresh.unclear],
]) {
  for (const g of list) {
    freshFlat.set(g.code, {
      verdict,
      products: g.products,
      derivedDate: g.derivedDate,
      sourceDateDiffers: g.statedDiffers,
    });
  }
}
if (freshFlat.size !== bundledFlat.size) {
  fail(
    "FRESH_VS_SOURCE",
    `the sources now parse to ${freshFlat.size} codes but the emitted files carry ${bundledFlat.size} — a generator has not been re-run since a source changed`,
    REGEN,
  );
}
for (const [code, f] of freshFlat) {
  const b = bundledFlat.get(code);
  if (!b) {
    fail("FRESH_VS_SOURCE", `${code} parses from the sources but is in no emitted file`, REGEN);
    continue;
  }
  if (b.verdict !== f.verdict || b.derivedDate !== f.derivedDate || b.sourceDateDiffers !== f.sourceDateDiffers) {
    fail("FRESH_VS_SOURCE", `${code} disagrees with a fresh parse of the sources`, REGEN);
  }
}

const freshIndex = buildCanonicalIndex();
const indexRows = (indexSrc.match(/\{ slug: "/g) ?? []).length;
if (indexRows !== freshIndex.length) {
  fail(
    "FRESH_VS_SOURCE",
    `canonical-index.generated.ts carries ${indexRows} beys but the corpus now parses to ${freshIndex.length}`,
    REGEN,
  );
}

/* R4 — the seed file's own count assertion. */
const declaredCount = Number((/AUTHENTICITY_KNOWLEDGE_COUNT = (\d+)/.exec(seedSrc) ?? [, "-1"])[1]);
const actualDocs = (seedSrc.match(/\n    id: "authknow-/g) ?? []).length;
if (declaredCount !== actualDocs) {
  fail(
    "COUNT_ASSERTION",
    `AUTHENTICITY_KNOWLEDGE_COUNT says ${declaredCount} but the file declares ${actualDocs} documents`,
    REGEN,
  );
}

report();

function report() {
  const name = "authenticity-data-parity";
  if (violations.length === 0) {
    console.log(
      `✓ ${name}: ${bundledFlat?.size ?? 0} codes agree across the bundled tables, the Firestore seed and a fresh parse`,
    );
    process.exit(0);
  }
  console.error(`✗ ${name}: ${violations.length} violation(s)\n`);
  for (const v of violations.slice(0, 40)) {
    console.error(`  [${v.rule}] ${v.message}`);
    console.error(`      fix: ${v.fix}`);
  }
  if (violations.length > 40) console.error(`  … and ${violations.length - 40} more`);
  process.exit(1);
}
