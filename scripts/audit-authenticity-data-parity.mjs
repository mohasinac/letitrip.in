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
 *   R5 · SINGLE_TABLE      — no code sits in two of the four tables at once.
 *                            This is the invariant the three-source merge
 *                            exists to hold: a code the sources disagree about
 *                            belongs in CONTESTED and in neither of the others,
 *                            or the engine's table scan silently returns
 *                            whichever it reads first.
 *   R6 · SERIES_PARITY     — the seed's four series-window documents agree
 *                            with SERIES_WINDOWS in the bundle, and both agree
 *                            with a fresh parse of the reddit post's own
 *                            "Additional Information" dates.
 *   R7 · MODEL_CODE_PARITY — the per-model reverse index and the picker list
 *                            agree with a FRESH link of the sources, and the
 *                            bundle and the seed carry the same model set.
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
import {
  buildCanonicalIndex,
  buildDateCodeTables,
  buildModelCodeIndex,
  buildSeriesWindows,
} from "./lib/authenticity-sources.mjs";

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
  const start = src.indexOf(`export const ${name}`);
  if (start < 0) return "";
  const open = src.indexOf("[", start);
  const close = src.indexOf("\n];", open);
  return open < 0 || close < 0 ? "" : src.slice(open, close);
}

/**
 * The bundled generator emits one JSON object literal per line, so a row is
 * parsed rather than pattern-matched.
 *
 * 🛑 This replaced a regex that enumerated every field. Adding a field to the
 * generator made that regex stop matching ANY row, and an audit that matches
 * nothing reports success — Root Cause #84's shape. `JSON.parse` fails loudly
 * instead, and PARSE_FAILED below turns "I read zero rows" into a violation.
 */
function parseBundled(block) {
  const out = new Map();
  for (const rawLine of block.split("\n")) {
    const line = rawLine.trim().replace(/,$/, "");
    if (!line.startsWith("{")) continue;
    const row = JSON.parse(line);
    out.set(row.code, row);
  }
  return out;
}

const bundled = {
  "recorded-original": parseBundled(sliceArray(bundledSrc, "ORIGINAL_DATE_CODES")),
  "recorded-midfake": parseBundled(sliceArray(bundledSrc, "MIDFAKE_DATE_CODES")),
  contested: parseBundled(sliceArray(bundledSrc, "CONTESTED_DATE_CODES")),
  unresolved: parseBundled(sliceArray(bundledSrc, "UNCLEAR_DATE_CODES")),
};

/** Parse the seed collection's date-code documents. */
const seedCodes = new Map();
const seedDocRe =
  /id:\s*"authknow-code-[a-z0-9]+",\s*\n\s*kind:\s*"date-code",\s*\n\s*code:\s*"([A-Z0-9]+)",\s*\n\s*verdict:\s*"([a-z-]+)",\s*\n\s*products:\s*(\[[^\]]*\]),\s*\n\s*regions:\s*(\[[^\]]*\]),\s*\n\s*packaging:\s*(\[[^\]]*\]),\s*\n\s*notes:\s*(\[[\s\S]*?\]),\s*\n\s*families:\s*(\[[^\]]*\]),\s*\n\s*sources:\s*(\[[^\]]*\]),\s*\n\s*uncertain:\s*(true|false),\s*\n\s*derivedDate:\s*(null|"[^"]*"),\s*\n\s*sourceDateDiffers:\s*(true|false)/g;
