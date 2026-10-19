#!/usr/bin/env node
/**
 * Turn the crawled `{{Beyblade Infobox}}` wikitext into committed bey JSON.
 *
 *   node scripts/extract-wiki-beys.mjs [--corpus <path>] [--quiet]
 *
 * Reads `linka/api-beys-2026-10/*.wikitext` (written by `crawl-wiki-parts.mjs
 * --category Category:Beyblades`) and writes
 * `docs/research/bey-specs-2026-10/wiki-beys.json` plus an extraction report.
 * No network.
 *
 * ── 🛑 WHAT THIS UNLOCKS, MEASURED OVER ALL 2,011 PAGES ────────────────────
 *
 * 1,993 carry an infobox. Field coverage:
 *
 *   type 1904 · system 1898 · series 1818 · spinDirection 1673
 *   productCode 1545 · image 1398 · aka 1330 · price 1312
 *   romaji 1253 · jpName 1248 · releaseJP 907 · owner 738
 *   appearAnime 523 · specialMoves 479 · weight 262 · creator 138
 *
 * and the COMPOSITION, keyed by slot name rather than by prose:
 *
 *   driver 903 · disc 882 · layer 587 · performanceTip 408 · spinTrack 400
 *   faceBolt 336 · energyRing 293 · bit 285 · ratchet 275 · fusionWheel 268
 *
 * `composition.json` holds 259 beys. This holds a composition for ~900+, and
 * it needs no name matching and no fuzzy join — the infobox states the part
 * per slot, so the slot IS the key.
 *
 * ── 🛑 `aka` IS THE HASBRO ↔ TAKARA-TOMY MAP, ON 1,330 BEYS ────────────────
 *
 * The two vendors rename the same bey (Valkyrie/Valtryek,
 * Spriggan/Spryzen), and `aka` is the wiki stating that equivalence outright.
 * It is recorded as an ALIAS, never as the row's name: TT's JP name is
 * canonical here and a Hasbro name is a cross-reference.
 *
 * 🛑 It must not be used to MERGE two rows. Dead/Dread are two distinct
 * Gatinko bases one character apart, so any name-similarity join on this
 * corpus is disqualified; `aka` is evidence of equivalence only where the
 * wiki itself asserts it, in that field, on that page.
 *
 * ── 🛑 `WBO=` IS A FORUM URL, NOT A COMPETITIVE TIER ───────────────────────
 *
 * Measured: all 125 values are `https://worldbeyblade.org/Thread-...` links.
 * The competitive tiering this project wants (Must-buy / decent /
 * collection-only) lives on the WBO WIKI as page categories and is a separate
 * crawl. Reading this field as a rating would invent one.
 *
 * ── 🛑 FACTS ONLY — CC-BY-SA ───────────────────────────────────────────────
 *
 * Names, codes, dates, types, systems, weights, prices, slot assignments and
 * the stated owner/moves/episode. The `==Description==` and `==Gallery==`
 * prose is never read; the rendering side links back to `sourceUrl`.
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
} from "./lib/wiki-infobox.mjs";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const OUT_DIR = "docs/research/bey-specs-2026-10";
const WIKI = "https://beyblade.fandom.com/wiki/";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const CORPUS = arg("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const CRAWL = path.join(CORPUS, "linka/api-beys-2026-10");
const QUIET = process.argv.includes("--quiet");
const log = (...a) => {
  if (!QUIET) console.log(...a);
};

/**
 * Infobox slot key → our `PartSlot`.
 *
 * 🛑 Keyed on the INFOBOX KEY, which is a different id space from the part
 * pages' `Classification=`. `PerformanceTip` here is the key; `Performance
 * Tip` is the classification; `performance-tip` is our slot. Reusing
 * `slotForClassification` would miss every one of them.
 *
 * 🛑 `Blade` and `BladeX` are TWO KEYS and they split by system — measured,
 * BladeX 219 (Basic Line 177 / Unique Line 42, i.e. Beyblade X) against Blade
 * 83 (QuadDrive 44 / Dynamite Battle 32, i.e. Burst). Our union has one
 * `blade`, so both map to it and the SYSTEM field is what distinguishes them
 * downstream. Recorded here because an earlier pass mistook a correct mass
 * band flagging that difference for a wrong band, and widened the band.
 */
