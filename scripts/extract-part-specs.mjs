#!/usr/bin/env node
/**
 * Extract PART SPECIFICATIONS from the local corpus's curated tables.
 *
 *   node scripts/extract-part-specs.mjs [--corpus <path>] [--quiet]
 *
 * Writes `docs/research/part-specs-2026-10/part-specs.json` and
 * `extraction-report.json`. Reads the corpus read-only and never the network.
 *
 * ── 🛑 WHAT THIS CLOSES ────────────────────────────────────────────────────
 *
 * `partGlossary` carries seven fields and 98 of 752 rows have a weight. The
 * corpus has 1,048 slot-attributable spec rows across 18 curated tables —
 * weight, material, mm dimensions, protrusions, spin compatibility, contact
 * geometry — and none of it reached the product, so the parts gallery rendered
 * a name and nothing else for 87% of its rows.
 *
 * ── 🛑 THE REPORT IS THE DELIVERABLE, NOT A LOG ────────────────────────────
 *
 * Every later phase consumes these numbers. A broken slot resolver would
 * propagate silently through the schema, the seed, the UI and the 543 new
 * parts, so the report records the per-slot join rate, every dropped table,
 * every unresolvable name and every cell-level DISAGREEMENT between sources —
 * and the gate is that those numbers match what was measured by hand before
 * any of this was written.
 *
 * ── 🛑 LICENSING ───────────────────────────────────────────────────────────
 *
 * The corpus derives from the Beyblade Wiki, which is CC-BY-SA. This script
 * takes FACTS ONLY — names, codes, weights, dimensions, materials. It copies
 * no prose. The editorial columns (`Competitive Notes`, `Notes`, `Key
 * Behavior`, `Competitive Use`) are deliberately NOT in the allow-list for
 * exactly that reason, and the rendering side links out to the source page.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:writes-docs-research
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  SLOTS,
  cleanCell,
  normaliseName,
  partGlossaryId,
  readPartSpecFile,
  singleWeightG,
} from "./lib/part-spec-tables.mjs";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const OUT_DIR = "docs/research/part-specs-2026-10";
const GLOSSARY_JSON = "docs/research/part-composition-2026-10/part-glossary.json";

/**
 * Source precedence, highest first. A higher source WINS a label outright; a
 * lower one only FILLS a label the higher sources left empty.
 *
 * 🛑 `corpus-parts-table` outranks `corpus-gen-glossary` because its
 * provenance is per-ROW (`FACT`, `FACT(PDB) — CS4-270`, `INFERENCE`) while the
 * aggregates tag per-FILE or per-COLUMN. Finer-grained provenance is the whole
 * basis for trusting one number over another.
 */
const PRECEDENCE = ["corpus-parts-table", "corpus-gen-glossary"];

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const CORPUS = argValue("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const QUIET = process.argv.includes("--quiet");

function log(...a) {
  if (!QUIET) console.log(...a);
}

/* ── Inputs ──────────────────────────────────────────────────────────────── */

function collectSourceFiles() {
  const files = [];
  const partsDir = path.join(CORPUS, "linka/parts");
  if (fs.existsSync(partsDir)) {
    for (const sub of fs.readdirSync(partsDir)) {
      const dir = path.join(partsDir, sub);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith(".md")) files.push({ file: path.join(dir, f), kind: "corpus-parts-table" });
      }
    }
  }
  for (const gen of ["gen1", "gen2", "gen3", "gen4"]) {
    const f = path.join(CORPUS, "linka", gen, "parts-glossary.md");
    if (fs.existsSync(f)) files.push({ file: f, kind: "corpus-gen-glossary" });
  }
  return files;
}

/* ── Merge ───────────────────────────────────────────────────────────────── */

/**
 * Fold the flat spec list into `partKey -> { label -> spec }`, applying
 * precedence and recording every disagreement.
 *
 * 🛑 Disagreements are REPORTED, never averaged and never silently resolved.
 * Two sources giving one part two different weights is a data problem worth a
 * human looking at it; a mean of the two is a number no source ever measured.
 */
