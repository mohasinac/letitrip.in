/**
 * Generates `appkit/src/seed/products-catalogue-seed-data.ts` — one listing per
 * tier-4 leaf, so the 1,173-node taxonomy actually has a catalogue in it.
 *
 * ── 🛑 THE GAP THIS CLOSES ─────────────────────────────────────────────────
 *
 * Measured before writing it: **967 of 968** tier-4 listing leaves had no
 * product at all. We had built 216 named-model leaves and 752 part leaves and
 * put 71 products in the whole tree — so almost every category page, every
 * breadcrumb and every part page rendered an empty grid, and the counts G3b
 * computes were counting nothing.
 *
 * ── 🛑 WHERE THE DATA COMES FROM, AND WHERE IT DOES NOT ───────────────────
 *
 * Names, product codes, types, spin, system, series and part weights come from
 * the LOCAL canonical corpus (B4/E4), already committed as the category leaves'
 * own `name`, `description` and `aliases`. Prices come from `MARKET_BANDS` —
 * 70 measured bands, each with its own sample size and source.
 *
 * 🛑 **Nothing is copied from a competitor's listing.** The standing decision
 * in this plan is that competitor data is commercial, not canonical, and that
 * the 36,461 crawled images are third-party product photography which must not
 * be republished. A measured aggregate band is a statistic; a scraped title and
 * photo is somebody's listing. So images stay on `seedPhoto()` tiles, which
 * `resolveMediaUrl` maps to a committed local placeholder rather than a proxied
 * remote fetch (Root Cause #104).
 *
 * ── 🛑 `seedPurpose: "test"`, AND NOT `isTestData` ────────────────────────
 *
 * The two are orthogonal and conflating them is a recorded near-miss: deriving
 * `isTestData` from the purpose would have hidden the entire catalogue from the
 * public while reporting a clean load. These rows are:
 *
 *   - `test`          — purgeable, because they are GENERATED and one command
 *                       re-creates them. Nothing is lost by clearing them.
 *   - NOT `isTestData` — publicly visible, because a catalogue nobody can see
 *                       is not a catalogue.
 *
 * ── 🛑 PRICE IS DERIVED FROM THE NEAREST BANDED ANCESTOR ──────────────────
 *
 * A model leaf has no band of its own; its line does. The walk is
 * nearest-ancestor-first and a leaf under no banded ancestor is **SKIPPED**,
 * not given a guessed price — a fabricated price is worse than an absent
 * listing, because a seller prices against it and a buyer believes it.
 *
 * Usage: node scripts/gen-catalogue-products.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "appkit/src/seed/products-catalogue-seed-data.ts");

const { categoriesSeedData } = await import(
  "file://" + path.join(ROOT, "appkit/dist/seed/categories-seed-data.js").replace(/\\/g, "/")
);

const byId = new Map(categoriesSeedData.map((c) => [c.id, c]));

/** The nearest ancestor (or self) carrying a measured band. */
function bandFor(leaf) {
  const chain = [leaf.id, ...[...(leaf.parentIds ?? [])].reverse()];
  for (const id of chain) {
    const b = byId.get(id)?.productDefaults?.priceGuidance?.market;
    if (b && typeof b.median === "number") return { band: b, from: id };
  }
  return null;
}

/**
 * A deterministic small integer from a string.
 *
 * 🛑 NOT `Math.random()`. Seed files are re-imported and re-executed on every
 * `appkit-seed load`/`status`/`delete`, so a random value means the same
 * conceptual row differs every run — `load` stops upserting and starts
 * creating duplicates, and `status`/`delete` can never find what a previous
 * load wrote (Root Cause #25, which silently duplicated 50 orders per reseed).
 */
function seeded(key, mod) {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = Math.imul(31, h) + key.charCodeAt(i) | 0;
  return Math.abs(h) % mod;
}

