#!/usr/bin/env node
/*
 * WHY: The knowledge base needs to be reachable WITHOUT reading the bundle — an
 *      admin asking "what do we say about A0813", a support reply, a future
 *      surface that wants the generation table. A Firestore collection gives
 *      that; a TypeScript array in the Next.js bundle does not.
 *
 * WHAT: Emits appkit/src/seed/authenticity-knowledge-seed-data.ts — the
 *       `authenticityKnowledge` collection, one document per date code, per
 *       generation and per marque.
 *
 * 🛑 THE ENGINE DOES NOT READ THIS COLLECTION, and that is deliberate.
 *    /tools/authenticity resolves entirely from bundled static data, so a lookup
 *    costs one invocation and ZERO Firestore reads (Rule #6) — which is what
 *    makes it safe to expose with no rate-limit story. Firestore is the
 *    ACCESS copy, not the runtime source. If you ever make the engine read it,
 *    the cost argument in the route's docstring stops being true.
 *
 * 🛑 So why is this not Root Cause #42's denormalised-mirror trap? Because both
 *    copies are DERIVED from one parse — `scripts/lib/authenticity-sources.mjs`
 *    — by emitters that cannot disagree about content, only about format. They
 *    are two renderings of one source, not two hand-maintained tables. And
 *    `scripts/audit-authenticity-data-parity.mjs` fails the build if the two
 *    emitted files ever stop agreeing, so a stale re-run is caught rather than
 *    shipped.
 *
 * Run: node scripts/gen-authenticity-seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {
  buildCanonicalIndex,
  buildDateCodeTables,
  buildModelCodeIndex,
} from "./lib/authenticity-sources.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "appkit/src/seed/authenticity-knowledge-seed-data.ts");

const tables = buildDateCodeTables();
const { seriesWindows, counts, yearGaps } = tables;
const canonical = buildCanonicalIndex();

/*
 * 🛑 THE LINKED COPIES REPLACE THE RAW TABLES BELOW. `linked.original` is
 * `original` plus `modelSlugs`/`categoryIds`, in the same order, so everything
 * downstream reads one shape and a row can never be emitted half-linked.
 */
const { models: modelCodeIndex, linked, unlinkedProducts } = buildModelCodeIndex(tables, canonical);
const { original, midfake, unclear, contested } = linked;

/** Reported in the header, so a drop in linkage shows up in the diff. */
const unlinkedCodeDocs = [original, midfake, contested, unclear]
  .flat()
  .filter((g) => g.models.length === 0).length;

/**
 * 🛑 Document ids are SLUGS, not auto-ids, so a code is addressable directly:
 * `authenticityKnowledge/authknow-code-a0813`. An auto-id would mean a query to
 * answer "what do we know about this code", which is the one thing this
 * collection exists to make cheap.
 */
const codeDocId = (code) => `authknow-code-${code.toLowerCase()}`;
const genDocId = (id) => `authknow-generation-${id}`;
/**
 * Keyed on the CATEGORY ID, not the corpus slug.
 *
 * The category leaf is the id every other surface on this site already uses for
 * a bey — a model search hit carries it, the model's own page is addressed by
 * it, and `categoryIdForModel` is the one derivation of it. Keying on the
 * corpus slug instead would mean every reader had to translate, and the two
 * spellings differ for 58 of the 195 models that carry imagery (the trailing
 * parenthetical), which is exactly the mismatch CLAUDE.md records as having
 * silently orphaned those images once already.
 */
const modelDocId = (categoryId) => `authknow-model-${categoryId.replace(/^category-/, "")}`;
const marqueDocId = (slug) => `authknow-marque-${slug}`;
const seriesWindowDocId = (name) => `authknow-series-${name.toLowerCase().replace(/\s+/g, "-")}`;

const q = (v) => JSON.stringify(v);

