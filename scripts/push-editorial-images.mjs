#!/usr/bin/env node
/**
 * Upload the staged editorial images to Firebase Storage and write the
 * `mediaAssets` rows that make `/media/<shortId>` resolve.
 *
 *   fetch-editorial-images.mjs    Commons -> .media-cache/editorial/<key>.webp
 *   fetch-elevate-bit-image.mjs   wiki    -> .media-cache/editorial/<key>.webp
 *   push-editorial-images.mjs     cache   -> Storage + mediaAssets   ← this
 *   push-editorial-content.mjs    -> patches blogPosts/events/products/…
 *
 * ── 🛑 THE ROW IS THE URL ─────────────────────────────────────────────────
 *
 * `/media/<shortId>` resolves ONLY through a `mediaAssets` document — the
 * proxy looks the single-segment slug up to find its Storage path. Uploading
 * the object without writing the row gives every consumer a cover URL that
 * 404s while the bytes sit in the bucket, which is the exact state CLAUDE.md
 * records happening to all 504 category covers for three days: `appkit-seed
 * status` reported `504 seed / 0 in db`, nothing errored, and the only symptom
 * was a broken image nobody could attribute.
 *
 * ── 🛑 REUSED SLUGS ARE VERIFIED, NOT TRUSTED ─────────────────────────────
 *
 * `REUSED_MEDIA` points Beyblade slots at images already in the bucket. A typo
 * there produces a perfectly well-formed `/media/...` that matches no row —
 * uploads fine, patches fine, renders nothing. So each one is read back from
 * Firestore here and a miss is fatal before anything is written.
 *
 * Usage:
 *   node scripts/push-editorial-images.mjs --dry-run
 *   node scripts/push-editorial-images.mjs --yes-i-am <projectId>
 *   node scripts/push-editorial-images.mjs --yes-i-am <projectId> --force
 *
 * Idempotent: an object already in the bucket at the same byte size is
 * skipped unless `--force`; rows are written with merge.
 *
 * Exit: 0 = success, 1 = something failed, 2 = misconfiguration.
 *
 * @tag domain:blog,events,media
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:storage-write,firestore-write
 */

import fs from "node:fs";
import path from "node:path";
import { initAdmin, ROOT } from "./lib/live-admin.mjs";
import { REUSED_MEDIA } from "./lib/editorial-image-manifest.mjs";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");

const CACHE_DIR = path.join(ROOT, ".media-cache/editorial");
const STORAGE_PREFIX = "media/editorial";
/*
 * `uploadedBy` is required on MediaAssetDocument and the watermark resolver
 * reads it. These are platform editorial assets, so the platform admin is the
 * honest owner — attributing them to a seller would make them look like that
 * seller's uploads in any per-uploader view.
 */
const UPLOADER_UID = "user-admin-letitrip";

if (!fs.existsSync(CACHE_DIR)) {
  console.error(`✗ ${path.relative(ROOT, CACHE_DIR)} missing. Run fetch-editorial-images.mjs first.`);
  process.exit(2);
}
const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".webp")).sort();
if (files.length === 0) {
  console.error("✗ no staged .webp files — nothing to upload.");
  process.exit(2);
}

const { db, bucket, projectId } = initAdmin({ requireConfirm: !DRY_RUN });
console.log(`project: ${projectId}`);
console.log(`bucket:  ${bucket.name}`);
console.log(`staged:  ${files.length} images\n`);

/* ── 1. Verify every reused slug resolves to a real mediaAssets row ──────── */

