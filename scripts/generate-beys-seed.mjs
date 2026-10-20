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
import { AUTHORED_PART_MODES, MODES_WITHHELD } from "./lib/bey-modes-authored.mjs";
/* Reads the SHIPPED SOURCE, not appkit/dist — keeps this generator build-free. */
import { readPartGlossary } from "./lib/read-part-glossary.mjs";

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
  "modes",
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
const modesAttached = [];
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
  /*
   * ── 🛑 MODES FAN OUT FROM THE PART, VIA THIS BEY'S OWN COMPOSITION ───────
   *
   * Every mode the owner confirmed is a property of a fusion wheel, a tip or a
   * track — so they are authored ONCE against a `partId` and attached to every
   * bey whose composition uses it. A wheel in six beys is described once
   * instead of copied six times (Root Cause #75's shape).
   *
   * 🛑 Matched on `composition[].partId`, NEVER on the bey's name. "Fusion
   * Hades" carries the *Fusion* wheel while "Hades Kerbecs" carries the *Hades*
   * wheel — MFB names the fusion wheel first — so a name-prefix sweep would
   * attach one wheel's modes to a bey that does not have it. And three of the
   * four `lightning-l-drago-*` rows carry a different wheel or none at all.
   *
   * 🛑 ONLY `confirmed` MODES ARE EMITTED. The case-study corpus's mode prose
   * was wrong in four of five claims reviewed by the owner (an inverted
   * transition, a mode that was really launch spin direction, a mechanism on
   * the wrong part, and a tip that has no modes at all), so an unconfirmed
   * reading must not reach a public reference page.
   *
   * Absent, never `[]`: an empty array tells a consumer "this bey has no
   * modes", which is a different claim from "we do not know".
   */
  const fromParts = [];
  for (const entry of doc.composition ?? []) {
    const authored = AUTHORED_PART_MODES[entry.partId];
    if (!authored) continue;
    for (const mode of authored) {
      if (!mode.confirmed) continue;
      fromParts.push({ ...mode, appliesToPart: entry.partId });
    }
  }
  if (fromParts.length > 0) {
    doc.modes = fromParts;
    modesAttached.push(slug);
  }
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
/*
 * ── 🛑 AN AUTHORED KEY THAT MATCHES NO BEY IS A HARD ERROR ────────────────
 *
 * The whole value of a hand-authored overlay is that somebody READ the source
 * and wrote a claim. A key with a typo, or naming a bey this dataset does not
 * carry, silently contributes nothing — and reads afterwards as "the corpus
 * had no modes for that one" rather than "the map is wrong". That is the
 * seed-registration failure this project has already paid for twice (Root
 * Cause #90: a collection wired for PII but never registered for LOADING,
 * which reported `created 972, errors 0` while writing the wrong thing).
 *
 * So the generator refuses rather than warning. Every key in the map was
 * verified against the 1,988 slugs before being written.
 */
/*
 * ── 🛑 TWO CHECKS, TWO SEVERITIES — CONFLATING THEM REJECTED GOOD DATA ────
 *
 * The first version of this validated authored keys against the part ids that
 * appear in a composition, and failed the build on six keys. Only TWO were
 * actually wrong (`performance-tip--4d-bottom-f-s-final-survive` and
 * `spin-track--uw145-upper-wing-145` are duplicate glossary rows that no bey
 * references; the ids in use are `--final-survive` and `--upper-wing-145`).
 * The other four were CORRECT, owner-confirmed modes for parts our composition
 * data simply does not mention — SW145 and BD145 appear in no bey's parts list
 * at all.
 *
 * Those are different problems and only one is the map's fault:
 *
 *   NOT IN THE GLOSSARY  -> the key is wrong. Hard error; nothing can fix
 *                           itself later, and a bad key contributes nothing
 *                           while reading afterwards as "that part has no
 *                           modes" (Root Cause #90's shape).
 *   IN THE GLOSSARY, BUT  -> the key is right and the COMPOSITION data has a
 *   NO COMPOSITION USES IT   gap. Report it; the mode is still correct and will
 *                           attach the moment extraction improves. Failing here
 *                           would mean deleting true, reviewed data to satisfy
 *                           a coverage problem somewhere else entirely.
 *
 * Measured right now: 155 beys carry a spin-gear and only 194 carry a
 * blade-base, so a whole class of plastic-generation bases is missing from the
 * compositions — which is exactly why this must be a report and not a gate.
 */
const compositionPartIds = new Set();
for (const b of beys) {
  for (const entry of b.composition ?? []) {
    if (entry.partId) compositionPartIds.add(entry.partId);
  }
}
const glossaryPartIds = new Set(readPartGlossary(ROOT).map((p) => p.id));
const authoredKeys = Object.keys(AUTHORED_PART_MODES);
const unresolvedModeKeys = authoredKeys.filter((k) => !glossaryPartIds.has(k));
const unreachableModeKeys = authoredKeys.filter(
  (k) => glossaryPartIds.has(k) && !compositionPartIds.has(k),
);
if (unresolvedModeKeys.length > 0) {
  console.error(
    [
      `[generate-beys-seed] 🛑 ${unresolvedModeKeys.length} authored mode key(s) match no bey:`,
      ...unresolvedModeKeys.map((k) => `     ${k}`),
      "  Fix scripts/lib/bey-modes-authored.mjs — an unmatched key contributes nothing",
      '  and afterwards reads as "the corpus documents no modes for it".',
    ].join("\n"),
  );
  process.exit(1);
}

if (unreachableModeKeys.length > 0) {
  const lines = [
    `  ⚠ ${unreachableModeKeys.length} authored mode key(s) are real parts that NO bey`,
    "    composition references, so their modes attach to nothing yet:",
    ...unreachableModeKeys.map((k) => `       ${k}`),
    "    The modes are correct; the COMPOSITION data is incomplete. Not an error.",
  ];
  for (const line of lines) console.log(line);
}

console.log(`[generate-beys-seed] beys ${beys.length} in ${chunks.length} chunk(s)`);
console.log(
  `  modes authored ${modesAttached.length}/${beys.length} (${modesAttached.join(", ")})` +
    `; withheld ${Object.keys(MODES_WITHHELD).length} — see lib/bey-modes-authored.mjs`,
);
console.log(`  composition ${cov("composition")} · ratings ${cov("ratingsFromParts")} · mass stated ${cov("weightG")} + summed ${cov("weightGFromParts")}`);
console.log(`  ownerCharacters ${cov("ownerCharacters")} · aka ${cov("aka")} · images ${cov("images")} · sourceUrl ${cov("sourceUrl")}`);
if (collisions) console.log(`  🛑 slug collisions merged: ${collisions}`);
console.log(`[generate-beys-seed] beyProducts ${products.length}`);
console.log(
  `  assortment entries resolved to a bey: ${assortmentResolved}/${assortmentTotal}` +
    ` (${Math.round((assortmentResolved / Math.max(1, assortmentTotal)) * 100)}%)`,
);
if (productCollisions) console.log(`  🛑 product slug collisions skipped: ${productCollisions}`);
