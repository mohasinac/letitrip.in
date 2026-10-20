#!/usr/bin/env node
/**
 * Generate one product listing per taxonomy leaf — a part, or a complete
 * model — so the `products` collection is reproducible from committed data
 * alone.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * Measured 2026-10-14: the live `products` collection held **1,039** documents
 * against a seed of 71. The other 968 (752 part leaves + 216 model leaves) came
 * from a one-listing-per-taxonomy-leaf generator that was never committed — so
 * `appkit-seed status` reported "71 / 71" (it counts matched seeded ids, not
 * collection size) and a `delete --collections products` would have destroyed
 * 968 documents nothing could rebuild. That is this project's whole reason for
 * wanting committed seed files: "clear whole firebase... our goal was actual
 * seed files so that we can always reseed again."
 *
 * This is that generator, committed and deterministic.
 *
 * ── SOURCES, EACH THE REAL ONE — NOT A SECOND GUESS ─────────────────────────
 *
 *   PART_LEAVES / MODEL_LEAVES            the leaf id, name, generated prose
 *   PART_CATEGORY_TO_GLOSSARY_ID          category id -> partGlossary id
 *   GENERATED_CATEGORY_IMAGES             real wiki photos for 195 of 220 models
 *   categoriesSeedData[].parentIds        the ancestor chain, for categorySlugs
 *
 * All four are read from the built dist, after the categories/parts/models/
 * images generators have already run — this script is the LAST step in that
 * chain, not a parallel one. Running it against a stale dist would bake wrong
 * ids into 968 object literals; see the `--verify` mode below.
 *
 * ── 🛑 THE PRICE/STOCK/CONDITION FIELDS ARE DETERMINISTIC, NEVER Math.random ─
 *
 * Root Cause #25: a seed file re-imported on every `appkit-seed load` with a
 * `Math.random()`-derived field regenerates a different value each run, so
 * `load` never upserts — it creates fresh duplicates, and `status`/`delete`
 * can never find what a previous run wrote. Every "random-looking" field here
 * (price, stock, condition, authenticity, which colour tile) is an FNV-1a hash
 * of the listing's own id — same input, same output, forever.
 *
 * ── IMAGES ───────────────────────────────────────────────────────────────────
 *
 * A model leaf with a real wiki photo (195 of 220) uses it — the SAME
 * `/media/<shortId>` reference its category page's cover image uses, which is
 * a deliberate reuse rather than a second fetch. Everything else (752 parts,
 * 25 photo-less models) gets a deterministic coloured tile from the 6 files
 * already committed at `public/images/seed-tiles/` — the same helper pattern
 * (`seedPhoto`) the curated 71 listings already use, re-implemented here only
 * because that helper is a `.ts` internal with no barrel export reachable from
 * a plain `.mjs` script.
 *
 * Usage (from the consumer root):
 *   node scripts/gen-catalogue-listings.mjs --verify   check without writing
 *   node scripts/gen-catalogue-listings.mjs            write the seed file
 *
 * @tag domain:products
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:fs — writes one generated seed file
 */

import fs from "node:fs";
import path from "node:path";
import {
  splitTrailingParenthetical,
  categoryIdForModel,
  slugify,
} from "./lib/bey-model-id.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const VERIFY_ONLY = process.argv.includes("--verify");

/*
 * ── 🛑 SOURCE TEXT, NOT `dist` — THIS STEP NO LONGER NEEDS A BUILD ──────────
 *
 * Every file below is itself GENERATED and committed, so reading it as text is
 * reading the same bytes a build would compile. See
 * `scripts/lib/read-generated-seed.mjs` for why that matters: this used to
 * import seven modules from `node_modules/@mohasinac/appkit/dist`, which made
 * the LAST step of a pure codegen chain require a ~4.4 GB warm (~8.1 GB cold)
 * appkit build — so under a memory cap the catalogue could not be regenerated
 * at all, and a catalogue that lags the leaf maps keeps referencing ids that
 * may no longer exist. That is the `audit-category-name-mirror` failure which
 * cost two false "stale dist" diagnoses in one day.
 *
 * The one thing that genuinely cannot be read from source is the ancestor
 * chain, because `parentIds` requires `buildCategoryTree` to EXECUTE. It comes
 * from a frozen, cross-checked sidecar instead — see `readParentChains`.
 */