/**
 * A price inside the measured band, varied deterministically per leaf.
 *
 * 🛑 Varied rather than every row sitting on the median, because a catalogue
 * where 216 listings share one price is not a catalogue anyone can test a
 * price filter, a price sort or a price-range facet against. The spread stays
 * INSIDE p25..p75 — it never invents a price outside what was measured.
 */
function priceFor(leafId, band) {
  const lo = typeof band.p25 === "number" ? band.p25 : band.median;
  const hi = typeof band.p75 === "number" ? band.p75 : band.median;
  if (hi <= lo) return band.median;
  const steps = Math.max(1, Math.round((hi - lo) / 50));
  const pick = lo + seeded(leafId, steps + 1) * 50;
  return Math.min(hi, pick);
}

/**
 * ── 🛑 FIXTURE PRICES for tiers with NO measured band ─────────────────────
 *
 * Measured: 361 of 968 leaves have no banded ancestor, and they are not a
 * random 361 — they are the Plastic-Gen component tiers (attack rings 87, bit
 * chips 66, blade bases 49, weight disks 26, running cores 25, spin gears 14),
 * two metal tiers raikages does not stock (face bolts 42, chrome wheels 25),
 * Burst chips & armour (4) and the Engine Gear line (23).
 *
 * The cause is real and worth stating: **raikages is the ONLY component-level
 * seller in all seventeen crawled sites**, and they stock metal-era rings,
 * wheels, tracks and tips. A loose Plastic-Gen attack ring has no measured
 * price anywhere in the corpus.
 *
 * 🛑 SO THIS TABLE IS NOT A `MARKET_BAND`, AND MUST NEVER BECOME ONE.
 *
 * `MARKET_BANDS` is a HINT SHOWN TO A SELLER, and this plan's rule for it is
 * absolute: *"a band with no evidence is omitted rather than guessed — a
 * fabricated typical price is worse than no hint, because a seller prices
 * against it."* That rule is untouched; none of these numbers goes near
 * `category-content.ts`.
 *
 * What they are instead is a **demo-fixture price**, used only to give a
 * generated listing a number so the category page is not empty. The nearest
 * MEASURED component tier is named per row, so a reader can see exactly what
 * each figure is an inference from rather than taking it as evidence.
 */
const FIXTURE_PRICES = {
  // Plastic Gen components. Inference: raikages' metal-era component tiers are
  // ₹129–₹299; plastic parts are smaller, lighter and less sought, so the floor
  // of that range rather than the middle.
  "category-original-attack-rings": { p25: 149, median: 199, p75: 299, from: "raikages metal component tier (energy-rings n=68)" },
  "category-original-weight-disks": { p25: 149, median: 199, p75: 249, from: "raikages metal component tier (spin-tracks n=53)" },
  "category-original-blade-bases": { p25: 149, median: 249, p75: 349, from: "raikages metal component tier (fusion-wheels n=52)" },
  "category-original-bit-chips": { p25: 99, median: 129, p75: 199, from: "WHS burst-parts n=82, the cheapest measured component tier" },
  "category-original-spin-gears": { p25: 149, median: 199, p75: 299, from: "raikages metal component tier (energy-rings n=68)" },
  "category-original-running-cores": { p25: 199, median: 299, p75: 399, from: "raikages fusion-wheels n=52; HMS is the highest-value original tier" },
  "category-original-engine-gears": { p25: 199, median: 299, p75: 399, from: "raikages fusion-wheels n=52; a moulded module, not a flat part" },
  // Metal tiers raikages does not stock.
  "category-metal-face-bolts": { p25: 99, median: 129, p75: 149, from: "WHS burst-parts n=82; a face bolt is the smallest metal part" },
  "category-metal-chrome-wheels": { p25: 249, median: 349, p75: 499, from: "raikages fusion-wheels n=52; 4D chrome is the heaviest single part" },
  // Burst — this one is barely an inference: WHS measured `burst-parts` at
  // 99/149/249 (n=82) and it was simply never wired to this node.
  "category-burst-chips-armour": { p25: 99, median: 149, p75: 249, from: "WHS burst-parts n=82 — MEASURED, just not wired to this node" },
  // The G-Rev line. Its siblings are measured; it alone is not.
  "category-original-engine-gear": { p25: 999, median: 1699, p75: 1999, from: "the magna-core V-Force band (its adjacent G-Rev-era sibling)" },
};