const reusedIds = [...new Set(Object.values(REUSED_MEDIA))].map((p) => p.replace(/^\/media\//, ""));
const missingReused = [];
for (const id of reusedIds) {
  const snap = await db.collection("mediaAssets").doc(id).get();
  if (!snap.exists) missingReused.push(id);
}
if (missingReused.length) {
  console.error("✗ REUSED_MEDIA points at mediaAssets rows that do not exist:");
  for (const id of missingReused) console.error(`    ${id}`);
  console.error("  Fix the manifest — a well-formed /media/ URL with no row renders nothing.");
  process.exit(1);
}
console.log(`✓ verified ${reusedIds.length} reused /media/ slugs resolve\n`);

/* ── 2. Upload staged objects + upsert their rows ────────────────────────── */

let uploaded = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const shortId = file.replace(/\.webp$/, "");
  const storagePath = `${STORAGE_PREFIX}/${file}`;
  const local = path.join(CACHE_DIR, file);
  const size = fs.statSync(local).size;

  if (DRY_RUN) {
    console.log(`[dry-run] ${shortId} -> ${storagePath} (${size} B)`);
    uploaded += 1;
    continue;
  }

  try {
    const gcsFile = bucket.file(storagePath);
    const [exists] = await gcsFile.exists();
    let same = false;
    if (exists && !FORCE) {
      const [meta] = await gcsFile.getMetadata();
      same = Number(meta.size) === size;
    }

    if (same) {
      skipped += 1;
    } else {
      await bucket.upload(local, {
        destination: storagePath,
        metadata: {
          contentType: "image/webp",
          // Matches the proxy's own immutable policy; the object is content
          // addressed by its editorial slot and replaced in place on re-fetch.
          cacheControl: "public, max-age=2592000, immutable",
        },
      });
      uploaded += 1;
    }

    await db.collection("mediaAssets").doc(shortId).set(
      {
        storagePath,
        uploadedBy: UPLOADER_UID,
        contentType: "image/webp",
        size,
        isPublic: true,
        status: "finalized",
        contextType: shortId.startsWith("blog-")
          ? "blog-image"
          : shortId.startsWith("event-")
            ? "event-image"
            : "product-image",
        createdAt: new Date(),
      },
      { merge: true },
    );
    console.log(`✓ ${shortId}${same ? " (object cached)" : ""}`);
  } catch (err) {
    failed += 1;
    console.error(`✗ ${shortId}: ${err.message}`);
  }
}

/* ── 3. Emit the seed rows, so a reseed cannot orphan the bucket ─────────── */

/*
 * 🛑 A SEPARATE FILE FROM `media-assets-seed-data.ts`, deliberately.
 *
 * That one carries a "GENERATED by scripts/upload-taxonomy-images.mjs — do not
 * edit by hand" header and is rewritten wholesale on every taxonomy run.
 * Appending these 18 rows to it would work exactly until the next
 * `upload-taxonomy-images.mjs`, which would silently drop them — and the
 * symptom would be 18 editorial images 404ing after an unrelated image job,
 * with nothing connecting cause to effect.
 *
 * Both arrays are concatenated in `seed-cli`'s SEED_DATA_MAP, so the loader
 * sees one `mediaAssets` collection.
 */
if (!DRY_RUN && failed === 0) {
  const rows = files
    .map((f) => {
      const shortId = f.replace(/\.webp$/, "");
      return {
        id: shortId,
        storagePath: `${STORAGE_PREFIX}/${f}`,
        size: fs.statSync(path.join(CACHE_DIR, f)).size,
        contextType: shortId.startsWith("blog-")
          ? "blog-image"
          : shortId.startsWith("event-")
            ? "event-image"
            : "product-image",
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const seedOut = path.join(ROOT, "appkit/src/seed/media-assets-editorial-seed-data.ts");
  const body = rows
    .map(
      (r) => `  {
    id: ${JSON.stringify(r.id)},
    storagePath: ${JSON.stringify(r.storagePath)},
    uploadedBy: ${JSON.stringify(UPLOADER_UID)},
    contentType: "image/webp",
    size: ${r.size},
    isPublic: true,
    status: "finalized",
    contextType: ${JSON.stringify(r.contextType)},
  },`,
    )
    .join("\n");

  fs.writeFileSync(
    seedOut,
    `/**
 * GENERATED by scripts/push-editorial-images.mjs — do not edit by hand.
 *
 * One \`mediaAssets\` row per EDITORIAL image (blog covers and inline art,
 * event art, and the product shots for the event stickers and the Elevate
 * bit). These are what make \`/media/<shortId>\` resolve: the proxy looks a
 * single-segment slug up here to find its Storage path, so **without these
 * rows every one of these images 404s** while the objects sit in the bucket.
 *
 * Kept separate from \`media-assets-seed-data.ts\` because that file is
 * rewritten wholesale by \`upload-taxonomy-images.mjs\`; appending here would
 * survive only until the next taxonomy image run. \`seed-cli\` concatenates
 * the two.
 *
 * Re-create the whole chain from a clean checkout with:
 *
 *   node scripts/fetch-editorial-images.mjs
 *   node scripts/fetch-elevate-bit-image.mjs
 *   node scripts/push-editorial-images.mjs --yes-i-am <projectId>
 *
 * Image provenance (source page, author, licence) is recorded per image in
 * \`docs/research/editorial-images/image-provenance.json\`.
 */
import type { MediaAssetDocument } from "../features/media/repository/media-assets.repository";

export const mediaAssetsEditorialSeedData: Partial<MediaAssetDocument>[] = [
${body}
];
`,
  );
  console.log(`\n→ wrote ${path.relative(ROOT, seedOut)} (${rows.length} rows)`);
}

console.log(
  `\n${DRY_RUN ? "[dry-run] " : ""}uploaded ${uploaded} · skipped ${skipped} · failed ${failed}`,
);
if (failed) process.exit(1);