import {
  readFlatStringMap,
  readLeafMap,
  readDeclaredCount,
  readParentChains,
} from "./lib/read-generated-seed.mjs";
import { readPartGlossary } from "./lib/read-part-glossary.mjs";

const MODEL_CHUNKS = fs
  .readdirSync(path.join(ROOT, "appkit/src/seed/_helpers/category-models"))
  /* 🛑 Numeric sort. A lexical one puts chunk10 between chunk1 and chunk2, and
   * the assembler's spread order decides which duplicate key wins. */
  .filter((f) => /^chunk\d+\.ts$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
  .map((f) => `category-models/${f}`);

const { leaves: PART_LEAVES, count: PART_LEAF_PARSED } = readLeafMap("category-parts.ts");
const { leaves: MODEL_LEAVES, count: MODEL_LEAF_PARSED } = readLeafMap(MODEL_CHUNKS);
const PART_LEAF_COUNT = readDeclaredCount("category-parts.ts", "PART_LEAF_COUNT");
const MODEL_LEAF_COUNT = readDeclaredCount("category-models.ts", "MODEL_LEAF_COUNT");

/*
 * 🛑 The PARSE is checked against the generator's own DECLARED count, which is
 * the assertion the seed already makes so a silent drop is loud. Without this
 * a reader that matched 1,400 of 1,904 leaves would emit a plausible-looking
 * catalogue missing a quarter of the taxonomy, and nothing downstream could
 * tell — every row present would be correct.
 */
for (const [label, parsed, declared] of [
  ["PART_LEAVES", PART_LEAF_PARSED, PART_LEAF_COUNT],
  ["MODEL_LEAVES", MODEL_LEAF_PARSED, MODEL_LEAF_COUNT],
]) {
  if (parsed !== declared) {
    console.error(
      `[gen-catalogue] 🛑 ${label}: parsed ${parsed} leaves, the generator declares ${declared}.\n` +
        `  The source-text reader and the emit shape have diverged. Fix ` +
        `scripts/lib/read-generated-seed.mjs\n  rather than trusting the lower number.`,
    );
    process.exit(1);
  }
}

const PART_CATEGORY_TO_GLOSSARY_ID = readFlatStringMap(
  "category-parts-glossary-map.ts",
  "PART_CATEGORY_TO_GLOSSARY_ID",
);
const GENERATED_CATEGORY_IMAGES = readFlatStringMap(
  "category-images-generated.ts",
  "GENERATED_CATEGORY_IMAGES",
);

/*
 * ── A5b: part photos as extra gallery images ────────────────────────────────
 *
 * A model listing shipped ONE image, and on the 49% with no wiki photo that
 * one image was a flat SVG tile. The measured competitor median is 1-4 images
 * per product (docs/research/competitor-crawl-2026-10/images.md), so a single
 * tile is the weakest part of this catalogue.
 *
 * The content to fix it is already here and already uploaded: 309 part
 * photographs, and a composition table saying which parts a model is built
 * from. So [cover, blade, ratchet, bit] is assembled from material we own,
 * with provenance, rather than scraped or invented.
 *
 * The join is THREE hops and none of them is guessable, which is why each is
 * read from the file that owns it rather than re-derived:
 *   composition slot  --{slotKey}--{slugify(partName)}-->  glossary id
 *   glossary id       --PART_CATEGORY_TO_GLOSSARY_ID-->    part category id
 *   part category id  --GENERATED_CATEGORY_IMAGES-->       /media/<shortId>
 *
 * Measured over all 259 composition rows: 963 slots, 952 glossary-matched
 * (99%), 429 resolving to a real uploaded ref — so 203 of 259 models gain
 * 1-5 photos (75 gain 1, 63 gain 2, 40 gain 3, 17 gain 4, 8 gain 5). The 56
 * with none keep their single cover, which is the honest outcome: a part with
 * no photograph must not become a placeholder.
 */
const composition = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "docs/research/part-composition-2026-10/composition.json"),
    "utf8",
  ),
);
const PART_CATEGORY_BY_GLOSSARY_ID = new Map(
  Object.entries(PART_CATEGORY_TO_GLOSSARY_ID).map(([catId, gId]) => [gId, catId]),
);
/**
 * model category id -> ordered, de-duplicated `{ ref, partName, slotLabel }`.
 *
 * The name and slot label ride along because they are what makes the alt text
 * worth having — see the gallery block in `buildRow`. Resolving them again
 * there would mean a second walk of the composition per listing.
 */
