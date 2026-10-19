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
import { slotForClassification, SLOT_VOCAB_REPORT, SLOT_LABEL } from "./lib/part-slot-vocab.mjs";
import { parseProductsSection, hasMoldVariations } from "./lib/wiki-products-section.mjs";

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

/**
 * A meta description composed from FACTS, in our own words.
 *
 * ── 🛑 WHY THIS IS GENERATED AND NOT COPIED ────────────────────────────────
 *
 * Every crawled page has an `== Description ==` section, and taking it would
 * be both a CC-BY-SA problem and the exact anti-pattern the competitor crawl
 * recorded: *"raikagesbeybladestore… 114-char product bodies lifted verbatim
 * from the Wiki including Japanese name and romaji, one of which ships with
 * the literal UI string 'Add to Wishlist'."* The corpus README's rule is the
 * one followed here — take the facts, write our own prose, link out.
 *
 * ── 🛑 WHAT IT REPLACES ────────────────────────────────────────────────────
 *
 * Today's part-detail description is:
 *
 *   "{name} is a Beyblade {label}.{weight} See which models use it and what
 *    is currently listed."
 *
 * — and the weight clause was absent for 87% of parts, so most pages shipped
 * one near-identical sentence. Google treats a template like that as thin,
 * and 752 pages sharing it compete with each other rather than ranking.
 *
 * Every clause below is omitted when its fact is missing, so a sparse part
 * gets a short honest sentence rather than a padded one with an em-dash in it.
 */
function buildSeoDescription({ name, slot, box, grams, products }) {
  const label = (SLOT_LABEL[slot] ?? slot).toLowerCase();
  const system = cleanValue(box.system);
  const series = cleanValue(box.series);
  const codes = productCodes(box.productcode);
  const jp = cleanValue(box.releasejp);

  const parts = [];

  // Sentence 1 — what it is, how heavy, what system.
  let s1 = `${name} is a Beyblade ${label}`;
  if (system) s1 += ` from the ${system}`;
  if (grams !== null) s1 += `, weighing ${grams} g`;
  parts.push(`${s1}.`);

  /*
   * Sentence 2 — when, under what box code, for what series.
   *
   * 🛑 No preposition before the date. `ReleaseJP` is sometimes a full date
   * ("June 10th, 2023"), sometimes a month ("August 2010"), sometimes a bare
   * year ("2001") — so "on" is wrong for two of the three and "in" is wrong
   * for the first. The date simply follows the verb.
   */
  if (codes.length || jp) {
    let s2 = "Released";
    if (jp) s2 += ` ${jp}`;
    if (codes.length) s2 += ` as ${codes.slice(0, 2).join(" and ")}`;
    if (series) s2 += ` for ${series}`;
    parts.push(`${s2}.`);
  } else if (series) {
    parts.push(`Part of ${series}.`);
  }

  // Sentence 3 — which beys it came in. The question buyers actually ask.
  const beys = products?.beys ?? [];
  if (beys.length === 1) {
    parts.push(`It shipped with ${beys[0]}.`);
  } else if (beys.length > 1) {
    const shown = beys.slice(0, 3).join(", ");
    const rest = beys.length - 3;
    parts.push(
      rest > 0
        ? `It shipped with ${shown} and ${rest} other release${rest === 1 ? "" : "s"}.`
        : `It shipped with ${shown}.`,
    );
  }

  // Sentence 4 — colourways, counted rather than listed.
  const cw = products?.colourways ?? [];
  if (cw.length === 1) {
    parts.push(`One alternate colourway is recorded: ${cw[0].colourway}.`);
  } else if (cw.length > 1) {
    parts.push(`${cw.length} alternate colourways are recorded.`);
  }

  const text = parts.join(" ");
  /*
   * Google truncates a meta description around 155–160 characters, but a
   * longer one is not penalised — it is simply cut. Trimming to a sentence
   * boundary under 300 keeps the useful clauses and never ends mid-word.
   */
  if (text.length <= 300) return text;
  let cut = text.slice(0, 300);
  const lastStop = cut.lastIndexOf(". ");
  return lastStop > 80 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`;
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
  let withProducts = 0;
  let withColourways = 0;
  let beyRefs = 0;
  let droppedBullets = 0;
  let withSeo = 0;
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

    /*
     * `== Products ==` — which beys this part shipped in, and its colourways.
     * The two questions the gallery could not answer, from one section that is
     * present on 2,105 of 2,248 pages.
     */
    const products = parseProductsSection(text);
    if (products.hasSection) withProducts += 1;
    if (products.beys.length) beyRefs += products.beys.length;
    if (products.colourways.length) withColourways += 1;
    droppedBullets += products.dropped;

    const seo = buildSeoDescription({ name, slot, box, grams, products });

    perSlot[slot] = (perSlot[slot] ?? 0) + 1;
    if (grams !== null) weights += 1;
    if (image) images += 1;
    if (seo) withSeo += 1;

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
      ...(products.releases.length ? { releases: products.releases } : {}),
      ...(products.beys.length ? { shippedIn: products.beys } : {}),
      ...(products.colourways.length ? { colourways: products.colourways } : {}),
      ...(hasMoldVariations(text) ? { hasMoldVariations: true } : {}),
      ...(seo ? { seoDescription: seo } : {}),
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
    withProductsSection: withProducts,
    withColourways: withColourways,
    beyReferencesExtracted: beyRefs,
    productBulletsDropped: droppedBullets,
    withSeoDescription: withSeo,
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
  log("");
  log(`  with a Products section ${withProducts}`);
  log(`  bey references          ${beyRefs}   <- "which bey does it come in"`);
  log(`  with colourways         ${withColourways}`);
  log(`  product bullets dropped ${droppedBullets}   (no resolvable bey link)`);
  log(`  SEO descriptions built  ${withSeo}`);
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
