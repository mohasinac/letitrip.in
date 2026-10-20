#!/usr/bin/env node
/**
 * Extract the TAGGED PHYSICAL CONSTANTS from the local case-study corpus.
 *
 *   node --max-old-space-size=3072 scripts/extract-case-study-constants.mjs
 *
 * ── 🛑 WHAT THIS IS, AND WHY IT IS NOT THE `modes[]` WORK ─────────────────
 *
 * The plan's item 3b wanted `modes[]` and `pieceCount` per bey from this
 * corpus, and measured the sourcing correctly: the wiki carries ZERO mode
 * data (0 `Modes=` fields and 1 `===Modes===` section across 2,248 part pages,
 * 0 across 2,011 bey pages) while the case study mentions modes 1,290 times.
 *
 * What that measurement MISSED is that the mode prose is prose — "a three-part
 * automatic state machine: Metal Frame rotation -> pin actuation -> tip
 * selection", with ASCII diagrams of 120-degree detents. No parser recovers
 * that, and I said as much.
 *
 * But the corpus ALSO carries 218 four-column tables that are fully
 * structured, each row `| parameter | value | source | [TAG] |`, and those are
 * exactly the numbers a spinning-top simulation integrates: per-material tip
 * friction, spring constants, restitution, and the one mode fact that IS
 * numeric (`F:D mode-switch threshold, 94.3 rad/s`). Extracting them is the
 * part of 3b that is extraction rather than authoring.
 *
 * ── 🛑 THE TAG IS THE POINT — IT IS NEVER DROPPED ─────────────────────────
 *
 * The corpus defines its own provenance convention and it is better than most
 * of what we have:
 *
 *   [CONFIRMED]  directly measured, or cross-verified against case physics
 *   [FACT]       a wiki spec, a confirmed part weight, official product data
 *   [INFERRED]   derived from confirmed inputs, with the derivation shown
 *   [ESTIMATED]  image-based measurement or approximation, no primary source
 *
 * Measured here: 182 CONFIRMED, 27 ESTIMATED, 9 INFERRED. Flattening those
 * into one bag of numbers would turn 27 image-based guesses into measurements,
 * which is precisely the confusion the convention exists to prevent — so the
 * tag travels with every row and a consumer can refuse anything below
 * CONFIRMED.
 *
 * 🛑 FACTS ONLY, and these are the OWNER'S OWN analysis of their own corpus,
 * not a third-party publication — so there is no attribution question here of
 * the kind the wiki data carries. The `source` citation is kept anyway,
 * because a constant whose derivation nobody can find is a constant nobody
 * can correct.
 *
 * @tag domain:physics
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:writes-docs-research
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const OUT_DIR = "docs/research/physics-2026-10";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const CORPUS = arg("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const DIR = path.join(CORPUS, "case study");

/** The corpus's own tag vocabulary. An unknown tag is reported, not mapped. */
const KNOWN_TAGS = new Set(["CONFIRMED", "FACT", "INFERRED", "ESTIMATED"]);

/**
 * Strip markdown emphasis from a cell without touching the value.
 *
 * 🛑 `**0.17**` must become `0.17` and NOT `0.17` with the asterisks counted
 * as part of a unit string. Only emphasis markers are removed — backticks,
 * units, ranges (`0.65–0.70`) and inline maths (`k = 1500 N/m`) are left
 * exactly as written, because normalising those is where a value silently
 * changes meaning.
 */
const cell = (s) =>
  String(s)
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();

function main() {
  if (!fs.existsSync(DIR)) {
    console.error(
      `[extract-case-study-constants] no corpus at ${DIR}\n` +
        `  pass --corpus <path> or set BEY_CORPUS.`,
    );
    process.exit(2);
  }

  const rows = [];
  const byTag = {};
  const byFile = {};
  const unknownTags = new Map();
  let filesScanned = 0;

  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".md")).sort()) {
    filesScanned += 1;
    /* One file at a time — the corpus is 265,727 lines and nothing needs to
     * hold more than the current file plus the output rows. */
    const text = fs.readFileSync(path.join(DIR, f), "utf8");
    let lineNo = 0;
    for (const line of text.split(/\r?\n/)) {
      lineNo += 1;
      /*
       * Exactly four columns, the last being a bracketed tag. A three-column
       * or five-column table is a DIFFERENT table in this corpus (the case
       * ledger, the per-part breakdowns), and matching loosely would mix them
       * — so the shape is the filter.
       */
      const m = line.match(
        /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*\[([A-Z]+)([^\]]*)\]\s*\|?\s*$/,
      );
      if (!m) continue;
      const [, parameter, value, source, tag, qualifier] = m;
      if (!KNOWN_TAGS.has(tag)) {
        unknownTags.set(tag, (unknownTags.get(tag) ?? 0) + 1);
        continue;
      }
      rows.push({
        parameter: cell(parameter),
        value: cell(value),
        source: cell(source),
        tag,
        /* `[ESTIMATED — pull-test]` carries HOW it was estimated. Dropping the
         * qualifier would lose the only thing that makes it checkable. */
        ...(qualifier.trim() ? { qualifier: qualifier.replace(/^[\s—-]+/, "").trim() } : {}),
        file: f,
        line: lineNo,
      });
      byTag[tag] = (byTag[tag] ?? 0) + 1;
      byFile[f] = (byFile[f] ?? 0) + 1;
    }
  }

  if (rows.length === 0) {
    console.error(
      "[extract-case-study-constants] matched ZERO tagged rows — the table shape has " +
        "changed. Refusing to write an empty file, which would read as 'the corpus has none'.",
    );
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "case-study-constants.json"),
    `${JSON.stringify(
      {
        note:
          "Tagged physical constants extracted from the local case-study corpus by " +
          "scripts/extract-case-study-constants.mjs. The TAG is load-bearing: CONFIRMED is " +
          "measured or cross-verified, ESTIMATED is an image-based approximation with no " +
          "primary source. A consumer that treats them alike turns guesses into measurements.",
        generatedAt: new Date().toISOString(),
        filesScanned,
        count: rows.length,
        byTag,
        byFile,
        unknownTags: Object.fromEntries(unknownTags),
        rows,
      },
      null,
      1,
    )}\n`,
    "utf8",
  );

  console.log(`[extract-case-study-constants] ${filesScanned} files, ${rows.length} tagged rows`);
  for (const [t, n] of Object.entries(byTag).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  [${t}]`);
  }
  if (unknownTags.size) {
    console.log(`\n  🛑 unknown tags skipped: ${[...unknownTags.keys()].join(", ")}`);
  }
  console.log(`\n-> ${OUT_DIR}/case-study-constants.json`);
}

main();