const PART_IMAGES_BY_MODEL = new Map();
for (const model of composition) {
  const leafId = categoryIdForModel(model);
  const picked = [];
  const seen = new Set();
  // Slot order is the composition's own order (blade, ratchet, bit …), which
  // is how the parts physically stack — a stable, meaningful gallery order
  // rather than whatever Object.keys happened to yield.
  for (const slot of model.slots ?? []) {
    const glossaryId = `${slot.slotKey}--${slugify(slot.partName)}`;
    const partCategoryId = PART_CATEGORY_BY_GLOSSARY_ID.get(glossaryId);
    if (!partCategoryId) continue;
    const ref = GENERATED_CATEGORY_IMAGES[partCategoryId];
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    /*
     * `slotLabel` is the composition's own human label ("ATTACK RING (AR)"),
     * title-cased for prose — it is SHOUTED in the source data, and alt text
     * read aloud in caps is read as an initialism by some screen readers.
     */
    const slotLabel = String(slot.slotLabel ?? slot.slotKey)
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase());
    picked.push({ ref, partName: slot.partName, slotLabel });
  }
  if (picked.length > 0) PART_IMAGES_BY_MODEL.set(leafId, picked);
}
const GENERATED_PART_COLOURS = readFlatStringMap(
  "part-colours-generated.ts",
  "GENERATED_PART_COLOURS",
);
const partGlossarySeedData = readPartGlossary(ROOT);
const PARENT_CHAINS = readParentChains();

/*
 * ── Colourway variants ─────────────────────────────────────────────────────
 *
 * A colourway names the COLOUR and the Beyblade it shipped in — "Navy (Jade
 * Jupiter S130RB)". A part released in several models is several distinct
 * things to a collector, so each becomes its own listing sharing one
 * `partGlossaryId`. That is also exactly what makes the buildable-now rollup
 * demonstrable: two holdings of one part in different colourways, where
 * `satisfiesSlot` can accept one and refuse the other.
 *
 * Both halves come from measured data, neither is invented:
 *   MODEL  — `usedBy`, resolved to the corpus row's display name. Exact.
 *   COLOUR — the dominant colour of that part's own photograph
 *            (`derive-part-colours.mjs`). See that file for the one caveat:
 *            the wiki has a single photo per part, so for a multi-model part
 *            the colour is the photographed release's.
 *
 * `usedBy` entries are the corpus FILE path with `/` replaced by `-`
 * ("gen2-mfb-jade-jupiter"), not the corpus `slug` — verified: all 259
 * distinct refs resolve this way and none resolve by slug.
 */