const codeDocs = [
  ...original.map((g) => ({ g, verdict: "recorded-original" })),
  ...midfake.map((g) => ({ g, verdict: "recorded-midfake" })),
  ...contested.map((g) => ({ g, verdict: "contested" })),
  ...unclear.map((g) => ({ g, verdict: "unresolved" })),
].map(
  ({ g, verdict }) =>
    `  {\n` +
    `    id: ${q(codeDocId(g.code))},\n` +
    `    kind: "date-code",\n` +
    `    code: ${q(g.code)},\n` +
    `    verdict: ${q(verdict)},\n` +
    `    products: ${q(g.products)},\n` +
    `    regions: ${q(g.regions)},\n` +
    `    packaging: ${q(g.packaging)},\n` +
    `    notes: ${q(g.notes)},\n` +
    `    families: ${q(g.families)},\n` +
    `    sources: ${q(g.sources)},\n` +
    `    uncertain: ${g.uncertain},\n` +
    `    derivedDate: ${g.derivedDate === null ? "null" : q(g.derivedDate)},\n` +
    `    sourceDateDiffers: ${g.statedDiffers},\n` +
    /*
     * 🛑 The link, and the ADMISSION that it is partial. `unlinkedProducts`
     * carries every label naming a bey the canonical corpus has no row for —
     * 41 of them, mostly Metal Fight releases the 221-row corpus never
     * covered. Emitting only the successes would make a 432-of-517 linkage
     * read as complete to everyone who came after.
     */
    `    modelSlugs: ${q(g.modelSlugs)},\n` +
    `    categoryIds: ${q(g.categoryIds)},\n` +
    (g.unlinkedProducts.length > 0 ? `    unlinkedProducts: ${q(g.unlinkedProducts)},\n` : "") +
    (g.recordedOriginalBy ? `    recordedOriginalBy: ${q(g.recordedOriginalBy)},\n` : "") +
    (g.recordedMidfakeBy ? `    recordedMidfakeBy: ${q(g.recordedMidfakeBy)},\n` : "") +
    `    generation: "mfb",\n` +
    `    seedPurpose: "permanent",\n` +
    `  },`,
);

/*
 * Generation + marque rows are authored prose, so they are NOT re-derived here —
 * they would have to be duplicated from the TypeScript knowledge base, which is
 * exactly the drift this file's header refuses. Instead the generator emits only
 * the identity and counts for each generation, and the authored text stays in
 * one place: src/features/authenticity/data/generations.ts.
 *
 * 🛑 That is a deliberate limit on this collection's contents. A Firestore row
 * repeating a paragraph that also lives in TypeScript is two owners of one
 * sentence (Root Cause #42); a row carrying the code table is one owner of data
 * nothing else holds.
 */
const generationIds = [...new Set(canonical.map((c) => c.generation))].sort();
const perGeneration = generationIds.map((id) => {
  const beys = canonical.filter((c) => c.generation === id);
  return (
    `  {\n` +
    `    id: ${q(genDocId(id))},\n` +
    `    kind: "generation",\n` +
    `    generation: ${q(id)},\n` +
    `    canonicalReleaseCount: ${beys.length},\n` +
    `    releasesWithRetailCode: ${beys.filter((b) => b.code).length},\n` +
    `    exampleCodes: ${q(beys.filter((b) => b.code).slice(0, 3).map((b) => b.code))},\n` +
    `    hasDateCodeTable: ${id === "mfb" || id === "zerog"},\n` +
    `    seedPurpose: "permanent",\n` +
    `  },`
  );
});

/**
 * The four named Metal-series production windows. UNLIKE the generation rows
 * above, these ARE re-derived data, not authored prose — they are parsed
 * straight out of the reddit post's "Additional Information" section by the
 * same shared `authenticity-sources.mjs`, so emitting them here is a second
 * rendering of one parse (same contract as the date-code tables), not a
 * second owner of a sentence (Root Cause #42 does not apply).
 */
const seriesWindowDocs = seriesWindows.map(
  (w) =>
    `  {\n` +
    `    id: ${q(seriesWindowDocId(w.name))},\n` +
    `    kind: "series-window",\n` +
    `    name: ${q(w.name)},\n` +
    `    generation: ${q(w.generation)},\n` +
    `    startLabel: ${q(w.startLabel)},\n` +
    `    endLabel: ${q(w.endLabel)},\n` +
    `    seedPurpose: "permanent",\n` +
    `  },`,
);

