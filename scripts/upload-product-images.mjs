#!/usr/bin/env node
/**
 * Upload the real Beyblade X product photos fetched by
 * `fetch-product-images.mjs` to Firebase Storage, and write one
 * `mediaAssets` row per image.
 *
 * 🛑 `/media/<shortId>`, never a raw Storage URL — CLAUDE.md's rule, and the
 * actual mechanism: `/media/{shortId}` resolves through a `mediaAssets`
 * document to `storagePath`. Skip the row and the Storage object exists with
 * nothing pointing at it — every reference 404s (the exact production
 * incident this rule exists to prevent, Root Cause: `mediaAssets` orphan).
 *
 * `contextType: "product-image"`, storage path `media/products/...` —
 * deliberately NOT the `category-image` scheme `upload-taxonomy-images.mjs`
 * uses (`media/categories/...`). A product photo and a category cover are
 * different kinds of asset with different lifecycles; sharing the scheme
 * would make a future category-image sweep touch product photos it was never
 * meant to.
 *
 * Usage: node scripts/upload-product-images.mjs --yes [--force]
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE_DIR = path.join(ROOT, ".media-cache/products");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CONFIRMED = args.includes("--yes");
const FORCE = args.includes("--force");

if (!DRY_RUN && !CONFIRMED) {
  console.error("✗ Refusing to upload without --yes. Use --dry-run to preview.");
  process.exit(2);
}

if (!fs.existsSync(CACHE_DIR)) {
  console.error(`✗ ${path.relative(ROOT, CACHE_DIR)} is empty or missing. Run fetch-product-images.mjs first.`);
  process.exit(2);
}

const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".webp")).sort();
if (files.length === 0) {
  console.error("✗ no .webp files staged — nothing to upload.");
  process.exit(2);
}
console.log(`staged images: ${files.length}`);

const entries = files.map((f) => {
  const slug = f.replace(/\.webp$/, "");
  const local = path.join(CACHE_DIR, f);
  const shortId = `product-${slug}-image`;
  const storagePath = `media/products/${shortId}.webp`;
  const size = fs.statSync(local).size;
  return { slug, local, shortId, storagePath, size };
});

for (const e of entries) console.log(`  ${e.slug.padEnd(24)} -> /media/${e.shortId}  (${(e.size / 1024).toFixed(0)} KB)`);

if (DRY_RUN) {
  console.log("\n--dry-run: nothing uploaded.");
  process.exit(0);
}

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
const db = admin.firestore();
console.log(`\nbucket: ${bucket.name}`);

let uploaded = 0, skipped = 0, failed = 0;

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
        cacheControl: "public, max-age=2592000, immutable",
      },
    });

    await db.collection("mediaAssets").doc(e.shortId).set(
      {
        id: e.shortId,
        storagePath: e.storagePath,
        uploadedBy: "user-admin-letitrip",
        contentType: "image/webp",
        size: e.size,
        isPublic: true,
        status: "finalized",
        contextType: "product-image",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true },
    );

    console.log(`  + ${e.shortId}`);
    uploaded++;
  } catch (err) {
    console.error(`  ✗ ${e.slug}: ${err.message}`);
    failed++;
  }
}

console.log(`\nuploaded ${uploaded}, skipped ${skipped}, failed ${failed}`);
process.exit(failed > 0 ? 1 : 0);