function mergeSpecs(all) {
  const byKey = new Map();
  const disagreements = [];

  const rank = (s) => {
    const i = PRECEDENCE.indexOf(s);
    return i < 0 ? PRECEDENCE.length : i;
  };

  for (const spec of all) {
    const key = `${spec.slot}\u0000${normaliseName(spec.code || spec.name)}`;
    if (!byKey.has(key)) {
      byKey.set(key, { slot: spec.slot, name: spec.name, code: spec.code, labels: new Map() });
    }
    const entry = byKey.get(key);
    if (!entry.code && spec.code) entry.code = spec.code;

    const prev = entry.labels.get(spec.label);
    if (!prev) {
      entry.labels.set(spec.label, spec);
      continue;
    }
    if (prev.value === spec.value) continue;

    const better = rank(spec.source) < rank(prev.source);
    disagreements.push({
      slot: spec.slot,
      name: entry.name,
      label: spec.label,
      kept: better ? spec.value : prev.value,
      keptSource: better ? spec.source : prev.source,
      keptFile: better ? spec.file : prev.file,
      dropped: better ? prev.value : spec.value,
      droppedSource: better ? prev.source : spec.source,
      droppedFile: better ? prev.file : spec.file,
    });
    if (better) entry.labels.set(spec.label, spec);
  }
  return { byKey, disagreements };
}

/* ── Join against the seeded glossary ────────────────────────────────────── */

function loadGlossary() {
  if (!fs.existsSync(GLOSSARY_JSON)) {
    console.error(`[extract-part-specs] missing ${GLOSSARY_JSON}`);
    process.exit(2);
  }
  const rows = JSON.parse(fs.readFileSync(GLOSSARY_JSON, "utf8"));

  // Mirrors `generate-parts-seed.mjs`: the slot comes from the classification,
  // and the id tail is the code when there is one, else the name.
  const slotOf = (classification) =>
    String(classification).toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

  const byKey = new Map();
  const bySlotName = new Map();
  for (const r of rows) {
    const slot = slotOf(r.classification);
    if (!SLOTS.includes(slot)) continue;
    const id = partGlossaryId(slot, r.code || r.name);
    const rec = { id, slot, name: r.name, code: r.code ?? null };
    if (r.code) byKey.set(`${slot}\u0000${normaliseName(r.code)}`, rec);
    byKey.set(`${slot}\u0000${normaliseName(r.name)}`, rec);
    bySlotName.set(`${slot}\u0000${normaliseName(r.name)}`, rec);
    for (const a of r.aliases ?? []) {
      const k = `${slot}\u0000${normaliseName(a)}`;
      if (!byKey.has(k)) byKey.set(k, rec);
    }
  }
  return { rows, byKey, bySlotName };
}

/* ── Main ────────────────────────────────────────────────────────────────── */

