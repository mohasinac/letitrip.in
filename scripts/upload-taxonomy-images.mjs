#!/usr/bin/env node
/**
 * Upload the staged taxonomy cover images to Firebase Storage, then emit the
 * two generated files the seed needs: the `mediaAssets` rows and the category
 * id -> `/media/<shortId>` map.
 *
 * ── The pipeline, and why each hop exists ──────────────────────────────────
 *
 *   fetch-taxonomy-images.mjs   wiki -> .media-cache/beys/<slug>.webp (gitignored)
 *   upload-taxonomy-images.mjs  cache -> Storage + mediaAssets seed + id map
 *   appkit-seed load            seed  -> Firestore
 *
 * The cache is gitignored because after this step nothing reads it: the bytes
 * live in Storage and Firestore holds a `/media/<shortId>` reference. Both
 * scripts are committed and idempotent, so a clean checkout rebuilds the whole
 * chain — which is the actual goal ("seed files so that we can always reseed").
 *
 * ── 🛑 `/media/<shortId>`, never a raw Storage URL ─────────────────────────
 *
 * CLAUDE.md: "Never write raw `firebasestorage.googleapis.com` URLs into
 * Firestore. All Firestore URLs use `/media/<slug>`." The proxy resolves a
 * single-segment slug through `mediaAssets/{slug}` -> `storagePath`, which is
 * what keeps the bucket layout private and lets a file move (tmp/ -> media/)
 * without breaking a live URL.
 *
 * It is also not the Root Cause #104 trap. That was `/api/media/ext?url=<third
 * party>`, which adds an UPSTREAM FETCH to every render; this path streams from
 * our own bucket and answers with `Cache-Control: public, max-age=2592000,
 * immutable`, so it is one function invocation per image per edge per 30 days,
 * not one per view. The watermark is a feature here rather than a cost.
 *
 * ── 🛑 THE ROWS ARE SEEDED, OR THE IMAGES VANISH ON A WIPE ─────────────────
 *
 * `/media/<shortId>` resolves ONLY through a `mediaAssets` document. Uploading
 * to Storage without seeding that row gives 195 categories a cover URL that
 * 404s the moment Firestore is cleared — and `mediaAssets` was in NEITHER of
 * seed-cli's two maps when this was written, which is exactly the registration
 * gap Root Cause #90 describes (a collection wired for everything except
 * loading, holding zero documents in every run).
 *
 * So this writes `appkit/src/seed/media-assets-seed-data.ts` and the collection
 * is registered in both `COLLECTION_MAP` and `SEED_DATA_MAP`.
 *
 * Usage (from the consumer root):
 *   node scripts/upload-taxonomy-images.mjs --dry-run
 *   node scripts/upload-taxonomy-images.mjs --yes
 *   node scripts/upload-taxonomy-images.mjs --yes --force   re-upload everything
 *
 * Idempotent: an object already present in the bucket at the same size is
 * skipped, so a re-run after a partial failure costs only the remainder.
 *
 * Exit: 0 = success, 1 = some uploads failed, 2 = misconfiguration.
 *
 * @tag domain:categories
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:storage-write,fs
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { categoryIdForModel } from "./lib/bey-model-id.mjs";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");
const CORPUS = path.join(ROOT, "docs/research/bey-corpus-2026-10/canonical-beys.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CONFIRMED = args.includes("--yes");
const FORCE = args.includes("--force");

if (!DRY_RUN && !CONFIRMED) {
  console.error("✗ Refusing to upload without --yes. Use --dry-run to preview.");
  process.exit(2);
}

const CACHE_DIR = path.join(ROOT, ".media-cache/beys");
const SEED_OUT = path.join(ROOT, "appkit/src/seed/media-assets-seed-data.ts");
const MAP_OUT = path.join(ROOT, "appkit/src/seed/_helpers/category-images-generated.ts");

if (!fs.existsSync(CACHE_DIR)) {
  console.error(`✗ ${path.relative(ROOT, CACHE_DIR)} is empty or missing.`);
  console.error("  Run `node scripts/fetch-taxonomy-images.mjs` first.");
  process.exit(2);
}

const files = fs
  .readdirSync(CACHE_DIR)
  .filter((f) => f.endsWith(".webp"))
  .sort();
if (files.length === 0) {
  console.error(`✗ no .webp files in ${path.relative(ROOT, CACHE_DIR)} — nothing to upload.`);
  process.exit(2);
}
console.log(`staged images: ${files.length}`);

/*
 * 🛑 THE CATEGORY ID IS NOT `category-<cache-filename>`.
 *
 * The cache filename is the CORPUS's own `slug` field, which keeps a trailing
 * parenthetical ("aero-knight-ms-aero-knight-metal-sky"). The real category id
 * strips it (`category-aero-knight-ms`) via `splitTrailingParenthetical` +
 * `slugify` in `gen-category-models.mjs`. Assuming the two were the same was
 * this script's first version, and it silently mismatched 58 of 195 — every
 * image uploaded fine and every row seeded fine, while 58 categories referenced
 * a `/media/` id that pointed at nothing. Re-deriving the rule instead of
 * calling it produced a confident wrong id, the exact failure this session kept
 * finding in other forms (Root Cause #84).
 *
 * So resolve through the SAME corpus the category generator reads, using the
 * SAME imported function — never a second guess at the slug.
 */
