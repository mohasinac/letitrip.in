#!/usr/bin/env node
/**
 * E4/D12 — generate the `partGlossary` and `modelComposition` seed files from
 * the extracted research.
 *
 * 🛑 GENERATED, never hand-typed. 759 parts and 260 compositions is not
 * something a human transcribes correctly, and a transcription error here is
 * a part page stating a wrong weight or a model missing a slot — both of which
 * read as data rather than as a mistake.
 *
 *   node scripts/extract-part-composition.mjs
 *   node scripts/extract-part-glossary.mjs
 *   node scripts/generate-parts-seed.mjs    <- this
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DIR = resolve(process.cwd(), "docs/research/part-composition-2026-10");
const glossary = JSON.parse(readFileSync(resolve(DIR, "part-glossary.json"), "utf8"));
const composition = JSON.parse(readFileSync(resolve(DIR, "composition.json"), "utf8"));

/** Buyer-facing classification → the canonical slot key. */
const SLOT_FOR = {
  "Bit Chip": "bit-chip", "Attack Ring": "attack-ring", "Weight Disk": "weight-disk",
  "Spin Gear": "spin-gear", "Engine Gear": "engine-gear", "Blade Base": "blade-base",
  "Running Core": "running-core", "Face Bolt": "face-bolt", "Energy Ring": "energy-ring",
  "Fusion Wheel": "fusion-wheel", "Chrome Wheel": "chrome-wheel", "Spin Track": "spin-track",
  "Performance Tip": "performance-tip", Layer: "layer", Disc: "disc", Driver: "driver",
  Armour: "armour", Blade: "blade", Ratchet: "ratchet", Bit: "bit",
  /*
   * I10 — the 39 added 2026-10-20, keyed on the wiki's own `Classification`
   * spelling. Aliases first: these are the three the corpus writes
   * differently from our key, and getting one wrong splits a part family.
   */
  "Forge Disc": "disc", "Energy Layer": "layer", Armor: "armour",
  "Layer Base": "base", "Layer Ring": "ring", "Sparking Chip": "superking-chip",
  "GT Chip": "gt-chip", "Gatinko Chip": "gatinko-chip",
  "Superking Chip": "superking-chip", "DB Core": "db-core",
  "Armor Tip": "armor-tip", Frame: "frame", Chassis: "chassis",
  "BU Blade": "bu-blade", "QS Blade": "qs-blade", "Drive Chip": "drive-chip",
  "Storm Chip": "storm-chip", "Strike Chip": "strike-chip",
  "Gravity Ring": "gravity-ring", "Spirit Shield": "spirit-shield",
  "Spirit Axle": "spirit-axle",
  "Disc-Integrated Driver": "disc-integrated-driver",
  "Lock Chip": "lock-chip", "Main Blade": "main-blade",
  "Assist Blade": "assist-blade", "Over Blade": "over-blade",
  "Metal Blade": "metal-blade",
  "Ratchet-Integrated Blade": "ratchet-integrated-blade",
  "Ratchet-Integrated Bit": "ratchet-integrated-bit",
  "Warrior Wheel": "warrior-wheel", "Element Wheel": "element-wheel",
  "Light Wheel": "light-wheel", Wheel: "wheel",
  "Shogun Face Bolt": "shogun-face-bolt", "Dome Spin Track": "dome-spin-track",
  "Evolution Gear": "evolution-gear", "Bit Protector": "bit-protector",
  Weight: "weight", Core: "core",
  "Support Parts": "support-parts", "Support Part": "support-parts",
  "Sub Attack Ring": "sub-attack-ring",
  "Customize Engine Weight": "cew", "Gear Chip": "gear-chip",
};

/*
 * 🛑 A TRAILING APOSTROPHE IS A REAL PART, NOT PUNCTUATION TO STRIP.
 *
 * In Burst, `Dimension'` is a different driver from `Dimension` — the
 * community reads the mark as "dash" and Takara Tomy ships them as separate
 * products. Stripping it collapsed three genuinely distinct drivers
 * (`Dimension'`, `Unite'`, `Variable'`) onto their base names, and the
 * collision handler below then gave each a `-2` suffix: an id that is an
 * accident of array order and tells a reader nothing about which part it is.
 *
 * Measured before this fix: `driver--dimension-2`, `driver--unite-2`,
 * `driver--variable-2`. Those ids are also URLs, and a slug is the one field
 * that cannot be quietly corrected later.
 */