function main() {
  if (!fs.existsSync(path.join(CORPUS, "linka"))) {
    console.error(
      `[extract-part-specs] corpus not found at ${CORPUS}\n` +
        `  pass --corpus <path> or set BEY_CORPUS.`,
    );
    process.exit(2);
  }

  const files = collectSourceFiles();
  log(`[extract-part-specs] ${files.length} source file(s)`);

  const allSpecs = [];
  const dropped = [];
  let rawRows = 0;
  const perFile = [];

  for (const { file, kind } of files) {
    const r = readPartSpecFile(file, kind);
    allSpecs.push(...r.specs);
    dropped.push(...r.dropped);
    rawRows += r.rows;
    perFile.push({
      file: file.replace(/\\/g, "/").replace(`${CORPUS}/`, ""),
      kind,
      partRows: r.rows,
      specValues: r.specs.length,
      droppedTables: r.dropped.length,
    });
  }

  const { byKey: merged, disagreements } = mergeSpecs(allSpecs);
  const glossary = loadGlossary();

  /* Join, slot-scoped. */
  const specsById = {};
  const unmatched = [];
  const perSlot = {};
  for (const slot of SLOTS) perSlot[slot] = { corpusParts: 0, matched: 0, seeded: 0 };
  for (const rec of glossary.bySlotName.values()) perSlot[rec.slot].seeded += 1;

  for (const [key, entry] of merged) {
    perSlot[entry.slot].corpusParts += 1;
    const hit =
      glossary.byKey.get(key) ??
      (entry.code ? glossary.byKey.get(`${entry.slot}\u0000${normaliseName(entry.code)}`) : null) ??
      glossary.byKey.get(`${entry.slot}\u0000${normaliseName(entry.name)}`);

    if (!hit) {
      unmatched.push({ slot: entry.slot, name: entry.name, code: entry.code });
      continue;
    }
    perSlot[entry.slot].matched += 1;

    const specs = [...entry.labels.values()]
      .map((s) => ({
        label: s.label,
        value: s.value,
        ...(s.unit ? { unit: s.unit } : {}),
        source: s.source,
        confidence: s.confidence,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const weightSpec = entry.labels.get("Weight");
    const weightG = weightSpec ? singleWeightG(weightSpec.value) : null;

    /*
     * 🛑 `weightG` and a `Weight` spec row are MUTUALLY EXCLUSIVE.
     *
     * The detail page already renders the weight as a badge. Leaving a Weight
     * row in `specs[]` too shows the number twice, and the two can disagree
     * the moment either is edited. When a single number was parseable the
     * typed field wins and the row is dropped; when the cell was multi-valued
     * (`15.3g (regular) / 15.5g (indent mold)`) the row is the only honest
     * representation and the typed field stays unset.
     */
    const finalSpecs = weightG === null ? specs : specs.filter((s) => s.label !== "Weight");

    specsById[hit.id] = {
      ...(finalSpecs.length ? { specs: finalSpecs } : {}),
      ...(weightG === null ? {} : { weightG }),
    };
    if (!finalSpecs.length && weightG === null) delete specsById[hit.id];
  }

  /* Report. */
  const confidenceCounts = {};
  for (const e of merged.values()) {
    for (const s of e.labels.values()) {
      confidenceCounts[s.confidence] = (confidenceCounts[s.confidence] ?? 0) + 1;
    }
  }

  const labelCounts = {};
  for (const e of merged.values()) {
    for (const s of e.labels.values()) labelCounts[s.label] = (labelCounts[s.label] ?? 0) + 1;
  }

  const matchedTotal = Object.values(perSlot).reduce((n, s) => n + s.matched, 0);
  const seededTotal = Object.values(perSlot).reduce((n, s) => n + s.seeded, 0);

  const report = {
    note:
      "Written by scripts/extract-part-specs.mjs. Facts only — no prose is copied " +
      "from the CC-BY-SA source. Read this before building on part-specs.json: a " +
      "per-slot rate below the recorded figure means the slot resolver broke.",
    generatedFrom: CORPUS,
    sourceFiles: perFile.length,
    corpusPartRows: rawRows,
    specValuesExtracted: allSpecs.length,
    distinctCorpusParts: merged.size,
    matchedToSeededGlossary: matchedTotal,
    seededGlossaryParts: seededTotal,
    joinRate: seededTotal ? Number((matchedTotal / seededTotal).toFixed(4)) : 0,
    perSlot,
    labelCounts,
    confidenceCounts,
    droppedTables: dropped,
    droppedTableCount: dropped.length,
    droppedRowCount: dropped.reduce((n, d) => n + d.rows, 0),
    disagreements,
    disagreementCount: disagreements.length,
    unmatchedCorpusParts: unmatched.length,
    unmatchedSample: unmatched.slice(0, 60),
    perFile,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "part-specs.json"),
    `${JSON.stringify(specsById, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "extraction-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  log("");
  log(`  corpus part rows read      ${rawRows}`);
  log(`  spec values extracted      ${allSpecs.length}`);
  log(`  distinct corpus parts      ${merged.size}`);
  log(`  joined to seeded glossary  ${matchedTotal} / ${seededTotal}  (${(report.joinRate * 100).toFixed(1)}%)`);
  log(`  parts receiving specs      ${Object.keys(specsById).length}`);
  log(`  dropped tables             ${dropped.length}  (${report.droppedRowCount} rows)`);
  log(`  cross-source disagreements ${disagreements.length}`);
  log(`  unmatched corpus parts     ${unmatched.length}   <- Phase 9 candidates`);
  log("");
  log("  per slot (matched / seeded):");
  for (const slot of SLOTS) {
    const s = perSlot[slot];
    log(`    ${slot.padEnd(16)} ${String(s.matched).padStart(3)} / ${String(s.seeded).padStart(3)}`);
  }
  log("");
  log(`  wrote ${OUT_DIR}/part-specs.json`);
  log(`  wrote ${OUT_DIR}/extraction-report.json`);
}

main();