const SLOT_KEY = {
  // Plastic / SG / HMS
  bitchip: "bit-chip",
  attackring: "attack-ring",
  subattackring: "sub-attack-ring",
  weightdisk: "weight-disk",
  bladebase: "blade-base",
  spingear: "spin-gear",
  enginegear: "engine-gear",
  runningcore: "running-core",
  bitprotector: "bit-protector",
  supportparts: "support-parts",
  core: "core",
  // Metal Fight / Zero-G
  facebolt: "face-bolt",
  shogunfacebolt: "shogun-face-bolt",
  energyring: "energy-ring",
  fusionwheel: "fusion-wheel",
  chromewheel: "chrome-wheel",
  crystalwheel: "crystal-wheel",
  elementwheel: "element-wheel",
  warriorwheel: "warrior-wheel",
  lightwheel: "light-wheel",
  wheel: "wheel",
  spintrack: "spin-track",
  domespintrack: "dome-spin-track",
  performancetip: "performance-tip",
  // Burst
  layer: "layer",
  energylayer: "layer",
  disc: "disc",
  forgedisc: "disc",
  frame: "frame",
  driver: "driver",
  armor: "armour",
  armour: "armour",
  armortip: "armor-tip",
  gtchip: "gt-chip",
  gatinkochip: "gatinko-chip",
  sparkingchip: "superking-chip",
  superkingchip: "superking-chip",
  dbcore: "db-core",
  ring: "ring",
  layerring: "ring",
  base: "base",
  layerbase: "base",
  chassis: "chassis",
  gravityring: "gravity-ring",
  dischip: "drive-chip",
  drivechip: "drive-chip",
  stormchip: "storm-chip",
  strikechip: "strike-chip",
  bublade: "bu-blade",
  qsblade: "qs-blade",
  evolutiongear: "evolution-gear",
  // Beyblade X
  bladex: "blade",
  blade: "blade",
  ratchet: "ratchet",
  bit: "bit",
  lockchip: "lock-chip",
  mainblade: "main-blade",
  assistblade: "assist-blade",
  overblade: "over-blade",
  metalblade: "metal-blade",
  /*
   * 🛑 MERGED slots — one physical piece doing two slots' jobs. The schema
   * header already warned these exist (`Spin Gear + Blade Base -> RUNNING
   * CORE`, `SPIN TRACK + TIP combined: F:D`); these are the Burst/X instances.
   */
  discdriver: "disc-integrated-driver",
  ratchetblade: "ratchet-integrated-blade",
  ratchetbit: "ratchet-integrated-bit",
  /*
   * 🛑 `LayerWeight=Retsu` is a PART NAME, not a gram measurement — measured,
   * the values are `Retsu` and `Ten`, which are BURST weight parts. Reading it
   * as a number would have produced NaN on 60 beys and looked like missing
   * data rather than a mis-mapped slot.
   */
  layerweight: "weight",
  /*
   * 🛑 A SECOND wheel on the same bey. Synchrome combines two Chrome Wheels,
   * so `WarriorWheel2=Behemoth` is not a duplicate key to dedupe — it is the
   * other half of the combination. `composition` is an array and each entry
   * keeps its `infoboxKey`, so both survive and stay distinguishable.
   */
  warriorwheel2: "warrior-wheel",
  chromewheel2: "chrome-wheel",
  elementwheel2: "element-wheel",
  // Spinoffs
  spiritshield: "spirit-shield",
  spiritaxle: "spirit-axle",
  attackgear: "attack-gear",
  energycore: "energy-core",
  shoguntip: "shogun-tip",
  trackerwheel: "tracker-wheel",
  warriorweapons: "warrior-weapons",
  gyroholder: "gyro-holder",
  gyrostat: "gyrostat",
};

/**
 * Keys that are NOT a part slot and must not be reported as unmapped.
 * Everything else unknown IS reported — a silently dropped slot is a bey with
 * an incomplete composition and no error anywhere.
 */