for (const m of seedSrc.matchAll(seedDocRe)) {
  seedCodes.set(m[1], {
    verdict: m[2],
    products: JSON.parse(m[3]),
    regions: JSON.parse(m[4]),
    families: JSON.parse(m[7]),
    sources: JSON.parse(m[8]),
    uncertain: m[9] === "true",
    derivedDate: m[10] === "null" ? null : JSON.parse(m[10]),
    sourceDateDiffers: m[11] === "true",
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
  for (const field of ["regions", "families", "sources"]) {
    if (JSON.stringify(s[field]) !== JSON.stringify(b[field])) {
      fail("FIELD_PARITY", `${code}: ${field} differ`, REGEN);
    }
  }
  if (s.uncertain !== b.uncertain) {
    fail("FIELD_PARITY", `${code}: uncertain ${b.uncertain} vs ${s.uncertain}`, REGEN);
  }
}

/* R3 — both files still match the live parse of the sources. */
const fresh = buildDateCodeTables();
const freshFlat = new Map();
for (const [verdict, list] of [
  ["recorded-original", fresh.original],
  ["recorded-midfake", fresh.midfake],
  ["contested", fresh.contested],
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

/*
 * R5 — no code may sit in two tables at once.
 *
 * 🛑 This is the invariant the whole merge exists to hold. A code recorded as
 * genuine by one source and as a midfake by another belongs in CONTESTED and in
 * neither of the other two; if it leaks back into both, the engine's table scan
 * returns whichever it reads first — which is a coin flip presented to a buyer
 * as an answer, in a direction nobody chose.
 */
const seenIn = new Map();
for (const [verdict, table] of Object.entries(bundled)) {
  for (const code of table.keys()) {
    const prior = seenIn.get(code);
    if (prior) {
      fail(
        "SINGLE_TABLE",
        `${code} appears in both ${prior} and ${verdict} — a code must live in exactly one table`,
        REGEN,
      );
    }
    seenIn.set(code, verdict);
  }
}

/*
 * R6 — the fourth data kind this collection carries, parity-checked the same
 * way as the date-code tables: bundle vs. seed vs. a fresh parse. Added
 * 2026-10-19 alongside the series-window feature itself — a new data shape is
 * exactly the moment a parity check is cheapest to add and easiest to forget.
 */
// `parseBundled` above keys rows by `row.code`; series rows have no `code`
// field, so this is the same one-JSON-object-per-line parse keyed by `name`.
function parseSeriesBundled(block) {
  const out = new Map();
  for (const rawLine of block.split("\n")) {
    const line = rawLine.trim().replace(/,$/, "");
    if (!line.startsWith("{")) continue;
    const row = JSON.parse(line);
    out.set(row.name, row);
  }
  return out;
}
const bundledSeriesWindows = parseSeriesBundled(sliceArray(bundledSrc, "SERIES_WINDOWS"));

const seedSeriesWindows = new Map();
const seedSeriesRe =
  /id:\s*"authknow-series-[a-z-]+",\s*\n\s*kind:\s*"series-window",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*generation:\s*"([a-z]+)",\s*\n\s*startLabel:\s*"([^"]+)",\s*\n\s*endLabel:\s*"([^"]+)"/g;
for (const m of seedSrc.matchAll(seedSeriesRe)) {
  seedSeriesWindows.set(m[1], { generation: m[2], startLabel: m[3], endLabel: m[4] });
}

if (bundledSeriesWindows.size === 0 || seedSeriesWindows.size === 0) {
  fail(
    "SERIES_PARSE_FAILED",
    `parsed ${bundledSeriesWindows.size} bundled and ${seedSeriesWindows.size} seed series-window rows — ` +
      `the format changed and this audit is no longer reading it`,
    "Fix the SERIES_WINDOWS regexes in this audit, then verify by breaking a row on purpose.",
  );
} else {
  for (const [name, b] of bundledSeriesWindows) {
    const s = seedSeriesWindows.get(name);
    if (!s) {
      fail("SERIES_PARITY", `"${name}" is in the bundled SERIES_WINDOWS but not in the Firestore seed`, REGEN);
      continue;
    }
    if (s.generation !== b.generation || s.startLabel !== b.startLabel || s.endLabel !== b.endLabel) {
      fail("SERIES_PARITY", `"${name}": bundled and seed series-window rows disagree`, REGEN);
    }
  }
  for (const name of seedSeriesWindows.keys()) {
    if (!bundledSeriesWindows.has(name)) {
      fail("SERIES_PARITY", `"${name}" is in the Firestore seed but not in the bundled SERIES_WINDOWS`, REGEN);
    }
  }

  const freshSeries = buildSeriesWindows();
  if (freshSeries.length !== bundledSeriesWindows.size) {
    fail(
      "SERIES_FRESH_VS_SOURCE",
      `the source now parses to ${freshSeries.length} series window(s) but the emitted files carry ${bundledSeriesWindows.size}`,
      REGEN,
    );
  }
  for (const w of freshSeries) {
    const b = bundledSeriesWindows.get(w.name);
    if (!b || b.generation !== w.generation || b.startLabel !== w.startLabel || b.endLabel !== w.endLabel) {
      fail("SERIES_FRESH_VS_SOURCE", `"${w.name}" disagrees with a fresh parse of the reddit post`, REGEN);
    }
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

/*
 * R7 — the per-model reverse index.
 *
 * 🛑 Checked against a FRESH LINK of the sources, not against the other
 * emitted copy. The two generated files are built by the same resolver in the
 * same process, so they agree with each other by construction and comparing
 * them proves only that nobody hand-edited one — the exact "derived artefact
 * compared against another copy of itself" failure Root Cause #105 is about,
 * and the reason R3 exists for the code tables.
 *
 * It also pins the LINKAGE COUNT. The resolver refuses to link an ambiguous
 * label, so a corpus edit that makes two beys share a base name silently drops
 * every code recorded against both — a loss that looks exactly like a bey for
 * which nothing was ever recorded. A drop here fails rather than reads as
 * normal.
 */
const MODEL_CODES_FILE = path.join(ROOT, "src/features/authenticity/data/model-codes.generated.ts");
const MODEL_OPTIONS_FILE = path.join(ROOT, "src/features/authenticity/data/model-options.generated.ts");

if (!fs.existsSync(MODEL_CODES_FILE) || !fs.existsSync(MODEL_OPTIONS_FILE)) {
  fail("MISSING_FILE", "the model-codes / model-options bundles do not exist", REGEN);
} else {
  const bundledModels = parseBundledBy(
    sliceArray(fs.readFileSync(MODEL_CODES_FILE, "utf8"), "MODEL_CODES"),
    "slug",
  );
  const freshModels = new Map(
    buildModelCodeIndex(buildDateCodeTables(), freshIndex).models.map((m) => [m.slug, m]),
  );

  if (bundledModels.size === 0) {
    fail(
      "PARSE_FAILED",
      "parsed 0 rows out of MODEL_CODES — its emitted format changed, so this rule is no longer reading it",
      "Fix the slice in this audit, then break a row on purpose and watch it fail.",
    );
  }

  if (bundledModels.size !== freshModels.size) {
    fail(
      "MODEL_CODE_PARITY",
      `MODEL_CODES carries ${bundledModels.size} models but a fresh link of the sources resolves ${freshModels.size}`,
      REGEN,
    );
  }

  for (const [slug, fresh] of freshModels) {
    const b = bundledModels.get(slug);
    if (!b) {
      fail("MODEL_CODE_PARITY", `${slug} links from the sources but is not in MODEL_CODES`, REGEN);
      continue;
    }
    if (b.categoryId !== fresh.categoryId) {
      fail(
        "MODEL_CODE_PARITY",
        `${slug} points at ${b.categoryId} but the shared id helper resolves ${fresh.categoryId}`,
        REGEN,
      );
    }
    for (const key of ["originalCodes", "midfakeCodes", "contestedCodes", "unclearCodes"]) {
      if (b[key].join(",") !== fresh[key].join(",")) {
        fail("MODEL_CODE_PARITY", `${slug}.${key} disagrees with a fresh link of the sources`, REGEN);
      }
    }
  }

  /* Every seed model-codes document must have a bundled twin, and vice versa. */
  const seedModelIds = new Set(
    [...seedSrc.matchAll(/id: "authknow-model-([a-z0-9-]+)"/g)].map((m) => m[1]),
  );
  const bundledModelIds = new Set(
    [...bundledModels.values()].map((m) => m.categoryId.replace(/^category-/, "")),
  );
  for (const id of bundledModelIds) {
    if (!seedModelIds.has(id)) {
      fail("MODEL_CODE_PARITY", `authknow-model-${id} is in the bundle but not in the seed`, REGEN);
    }
  }
  for (const id of seedModelIds) {
    if (!bundledModelIds.has(id)) {
      fail("MODEL_CODE_PARITY", `authknow-model-${id} is in the seed but not in the bundle`, REGEN);
    }
  }

  /* The picker list must cover the whole corpus — it is the only way in. */
  const optionRows = (fs.readFileSync(MODEL_OPTIONS_FILE, "utf8").match(/\{ slug: "/g) ?? []).length;
  if (optionRows !== freshIndex.length) {
    fail(
      "MODEL_CODE_PARITY",
      `MODEL_OPTIONS carries ${optionRows} beys but the corpus parses to ${freshIndex.length} — the picker would silently not offer some of them`,
      REGEN,
    );
  }
}

report();

/** `parseBundled`, keyed on something other than `code`. */
function parseBundledBy(block, key) {
  const out = new Map();
  for (const rawLine of block.split("\n")) {
    const line = rawLine.trim().replace(/,$/, "");
    if (!line.startsWith("{")) continue;
    const row = JSON.parse(line);
    out.set(row[key], row);
  }
  return out;
}

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
