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
  splitList,
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
  /*
   * Structured siblings of two of the display rows below. Declared here and
   * returned beside `rows` rather than assigned to module scope: a module-level
   * `let` that a function mutates is read-after-call state, and the next person
   * to add a second call site gets the previous part's ratings with no error.
   */
  let statsOut = {};
  let legalityOut = {};
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
  /*
   * 🛑 `HasbroCode` is a SEPARATE key from `ProductCode`, on 350 pages. It is
   * the other vendor's code for the same physical part, which is precisely the
   * Hasbro <-> Takara-Tomy grouping signal — and it was being dropped while
   * the project planned to go looking for that signal elsewhere.
   */
  push("Hasbro code", box.hasbrocode);
  push("Type", box.type);
  push("Spin direction", box.spindirection);
  push("Element", box.element);
  push("Part family", box.partfamily);
  push("System (also)", box.system2);
  push("Series (also)", box.series2);
  push("Toyline", box.toyline);
  push("Released (EU)", box.releaseeu);
  push("Released (KR)", box.releasekr);

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
    ["Attack", box.attackstat, "attack"],
    ["Defense", box.defensestat, "defense"],
    ["Stamina", box.staminastat, "stamina"],
    ["Weight", box.weightstat, "weight"],
    ["Speed", box.speedstat, "speed"],
    ["Burst", box.burststat, "burst"],
    /*
     * 🛑 FIVE MORE, measured on real pages and previously dropped:
     *   Dash 55 · Burst Resistance 55 · Power 50 · Height 45 · Run Time 31
     * Note the SCALE differs — `Bit - Accel` reads Dash 40 and Burst
     * Resistance 80, i.e. 0-100, while the six above are 0-6. They are kept
     * verbatim rather than normalised: rescaling them here would invent
     * precision the source never stated, and a 0-100 value is still
     * comparable against other parts of the same slot.
     */
    ["Dash", box.dashstat, "dash"],
    ["Burst resistance", box.burstresistancestat, "burstResistance"],
    ["Power", box.powerstat, "power"],
    ["Height", box.heightstat, "height"],
    ["Run time", box.runtimestat, "runTime"],
  ]
    .map(([k, v, key]) => [k, cleanValue(v), key])
    .filter(([, v]) => v !== "");
  if (stats.length) {
    rows.push({ label: "Stats", value: stats.map(([k, v]) => `${k} ${v}`).join(" · ") });
  }
  /*
   * 🛑 The display row above is kept EXACTLY as it was, and the numbers are
   * emitted a second time as structured data. Both are needed and they answer
   * different questions:
   *
   *   the row     a human reading one part's page, where six rows of single
   *               digits would crowd out every real specification
   *   `ratings`   sorting, filtering, a side-by-side comparison, and the
   *               simulation — none of which can parse "Attack 3 · Defense 0"
   *
   * Replacing the row with six rows would regress the page; replacing the
   * numbers with the row makes every one of those four uses impossible. The
   * duplication is between a RENDERING and a VALUE, which is not the
   * mirror-drift trap (Root Cause #42) because the row is derived from the
   * same parse in the same pass — there is no second write path to forget.
   */
  /*
   * 🛑 The KEY comes from an explicit column, never from the label.
   * `k.toLowerCase()` turned "Burst resistance" into `"burst resistance"` —
   * with a space — and "Run time" into `"run time"`. tsc caught both against
   * `PartRatings`, which is exactly why the seed keeps its type annotation
   * instead of an `as` cast. Same bug and same fix as the legality keys below.
   */
  statsOut = Object.fromEntries(
    stats.map(([, v, key]) => [key, Number(v)]).filter(([, v]) => Number.isFinite(v)),
  );

  /*
   * WBO format legality. Only the formats the page actually answers — an
   * absent format is "not stated", and rendering it as "illegal" would be an
   * assertion the source never made.
   */
  const legality = [
    ["Burst", box.burststandard, "burst"],
    ["Burst GT", box.burstgt, "burstGt"],
    ["Burst Limited", box.burstlimited, "burstLimited"],
    ["Burst Classic", box.burstclassic, "burstClassic"],
    /*
     * 🛑 The Burst four were all this read, and the corpus answers SEVEN more
     * — measured: X Standard 286, MFB Standard 96, MFB Limited 96,
     * MFB Zero-G 77, MFB 4D 77, X Masters and X Open. A Beyblade X part was
     * therefore reporting no legality at all on 286 pages, which renders
     * identically to "not tournament legal".
     */
    ["X Standard", box.xstandard, "xStandard"],
    ["X Masters", box.xmasters, "xMasters"],
    ["X Open", box.xopen, "xOpen"],
    ["MFB Standard", box.mfbstandard, "mfbStandard"],
    ["MFB Limited", box.mfblimited, "mfbLimited"],
    ["MFB Zero-G", box.mfbzerog, "mfbZeroG"],
    ["MFB 4D", box.mfb4d, "mfb4d"],
  ]
    .map(([k, v, key]) => [k, tri(v), key])
    .filter(([, v]) => v !== null);
  if (legality.length) {
    rows.push({
      label: "WBO legality",
      value: legality.map(([k, v]) => `${k}: ${v ? "legal" : "banned"}`).join(" · "),
    });
  }
  /*
   * 🛑 A format the page does not answer is ABSENT, never `false`. `tri()`
   * already returns null for silence and the filter above drops it, so this
   * map holds only formats the source actually ruled on. Defaulting the rest
   * to `false` would publish "banned in Burst Classic" as a fact about every
   * part whose page simply does not mention Burst Classic.
   */
  legalityOut = Object.fromEntries(legality.map(([, v, key]) => [key, v]));

  return { rows, ratings: statsOut, wboLegality: legalityOut };
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

    const { rows: specs, ratings, wboLegality } = buildSpecs(box, slot);
    const akaList = splitList(box.aka);
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
      ...(Object.keys(ratings).length ? { ratings } : {}),
      /*
       * 🛑 `AKA` is on 1,133 of 2,248 part pages and carries BOTH the
       * community abbreviation (`Armor Tip - Adventure` -> `Ad`) and the other
       * vendor's name. Aliases feed search, so dropping it meant a buyer
       * searching the abbreviation printed on the part found nothing.
       *
       * Split depth-aware, because a comma inside a parenthetical is a
       * qualifier and not a separator — the same bug that produced 330 broken
       * aliases in the bey extractor.
       */
      ...(akaList.length ? { aka: akaList } : {}),
      ...(cleanValue(box.hasbrocode) ? { hasbroCode: cleanValue(box.hasbrocode) } : {}),
      /*
       * 🛑 ALSO top-level, not only as a `specs[]` row.
       *
       * `Japanese name` reaches 1,068 rows as a spec row, which renders fine
       * on the page and is unreachable from anywhere else. Page METADATA needs
       * a field: a `<title>`, an `og:title`, an hreflang alternate and a
       * JSON-LD `alternateName` cannot scan an array of label/value pairs for
       * one whose label happens to read "Japanese name".
       */
      ...(cleanValue(box.jpname) ? { jpName: cleanValue(box.jpname) } : {}),
      ...(cleanValue(box.romajiname) ? { romaji: cleanValue(box.romajiname) } : {}),
      ...(cleanValue(box.kanjiname) ? { kanjiName: cleanValue(box.kanjiname) } : {}),
      ...(cleanValue(box.type) ? { partType: cleanValue(box.type) } : {}),
      ...(cleanValue(box.spindirection) ? { spinDirection: cleanValue(box.spindirection) } : {}),
      ...(cleanValue(box.element) ? { element: cleanValue(box.element) } : {}),
      /*
       * A part page can name a character — `Bit Chip - Black Dranzer` is Kai
       * Hiwatari's — on 33 pages, with an episode on 26. Small counts, but it
       * is the only place a PART is tied to a character.
       */
      ...(cleanValue(box.owner) ? { owner: cleanValue(box.owner) } : {}),
      ...(cleanValue(box.appearanime) ? { appearAnime: cleanValue(box.appearanime) } : {}),
      ...(Object.keys(wboLegality).length ? { wboLegality } : {}),
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