const slugTail = (s) =>
  String(s)
    .trim()
    .replace(/['’]\s*$/, "-dash")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const idFor = (slot, codeOrName) => `${slot}--${slugTail(codeOrName)}`;

/*
 * 🛑 Ids must be UNIQUE, and two different parts can slug to the same tail —
 * "Metal Ball" and "Metal-Ball" both become `metal-ball`. A collision would
 * make `appkit-seed load` silently overwrite one with the other (a merge
 * write, reported as created), so it is counted and disambiguated rather than
 * trusted.
 */
const used = new Map();
const parts = [];
let merged = 0;
for (const g of glossary) {
  const slot = SLOT_FOR[g.classification];
  if (!slot) continue;
  const id = idFor(slot, g.code ?? g.name);

  /*
   * 🛑 A REMAINING collision is a TRUE DUPLICATE and is MERGED, not suffixed.
   *
   * Once the apostrophe is preserved above, the only ids that still collide are
   * the same part recorded twice with different punctuation — measured: exactly
   * one pair, "SG Semi Flat Base" and "SG Semi-Flat Base". Those were two rows,
   * two part pages and (now) two category leaves for one physical object.
   *
   * Suffixing `-2` kept both and made the duplicate invisible; merging unions
   * what each row knows and keeps the richer name. `appkit-seed load` is a
   * merge write, so two rows with one id would ALSO have collapsed silently in
   * Firestore and reported `created` for both — this is the same defect caught
   * one layer earlier, where it can be reported.
   */
  const prior = used.get(id);
  if (prior !== undefined) {
    merged++;
    const existing = parts[prior];
    existing.usedBy = [...new Set([...(existing.usedBy ?? []), ...(g.usedBy ?? [])])];
    existing.aliases = [...new Set([...(existing.aliases ?? []), g.name, g.code].filter(Boolean))];
    if (existing.weightG == null && g.weightG != null) existing.weightG = g.weightG;
    /*
     * Keep the richer spelling: "SG Semi-Flat Base" reads as the real name and
     * "SG Semi Flat Base" as the typo, and the hyphenated form is what the
     * corpus uses elsewhere.
     *
     * 🛑 The length test alone LOSES that case. Both spellings are 17
     * characters, so `>` is false and the un-hyphenated form wins — the exact
     * opposite of what the comment above promises. Punctuation breaks the tie
     * first, which is the signal that actually distinguishes them.
     */
    const score = (s) => (s.match(/[^A-Za-z0-9 ]/g) ?? []).length;
    if (
      g.name.length > existing.name.length ||
      (g.name.length === existing.name.length && score(g.name) > score(existing.name))
    ) {
      existing.name = g.name;
    }
    continue;
  }
  used.set(id, parts.length);
  parts.push({
    id,
    classification: g.classification,
    slot,
    code: g.code ?? null,
    name: g.name,
    ...(g.weightG != null ? { weightG: g.weightG } : {}),
    ...(g.usedBy?.length ? { usedBy: g.usedBy } : {}),
    ...(g.aliases?.length ? { aliases: g.aliases } : {}),
    ...(g.source ? { source: g.source } : {}),
  });
}

/*
 * ── I10 — merge the extracted specs onto the rows ──────────────────────────
 *
 * Two sources, one merge point. Doing it here rather than at each call site is
 * the same reason `deriveTaxonomy` lives in the repository: a per-caller merge
 * is Root Cause #75's shape, where one copy learns about a new field and the
 * others silently do not.
 *
 * PRECEDENCE, per (part, label): the CORPUS tables win, the wiki fills.
 * The corpus tags provenance per ROW (`FACT`, `FACT(PDB)` — verified against
 * PlasticsDB's own part page, `INFERENCE`), while the wiki infobox is a single
 * unattributed value. Finer-grained provenance is the whole basis for
 * preferring one number over another.
 *
 * 🛑 A missing file is NOT fatal. These JSONs are committed, but a clone that
 * has not run the extractors yet should still produce a working seed — the
 * parts would simply have no specs, which is exactly the state before this
 * work. Failing the generator instead would make the repo unbuildable for
 * anyone without the external corpus.
 */
function readJsonOrNull(rel) {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), rel), "utf8"));
  } catch {
    return null;
  }
}

