#!/usr/bin/env node
/**
 * Turn the crawled `{{Part Infobox}}` wikitext into committed spec JSON.
 *
 *   node scripts/extract-wiki-part-specs.mjs [--corpus <path>] [--quiet]
 *
 * Reads `linka/api-2026-10/*.wikitext` (written by `crawl-wiki-parts.mjs`) and
 * writes `docs/research/part-specs-2026-10/wiki-part-specs.json` plus
 * `wiki-extraction-report.json`. No network.
 *
 * ── 🛑 WHAT THIS IS FOR ────────────────────────────────────────────────────
 *
 * Our glossary carries a weight on 98 of 752 parts, and twelve of twenty
 * classifications have NONE — every Attack Ring, Blade Base, Driver, Face
 * Bolt, Disc, Blade and Ratchet. The wiki infobox carries `Weight=` on 2,023
 * of 2,248 pages, including all of those slots. That gap was never a fact
 * about the wiki; it was a fact about a five-month-old crawl that had not
 * fetched the legacy pages.
 *
 * ── 🛑 THE SLOT COMES FROM `Classification=`, NEVER THE TITLE ──────────────
 *
 * `Performance_Tip_-_Xtend` carries `Classification=Driver`, and 21 of 31
 * `Performance_Tip_-_*` pages are Burst Drivers filed under a legacy prefix.
 * The title prefix is a filing convention; the field is the fact. Measured:
 * the field yields `Driver 276` and `Performance Tip 51` as distinct sets.
 *
 * ── 🛑 FACTS ONLY — CC-BY-SA ───────────────────────────────────────────────
 *
 * Weights, codes, dates, classifications, systems, names and stat numbers.
 * The `==Description==` prose that follows every infobox is never read. The
 * rendering side links back to `sourceUrl`.
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
  parseInfobox,
  cleanValue,
  imageFilename,
  weightGrams,
  productCodes,
  tri,
  weightInBand,
} from "./lib/wiki-infobox.mjs";
import { slotForClassification, SLOT_VOCAB_REPORT } from "./lib/part-slot-vocab.mjs";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const OUT_DIR = "docs/research/part-specs-2026-10";
const WIKI = "https://beyblade.fandom.com/wiki/";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const CORPUS = arg("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const CRAWL = path.join(CORPUS, "linka/api-2026-10");
const QUIET = process.argv.includes("--quiet");
const log = (...a) => { if (!QUIET) console.log(...a); };

/** `partGlossaryId`, byte-identical to the schema's. */
function partGlossaryId(slot, codeOrName) {
  const tail = String(codeOrName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slot}--${tail}`;
}
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * The part's NAME, from the title's post-` - ` half.
 *
 * 🛑 `Name=` is unreliable: measured empty on `Weight Disk - Eight Heavy` and
 * set to the FULL title on `Attack Ring - Cross Dranzer`. The title's second
 * half is the one consistently-correct source, with `Name=` as a fallback only
 * when the title has no ` - ` at all.
 */
function nameFromTitle(title, box) {
  const dash = title.indexOf(" - ");
  if (dash > 0) return title.slice(dash + 3).trim();
  const n = cleanValue(box.name);
  return n && n !== title ? n : title;
}

/** Spec rows, in the order a reader wants them. Facts only. */
function buildSpecs(box, slot) {
  const rows = [];
  const push = (label, value, unit) => {
    const v = cleanValue(value);
    if (v) rows.push(unit ? { label, value: v, unit } : { label, value: v });
  };

  push("Classification", box.classification);
  push("System", box.system);
  push("Series", box.series);

  const codes = productCodes(box.productcode);
  if (codes.length) rows.push({ label: "Product code", value: codes.join(" · ") });

  push("Abbreviation", box.abbreviation);
  push("Japanese name", box.jpname);
  push("Romaji", box.romajiname);

  const release = [
    ["Released (JP)", box.releasejp],
    ["Released (US)", box.releaseus],
    ["Released (CA)", box.releaseca],
    ["Released (AU)", box.releaseau],
  ];
  for (const [label, v] of release) push(label, v);

  /*
   * The 0–6 stat grid. Emitted as ONE row rather than six, because six rows of
   * single digits crowd out every real specification in a 10-row table — and
   * the grid is only meaningful read together.
   */
  const stats = [
    ["Attack", box.attackstat],
    ["Defense", box.defensestat],
    ["Stamina", box.staminastat],
    ["Weight", box.weightstat],
    ["Speed", box.speedstat],
    ["Burst", box.burststat],
  ]
    .map(([k, v]) => [k, cleanValue(v)])
    .filter(([, v]) => v !== "");
  if (stats.length) {
    rows.push({ label: "Stats", value: stats.map(([k, v]) => `${k} ${v}`).join(" · ") });
  }

  /*
   * WBO format legality. Only the formats the page actually answers — an
   * absent format is "not stated", and rendering it as "illegal" would be an
   * assertion the source never made.
   */
  const legality = [
    ["Burst", box.burststandard],
    ["Burst GT", box.burstgt],
    ["Burst Limited", box.burstlimited],
    ["Burst Classic", box.burstclassic],
  ]
    .map(([k, v]) => [k, tri(v)])
    .filter(([, v]) => v !== null);
  if (legality.length) {
    rows.push({
      label: "WBO legality",
      value: legality.map(([k, v]) => `${k}: ${v ? "legal" : "banned"}`).join(" · "),
    });
  }

  return rows;
}

function main() {
  if (!fs.existsSync(CRAWL)) {
    console.error(
      `[extract-wiki-part-specs] no crawl at ${CRAWL}\n` +
        `  run: node scripts/crawl-wiki-parts.mjs`,
    );
    process.exit(2);
  }

  const files = fs.readdirSync(CRAWL).filter((f) => f.endsWith(".wikitext"));
  log(`[extract-wiki-part-specs] ${files.length} crawled page(s)`);

  const out = {};
  const unmappedClassification = {};
  const outOfBand = [];
  const noInfobox = [];
  const multiWeight = [];
  const perSlot = {};
  let weights = 0;
  let images = 0;
  let idCollisions = 0;
  let slotFromTitlePrefix = 0;
  const seenId = new Map();

  for (const f of files) {
    const text = fs.readFileSync(path.join(CRAWL, f), "utf8");
    const title = f.replace(/\.wikitext$/, "").replace(/_/g, " ");
    const box = parseInfobox(text);
    if (!box) {
      noInfobox.push(title);
      continue;
    }

    /*
     * 🛑 `Classification=` first, the TITLE PREFIX only as a fallback.
     *
     * The field is authoritative where present — `Performance_Tip_-_Xtend`
     * carries `Classification=Driver`, and trusting its prefix would file 21
     * Burst Drivers as Metal Fight tips. But 160 pages ship the template with
     * the field EMPTY (every legacy `Bit Chip - *`, a batch of Attack Rings),
     * and for those the prefix is the only statement the page makes. Dropping
     * them lost 160 real parts and read as a lower count rather than a fault.
     */
    const declared = cleanValue(box.classification);
    const dashIdx = title.indexOf(" - ");
    const prefix = dashIdx > 0 ? title.slice(0, dashIdx) : "";
    const slot = slotForClassification(declared) ?? slotForClassification(prefix);
    const classification = declared || prefix;
    if (slot) {
      if (!declared && prefix) slotFromTitlePrefix += 1;
    } else {
      const key = declared || (prefix ? `(prefix) ${prefix}` : "(empty)");
      unmappedClassification[key] = (unmappedClassification[key] ?? 0) + 1;
      continue;
    }

    const name = nameFromTitle(title, box);
    if (!name) continue;

    const codes = productCodes(box.productcode);
    const abbrev = cleanValue(box.abbreviation);
    /*
     * The id tail follows the glossary's own rule: the CODE when there is one,
     * else the name. `Abbreviation` is the part's printed code (`RF`, `B:D`);
     * `ProductCode` is the BOX code (`BB-01`) and is NOT an id component — two
     * different parts ship in one box, so a box code is not unique per part.
     */
    const id = partGlossaryId(slot, abbrev || name);

    if (seenId.has(id)) {
      idCollisions += 1;
      continue;
    }
    seenId.set(id, title);

    const grams = weightGrams(box.weight);
    if (grams === null && cleanValue(box.weight)) {
      multiWeight.push({ title, raw: cleanValue(box.weight) });
    }
    const band = weightInBand(slot, grams);
    if (!band.ok) {
      outOfBand.push({ title, slot, grams, reason: band.reason });
    }

    const specs = buildSpecs(box, slot);
    const image = imageFilename(box.image);

    perSlot[slot] = (perSlot[slot] ?? 0) + 1;
    if (grams !== null) weights += 1;
    if (image) images += 1;

    out[id] = {
      slot,
      name,
      classification,
      ...(abbrev ? { code: abbrev } : {}),
      ...(codes.length ? { productCodes: codes } : {}),
      /*
       * 🛑 PUBLISHED even when out of band, and flagged in the report instead.
       *
       * The first version withheld an out-of-band weight, and that was wrong:
       * of the 11 flagged, TEN are real outliers the source is right about —
       * `Fusion Wheel - Diablo` at 51.4 g (the heaviest ever made),
       * `Layer - Nightmare Longinus` at 37.34 g, `Spin Gear - Gyro Spin Gear`
       * at 32 g. Suppressing them discarded ten true facts to avoid one
       * mis-slotted row. The band's job is to put a human's eye on an unusual
       * number, not to decide the number is false.
       */
      ...(grams !== null ? { weightG: grams } : {}),
      ...(grams !== null && !band.ok ? { weightOutOfBand: band.reason } : {}),
      ...(specs.length ? { specs } : {}),
      ...(image ? { wikiImage: image } : {}),
      sourceUrl: WIKI + encodeURIComponent(title.replace(/ /g, "_")),
      source: "fandom-infobox",
    };
  }

  const report = {
    note:
      "Written by scripts/extract-wiki-part-specs.mjs from the api.php crawl in " +
      "linka/api-2026-10. Facts only — no prose is taken from the CC-BY-SA source. " +
      "The slot comes from the infobox's Classification field, never the page title " +
      "prefix (21 of 31 Performance_Tip_-_* pages are really Burst Drivers).",
    crawlDir: CRAWL,
    pagesRead: files.length,
    partsExtracted: Object.keys(out).length,
    withWeight: weights,
    withImage: images,
    slotResolvedFromTitlePrefix: slotFromTitlePrefix,
    glossaryWeightBaseline: "98 of 752 before this crawl",
    perSlot,
    slotVocabulary: SLOT_VOCAB_REPORT,
    pagesWithoutInfobox: noInfobox.length,
    pagesWithoutInfoboxSample: noInfobox.slice(0, 20),
    unmappedClassification,
    unmappedClassificationCount: Object.values(unmappedClassification).reduce((a, b) => a + b, 0),
    idCollisions,
    weightOutOfDocumentedBand: outOfBand.length,
    weightOutOfDocumentedBandSample: outOfBand.slice(0, 30),
    weightNotASingleValue: multiWeight.length,
    weightNotASingleValueSample: multiWeight.slice(0, 20),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "wiki-part-specs.json"), `${JSON.stringify(out, null, 2)}\n`);
  fs.writeFileSync(
    path.join(OUT_DIR, "wiki-extraction-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  log("");
  log(`  parts extracted         ${report.partsExtracted}`);
  log(`  with a single weight    ${weights}   (glossary baseline: 98 of 752)`);
  log(`  with an image filename  ${images}`);
  log(`  slot from title prefix  ${slotFromTitlePrefix}   (Classification= was empty)`);
  log(`  pages with no infobox   ${noInfobox.length}`);
  log(`  unmapped classification ${report.unmappedClassificationCount}`);
  log(`  id collisions skipped   ${idCollisions}`);
  log(`  weight out of band      ${outOfBand.length}   <- published AND flagged for review`);
  log(`  weight not single-valued ${multiWeight.length}  <- kept as a spec row only`);
  log("");
  log(`  slot vocabulary: ${SLOT_VOCAB_REPORT.existing} existing + ${SLOT_VOCAB_REPORT.added} new = ${SLOT_VOCAB_REPORT.total}`);
  log("");
  log("  per slot:");
  for (const [slot, n] of Object.entries(perSlot).sort((a, b) => b[1] - a[1])) {
    log(`    ${slot.padEnd(26)} ${String(n).padStart(4)}`);
  }
  log("");
  log(`  wrote ${OUT_DIR}/wiki-part-specs.json`);
  log(`  wrote ${OUT_DIR}/wiki-extraction-report.json`);
}

main();