const corpus = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
const categoryIdByCorpusSlug = new Map(
  corpus.canonical.map((r) => [r.slug, categoryIdForModel(r)]),
);

/*
 * Parts are the second source, cached by GLOSSARY id ("disc--0"). Their
 * category id is a different scheme again (a collision-qualified bare tail,
 * "category-0"), so it is read from the map `gen-category-parts.mjs` emits
 * from the loop that assigns it — same rule as above, never a third guess.
 */
const PARTS_CACHE_DIR = path.join(ROOT, ".media-cache/parts");
const DIST = `file:///${ROOT.replace(/\\/g, "/")}/node_modules/@mohasinac/appkit/dist/`;
const { PART_CATEGORY_TO_GLOSSARY_ID } = await import(
  new URL("seed/_helpers/category-parts-glossary-map.js", DIST).href
);
const categoryIdByGlossaryId = new Map(
  Object.entries(PART_CATEGORY_TO_GLOSSARY_ID).map(([catId, gId]) => [gId, catId]),
);

/*
 * Branch covers — generation roots and waves, retail lines, brand and
 * franchise rows — staged by `fetch-category-images.mjs`.
 *
 * 🛑 Its cache key IS the category id, which makes it the only one of the
 * three schemes needing no lookup table. That is also its hazard: a typo in
 * the manifest produces a perfectly well-formed id that matches no category,
 * uploads fine, seeds fine, and points at nothing. So these are validated
 * against the real seeded id set below rather than trusted.
 *
 * A `__hasbro` suffix selects the regional-variant logo, which is a SECOND
 * image for the SAME category and therefore needs its own shortId and its own
 * generated map — not a second entry in the cover map, which would overwrite.
 *
 * 🛑 The separator is `__` because `-hasbro` was ambiguous: `brand-hasbro` is
 * the Hasbro BRAND row, a real category id that itself ends in `-hasbro`, so
 * the naive split turned it into `brand` and the validation below rejected it.
 * Kebab-case ids cannot contain `__`, so this split is total.
 */
const BRANCH_CACHE_DIR = path.join(ROOT, ".media-cache/categories");
const HASBRO_SUFFIX = "__hasbro";

/*
 * `category-image` from CLAUDE.md's Media Filename Slug Patterns table is
 * `category-{name}-image.{ext}`. The shortId is content-derived from the
 * REAL category id, so a re-fetch of the same model overwrites its own
 * object rather than minting a second one under a different key.
 */
const shortIdFor = (categoryId, variant = "cover") =>
  variant === "hasbro" ? `${categoryId}-hasbro-image` : `${categoryId}-image`;
const storagePathFor = (categoryId, variant = "cover") =>
  `media/categories/${shortIdFor(categoryId, variant)}.webp`;

/*
 * `uploadedBy` is a required field on `MediaAssetDocument` and the watermark
 * resolver reads it. The seeded platform admin is the honest owner: these are
 * platform taxonomy assets, not a seller's product photos, and attributing them
 * to a seller would make them look like that seller's uploads in any future
 * per-uploader view.
 */
const UPLOADER_UID = "user-admin-letitrip";

const unresolvedSlugs = [];