const corpusSpecs = readJsonOrNull("docs/research/part-specs-2026-10/part-specs.json") ?? {};
const wikiSpecs = readJsonOrNull("docs/research/part-specs-2026-10/wiki-part-specs.json") ?? {};

/*
 * ── CREATE a row for every wiki part the glossary has no row for ──────────
 *
 * 🛑 THE MERGE LOOP BELOW ONLY EVER FILLS ROWS THAT ALREADY EXIST.
 *
 * Measured 2026-10-20: `wiki-part-specs.json` holds **2,087** parts and only
 * **368** of them matched a glossary row, so **1,719** fully-extracted parts
 * were sitting in a committed file, read by this generator, and silently
 * dropped on the floor — the glossary stayed at 771 while the data to take it
 * to ~2,490 was already on disk. That is Root Cause #57's shape (a feature
 * complete end to end except one hop) and the symptom was simply a smaller
 * number than it should have been, which nothing can flag.
 *
 * Creating here, BEFORE the merge, is deliberate: the new rows then flow
 * through the same merge loop as every other row, so the duplicate-`Weight`
 * invariant, the corpus-wins precedence and every counter apply to them
 * without a second copy of that logic (Root Cause #75).
 *
 * 🛑 `code` is NOT derived from the id tail. The id is `${slot}--${slugTail}`
 * where the tail is the code OR the name, so reading it back would write
 * `code: "adventure"` for `armor-tip--adventure` — a NAME presented as a
 * product code. The wiki carries a real `code` on 2 of 1,719 rows; the other
 * 1,717 get `code: null`, which is exactly what the existing name-keyed rows
 * already do (`armor-tip--yard` is `code: null, name: "Yard"`).
 *
 * 🛑 `wikiImage` is NOT copied across. It is a bare wiki filename
 * (`Armor1.png`), and `PartGlossaryDocument.image` is a `/media/<slug>` that
 * only exists once the file has been fetched and given a `mediaAssets` row.
 * Writing the filename into `image` would produce 1,719 broken images that
 * render as a styling bug rather than as missing data (the 2026-10-17
 * incident). Images are their own pass.
 *
 * Verified before writing this: every one of the 55 slots the wiki extraction
 * uses is already in `PART_SLOT_VALUES`, so no row created here can carry a
 * slot outside the union and break the `Partial<PartGlossaryDocument>` type.
 */
let createdFromWiki = 0;
const createdBySlot = new Map();
for (const [id, wiki] of Object.entries(wikiSpecs)) {
  if (used.has(id)) continue;
  if (!wiki.slot || !wiki.name) continue;
  used.set(id, parts.length);
  parts.push({
    id,
    classification: wiki.classification ?? wiki.slot,
    slot: wiki.slot,
    code: wiki.code ?? null,
    name: wiki.name,
    ...(wiki.weightG != null ? { weightG: wiki.weightG } : {}),
    aliases: [...new Set([wiki.name, wiki.code].filter(Boolean).map((s) => slugTail(s)))],
    source: wiki.source ?? "fandom-infobox",
  });
  createdFromWiki += 1;
  createdBySlot.set(wiki.slot, (createdBySlot.get(wiki.slot) ?? 0) + 1);
}

let withSpecs = 0;
let withSeo = 0;
let withShippedIn = 0;
let withColourways = 0;
let withRatings = 0;
let withLegality = 0;
let withAka = 0;
let withHasbroCode = 0;
let weightsFilled = 0;
let duplicateWeightRowsDropped = 0;