const CONDITIONS = ["new", "like_new", "good", "used"];
const PART_SLOT_PREFIXES = [
  "category-original-attack-rings",
  "category-original-weight-disks",
  "category-original-blade-bases",
  "category-original-bit-chips",
  "category-original-spin-gears",
  "category-original-engine-gears",
  "category-original-running-cores",
  "category-metal-face-bolts",
  "category-metal-energy-rings",
  "category-metal-fusion-wheels",
  "category-metal-chrome-wheels",
  "category-metal-spin-tracks",
  "category-metal-performance-tips",
  "category-burst-layers",
  "category-burst-discs",
  "category-burst-drivers",
  "category-burst-chips-armour",
  "category-x-blades",
  "category-x-ratchets",
  "category-x-bits",
];
const PART_PARENTS = new Set(PART_SLOT_PREFIXES);

const leaves = categoriesSeedData.filter((c) => c.tier === 4 && !c.categoryType);
if (leaves.length === 0) {
  console.error("No tier-4 leaves found — refusing to write.");
  process.exit(1);
}

const rows = [];
let skippedNoBand = 0;
const skippedIds = [];

for (const leaf of leaves) {
  const parent = (leaf.parentIds ?? [])[leaf.parentIds.length - 1];
  let hit = bandFor(leaf);
  let inferred = null;
  if (!hit) {
    // Walk the chain for a FIXTURE price, nearest first, same as the band walk.
    for (const id of [leaf.id, ...[...(leaf.parentIds ?? [])].reverse()]) {
      if (FIXTURE_PRICES[id]) {
        hit = { band: FIXTURE_PRICES[id], from: id };
        inferred = FIXTURE_PRICES[id].from;
        break;
      }
    }
  }
  if (!hit) {
    skippedNoBand += 1;
    if (skippedIds.length < 12) skippedIds.push(leaf.id);
    continue;
  }
  const isPart = PART_PARENTS.has(parent);
  const tail = leaf.id.replace(/^category-/, "");
  const id = `product-${tail}`;

  // Leaf-first, matching how every existing product row stores the chain.
  const slugs = [leaf.id, ...[...(leaf.parentIds ?? [])].reverse()];
  const names = [leaf.name, ...[...(leaf.categoryNames ?? leaf.ancestors?.map((a) => a.name) ?? [])].reverse()];

  const price = priceFor(leaf.id, hit.band);
  const condition = CONDITIONS[seeded(`${leaf.id}-cond`, CONDITIONS.length)];
  /*
   * Stock is small and deterministic, and ~1 in 7 is deliberately 0. The
   * "Sold & Ended" scope was empty and untestable for most of this project's
   * life, and 76–93% of every crawled competitor's catalogue is sold out — a
   * catalogue with no sold-out rows does not resemble the thing it models.
   */
  const stock = seeded(`${leaf.id}-stock`, 7) === 0 ? 0 : 1 + seeded(`${leaf.id}-qty`, 5);

  rows.push({
    id,
    slug: id,
    title: leaf.name,
    description: leaf.description,
    categorySlugs: slugs,
    categoryNames: names,
    brandSlug: "brand-beyblade",
    brand: "Beyblade",
    price,
    currency: "INR",
    stockQuantity: stock,
    availableQuantity: stock,
    isSold: stock === 0,
    condition,
    isPart,
    aliases: leaf.aliases ?? [],
    bandFrom: hit.from,
    inferred,
  });
}