const NON_SLOT_KEYS = new Set([
  "__keys", "name", "image", "imagewidth", "caption", "jpname", "romajiname",
  "aka", "type", "system", "series", "spindirection", "productcode", "price",
  "releasejp", "releaseus", "releaseca", "releaseau", "releaseen", "releaseeu",
  "owner", "creator", "specialmoves", "specialmove", "appearanime",
  "appearmanga", "appeargame", "wbo", "weightg", "debut", "beyblader",
  "firstappearance", "lastappearance", "manga", "anime", "generation",
  "colour", "color", "rarity", "exclusive", "stadium", "launcher",
  "attackstat", "defensestat", "staminastat", "weightstat", "speedstat",
  "burststat", "burststandard", "burstgt", "burstlimited", "burstclassic",
  /*
   * Found by the unmapped-key report on the first run. Each is a real field
   * rather than a slot, and the useful ones are extracted below — recorded
   * here so the report stays a list of things that still need a decision.
   */
  /*
   * 🛑 Plain `Weight=` is the BEY'S MASS ("58 grams"), not a part. It was
   * mapped to the `weight` slot and produced
   * `{slot:"weight", partName:"58 grams"}` on every Burst bey — a measurement
   * filed as a component, which would render "Weight: 58 grams" as a PART in
   * the composition panel and link nowhere. The Burst weight PART arrives as
   * `LayerWeight=` and is mapped separately.
   */
  "weight",
  "series2", "system2", "refname", "element", "product", "toyline", "avatar",
  "tokentracker", "releasekr", "krname", "kanjiname", "animedebut", "angled",
  "hasbro", "takaratomy", "sonokong", "classification", "appearances",
  "nickname", "alias", "variant", "variants", "recolor", "recolour",
]);

/**
 * A separated list -> array.
 *
 * 🛑 A COMMA INSIDE PARENTHESES IS NOT A SEPARATOR.
 *
 * Measured on `Abyss Diabolos 5 Fusion' 1S`, whose `AKA` ends
 * `... Abyss Devolos (manga, English)`. A flat split produced the fragments
 * `"Abyss Devolos (manga"` and `"English)"` — two aliases, neither of which is
 * a name anything has ever been called, and **330 rows carried one**. The
 * parenthetical is a QUALIFIER on the alias before it, exactly like the
 * `[[Bey]] (''[[Beyblade Legends]]'')` case already fixed in
 * `wiki-products-section.mjs`.
 *
 * Aliases feed search, so `English)` is not merely untidy — it is a term the
 * catalogue would claim to be known by.
 *
 * So a separator only counts at bracket depth zero.
 */
function listValue(raw) {
  const v = cleanValue(raw);
  if (!v) return [];
  const out = [];
  let buf = "";
  let depth = 0;
  for (let i = 0; i < v.length; i++) {
    const c = v[i];
    if (c === "(" || c === "[") depth += 1;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);

    if (depth === 0) {
      const br = /^<br\s*\/?>/i.exec(v.slice(i));
      if (br) {
        out.push(buf);
        buf = "";
        i += br[0].length - 1;
        continue;
      }
      if (c === "·" || c === "," || c === "•") {
        out.push(buf);
        buf = "";
        continue;
      }
    }
    buf += c;
  }
  out.push(buf);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Labelled extra images: image1 + image1label, image2 + image2label, … */
function labelledImages(box) {
  const out = [];
  const lead = imageFilename(box.image);
  if (lead) out.push({ file: lead, label: cleanValue(box.caption) || null, lead: true });
  for (let i = 1; i <= 8; i++) {
    const file = imageFilename(box[`image${i}`]);
    if (!file) continue;
    /*
     * 🛑 The label is a SEPARATE key (`image1label`) and is frequently the
     * only thing distinguishing a Hasbro recolour from the TT original —
     * measured on 364 and 359 pages for the first two slots. Dropping it
     * leaves N indistinguishable photos.
     */
    const label = cleanValue(box[`image${i}label`]) || null;
    if (out.some((o) => o.file === file)) continue;
    out.push({ file, label, lead: false });
  }
  return out;
}