for (const row of parts) {
  const corpus = corpusSpecs[row.id];
  const wiki = wikiSpecs[row.id];
  if (!corpus && !wiki) continue;

  // Corpus first, then any wiki label the corpus did not supply.
  const byLabel = new Map();
  for (const s of corpus?.specs ?? []) byLabel.set(s.label, s);
  for (const s of wiki?.specs ?? []) if (!byLabel.has(s.label)) byLabel.set(s.label, s);

  if (row.weightG == null) {
    const w = corpus?.weightG ?? wiki?.weightG;
    if (w != null) {
      row.weightG = w;
      weightsFilled += 1;
    }
  }

  /*
   * 🛑 THE INVARIANT THE SCHEMA PROMISES. With `weightG` set, a `Weight` spec
   * row would render the same number a second time and the two could disagree
   * the moment either is edited. Dropped here, asserted by verify-part-specs.
   */
  if (row.weightG != null && byLabel.has("Weight")) {
    byLabel.delete("Weight");
    duplicateWeightRowsDropped += 1;
  }

  const specs = [...byLabel.values()];
  if (specs.length) {
    row.specs = specs;
    withSpecs += 1;
  }

  const seo = wiki?.seoDescription;
  if (seo) {
    row.seoDescription = seo;
    withSeo += 1;
  }
  if (wiki?.shippedIn?.length) {
    row.shippedIn = wiki.shippedIn;
    withShippedIn += 1;
  }
  if (wiki?.releases?.length) row.releases = wiki.releases;
  if (wiki?.colourways?.length) {
    row.colourways = wiki.colourways;
    withColourways += 1;
  }
  /*
   * A page WITH a Products section and no colourway in it is a source saying
   * "one release" — a real negative assertion. A page without the section at
   * all is silence, and the two must not render alike.
   */
  if (wiki?.releases?.length) row.colourwaysDocumented = true;
  if (wiki?.hasMoldVariations) row.hasMoldVariations = true;
  if (wiki?.sourceUrl) row.sourceUrl = wiki.sourceUrl;
  /*
   * The stat grid and the format legality as DATA, beside the `specs[]` rows
   * that render them. A sort, a filter, a comparison and the simulation all
   * need numbers; none of them can parse "Attack 3 · Defense 0". See
   * `PartRatings` for why both representations exist.
   */
  if (wiki?.ratings && Object.keys(wiki.ratings).length) {
    row.ratings = wiki.ratings;
    /* Without the scale the numbers are not comparable — see PartRatings. */
    if (wiki.ratingScale) row.ratingScale = wiki.ratingScale;
    if (wiki.ratingsNormalised) row.ratingsNormalised = wiki.ratingsNormalised;
    withRatings += 1;
  }
  if (wiki?.wboLegality && Object.keys(wiki.wboLegality).length) {
    row.wboLegality = wiki.wboLegality;
    withLegality += 1;
  }
  /*
   * Identity and story fields. `aka` UNIONS with whatever the row already has
   * rather than replacing it — the corpus-derived rows carry their own
   * aliases, and overwriting them would lose a search term to gain one.
   */
  if (wiki?.aka?.length) {
    row.aliases = [...new Set([...(row.aliases ?? []), ...wiki.aka])];
    row.aka = wiki.aka;
    withAka += 1;
  }
  if (wiki?.hasbroCode) {
    row.hasbroCode = wiki.hasbroCode;
    withHasbroCode += 1;
  }
  if (wiki?.partType) row.partType = wiki.partType;
  if (wiki?.spinDirection) row.spinDirection = wiki.spinDirection;
  if (wiki?.element) row.element = wiki.element;
  if (wiki?.owner) row.owner = wiki.owner;
  if (wiki?.appearAnime) row.appearAnime = wiki.appearAnime;
  if (wiki?.role) row.role = wiki.role;
  if (wiki?.fusedRoles) row.fusedRoles = wiki.fusedRoles;
  if (wiki?.jpName) row.jpName = wiki.jpName;
  if (wiki?.romaji) row.romaji = wiki.romaji;
  if (wiki?.kanjiName) row.kanjiName = wiki.kanjiName;
}

/*
 * 🛑 Join each composition to its named-model CATEGORY at generation time.
 *
 * The two id spaces were built from different sources and do not agree —
 * `gen1-plastic-dragoon-f` versus `category-dragoon-f` — so a model page needs
 * a join. Doing it HERE rather than at read time makes it one indexed
 * equality (`where("categoryId","==",id)`) instead of a name query, and makes
 * the match deterministic and reviewable in the committed seed.
 *
 * Matched on the NORMALISED name, and a non-match leaves `categoryId` unset:
 * the model page then shows no composition, which is honest. The alternative —
 * a fuzzy match — risks attaching ANOTHER bey's parts to a model, and a wrong
 * part list is worse than none.
 */
