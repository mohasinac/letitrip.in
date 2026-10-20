#!/usr/bin/env node
/**
 * Generate the `beys` and `beyProducts` seed files from the extracted research.
 *
 *   node --max-old-space-size=3072 scripts/generate-beys-seed.mjs
 *
 * 🛑 GENERATED, never hand-typed. 1,988 beys each carrying a composition, a
 * derived rating vector and a derived mass is not something a human
 * transcribes correctly, and a transcription error here is a bey page stating
 * a wrong build — which reads as data rather than as a mistake.
 *
 * ── 🛑 NO BUILD REQUIRED, AND THAT IS A PROPERTY TO PRESERVE ──────────────
 *
 * This reads only `docs/research/*.json` and writes only TS. It does not
 * import `appkit/dist`, which is what let `gen-category-parts.mjs` die when a
 * parallel session emptied dist mid-run, and what put the whole codegen chain
 * over a 4 GB memory cap. If a future field needs a value from appkit, prefer
 * reading the shipped SOURCE (see `scripts/lib/read-part-glossary.mjs`) over
 * importing the compiled module.
 *
 * @tag domain:beys
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:writes-appkit-seed
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { splitTrailingParenthetical, slugify as modelSlugify } from "./lib/bey-model-id.mjs";

const ROOT = process.cwd();
const BEYS_SRC = resolve(ROOT, "docs/research/bey-specs-2026-10/wiki-beys.json");
const PRODUCTS_SRC = resolve(ROOT, "docs/research/bey-products-2026-10/wiki-products.json");

const slugify = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * 🛑 AN EXPLICIT FIELD LIST, not a spread of the research row.
 *
 * `wiki-beys.json` carries extraction bookkeeping the collection has no
 * business storing — `title`, and the `compositionJoin` counters. Spreading
 * the row would publish whatever the extractor happens to add next, which is
 * the public-by-default shape this project has already paid for once (Root
 * Cause #70: a settings document spread into a public response shipped 25
 * commission fields and a GSTIN).
 *
 * So every field is named. A new research field reaches the collection only
 * when someone adds it here.
 */
const BEY_FIELDS = [
  "name",
  "type",
  "spinDirection",
  "system",
  "system2",
  "series",
  "series2",
  "composition",
  "ratingsFromParts",
  "ratingsFromPartsCoverage",
  "weightG",
  "weightGFromParts",
  "weightGFromPartsCoverage",
  "productCodes",
  "aka",
  "jpName",
  "romaji",
  "kanjiName",
  "krName",
  "releaseJP",
  "releaseUS",
  "releaseCA",
  "releaseKR",
  "price",
  "owner",
  "ownerNames",
  "ownerCharacters",
  "creator",
  "specialMoves",
  "appearAnime",
  "appearManga",
  "animeDebut",
  "element",
  "avatar",
  "toyline",
  "images",
  "seoDescription",
  "sourceUrl",
  "source",
  "wboThreadUrl",
  "categoryId",
];

const PRODUCT_FIELDS = [
  "name",
  "productType",
  "productCodes",
  "price",
  "releaseJP",
  "jpName",
  "romaji",
  "assortment",
  "assortmentBeyIds",
  "breakdown",
  "boxImage",
  "gallery",
  "seoDescription",
  "sourceUrl",
  "source",
];

const pick = (row, fields) => {
  const out = {};
  for (const f of fields) {
    const v = row[f];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) continue;
    out[f] = v;
  }
  return out;
};

/*
 * ── 🛑 THE PAIRED CATEGORY LEAF, RESOLVED HERE AND VERIFIED ───────────────
 *
 * A bey page links to its category leaf, which is where the COMMERCE lives.
 * The obvious link is `category-${bey.slug}` and it is WRONG: the leaf id
 * derives from the bey's NAME with the trailing parenthetical stripped, so
 * `draciel-shield-central-press-hasbro` pairs with
 * `category-draciel-shield-central-press`. Guessing from the slug would 404
 * on every vendor-qualified bey.
 *
 * 🛑 And 116 beys have NO leaf at all — their `system` is deliberately
 * unmapped (see scripts/lib/bey-system-to-line.mjs). So the id is computed
 * with the SAME helper the leaf generator uses and then CHECKED against the
 * leaves actually emitted. A bey with no leaf carries no `categoryId`, and
 * the page renders no link rather than a broken one.
 */