function main() {
  if (!fs.existsSync(CRAWL)) {
    console.error(
      `[extract-wiki-beys] no crawl at ${CRAWL}\n` +
        `  run: node scripts/crawl-wiki-parts.mjs --category Category:Beyblades --out api-beys-2026-10`,
    );
    process.exit(2);
  }

  const files = fs.readdirSync(CRAWL).filter((f) => f.endsWith(".wikitext"));
  const out = {};
  const unmapped = new Map();
  let pages = 0;
  let withBox = 0;
  let withComposition = 0;
  const counts = {
    owner: 0, creator: 0, specialMoves: 0, appearAnime: 0, appearManga: 0,
    price: 0, weightG: 0, aka: 0, images: 0, productCode: 0, spinDirection: 0,
  };
  const slotCounts = {};

  for (const f of files) {
    pages += 1;
    /* One file at a time; nothing accumulates but the output row. */
    const text = fs.readFileSync(path.join(CRAWL, f), "utf8");
    const box = parseInfobox(text);
    if (!box || !box.__keys?.length) continue;
    withBox += 1;

    const title = f.replace(/\.wikitext$/, "").replace(/_/g, " ");
    const name = cleanValue(box.name) || title;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    /* Composition, keyed by slot. */
    const composition = [];
    for (const rawKey of box.__keys) {
      const key = rawKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (NON_SLOT_KEYS.has(key) || key.startsWith("image")) continue;
      const slot = SLOT_KEY[key];
      if (!slot) {
        unmapped.set(key, (unmapped.get(key) ?? 0) + 1);
        continue;
      }
      const partName = cleanValue(box[key]);
      if (!partName) continue;
      composition.push({ slot, partName, infoboxKey: rawKey });
      slotCounts[slot] = (slotCounts[slot] ?? 0) + 1;
    }
    if (composition.length) withComposition += 1;

    const codes = productCodes(box.productcode);
    const grams = weightGrams(box.weight);
    const images = labelledImages(box);
    const aka = listValue(box.aka);
    const moves = listValue(box.specialmoves ?? box.specialmove);

    if (cleanValue(box.owner)) counts.owner += 1;
    if (cleanValue(box.creator)) counts.creator += 1;
    if (moves.length) counts.specialMoves += 1;
    if (cleanValue(box.appearanime)) counts.appearAnime += 1;
    if (cleanValue(box.appearmanga)) counts.appearManga += 1;
    if (cleanValue(box.price)) counts.price += 1;
    if (grams !== null) counts.weightG += 1;
    if (aka.length) counts.aka += 1;
    if (images.length) counts.images += 1;
    if (codes.length) counts.productCode += 1;
    if (cleanValue(box.spindirection)) counts.spinDirection += 1;

    out[slug] = {
      slug,
      name,
      ...(cleanValue(box.jpname) ? { jpName: cleanValue(box.jpname) } : {}),
      ...(cleanValue(box.romajiname) ? { romaji: cleanValue(box.romajiname) } : {}),
      ...(aka.length ? { aka } : {}),
      ...(cleanValue(box.type) ? { type: cleanValue(box.type) } : {}),
      ...(cleanValue(box.system) ? { system: cleanValue(box.system) } : {}),
      ...(cleanValue(box.series) ? { series: cleanValue(box.series) } : {}),
      ...(cleanValue(box.spindirection)
        ? { spinDirection: cleanValue(box.spindirection) }
        : {}),
      ...(grams !== null ? { weightG: grams } : {}),
      ...(codes.length ? { productCodes: codes } : {}),
      ...(cleanValue(box.price) ? { price: cleanValue(box.price) } : {}),
      ...(cleanValue(box.releasejp) ? { releaseJP: cleanValue(box.releasejp) } : {}),
      ...(cleanValue(box.releaseus) ? { releaseUS: cleanValue(box.releaseus) } : {}),
      ...(cleanValue(box.releaseca) ? { releaseCA: cleanValue(box.releaseca) } : {}),
      /*
       * Who the bey belongs to in the story, and who built it. Two different
       * facts: `owner` is the blader (often with a "(Manga only)" qualifier
       * the source itself adds, which is KEPT — it is the source's own scope
       * note and dropping it would overstate the appearance).
       */
      ...(cleanValue(box.owner) ? { owner: cleanValue(box.owner) } : {}),
      ...(cleanValue(box.creator) ? { creator: cleanValue(box.creator) } : {}),
      ...(moves.length ? { specialMoves: moves } : {}),
      ...(cleanValue(box.appearanime) ? { appearAnime: cleanValue(box.appearanime) } : {}),
      ...(cleanValue(box.appearmanga) ? { appearManga: cleanValue(box.appearmanga) } : {}),
      ...(composition.length ? { composition } : {}),
      ...(images.length ? { images } : {}),
      /*
       * 🛑 A FORUM URL, kept under a name that says so. Calling it
       * `competitiveTier` would be inventing a rating the field never carried.
       */
      ...(cleanValue(box.wbo) ? { wboThreadUrl: cleanValue(box.wbo) } : {}),
      /*
       * Extras that are useful to a wiki page or a game and were being
       * dropped. `element` (50) is Beyblade X's attribute — Sky, and its
       * siblings — which is a real game-facing property. `series2`/`system2`
       * exist because a bey can span two (111/103 pages); keeping only the
       * first silently halves its history. `avatar` is the bit-beast.
       */
      ...(cleanValue(box.element) ? { element: cleanValue(box.element) } : {}),
      ...(cleanValue(box.series2) ? { series2: cleanValue(box.series2) } : {}),
      ...(cleanValue(box.system2) ? { system2: cleanValue(box.system2) } : {}),
      ...(cleanValue(box.avatar) ? { avatar: cleanValue(box.avatar) } : {}),
      ...(cleanValue(box.toyline) ? { toyline: cleanValue(box.toyline) } : {}),
      ...(cleanValue(box.product) ? { product: cleanValue(box.product) } : {}),
      ...(cleanValue(box.releasekr) ? { releaseKR: cleanValue(box.releasekr) } : {}),
      ...(cleanValue(box.krname) ? { krName: cleanValue(box.krname) } : {}),
      ...(cleanValue(box.kanjiname) ? { kanjiName: cleanValue(box.kanjiname) } : {}),
      ...(cleanValue(box.animedebut) ? { animeDebut: cleanValue(box.animedebut) } : {}),
      ...(cleanValue(box.tokentracker) ? { tokenTracker: cleanValue(box.tokentracker) } : {}),
      sourceUrl: WIKI + encodeURIComponent(title.replace(/ /g, "_")),
      source: "fandom-infobox",
    };
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "wiki-beys.json"),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8",
  );

  const report = {
    note:
      "Written by scripts/extract-wiki-beys.mjs from the api.php crawl in " +
      "linka/api-beys-2026-10. Facts only — no prose is taken from the " +
      "CC-BY-SA source. Composition comes from the infobox's per-SLOT keys, " +
      "so there is no name matching and no fuzzy join. `WBO=` is a forum " +
      "thread URL and is NOT a competitive tier — that lives on the WBO wiki " +
      "as page categories and is a separate crawl.",
    crawlDir: CRAWL,
    pagesRead: pages,
    withInfobox: withBox,
    beysExtracted: Object.keys(out).length,
    withComposition,
    fieldCoverage: counts,
    compositionPerSlot: Object.fromEntries(
      Object.entries(slotCounts).sort((a, b) => b[1] - a[1]),
    ),
    /*
     * 🛑 REPORTED, never silently skipped. An infobox key this map does not
     * know is either a new slot or a new non-slot field, and both need a
     * human — a dropped slot is a bey with an incomplete composition and
     * nothing anywhere says so.
     */
    unmappedInfoboxKeys: Object.fromEntries(
      [...unmapped.entries()].sort((a, b) => b[1] - a[1]),
    ),
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "bey-extraction-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  log(`[extract-wiki-beys] ${pages} pages, ${withBox} with an infobox`);
  log(`  beys extracted:      ${Object.keys(out).length}`);
  log(`  with a composition:  ${withComposition}`);
  log("");
  for (const [k, v] of Object.entries(counts)) {
    log(`  ${k.padEnd(14)} ${String(v).padStart(5)}`);
  }
  const un = [...unmapped.entries()].sort((a, b) => b[1] - a[1]);
  if (un.length) {
    log(`\n  🛑 ${un.length} unmapped infobox key(s) — each is a dropped slot or a new field:`);
    for (const [k, n] of un.slice(0, 20)) log(`     ${k.padEnd(24)} ${n}`);
  }
}

main();