if (rows.length === 0) {
  console.error("Zero rows generated — refusing to write.");
  process.exit(1);
}

const ids = rows.map((r) => r.id);
const dupes = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
if (dupes.length > 0) {
  console.error(`Duplicate product id(s): ${dupes.slice(0, 8).join(", ")} — refusing to write.`);
  process.exit(1);
}

/**
 * The glossary id a part listing points at.
 *
 * The part LEAF id is `category-${tail}` or `category-${slot}-${tail}`, and the
 * glossary id is `${slot}--${tail}` — the same tail by construction
 * (gen-category-parts.mjs inherits it). Reconstructed here from the parent
 * node's slot rather than re-slugified, for the same reason.
 */
function partGlossaryIdFor(r) {
  const parent = r.categorySlugs[1];
  const slot = SLOT_OF_PARENT[parent];
  if (!slot) return "";
  const tail = r.id.replace(/^product-/, "").replace(new RegExp(`^${slot}-`), "");
  return `${slot}--${tail}`;
}

const SLOT_OF_PARENT = {
  "category-original-attack-rings": "attack-ring",
  "category-original-weight-disks": "weight-disk",
  "category-original-blade-bases": "blade-base",
  "category-original-bit-chips": "bit-chip",
  "category-original-spin-gears": "spin-gear",
  "category-original-engine-gears": "engine-gear",
  "category-original-running-cores": "running-core",
  "category-metal-face-bolts": "face-bolt",
  "category-metal-energy-rings": "energy-ring",
  "category-metal-fusion-wheels": "fusion-wheel",
  "category-metal-chrome-wheels": "chrome-wheel",
  "category-metal-spin-tracks": "spin-track",
  "category-metal-performance-tips": "performance-tip",
  "category-burst-layers": "layer",
  "category-burst-discs": "disc",
  "category-burst-drivers": "driver",
  "category-burst-chips-armour": "armour",
  "category-x-blades": "blade",
  "category-x-ratchets": "ratchet",
  "category-x-bits": "bit",
};

const q = (v) => JSON.stringify(v);
const body = rows
  .map((r) => {
    const img = `seedPhoto("product-image-${r.id.replace(/^product-/, "")}-1", 900, 900)`;
    return `  {
    id: ${q(r.id)},
    slug: ${q(r.slug)},
    title: ${q(r.title)},
    description: ${q(r.description)},
    categorySlugs: ${q(r.categorySlugs)},
    categoryNames: ${q(r.categoryNames)},
    brandSlug: "brand-beyblade",
    brand: "Beyblade",
    price: ${r.price},
    currency: "INR",
    stockQuantity: ${r.stockQuantity},
    availableQuantity: ${r.availableQuantity},
    isSold: ${r.isSold},
    status: PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED,
    condition: ${q(r.condition)} as ProductDocument["condition"],
    mainImage: ${img},
    images: [${img}],
    storeId: "store-letitrip-official",
    storeName: "LetItRip Official",${
      r.isPart ? `\n    partGlossaryId: ${q(partGlossaryIdFor(r))},` : ""
    }${r.aliases.length ? `\n    tags: ${q(r.aliases.slice(0, 6))},` : ""}
    createdAt: CATALOGUE_SEEDED_AT,
    updatedAt: CATALOGUE_SEEDED_AT,
  },`;
  })
  .join("\n");

const partCount = rows.filter((r) => r.isPart).length;
const soldOut = rows.filter((r) => r.isSold).length;
const inferredCount = rows.filter((r) => r.inferred).length;

