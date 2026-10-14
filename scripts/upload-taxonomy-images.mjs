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
 * image uploaded fine, every row seeded fine, and the category seed's own 90%
 * floor assertion didn't catch it because 137/195 happened to clear 90% of…
 * no, it does NOT clear 90%, and that is the point: re-deriving the rule
 * instead of calling it produced a confident wrong id for 58 images, the exact
 * failure this whole session kept finding in other forms (Root Cause #84).
 *
 * So resolve through the SAME corpus the category generator reads, using the
 * SAME imported function — never a second guess at the slug.
 */
const corpus = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
const categoryIdByCorpusSlug = new Map(
  corpus.canonical.map((r) => [r.slug, categoryIdForModel(r)]),
);

/*
 * `category-image` from CLAUDE.md's Media Filename Slug Patterns table is
 * `category-{name}-image.{ext}`. The shortId is content-derived from the
 * REAL category id, so a re-fetch of the same model overwrites its own
 * object rather than minting a second one under a different key.
 */
const shortIdFor = (categoryId) => `${categoryId}-image`;
const storagePathFor = (categoryId) => `media/categories/${shortIdFor(categoryId)}.webp`;

/*
 * `uploadedBy` is a required field on `MediaAssetDocument` and the watermark
 * resolver reads it. The seeded platform admin is the honest owner: these are
 * platform taxonomy assets, not a seller's product photos, and attributing them
 * to a seller would make them look like that seller's uploads in any future
 * per-uploader view.
 */
const UPLOADER_UID = "user-admin-letitrip";

const unresolvedSlugs = [];
const entries = files
  .map((f) => {
    const cacheSlug = f.replace(/\.webp$/, "");
    const categoryId = categoryIdByCorpusSlug.get(cacheSlug);
    if (!categoryId) {
      unresolvedSlugs.push(cacheSlug);
      return null;
    }
    return {
      cacheSlug,
      categoryId,
      shortId: shortIdFor(categoryId),
      storagePath: storagePathFor(categoryId),
      local: path.join(CACHE_DIR, f),
      size: fs.statSync(path.join(CACHE_DIR, f)).size,
    };
  })
  .filter((e) => e !== null);

if (unresolvedSlugs.length > 0) {
  console.error(
    `✗ ${unresolvedSlugs.length} cached file(s) have no matching corpus row — the cache is stale ` +
      `against the corpus. Re-run fetch-taxonomy-images.mjs. Refusing rather than guessing an id:`,
  );
  for (const s of unresolvedSlugs.slice(0, 5)) console.error(`   ${s}.webp`);
  process.exit(2);
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
const mapRows = ok
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
 * A hand-authored \`display.coverImage\` always wins over this map; a row absent
 * from it keeps no image rather than being given a placeholder. See
 * \`withGeneratedCoverImage\` in \`categories-seed-data.ts\`.
 *
 * Source and licensing for every file:
 * \`docs/research/bey-corpus-2026-10/image-provenance.json\`.
 */
export const GENERATED_CATEGORY_IMAGES: Readonly<Record<string, string>> = {
${mapRows}
};

export const GENERATED_CATEGORY_IMAGE_COUNT = ${ok.length};
`,
);
console.log(`wrote ${path.relative(ROOT, MAP_OUT)} (${ok.length} entries)`);

process.exit(failed > 0 ? 1 : 0);