/*
 * 🛑 Strip the PARENTHETICAL EXPANSION before joining. The corpus titles many
 * HMS beys as `Aero Knight MS (Aero Knight Metal Sky)` — the bracket expands
 * the abbreviation rather than naming a different bey — while the category is
 * simply "Aero Knight MS". Joining on the raw name missed every one of them.
 *
 * Both forms are tried, longest first, so a category that genuinely includes a
 * bracket still matches on its full name.
 */
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
const normNoParen = (s) => norm(String(s).replace(/\([^)]*\)/g, " "));
/*
 * 🛑 ABORT when the categories cannot be loaded — never emit a join-less seed.
 *
 * This was a `catch {}` that printed a warning and carried on. Carrying on
 * means every one of the 259 compositions is written with NO `categoryId`,
 * and `categoryId` is the only join a model page has: `data.ts` queries
 * `where("categoryId","==",id)`. So the generated file still looks healthy —
 * 259 rows, every slot present — and silently removes the Parts tab from
 * every bey on the site.
 *
 * It is not hypothetical. `appkit/dist` is ESM with EXTENSIONLESS relative
 * imports until `appkit/scripts/fix-esm-extensions.mjs` has run over it, so a
 * dist built by any path that skips that step makes this import throw
 * ERR_MODULE_NOT_FOUND. Running this generator against such a dist took the
 * committed seed from 222 joins to 0, and the only visible difference was one
 * line of `⚠` in a log that ends with a cheerful summary.
 *
 * A generator that cannot do its job must fail, not downgrade: the output is
 * committed, so a silent degrade outlives the session that caused it.
 */
let categories = [];
try {
  const mod = await import("../appkit/dist/seed/categories-seed-data.js");
  categories = mod.categoriesSeedData ?? [];
} catch (err) {
  console.error(`\n🛑 Cannot load the categories seed from appkit/dist:\n   ${err?.message ?? err}\n`);
  console.error("   Without it every composition would be written with no categoryId,");
  console.error("   which removes the Parts tab from every bey. Refusing to write.\n");
  console.error("   Fix: npm --prefix appkit run build");
  console.error("   (or, if dist is already compiled, just restore its ESM extensions:");
  console.error("    node appkit/scripts/fix-esm-extensions.mjs)\n");
  process.exit(1);
}
if (categories.length === 0) {
  console.error("\n🛑 The categories seed loaded but is EMPTY — refusing to write a join-less seed.\n");
  process.exit(1);
}
const catByName = new Map();
for (const c of categories) {
  if (c.categoryType) continue; // brands and bundles are not models
  if (c.name) catByName.set(norm(c.name), String(c.id));
}
let joined = 0;

// Resolve each composition slot to its glossary id, so a model page can link.
/*
 * TWO indexes, exact first and punctuation-insensitive second.
 *
 * 🛑 The exact index alone dropped two slots the moment the duplicate merge
 * landed: the merge keeps ONE spelling ("SG Semi-Flat Base") and a composition
 * slot naming the other ("SG Semi Flat Base") then matched nothing. The two
 * corpus files punctuate independently, so an exact-name join was always going
 * to be fragile — and its failure is silent, because an unresolved slot still
 * renders its `partName` and simply does not link.
 *
 * Aliases are indexed too, which is what makes the merged row reachable by
 * BOTH of its spellings.
 */
const normName = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]+/g, "");
const byNameSlot = new Map();
const byNormSlot = new Map();
for (const p of parts) {
  byNameSlot.set(`${p.slot}|${p.name.toUpperCase()}`, p.id);
  for (const a of [p.name, ...(p.aliases ?? [])]) {
    if (!a) continue;
    const k = `${p.slot}|${normName(a)}`;
    // First writer wins, so a later row cannot steal an earlier row's name.
    if (!byNormSlot.has(k)) byNormSlot.set(k, p.id);
  }
}
const resolvePart = (slotKey, partName) =>
  byNameSlot.get(`${slotKey}|${partName.toUpperCase()}`) ??
  byNormSlot.get(`${slotKey}|${normName(partName)}`);