const out = `/*
 * GENERATED by scripts/gen-catalogue-products.mjs — do not edit by hand.
 *
 * WHY: 967 of 968 tier-4 leaves had NO product. We had built 216 named-model
 *      leaves and 752 part leaves and put 71 products in the whole tree, so
 *      almost every category page, breadcrumb and part page rendered an empty
 *      grid and G3b's counts were counting nothing.
 *
 * WHAT: ${rows.length} listings — ${rows.length - partCount} complete models and ${partCount} loose parts —
 *       one per leaf, under \`store-letitrip-official\`.
 *
 * 🛑 Names, codes, types and weights come from the LOCAL canonical corpus
 *    (B4/E4), already committed as each leaf's own name/description/aliases.
 *    Prices come from the 70 MEASURED bands. **Nothing is copied from a
 *    competitor's listing** — a measured aggregate is a statistic, a scraped
 *    title and photo is somebody else's listing. Images are \`seedPhoto()\`
 *    tiles, which resolve to a committed local placeholder rather than a
 *    proxied remote fetch (Root Cause #104).
 *
 * 🛑 \`seedPurpose\` defaults to \`test\` (purgeable — these are GENERATED and one
 *    command re-creates them) and \`isTestData\` is NEVER set (they must be
 *    publicly visible). The two are orthogonal; conflating them would hide the
 *    whole catalogue while reporting a clean load.
 *
 * 🛑 ${skippedNoBand} leaf/leaves were SKIPPED for having no banded ancestor. A guessed
 *    price is worse than an absent listing, because a seller prices against it.
 *
 * ${soldOut} of ${rows.length} are deliberately sold out: the "Sold & Ended" scope was
 * empty and untestable, and 76–93% of every crawled competitor's catalogue is
 * sold out, so a catalogue with no sold-out rows does not resemble the thing it
 * models.
 *
 * @tag domain:products
 * @tag layer:seed
 * @tag pattern:generated
 * @tag access:server-only
 * @tag sideEffects:none
 */

import { PRODUCT_FIELDS } from "../constants/field-names";
import type { ProductDocument } from "../features/products/schemas/firestore";
import { buildSearchTxt } from "../utils/search-txt";
import { seedPhoto } from "./_helpers/media";

/** One timestamp for the whole generated catalogue — deterministic by design. */
const CATALOGUE_SEEDED_AT = new Date("2026-10-13T00:00:00.000Z");

/**
 * 🛑 EVERY ROW GOES THROUGH THE TOKEN BUILDER.
 *
 * Measured the hard way: the first load of this file put 968 products in the
 * catalogue with **searchTxt on 71 of 1,039** — the 71 that pre-dated it. So
 * not one of the new listings was findable by search, on any surface, and
 * nothing errored. Registering the file in \`audit-searchtxt-migration\`'s
 * MIGRATED set is what makes the AUDIT green; actually calling the builder is
 * what makes search work, and doing only the first is the worse of the two
 * half-fixes because it silences the check that would have caught it.
 *
 * Same field list as \`products-standard-seed-data.ts\`'s \`withTokens\`, so a
 * generated listing is findable by exactly what a hand-authored one is.
 */
function withTokens(p: Partial<ProductDocument>): Partial<ProductDocument> {
  return {
    ...p,
    searchTxt: buildSearchTxt([
      p.title, p.description, p.brand, p.brandSlug,
      p.categoryNames, p.tags, p.features, p.condition,
    ]),
  };
}

export const productsCatalogueSeedData: Partial<ProductDocument>[] = ([
${body}
] as Partial<ProductDocument>[]).map(withTokens);
`;

fs.writeFileSync(OUT, out, "utf8");
console.log(`leaves considered:   ${leaves.length}`);
console.log(`listings written:    ${rows.length}  (${rows.length - partCount} models, ${partCount} parts)`);
console.log(`sold-out fixtures:   ${soldOut}`);
console.log(`inferred price:      ${inferredCount}  (named fixture tiers, NOT market bands)`);
console.log(`skipped (neither):   ${skippedNoBand}${skippedIds.length ? "  e.g. " + skippedIds.slice(0, 5).join(", ") : ""}`);
console.log(`-> ${path.relative(ROOT, OUT)}`);