/**
 * Build entries for one cache directory, resolving its own id scheme.
 *
 * `resolve` returns either a category id or `{ categoryId, variant }`. The
 * second form exists for the branch cache, where one category can carry a
 * second image.
 */
function entriesFor(dir, resolve, kind) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".webp"))
    .sort()
    .map((f) => {
      const cacheKey = f.replace(/\.webp$/, "");
      const hit = resolve(cacheKey);
      if (!hit) {
        unresolvedSlugs.push(`${kind}/${cacheKey}`);
        return null;
      }
      const categoryId = typeof hit === "string" ? hit : hit.categoryId;
      const variant = typeof hit === "string" ? "cover" : hit.variant;
      return {
        kind,
        cacheKey,
        categoryId,
        variant,
        shortId: shortIdFor(categoryId, variant),
        storagePath: storagePathFor(categoryId, variant),
        local: path.join(dir, f),
        size: fs.statSync(path.join(dir, f)).size,
      };
    })
    .filter((e) => e !== null);
}

/*
 * 🛑 The real seeded category id set, for validating the branch manifest.
 *
 * Loaded from the same dist the part map comes from. Without it a manifest
 * typo is invisible all the way to production: the image uploads, the
 * mediaAssets row seeds, the generated map gains an entry keyed on a category
 * that does not exist, and `withGeneratedCoverImage` simply never matches it —
 * so the symptom is "that cover did not appear", with nothing anywhere
 * reporting why. Root Cause #84's shape, caught cheaply.
 */
let seededCategoryIds = null;
if (fs.existsSync(BRANCH_CACHE_DIR)) {
  try {
    const mod = await import(new URL("seed/categories-seed-data.js", DIST).href);
    if (Array.isArray(mod.categoriesSeedData)) {
      seededCategoryIds = new Set(mod.categoriesSeedData.map((r) => r.id));
    }
  } catch (err) {
    console.error(
      `✗ could not load the category seed from appkit/dist to validate branch ids:\n` +
        `  ${err?.message ?? err}\n` +
        `  Run \`npm --prefix appkit run build\` first. Refusing rather than\n` +
        `  uploading images keyed on ids nothing has checked.`,
    );
    process.exit(2);
  }
  if (!seededCategoryIds || seededCategoryIds.size === 0) {
    console.error("✗ the category seed loaded but exported no ids — refusing to validate against nothing.");
    process.exit(2);
  }
}

const modelEntries = entriesFor(CACHE_DIR, (k) => categoryIdByCorpusSlug.get(k), "model");
const partEntries = entriesFor(PARTS_CACHE_DIR, (k) => categoryIdByGlossaryId.get(k), "part");
const branchEntries = entriesFor(
  BRANCH_CACHE_DIR,
  (k) => {
    const isHasbro = k.endsWith(HASBRO_SUFFIX);
    const categoryId = isHasbro ? k.slice(0, -HASBRO_SUFFIX.length) : k;
    if (!seededCategoryIds?.has(categoryId)) return null;
    return { categoryId, variant: isHasbro ? "hasbro" : "cover" };
  },
  "branch",
);
const entries = [...modelEntries, ...partEntries, ...branchEntries];
console.log(
  `  models: ${modelEntries.length}  parts: ${partEntries.length}  branches: ${branchEntries.length}`,
);

if (unresolvedSlugs.length > 0) {
  console.error(
    `✗ ${unresolvedSlugs.length} cached file(s) resolve to no category. Refusing rather than guessing an id:`,
  );
  for (const s of unresolvedSlugs.slice(0, 8)) console.error(`   ${s}.webp`);
  console.error(
    `\n  model/ or part/ — the cache is stale against the corpus or the part glossary;\n` +
      `                    re-run the fetchers.\n` +
      `  branch/         — the categoryId is not in the seeded category set, so it is\n` +
      `                    almost certainly a typo in\n` +
      `                    docs/research/taxonomy-images-2026-10/manifest.json.`,
  );
  process.exit(2);
}

/* 🛑 Two sources, one id space. A model leaf and a part leaf are both
 * `category-*`, and `gen-category-parts.mjs` already qualifies a part slug when
 * it would collide with a model's — but that is ITS invariant, asserted on its
 * own output. Re-assert it here, because a collision at THIS point would
 * silently upload one image over the other and leave one category showing the
 * wrong photo entirely. */