let resolvedSlots = 0, unresolvedSlots = 0;
const models = composition.map((c) => ({
  id: c.id,
  name: c.name,
  generation: c.generation ?? null,
  ...(c.generationNote ? { generationNote: c.generationNote } : {}),
  ...(c.system ? { system: c.system } : {}),
  ...(c.series ? { series: c.series } : {}),
  ...(c.productCode ? { productCode: c.productCode } : {}),
  slots: (c.slots ?? []).map((s) => {
    const partId = resolvePart(s.slotKey, s.partName.replace(/\s+/g, " ").trim());
    if (partId) resolvedSlots++; else unresolvedSlots++;
    return {
      slotKey: s.slotKey,
      slotLabel: s.slotLabel,
      partName: s.partName.replace(/\s+/g, " ").trim(),
      ...(s.weightG != null ? { weightG: s.weightG } : {}),
      ...(partId ? { partId } : {}),
    };
  }),
  ...(c.slotMerges?.length ? { slotMerges: c.slotMerges } : {}),
  ...(c.source ? { source: c.source } : {}),
  ...(() => {
    const id = catByName.get(norm(c.name)) ?? catByName.get(normNoParen(c.name));
    if (id) joined++;
    return id ? { categoryId: id } : {};
  })(),
}));

const header = (what, n) => `/**
 * GENERATED by \`scripts/generate-parts-seed.mjs\` — do not hand-edit.
 * Source: \`docs/research/part-composition-2026-10/\` (E4a/E4b), itself
 * extracted from the LOCAL corpus with no network crawl.
 *
 * ${what} — ${n} rows.
 *
 * 🛑 Facts only. Fandom is CC-BY-SA, so names, codes, weights and slot
 * structure are taken and the PROSE is not — our own descriptions come from
 * the category templates. Regenerate rather than edit: a hand-fix here is lost
 * on the next run and, worse, makes the committed output disagree with the
 * script that is supposed to produce it.
 */`;

/*
 * 🛑 EMITTED AS ONE FILE PER CHUNK, because the TS2590 limit is per-FILE.
 *
 * Measured 2026-10-20 at 2,490 rows:
 *   part-glossary-seed-data.ts(16,70): error TS2590: Expression produces a
 *   union type that is too complex to represent.
 *
 * Every element is contextually checked against `Partial<PartGlossaryDocument>`,
 * whose `slot` is a 59-member union and whose `specs[].confidence` is another
 * four — so the checker's work grows with row count and at ~2.5k it exceeds
 * what TypeScript will represent. It compiled at 771 rows, which is why this
 * only appeared at that size.
 *
 * Three ways out, and the choice matters:
 *
 *   `as Partial<PartGlossaryDocument>[]`   compiles instantly and TURNS OFF
 *       the check. A misspelled field or a slot outside the union would then
 *       sail through to Firestore — which is the one thing this annotation is
 *       here to prevent, on a file no human reads.
 *   loosen the element type       same loss, spelled differently.
 *   CHUNK and concat              each chunk is checked in full, and the
 *       concatenation of checked arrays needs no check of its own.
 *
 * Chunking is right and nothing is weakened. 🛑 But the chunks must be separate
 * FILES — five `const`s inside ONE file does NOT fix it, which is what this
 * script emitted until 2026-10-20 and why a cold `tsc` was red for three days.
 * Measured, because every intuition about this is wrong in some direction:
 *
 *   500 rows, one file                       OK
 *   2,500 rows, five separate files, one tsc OK
 *   2,490 rows, five consts in one file      TS2590
 *
 * So the budget is per-file. Keep adding rows by raising the chunk COUNT,
 * never by growing CHUNK past roughly this size.
 *
 * 🛑 The red build was invisible locally because `tsconfig.json` sets
 * `incremental: true` — nothing re-checked the file, so `npm run check` passed
 * while CI and Vercel, which build cold, did not. And appkit's build script
 * `rm -rf dist` BEFORE tsc, so a build attempt in that state deleted the
 * working dist and then failed.
 */
const CHUNK = 500;
const chunks = [];
for (let i = 0; i < parts.length; i += CHUNK) chunks.push(parts.slice(i, i + CHUNK));

const chunkDir = resolve(process.cwd(), "appkit/src/seed/part-glossary");
mkdirSync(chunkDir, { recursive: true });
chunks.forEach((c, i) => {
  writeFileSync(
    resolve(chunkDir, `chunk${i}.ts`),
    `/**
 * GENERATED by \`scripts/generate-parts-seed.mjs\` — do not hand-edit.
 *
 * Chunk ${i} of the part glossary. See \`../part-glossary-seed-data.ts\` for
 * provenance and for why the chunks are separate FILES rather than separate
 * consts in one file.
 */
import type { PartGlossaryDocument } from "../../features/parts/schemas/firestore";

export const glossaryChunk${i}: Partial<PartGlossaryDocument>[] = ${JSON.stringify(c, null, 2)};
`,
  );
});