/**
 * One document per bey any source records a box code against — the REVERSE of
 * the code table, and the half this collection never had.
 *
 * Every table was keyed by code, so "what codes are recorded for Lightning
 * L-Drago" needed a scan of 517 documents to answer. It is now a single read at
 * a known id, which is what makes it answerable from a model picker at all.
 */
const modelDocs = modelCodeIndex.map(
  (m) =>
    `  {\n` +
    `    id: ${q(modelDocId(m.categoryId))},\n` +
    `    kind: "model-codes",\n` +
    `    name: ${q(m.name)},\n` +
    `    modelSlug: ${q(m.slug)},\n` +
    `    categoryId: ${q(m.categoryId)},\n` +
    `    generation: ${q(m.generation)},\n` +
    `    retailCode: ${m.code === null ? "null" : q(m.code)},\n` +
    `    originalCodes: ${q(m.originalCodes)},\n` +
    `    midfakeCodes: ${q(m.midfakeCodes)},\n` +
    `    contestedCodes: ${q(m.contestedCodes)},\n` +
    `    unclearCodes: ${q(m.unclearCodes)},\n` +
    `    seedPurpose: "permanent",\n` +
    `  },`,
);

const out = `/*
 * GENERATED by scripts/gen-authenticity-seed.mjs — do not edit by hand.
 *
 * WHY: the \`authenticityKnowledge\` collection makes the box-code tables
 *      reachable without reading the Next.js bundle — an admin answering "what
 *      do we say about A0813", a support reply, a future surface that wants the
 *      generation summary.
 *
 * 🛑 /tools/authenticity DOES NOT READ THIS COLLECTION. The engine resolves from
 *    bundled static data so a lookup costs ZERO Firestore reads (Rule #6). This
 *    is the ACCESS copy. Making the engine read it would invalidate the cost
 *    reasoning in src/app/api/tools/authenticity/route.ts.
 *
 * 🛑 Not a denormalised mirror (Root Cause #42): this file and
 *    src/features/authenticity/data/*.generated.ts are two RENDERINGS of one
 *    parse (scripts/lib/authenticity-sources.mjs), and
 *    scripts/audit-authenticity-data-parity.mjs fails the build if they diverge.
 *
 * Provenance for every row: docs/research/beyblade-authenticity-2026-10/README.md
 *
 * ${codeDocs.length} date-code documents · ${modelDocs.length} model-codes documents · ${perGeneration.length} generation documents · ${seriesWindowDocs.length} series-window documents
 * ${original.length} original · ${midfake.length} midfake · ${contested.length} contested · ${unclear.length} unresolved,
 * merged from ${counts.redditRows} + ${counts.modelListRows} + ${counts.midfakeListRows} rows across three archived sources.
 *
 * TAXONOMY LINKAGE — ${codeDocs.length - unlinkedCodeDocs} of ${codeDocs.length} code rows resolve to at least one category
 * leaf, and ${modelDocs.length} of ${canonical.length} canonical beys carry a recorded code. The ${unlinkedProducts.length}
 * product labels below name a bey the canonical corpus has no row for, so they
 * are carried on the row as \`unlinkedProducts\` rather than dropped:
${unlinkedProducts.length ? unlinkedProducts.map((p) => ` *   ${p}`).join("\n") : " *   (none)"}
 *
 * 🛑 \`contested\` means the sources DISAGREE about that exact code — recorded as
 *    genuine by one and as a midfake batch by another. Neither reading may be
 *    quoted on its own, including out of this collection.
 *
 * 🛑 The reddit post's own per-year counts are inflated — it claims 111 originals:
${yearGaps.length ? yearGaps.map((g) => ` *   ${g}`).join("\n") : " *   (no gaps)"}
 *
 * Re-run: node scripts/gen-authenticity-seed.mjs
 *
 * @tag domain:authenticity
 * @tag layer:seed
 * @tag pattern:generated
 * @tag access:server-only
 * @tag consumers:scripts/seed-cli.mjs
 * @tag sideEffects:none
 */

export const AUTHENTICITY_KNOWLEDGE_COLLECTION = "authenticityKnowledge";

/** A date-code row, its reverse per-model row, a generation summary, a series-production window, or (future) a marque. */
export type AuthenticityKnowledgeKind =
  | "date-code"
  | "model-codes"
  | "generation"
  | "series-window"
  | "marque";

/**
 * What the community has recorded about a box code.
 *
 * 🛑 \`recorded-midfake\` is a statement about a BATCH, never about a seller, and
 * never "counterfeit". A midfake is Takara-Tomy-blueprint product of reduced
 * quality and there is no official Takara Tomy statement acknowledging the runs.
 *
 * 🛑 \`contested\` is not a weaker midfake — it means two sources assert OPPOSITE
 * things about the same code. Quoting either side of one as the answer is how
 * this collection would be used to accuse the holder of a genuine box, or to
 * reassure the holder of a fake. Report both.
 */
export type AuthenticityCodeVerdict =
  | "recorded-original"
  | "recorded-midfake"
  | "contested"
  | "unresolved";

export interface AuthenticityKnowledgeDocument {
  id: string;
  kind: AuthenticityKnowledgeKind;
  seedPurpose: "permanent";
  /** date-code rows only. */
  code?: string;
  verdict?: AuthenticityCodeVerdict;
  products?: string[];
  /** Regions of sale: Japan, Taiwan (Funbox Toys), Korea (Sonokong), … */
  regions?: string[];
  /** Starter / Booster / Random Booster Vol. N, where a source stated it. */
  packaging?: string[];
  /** Per-batch observations: mould variants, importer stickers, launcher colour. */
  notes?: string[];
  /** Midfake rows: taiwan-batch | sonokong-highquality | chinese-font. */
  families?: string[];
  /** Which archived source files carry this row. */
  sources?: string[];
  /** The source itself hedged — a blurry photo, or two codes it could not separate. */
  uncertain?: boolean;
  /** Derived FROM the code under the disputed month-day-year reading. */
  derivedDate?: string | null;
  /** True where the source's own written date contradicts its own stated rule. */
  sourceDateDiffers?: boolean;
  /**
   * The bey(s) this code is recorded against, as CATEGORY LEAF ids — the same
   * id the model's own page, its search hit and its imagery all use.
   *
   * 🛑 A code resolving to no model is NORMAL and is not a defect in the row:
   * the source may have named a bey the canonical corpus has no entry for, or
   * named a Random Booster rather than a bey. Those labels are kept in
   * \`unlinkedProducts\` so the gap is visible instead of looking like nothing
   * was ever recorded.
   */
  modelSlugs?: string[];
  categoryIds?: string[];
  unlinkedProducts?: string[];
  /** \`contested\` rows only: which source is on which side. */
  recordedOriginalBy?: string[];
  recordedMidfakeBy?: string[];
  generation?: string;
  /** \`model-codes\` rows only — the reverse index, keyed by category leaf. */
  modelSlug?: string;
  categoryId?: string;
  retailCode?: string | null;
  originalCodes?: string[];
  midfakeCodes?: string[];
  contestedCodes?: string[];
  unclearCodes?: string[];
  /** generation rows only. */
  canonicalReleaseCount?: number;
  releasesWithRetailCode?: number;
  exampleCodes?: string[];
  hasDateCodeTable?: boolean;
  /** series-window rows only. \`name\`/\`generation\` are shared with other kinds above. */
  name?: string;
  startLabel?: string;
  endLabel?: string;
}

export const authenticityKnowledgeSeedData: AuthenticityKnowledgeDocument[] = [
${codeDocs.join("\n")}
${modelDocs.join("\n")}
${perGeneration.join("\n")}
${seriesWindowDocs.join("\n")}
];

/** Asserted downstream so a silent drop is loud. */
export const AUTHENTICITY_KNOWLEDGE_COUNT = ${codeDocs.length + modelDocs.length + perGeneration.length + seriesWindowDocs.length};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out, "utf8");
console.log(
  `gen-authenticity-seed: ${codeDocs.length} code docs + ${modelDocs.length} model-codes docs + ${perGeneration.length} generation docs ` +
    `+ ${seriesWindowDocs.length} series-window docs ` +
    `= ${codeDocs.length + modelDocs.length + perGeneration.length + seriesWindowDocs.length} -> ${path.relative(ROOT, OUT)}`,
);