const seenShortIds = new Map();
for (const e of entries) {
  const prev = seenShortIds.get(e.shortId);
  if (prev) {
    console.error(
      `✗ shortId collision: ${e.shortId} claimed by ${prev.kind} ${prev.cacheKey} and ${e.kind} ${e.cacheKey}.`,
    );
    process.exit(2);
  }
  seenShortIds.set(e.shortId, e);
}

if (DRY_RUN) {
  console.log("\n• DRY RUN — no upload, no generated files. First 5:");
  for (const e of entries.slice(0, 5)) {
    console.log(`   ${e.categoryId.padEnd(38)} -> /media/${e.shortId}  (${e.storagePath})`);
  }
  console.log(
    `\n  would upload ${entries.length} objects ` +
      `(${(entries.reduce((s, e) => s + e.size, 0) / 1024 / 1024).toFixed(1)} MB)`,
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// .env.local + firebase-admin
// ---------------------------------------------------------------------------
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    if (!(k in process.env)) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
}
const missing = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
].filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`✗ Missing env: ${missing.join(", ")}`);
  process.exit(2);
}

const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebasestorage.app`,
  });
}
const bucket = admin.storage().bucket();
console.log(`bucket: ${bucket.name}`);

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------
let uploaded = 0;
let skipped = 0;
let failed = 0;

for (const e of entries) {
  const file = bucket.file(e.storagePath);
  try {
    if (!FORCE) {
      const [exists] = await file.exists();
      if (exists) {
        const [meta] = await file.getMetadata();
        if (Number(meta.size) === e.size) {
          skipped++;
          continue;
        }
      }
    }
    await bucket.upload(e.local, {
      destination: e.storagePath,
      metadata: {
        contentType: "image/webp",
        // 30 days, immutable: the shortId is content-derived and a changed
        // image gets a changed object at the same path only via --force, which
        // is a deliberate act.
        cacheControl: "public, max-age=2592000, immutable",
      },
    });
    uploaded++;
    if (uploaded % 25 === 0) console.log(`  … ${uploaded} uploaded`);
  } catch (err) {
    failed++;
    console.warn(`  ⚠ ${e.shortId}: ${err?.message ?? err}`);
  }
}
console.log(`\nuploaded ${uploaded}, skipped ${skipped} (already present), failed ${failed}`);

// ---------------------------------------------------------------------------
// Generated: the mediaAssets seed rows
// ---------------------------------------------------------------------------
const ok = entries.filter((e) => fs.existsSync(e.local));

const seedRows = ok
  .map(
    (e) => `  {
    id: ${JSON.stringify(e.shortId)},
    storagePath: ${JSON.stringify(e.storagePath)},
    uploadedBy: ${JSON.stringify(UPLOADER_UID)},
    contentType: "image/webp",
    size: ${e.size},
    isPublic: true,
    status: "finalized",
    contextType: "category-image",
  },`,
  )
  .join("\n");

fs.writeFileSync(
  SEED_OUT,
  `/**
 * GENERATED by scripts/upload-taxonomy-images.mjs — do not edit by hand.
 *
 * One \`mediaAssets\` row per taxonomy cover image. These are what make
 * \`/media/<shortId>\` resolve: the proxy looks a single-segment slug up here to
 * find its Storage path, so **without these rows every category cover 404s**,
 * even though the objects are sitting in the bucket.
 *
 * That is why they are seeded rather than created as a side effect of the
 * upload — a Firestore wipe must not be able to orphan the bucket. Re-create
 * the whole chain from a clean checkout with:
 *
 *   node scripts/fetch-taxonomy-images.mjs
 *   node scripts/upload-taxonomy-images.mjs --yes
 *   npx appkit-seed load --collections mediaAssets,categories
 *
 * \`status: "finalized"\` because these were uploaded straight to \`media/\`,
 * never staged in \`tmp/\` — so \`mediaTmpCleanup\` has no claim on them.
 */
import type { MediaAssetDocument } from "../features/media/repository/media-assets.repository";

export const mediaAssetsSeedData: Partial<MediaAssetDocument>[] = [
${seedRows}
];