const corpusRaw = JSON.parse(
  fs.readFileSync(path.join(ROOT, "docs/research/bey-corpus-2026-10/canonical-beys.json"), "utf8"),
);
const modelNameByUsedByRef = new Map();
for (const r of [...corpusRaw.canonical, ...corpusRaw.review]) {
  const key = String(r.file || "")
    .replace(/\.md$/, "")
    .replace(/\//g, "-");
  /*
   * 🛑 The DISPLAY name, with the corpus's trailing parenthetical stripped by
   * the same helper the category generator uses. Raw, these names carry their
   * own brackets — "Apollon (アポロン)", "Draciel V (Draciel Viper)" — and a
   * colourway built from them nests: "Maroon (Apollon (アポロン))", in a title
   * that is already parenthesised. One bracket, the outer one, is ours.
   */
  if (key) modelNameByUsedByRef.set(key, splitTrailingParenthetical(r.name).name);
}
const glossaryById = new Map(partGlossarySeedData.map((p) => [p.id, p]));

/*
 * 🛑 `catById` is GONE, and its absence is the point of this change. It existed
 * only so `closureFor` could look a LEAF up in `categoriesSeedData` and read
 * the `parentIds` that `buildCategoryTree` had computed — which is the single
 * reason this generator needed a built appkit. The parent is known for free at
 * every call site (it is the key of the leaf map), so the lookup was never
 * needed; see `readParentChains` for where the ancestors come from now.
 */

// ---------------------------------------------------------------------------
// Deterministic hash — FNV-1a, same algorithm this codebase already uses in
// `appkit/src/seed/_helpers/media.ts`'s seedHash. A copy, not an import: that
// file is TS with no barrel export, and the algorithm is five lines.
// ---------------------------------------------------------------------------
function seededHash(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SEED_TILES = fs
  .readdirSync(path.join(ROOT, "public/images/seed-tiles"))
  .filter((f) => f.endsWith(".svg"))
  .sort();
if (SEED_TILES.length === 0) {
  console.error("✗ public/images/seed-tiles is empty — nothing to fall back to.");
  process.exit(2);
}

const CONDITIONS = ["good", "fair", "used", "like_new", "new"];

/**
 * The ancestor chain for a leaf's `categorySlugs` / `categoryNames`.
 *
 * 🛑 Keyed on the leaf's PARENT, which is the key of the map the leaf was read
 * from — not on the leaf's own id. The previous version looked the LEAF up in
 * `categoriesSeedData` and read its `parentIds`, which required the tree to
 * have been built. A leaf's parent is already known for free at every call
 * site, and the parent's own ancestors are the frozen, cross-checked sidecar.
 *
 * It no longer returns `null`: a missing chain THROWS inside the sidecar,
 * naming the parent. A silent `null` meant the listing was skipped and counted
 * as an error at the end, which on a new leaf-parent would have dropped every
 * row under it while the run still looked successful.
 */
function closureFor(leafId, leafName, parentId) {
  return PARENT_CHAINS.closureFor(leafId, leafName, parentId);
}

/**
 * One listing. `kind` only decides price band, partGlossaryId, and image
 * fallback — everything else is identical between a part and a model.
 */
function buildListing({ leafId, parentId, name, description, kind, variantOf, colour }) {
  const base = leafId.replace(/^category-/, "");
  /*
   * A variant's id carries the release, so the same part in two models is two
   * stable, distinct documents. Slugified from the model name for the same
   * reason every other id here is: it is the URL.
   */
  const variantSlug = variantOf
    ? String(variantOf)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";
  const slug = variantSlug ? `product-${base}-${variantSlug}` : `product-${base}`;
  const h = seededHash(slug);
  const closure = closureFor(leafId, name, parentId);
  if (!closure) {
    return { error: `no category row for leaf id ${leafId}` };
  }

  const isPart = kind === "part";
  // Resale/used parts and tops are cheaper than the curated 71's new-retail
  // ₹899-1799 band — parts ₹39-199, used complete tops ₹299-1199.
  const price = isPart ? 39 + (h % 161) : 299 + ((h >> 4) % 901);
  const stockQuantity = 1 + (h % 6);
  const condition = CONDITIONS[(h >> 8) % CONDITIONS.length];
  // Mostly unverified, consistent with an unauthenticated secondhand listing;
  // roughly 1-in-5 marked original.
  const authenticity = (h >> 12) % 5 === 0 ? "original" : "unverified";

  /*
   * 🛑 A colourway is the COLOUR **and** the Beyblade it shipped in —
   * "Navy (Jade Jupiter S130RB)". Both halves or neither: a bare colour cannot
   * tell two releases apart (which is the whole point of the field), and a bare
   * model name is a provenance note rather than a colourway. A part with no
   * photograph has no measured colour, so it correctly gets no colourway at all
   * rather than a guessed one — and `satisfiesSlot` already treats "declares
   * none" as refusable, which is the honest outcome.
   */
  const colourway = colour && variantOf ? `${colour} (${variantOf})` : undefined;

  let image = GENERATED_CATEGORY_IMAGES[leafId];
  const hasRealCover = Boolean(image);
  if (!image) {
    const tile = SEED_TILES[h % SEED_TILES.length];
    image = `/images/seed-tiles/${tile}`;
  }

  /*
   * A5b — the gallery. `mainImage` stays the cover; the parts follow it.
   *
   * 🛑 Only for a MODEL listing. A part listing is a photograph OF one part,
   * so appending its siblings' photos would claim the buyer is getting all of
   * them — the opposite of what the listing says.
   *
   * 🛑 The cover is filtered out of the tail rather than assumed distinct. A
   * part category and a model category can resolve to the same uploaded ref,
   * and a gallery whose slide 2 is identical to slide 1 reads as a broken
   * carousel.
   *
   * A placeholder tile is NOT given a parts tail: `[tile, blade, ratchet]`
   * advertises detail the cover cannot show, and the tile would sit first.
   * Those models keep exactly what they had.
   */
  const partImages = isPart || !hasRealCover ? [] : (PART_IMAGES_BY_MODEL.get(leafId) ?? []);
  const galleryTitle = variantOf ? `${name} (${variantOf})` : name;
  /*
   * A6 — `ProductImage[]`, with REAL alt text.
   *
   * This is the one place in the catalogue where alt can be generated rather
   * than typed by a human, because the join already knows what each photo is
   * OF: the cover is the model, and each tail image is a specific named part
   * in a specific slot. So the alt reads "Storm Spriggan Knuckle Unite —
   * Storm Spriggan (Blade)" rather than a repeat of the title, which is what
   * a naive fill would produce and what screen-reader users correctly treat
   * as noise.
   *
   * Measured competitor alt coverage is ~0% across 15 sites (0/151, 0/306,
   * 0/317; the best is 37/63), so 1,570 described images is not a parity
   * feature.
   *
   * 🛑 No `width`/`height`. The generator does not read the uploaded bytes,
   * and a guessed aspect ratio is worse than an absent one — `next/image`
   * would reserve the wrong box and the layout would shift anyway, while
   * LOOKING like it had been measured.
   */
  const images = [
    { url: image, alt: galleryTitle },
    ...partImages
      .filter((p) => p.ref !== image)
      .map((p) => ({ url: p.ref, alt: `${galleryTitle} — ${p.partName} (${p.slotLabel})` })),
  ];

  const row = {
    id: slug,
    ...(colourway ? { colourway } : {}),
    slug,
    title: variantOf ? `${name} (${variantOf})` : name,
    description,
    categorySlugs: closure.slugs,
    categoryNames: closure.names,
    brand: "Beyblade",
    brandSlug: "brand-beyblade",
    listingType: "standard",
    status: "published",
    condition,
    authenticity,
    currency: "INR",
    gstRate: 5,
    hsnCode: "95030020",
    price,
    stockQuantity,
    availableQuantity: stockQuantity,
    isSold: false,
    avgRating: 0,
    reviewCount: 0,
    mainImage: image,
    images,
    tags: [name],
    storeId: "store-letitrip-official",
    storeName: "LetItRip Official",
  };
  if (isPart) {
    const glossaryId = PART_CATEGORY_TO_GLOSSARY_ID[leafId];
    if (glossaryId) row.partGlossaryId = glossaryId;
  }
  return { row };
}

// ---------------------------------------------------------------------------
// Walk every leaf
// ---------------------------------------------------------------------------
const rows = [];
const errors = [];
const seenIds = new Set();

let variantRows = 0;
let expandedLeaves = 0;
for (const [parentId, arr] of Object.entries(PART_LEAVES)) {
  for (const leaf of arr) {
    const glossaryId = PART_CATEGORY_TO_GLOSSARY_ID[leaf.id];
    const glossary = glossaryId ? glossaryById.get(glossaryId) : undefined;
    const usedBy = glossary?.usedBy ?? [];
    const colour = glossaryId ? GENERATED_PART_COLOURS[glossaryId] : undefined;

    /*
     * One listing per RELEASE when the part shipped in more than one model;
     * otherwise a single listing, because "variant 1 of 1" is not a variant
     * and would only add a parenthetical to every title in the shop.
     */
    /*
     * Deduped by NAME, not by ref: two `usedBy` entries can resolve to one
     * model (a corpus row reachable by more than one file path, and the
     * review/canonical buckets overlapping), and "the same part in the same
     * Beyblade" is one release, not two. Without this the variant ids collide
     * — measured: 6 collisions including `destroy-dash` and `cobaltdrake`.
     */
    const releases =
      usedBy.length > 1
        ? [...new Set(usedBy.map((ref) => modelNameByUsedByRef.get(ref)).filter(Boolean))]
        : [];

    if (releases.length > 1) {
      expandedLeaves++;
      for (const modelName of releases) {
        const { row, error } = buildListing({
          leafId: leaf.id,
          parentId,
          name: leaf.name,
          description: leaf.description,
          kind: "part",
          variantOf: modelName,
          colour,
        });
        if (error) errors.push(`${leaf.id}: ${error}`);
        else if (row) {
          if (seenIds.has(row.id)) {
            errors.push(`duplicate listing id ${row.id}`);
            continue;
          }
          seenIds.add(row.id);
          rows.push(row);
          variantRows++;
        }
      }
      continue;
    }

    const { row, error } = buildListing({
      leafId: leaf.id,
      parentId,
      name: leaf.name,
      description: leaf.description,
      kind: "part",
      // A single-release part still gets a colourway when both halves are
      // known — the colour is then unambiguously that release's.
      variantOf: usedBy.length === 1 ? modelNameByUsedByRef.get(usedBy[0]) : undefined,
      colour,
    });
    if (error) errors.push(`${leaf.id}: ${error}`);
    else if (row) {
      if (seenIds.has(row.id)) errors.push(`duplicate listing id ${row.id}`);
      seenIds.add(row.id);
      rows.push(row);
    }
  }
}
for (const [parentId, arr] of Object.entries(MODEL_LEAVES)) {
  for (const leaf of arr) {
    const { row, error } = buildListing({
      leafId: leaf.id,
      parentId,
      name: leaf.name,
      description: leaf.description,
      kind: "model",
    });
    if (error) errors.push(`${leaf.id}: ${error}`);
    else if (row) {
      if (seenIds.has(row.id)) errors.push(`duplicate listing id ${row.id}`);
      seenIds.add(row.id);
      rows.push(row);
    }
  }
}

console.log(`part leaves  : ${PART_LEAF_COUNT}`);
console.log(`model leaves : ${MODEL_LEAF_COUNT}`);
console.log(`listings     : ${rows.length}`);
console.log(`errors       : ${errors.length}`);
for (const e of errors.slice(0, 10)) console.log(`   ✗ ${e}`);

const partsWithGlossary = rows.filter((r) => r.partGlossaryId).length;
const modelsWithRealImage = rows.filter(
  (r) => typeof r.mainImage === "string" && r.mainImage.startsWith("/media/"),
).length;
const withColourway = rows.filter((r) => r.colourway).length;
console.log(`part listings carrying partGlossaryId : ${partsWithGlossary}`);
console.log(`listings with a REAL wiki image        : ${modelsWithRealImage}`);
console.log(`colourway variants (extra listings)    : ${variantRows}`);
console.log(`listings carrying a colourway          : ${withColourway}`);

if (errors.length > 0) {
  console.error("\n✗ refusing to write with errors present.");
  process.exit(1);
}
/*
 * Reconcile exactly, rather than asserting a magic total.
 *
 * Every leaf yields one listing, EXCEPT a multi-release part, whose single
 * listing is replaced by one per release. So:
 *
 *     rows  ==  (all leaves - leaves that expanded)  +  variant rows
 *
 * Checking the identity rather than a number catches a silently dropped leaf
 * AND a runaway expansion, and keeps working when the corpus grows — a
 * hard-coded total would have to be edited on every taxonomy change, which is
 * how an assertion stops being read.
 */
const allLeaves = PART_LEAF_COUNT + MODEL_LEAF_COUNT;
const expectedRows = allLeaves - expandedLeaves + variantRows;
if (rows.length !== expectedRows) {
  console.error(
    `✗ row count does not reconcile: ${allLeaves} leaves - ${expandedLeaves} expanded + ` +
      `${variantRows} variants = ${expectedRows}, but built ${rows.length}. Refusing to write.`,
  );
  process.exit(1);
}

if (VERIFY_ONLY) {
  console.log("\n• --verify — nothing written.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------
const OUT = path.join(ROOT, "appkit/src/seed/products-catalogue-seed-data.ts");
const q = (v) => JSON.stringify(v);

/*
 * 🛑 CHUNKED INTO SEPARATE FILES, because one array literal of 1,237 objects is
 * a TypeScript error, not a style preference.
 *
 *   src/seed/products-catalogue-seed-data.ts(22,70): error TS2590:
 *   Expression produces a union type that is too complex to represent.
 *
 * `tsc` infers a union across every element of an array literal before
 * checking it against the annotation, and that union overflows somewhere past
 * ~1,000 distinct object shapes. The annotation does not prevent it — the
 * inference happens first.
 *
 * 🛑 SEPARATE FILES, NOT SEVERAL `const`s IN ONE FILE. This emitted 19 typed
 * consts into a single 5.5 MB module and that is the exact mistake CLAUDE.md's
 * trap #1 records: *"I chunked the seed into five `const`s in one file, ran
 * `tsc --noEmit` warm, reported clean. A COLD run was still red: TS2590's
 * budget is per FILE, not per const."* It was fixed there by splitting
 * `part-glossary` into real files, and `category-models` followed. Those are
 * the only two seeds in this repo of comparable size and both use files, so
 * this now does too — a `.flat()` over imported typed arrays infers nothing
 * new, exactly as the per-const version relied on.
 *
 * It also could not have been caught here: the gate is one cold `npm run check`
 * at the end of the plan, so an emit that only fails cold would have shipped.
 * 250 rows per file is kept rather than raised to `part-glossary`'s ~500,
 * because these rows have OPTIONAL fields (`partGlossaryId`, `colourway`) and
 * so span more distinct shapes per row than a uniform document does.
 *
 * It is also why this emits chunks rather than the generator being told to
 * produce fewer rows: the row count is the catalogue, and the file format is
 * the thing that has to bend.
 */
const CHUNK = 250;
const chunks = [];
for (let i = 0; i < rows.length; i += CHUNK) chunks.push(rows.slice(i, i + CHUNK));

const buildBody = (rowsSlice) => rowsSlice
  .map(
    (r) => `  {
    id: ${q(r.id)},
    slug: ${q(r.slug)},
    title: ${q(r.title)},
    description: ${q(r.description)},
    categorySlugs: ${q(r.categorySlugs)},
    categoryNames: ${q(r.categoryNames)},
    brand: ${q(r.brand)},
    brandSlug: ${q(r.brandSlug)},
    listingType: "standard",
    status: "published",
    condition: ${q(r.condition)},
    authenticity: ${q(r.authenticity)},
    currency: "INR",
    gstRate: ${r.gstRate},
    hsnCode: ${q(r.hsnCode)},
    price: ${r.price},
    stockQuantity: ${r.stockQuantity},
    availableQuantity: ${r.availableQuantity},
    isSold: false,
    avgRating: 0,
    reviewCount: 0,
    mainImage: ${q(r.mainImage)},
    images: ${q(r.images)},
    tags: ${q(r.tags)},
    storeId: ${q(r.storeId)},
    storeName: ${q(r.storeName)},${r.partGlossaryId ? `\n    partGlossaryId: ${q(r.partGlossaryId)},` : ""}${r.colourway ? `\n    colourway: ${q(r.colourway)},` : ""}
  },`,
  )
  .join("\n");

fs.writeFileSync(
  OUT,
  `/**
 * GENERATED by scripts/gen-catalogue-listings.mjs — do not edit by hand.
 *
 * One product listing per taxonomy leaf: ${PART_LEAF_COUNT} parts + ${MODEL_LEAF_COUNT} complete
 * models = ${rows.length} rows. This is what makes \`products\` reproducible from
 * committed data alone — see the generator's own header for the incident that
 * made that matter (968 live documents with no committed source).
 *
 * Deterministic: price/stock/condition/authenticity/image are derived from an
 * FNV-1a hash of each listing's own id, never \`Math.random()\` (Root Cause #25)
 * — so a re-run of the generator, and a re-run of \`appkit-seed load\`, both
 * reproduce the SAME 968 documents rather than minting duplicates.
 *
 * ${partsWithGlossary} of ${PART_LEAF_COUNT} part listings carry \`partGlossaryId\`, resolved through
 * \`PART_CATEGORY_TO_GLOSSARY_ID\` (the pairing \`gen-category-parts.mjs\` already
 * computes, emitted rather than re-derived). ${modelsWithRealImage} of ${MODEL_LEAF_COUNT} model listings
 * reuse the real wiki cover photo their category page already shows; the rest
 * fall back to a deterministic coloured tile from \`public/images/seed-tiles/\`.
 */
${chunks.map((_, i) => `import { catalogueChunk${i} } from "./products-catalogue/chunk${i}";`).join("\n")}

export const productsCatalogueSeedData = [
${chunks.map((_, i) => `  catalogueChunk${i},`).join("\n")}
].flat();

export const CATALOGUE_LISTING_COUNT = ${rows.length};
`,
);

/*
 * 🛑 STALE CHUNKS ARE REMOVED, not left behind. The chunk count moves with the
 * row count (2,974 rows was 12 files, 4,657 is 19), so a run that shrinks the
 * catalogue would leave orphans that nothing imports — dead files carrying real
 * listing ids, which is the shape that reads as coverage. Only this
 * generator's own `chunkN.ts` are touched.
 */
const CHUNK_DIR = path.join(ROOT, "appkit/src/seed/products-catalogue");
fs.mkdirSync(CHUNK_DIR, { recursive: true });
let removed = 0;
for (const f of fs.readdirSync(CHUNK_DIR)) {
  const m = f.match(/^chunk(\d+)\.ts$/);
  if (m && Number(m[1]) >= chunks.length) {
    fs.unlinkSync(path.join(CHUNK_DIR, f));
    removed++;
  }
}

chunks.forEach((slice, i) => {
  fs.writeFileSync(
    path.join(CHUNK_DIR, `chunk${i}.ts`),
    `/**
 * GENERATED by scripts/gen-catalogue-listings.mjs — do not edit by hand.
 *
 * Catalogue listings ${i * CHUNK + 1}–${i * CHUNK + slice.length} of ${rows.length}.
 *
 * 🛑 A SEPARATE FILE, not one of several consts in a shared module: TS2590's
 * union budget is per FILE (CLAUDE.md trap #1), so splitting consts inside one
 * module passes a warm \`tsc\` and still fails a cold one. See the generator's
 * emit section for the full reasoning.
 */
import type { ProductDocument } from "../../features/products/schemas/firestore";

export const catalogueChunk${i}: Partial<ProductDocument>[] = [
${buildBody(slice)}
];
`,
  );
});

console.log(
  `\nwrote ${path.relative(ROOT, OUT)} (${rows.length} rows across ${chunks.length} chunk files)` +
    (removed > 0 ? `\n  removed ${removed} stale chunk file(s)` : ""),
);
process.exit(0);