const MODEL_DIR = resolve(ROOT, "appkit/src/seed/_helpers/category-models");
const modelLeafIds = new Set();
try {
  for (const f of readdirSync(MODEL_DIR)) {
    if (!/^chunk\d+\.ts$/.test(f)) continue;
    for (const m of readFileSync(resolve(MODEL_DIR, f), "utf8").matchAll(
      /id: "(category-[a-z0-9-]+)"/g,
    )) {
      modelLeafIds.add(m[1]);
    }
  }
} catch {
  /* No leaves yet — every bey simply gets no categoryId. */
}
if (modelLeafIds.size === 0) {
  console.error(
    "[generate-beys-seed] 🛑 read ZERO model leaf ids — every bey will lack a categoryId.\n" +
      "  Run: node scripts/gen-category-models.mjs",
  );
}

/* ── beys ─────────────────────────────────────────────────────────────────── */
const wiki = JSON.parse(readFileSync(BEYS_SRC, "utf8"));
const beyBySlug = new Map();
const beys = [];
let collisions = 0;

for (const row of Object.values(wiki)) {
  if (!row.name) continue;
  const slug = row.slug ? slugify(row.slug) : slugify(row.name);
  if (!slug) continue;
  /*
   * 🛑 A collision MERGES rather than overwriting, and is counted.
   *
   * `appkit-seed load` is a `set(…, { merge: true })`, so two rows at one id
   * would collapse in Firestore and report `created` for BOTH — a silent loss
   * the CLI cannot see, because `status` counts ids and the id exists either
   * way. Catching it here is the same defect one layer earlier, where it can
   * be reported.
   *
   * Measured: the research file is keyed by slug, so this should be zero.
   * Counting it anyway is what makes that an observation rather than an
   * assumption.
   */
  const prior = beyBySlug.get(slug);
  if (prior) {
    collisions += 1;
    for (const [k, v] of Object.entries(pick(row, BEY_FIELDS))) {
      if (prior[k] === undefined) prior[k] = v;
    }
    continue;
  }
  const doc = { id: slug, slug, ...pick(row, BEY_FIELDS) };
  /* Same derivation as the leaf generator, then verified against its output. */
  const leafId = `category-${modelSlugify(splitTrailingParenthetical(row.name).name)}`;
  if (modelLeafIds.has(leafId)) doc.categoryId = leafId;
  beyBySlug.set(slug, doc);
  beys.push(doc);
}

/* ── beyProducts ──────────────────────────────────────────────────────────── */
const products = [];
const productSlugs = new Set();
let productCollisions = 0;
let assortmentResolved = 0;
let assortmentTotal = 0;

try {
  const raw = JSON.parse(readFileSync(PRODUCTS_SRC, "utf8"));
  for (const row of Object.values(raw)) {
    if (!row.name) continue;
    const slug = row.slug ? slugify(row.slug) : slugify(row.name);
    if (!slug || productSlugs.has(slug)) {
      if (slug) productCollisions += 1;
      continue;
    }
    productSlugs.add(slug);
    const doc = { id: slug, slug, ...pick(row, PRODUCT_FIELDS) };
    /*
     * Resolve each assortment entry to a bey id where the name matches
     * EXACTLY. 🛑 No fuzzy matching: `Dead` and `Dread` are two real Gatinko
     * bases one character apart, so a near-match join on this corpus is
     * disqualified outright. An unresolved entry keeps its stated name and
     * simply does not link.
     */
    if (Array.isArray(doc.assortment)) {
      doc.assortment = doc.assortment.map((a) => {
        assortmentTotal += 1;
        const target = beyBySlug.get(slugify(a.bey ?? ""));
        if (target) assortmentResolved += 1;
        return { ...a, ...(target ? { beyId: target.id } : {}) };
      });
      /*
       * 🛑 A FLAT MIRROR OF THE RESOLVED IDS, because Firestore cannot
       * `array-contains` a field nested inside objects in an array — so
       * "which products contain this bey" is unanswerable from
       * `assortment[].beyId` no matter how the query is written.
       *
       * It is a denormalised mirror, which is the shape that drifts (Root
       * Cause #42), so it is derived HERE from the array above in the same
       * pass and never hand-maintained. Absent when nothing resolved, so the
       * query matches nothing rather than matching every product with an
       * empty array.
       */
      const ids = [...new Set(doc.assortment.map((a) => a.beyId).filter(Boolean))];
      if (ids.length) doc.assortmentBeyIds = ids;
    }
    products.push(doc);
  }
} catch (err) {
  console.error(`[generate-beys-seed] could not read ${PRODUCTS_SRC}: ${err.message}`);
  process.exit(1);
}