/*
 * Stale chunk files are REMOVED, not left behind. A run that produces fewer
 * chunks than the last one would otherwise leave an orphan `chunkN.ts` that
 * still compiles, still type-checks, and is imported by nothing — so it would
 * read as live data to anyone who opened it.
 */
for (const f of readdirSync(chunkDir)) {
  const m = /^chunk(\d+)\.ts$/.exec(f);
  if (m && Number(m[1]) >= chunks.length) rmSync(resolve(chunkDir, f));
}

writeFileSync(
  resolve(process.cwd(), "appkit/src/seed/part-glossary-seed-data.ts"),
  `${header("The part glossary, keyed (slot, code|name)", parts.length)}

/*
 * ── Why the chunks are separate FILES ─────────────────────────────────────
 *
 * 🛑 The TS2590 budget is per-FILE. Five \`const\`s in ONE file does not fix
 * it — that was emitted here until 2026-10-20 and made a cold \`tsc\` red —
 * whereas five files does, with every row still fully checked. See
 * scripts/generate-parts-seed.mjs for the three measurements that settle it.
 *
 * Add rows by raising the chunk COUNT, never by growing a chunk.
 */
import type { PartGlossaryDocument } from "../features/parts/schemas/firestore";
${chunks.map((_, i) => `import { glossaryChunk${i} } from "./part-glossary/chunk${i}";`).join("\n")}

export const partGlossarySeedData: Partial<PartGlossaryDocument>[] = [
${chunks.map((_, i) => `  ...glossaryChunk${i},`).join("\n")}
];
`,
);

writeFileSync(
  resolve(process.cwd(), "appkit/src/seed/model-composition-seed-data.ts"),
  `${header("Model composition — which parts each bey is made of", models.length)}
import type { ModelCompositionDocument } from "../features/parts/schemas/firestore";

export const modelCompositionSeedData: Partial<ModelCompositionDocument>[] = ${JSON.stringify(models, null, 2)};
`,
);

console.log(`partGlossary:      ${parts.length} rows  (true duplicates merged: ${merged})`);
console.log(`  created from the wiki crawl: ${createdFromWiki}`);
if (createdFromWiki) {
  const top = [...createdBySlot.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([s, n]) => `${s} ${n}`)
    .join(", ");
  console.log(`    biggest slots: ${top}`);
}
console.log(`modelComposition:  ${models.length} rows`);
console.log("");
console.log(`specs merged onto rows:   ${withSpecs}`);
console.log(`  weights filled in:      ${weightsFilled}`);
console.log(`  duplicate Weight rows dropped: ${duplicateWeightRowsDropped}`);
console.log(`SEO descriptions:         ${withSeo}`);
console.log(`shippedIn (which bey):    ${withShippedIn}`);
console.log(`colourways:               ${withColourways}`);
console.log(`ratings (attack/def/...):  ${withRatings}`);
console.log(`WBO format legality:      ${withLegality}`);
console.log(`aka / abbreviations:      ${withAka}`);
console.log(`Hasbro code (vendor map): ${withHasbroCode}`);
console.log("");
console.log(`slots resolved to a glossary id: ${resolvedSlots}  unresolved: ${unresolvedSlots}`);
console.log(`compositions joined to a named-model category: ${joined}/${models.length}`);
console.log(`  (an unresolved slot still renders its partName — it just does not link)`);

/* 🛑 Fail rather than emit a seed whose ids are not unique. */
const ids = parts.map((p) => p.id);
if (new Set(ids).size !== ids.length) {
  console.log("\n🛑 DUPLICATE partGlossary IDS — `appkit-seed load` is a merge write, so one row would");
  console.log("   silently overwrite another and still report `created`.");
  process.exit(1);
}
const mids = models.map((m) => m.id);
if (new Set(mids).size !== mids.length) {
  console.log("\n🛑 DUPLICATE modelComposition IDS");
  process.exit(1);
}