export const MEDIA_ASSET_SEED_COUNT = ${ok.length};
`,
);
console.log(`wrote ${path.relative(ROOT, SEED_OUT)} (${ok.length} rows)`);

// ---------------------------------------------------------------------------
// Generated: category id -> /media/<shortId>
// ---------------------------------------------------------------------------
const coverOk = ok.filter((e) => e.variant !== "hasbro");
const hasbroOk = ok.filter((e) => e.variant === "hasbro");

const mapRows = coverOk
  .map((e) => `  ${JSON.stringify(e.categoryId)}: ${JSON.stringify(`/media/${e.shortId}`)},`)
  .join("\n");

const hasbroRows = hasbroOk
  .map((e) => `  ${JSON.stringify(e.categoryId)}: ${JSON.stringify(`/media/${e.shortId}`)},`)
  .join("\n");

fs.writeFileSync(
  MAP_OUT,
  `/**
 * GENERATED by scripts/upload-taxonomy-images.mjs — do not edit by hand.
 *
 * Category id -> cover image, as a \`/media/<shortId>\` reference resolved by
 * the media proxy through \`mediaAssets\`. Never a raw Firebase Storage host URL
 * (CLAUDE.md, Media Architecture) and never an \`/api/media/ext\` wrapper around
 * a third-party URL (Root Cause #104 — that adds an upstream fetch to every
 * single render).
 *
 * Covers model leaves, PART leaves and taxonomy BRANCH rows (generation roots
 * and waves, retail lines, brand rows, franchise rows) — they share one id
 * space (\`category-*\` / \`brand-*\` / \`franchise-*\`), so one map serves the
 * category cover and, through \`gen-catalogue-listings.mjs\`, a leaf's product
 * listing image too.
 *
 * A hand-authored \`display.coverImage\` always wins over this map; a row absent
 * from it keeps no image rather than being given a placeholder. See
 * \`withGeneratedCoverImage\` in \`categories-seed-data.ts\`.
 *
 * ── Replacing one of these with your own photograph ───────────────────────
 *
 * \`CategoryForm\` already edits \`display.coverImage\` (upload -> \`/media/<id>\`),
 * so any of these can be swapped for an original at runtime.
 *
 * 🛑 But a RUNTIME edit does not survive \`appkit-seed load\` — the loader
 * merge-writes \`display\`, so the generated value comes back. To replace one
 * permanently, set \`display.coverImage\` in the category SOURCE (the forest or
 * the seed row); the hand-authored value then wins here forever. That is the
 * deliberate trade for "the seed can always rebuild the database".
 *
 * Deleting them entirely: remove the \`media/categories/\` Storage prefix, delete
 * this file and \`media-assets-seed-data.ts\`, re-run the category seed. Bucket
 * versioning and soft-delete are both OFF, so a deleted object leaves no
 * recoverable copy and no residual billing.
 *
 * Source and licensing for every file — TWO manifests, because the leaves and
 * the branches were fetched by different scripts from different sources:
 *   \`docs/research/bey-corpus-2026-10/image-provenance.json\`      (model/part leaves)
 *   \`docs/research/taxonomy-images-2026-10/image-provenance.json\` (branch wordmarks)
 */
export const GENERATED_CATEGORY_IMAGES: Readonly<Record<string, string>> = {
${mapRows}
};

export const GENERATED_CATEGORY_IMAGE_COUNT = ${coverOk.length};

/**
 * The REGIONAL-VARIANT logo, keyed on the same category id.
 *
 * 🛑 A separate map rather than more entries in the one above, because this is
 * a SECOND image for the SAME category — \`category-burst-god\` has both a
 * Takara-Tomy "God" wordmark and a Hasbro "Evolution" one. Merging them would
 * mean one silently overwriting the other, and the loser would be whichever
 * the directory listing happened to reach second.
 *
 * Applied by \`withGeneratedHasbroCover\` to \`hasbroCoverImage\`, and rendered
 * beside the "Also known as" name. Only populated for a category that also
 * carries \`hasbroName\` — an image with no name to label it has nothing to say.
 */
export const GENERATED_CATEGORY_HASBRO_IMAGES: Readonly<Record<string, string>> = {
${hasbroRows}
};

export const GENERATED_CATEGORY_HASBRO_IMAGE_COUNT = ${hasbroOk.length};
`,
);
console.log(
  `wrote ${path.relative(ROOT, MAP_OUT)} (${coverOk.length} covers, ${hasbroOk.length} hasbro)`,
);

process.exit(failed > 0 ? 1 : 0);