/* ── emit ─────────────────────────────────────────────────────────────────── */
const header = (what, count) => `/**
 * GENERATED by scripts/generate-beys-seed.mjs — do not edit by hand.
 *
 * ${what} — ${count} rows.
 *
 * 🛑 The FACTS are extracted from a CC-BY-SA corpus and every row carries its
 * own \`sourceUrl\` for attribution. The prose in \`seoDescription\` is ours,
 * composed from those facts; no source sentence is reproduced.
 *
 * @tag domain:beys
 * @tag layer:seed
 * @tag pattern:generated
 * @tag access:server-only
 * @tag sideEffects:none
 */`;

/*
 * 🛑 CHUNKED INTO FILES, because the TS2590 budget is per-FILE.
 *
 * 1,988 rows of `Partial<BeyDocument>` is the same order as the 2,490
 * `Partial<PartGlossaryDocument>` rows that failed to compile. Five consts in
 * ONE file does NOT fix it — that was tried for the glossary and a cold `tsc`
 * was still red. Separate files do, with every row still fully checked.
 *
 * Add rows by raising the chunk COUNT, never by growing a chunk.
 */
const CHUNK = 500;
const chunkDir = resolve(ROOT, "appkit/src/seed/beys");
mkdirSync(chunkDir, { recursive: true });
const chunks = [];
for (let i = 0; i < beys.length; i += CHUNK) chunks.push(beys.slice(i, i + CHUNK));

/* Stale chunks are REMOVED. An orphan `chunkN.ts` still compiles and is
 * imported by nothing, so it reads as live data to anyone who opens it. */
for (const f of readdirSync(chunkDir)) {
  const m = /^chunk(\d+)\.ts$/.exec(f);
  if (m && Number(m[1]) >= chunks.length) rmSync(resolve(chunkDir, f));
}

chunks.forEach((rows, i) => {
  writeFileSync(
    resolve(chunkDir, `chunk${i}.ts`),
    `${header(`Chunk ${i} of the bey database`, rows.length)}
import type { BeyDocument } from "../../features/beys/schemas/firestore";

export const beyChunk${i}: Partial<BeyDocument>[] = ${JSON.stringify(rows, null, 2)};
`,
  );
});

writeFileSync(
  resolve(ROOT, "appkit/src/seed/beys-seed-data.ts"),
  `${header("The bey database, keyed by slug", beys.length)}
/*
 * ── Why the chunks are separate FILES ─────────────────────────────────────
 *
 * 🛑 The TS2590 budget is per-FILE. Five \`const\`s in ONE file does not fix
 * it — measured on the part glossary, where a cold \`tsc\` stayed red — whereas
 * separate files do, with every row still fully type-checked.
 *
 * Add rows by raising the chunk COUNT, never by growing a chunk.
 */
import type { BeyDocument } from "../features/beys/schemas/firestore";
${chunks.map((_, i) => `import { beyChunk${i} } from "./beys/chunk${i}";`).join("\n")}

export const beysSeedData: Partial<BeyDocument>[] = [
${chunks.map((_, i) => `  ...beyChunk${i},`).join("\n")}
];

export const BEY_SEED_COUNT = ${beys.length};
`,
);

writeFileSync(
  resolve(ROOT, "appkit/src/seed/bey-products-seed-data.ts"),
  `${header("Bey products — sets, random boosters, battle sets, stadiums", products.length)}
import type { BeyProductDocument } from "../features/beys/schemas/firestore";

export const beyProductsSeedData: Partial<BeyProductDocument>[] = ${JSON.stringify(products, null, 2)};

export const BEY_PRODUCT_SEED_COUNT = ${products.length};
`,
);

const cov = (f) => beys.filter((b) => b[f] !== undefined).length;
console.log(`[generate-beys-seed] beys ${beys.length} in ${chunks.length} chunk(s)`);
console.log(`  composition ${cov("composition")} · ratings ${cov("ratingsFromParts")} · mass stated ${cov("weightG")} + summed ${cov("weightGFromParts")}`);
console.log(`  ownerCharacters ${cov("ownerCharacters")} · aka ${cov("aka")} · images ${cov("images")} · sourceUrl ${cov("sourceUrl")}`);
if (collisions) console.log(`  🛑 slug collisions merged: ${collisions}`);
console.log(`[generate-beys-seed] beyProducts ${products.length}`);
console.log(
  `  assortment entries resolved to a bey: ${assortmentResolved}/${assortmentTotal}` +
    ` (${Math.round((assortmentResolved / Math.max(1, assortmentTotal)) * 100)}%)`,
);
if (productCollisions) console.log(`  🛑 product slug collisions skipped: ${productCollisions}`);
