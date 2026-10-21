#!/usr/bin/env node
/**
 * Composite each bundle's member photos into ONE cover image.
 *
 * ── Why a single processed image and not the client-side collage ──────────
 *
 * `withBundleMosaic` already resolves `display.mosaicImages` at seed time and
 * `<ImageMosaic>` can render a collage from it. Measured on production
 * 2026-10-21: all four bundles carry three resolvable member images — and
 * every bundle card still rendered the grey placeholder `display.coverImage`.
 * So the collage path is either not reached by `MarketplaceBundleCard` or is
 * losing to the cover, and the card has no way to say which.
 *
 * A composited cover removes the question. The card does what every other
 * card does — render one `coverImage` — and a bundle looks like its contents
 * everywhere a bundle appears, including surfaces that never knew about
 * `mosaicImages` (OG images, the admin list, a share preview).
 *
 * It is also cheaper: one image request per card instead of three, and the
 * work happens once here rather than per render.
 *
 * ── 🛑 Reads from OUR bucket, not over HTTP ───────────────────────────────
 *
 * Member images are `/media/<shortId>` → `mediaAssets/{slug}` →
 * `storagePath`. This resolves that chain through the Admin SDK and
 * downloads the object directly, so it never touches `/api/media/[...slug]`
 * — no watermark pass, no function invocation, and it works regardless of
 * whether the site is deployed.
 *
 * ── Layout ────────────────────────────────────────────────────────────────
 *
 *   2 members → side by side
 *   3 members → one large left, two stacked right
 *   4+        → 2x2 (first four)
 *
 * On WHITE, because these are publisher product shots on white; compositing
 * them onto a dark plate would leave each tile as a white rectangle floating
 * on dark. A 1-member bundle is skipped — that is not a collage, and its own
 * member photo is the better cover.
 *
 * Usage:
 *   node scripts/make-bundle-mosaics.mjs --dry-run
 *   node scripts/make-bundle-mosaics.mjs
 *
 * Output: `.media-cache/editorial/bundle-cover-<bundleId>.webp`, which
 * `push-editorial-images.mjs` uploads with its `mediaAssets` row.
 *
 * @tag domain:categories,bundles
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:fs,network
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { initAdmin, ROOT } from "./lib/live-admin.mjs";

const DRY_RUN = process.argv.includes("--dry-run");
const OUT_DIR = path.join(ROOT, ".media-cache/editorial");

const W = 1200;
const H = 900;
const GAP = 8;
const PAD = 16;
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

const { db, bucket } = initAdmin({ requireConfirm: false });

/** `/media/<shortId>` → the object's bytes, via the mediaAssets row. */
async function loadMediaImage(url) {
  if (typeof url !== "string" || !url.startsWith("/media/")) return null;
  const id = url.slice("/media/".length);
  const row = await db.collection("mediaAssets").doc(id).get();
  if (!row.exists) return null;
  const file = bucket.file(row.get("storagePath"));
  const [exists] = await file.exists();
  if (!exists) return null;
  const [buf] = await file.download();
  return buf;
}

/** Fit one member photo into a w×h cell, centred, on white. */
async function cell(buf, w, h) {
  return sharp(buf)
    .resize(w - PAD, h - PAD, { fit: "inside", withoutEnlargement: false, background: BG })
    .flatten({ background: BG })
    .extend({
      top: 0, bottom: 0, left: 0, right: 0,
      background: BG,
    })
    .resize(w, h, { fit: "contain", background: BG })
    .png()
    .toBuffer();
}

function layoutFor(n) {
  if (n === 2) {
    const w = Math.floor((W - GAP) / 2);
    return [
      { left: 0, top: 0, w, h: H },
      { left: w + GAP, top: 0, w: W - w - GAP, h: H },
    ];
  }
  if (n === 3) {
    const bigW = Math.floor(W * 0.58);
    const smallW = W - bigW - GAP;
    const smallH = Math.floor((H - GAP) / 2);
    return [
      { left: 0, top: 0, w: bigW, h: H },
      { left: bigW + GAP, top: 0, w: smallW, h: smallH },
      { left: bigW + GAP, top: smallH + GAP, w: smallW, h: H - smallH - GAP },
    ];
  }
  const w = Math.floor((W - GAP) / 2);
  const h = Math.floor((H - GAP) / 2);
  return [
    { left: 0, top: 0, w, h },
    { left: w + GAP, top: 0, w: W - w - GAP, h },
    { left: 0, top: h + GAP, w, h: H - h - GAP },
    { left: w + GAP, top: h + GAP, w: W - w - GAP, h: H - h - GAP },
  ];
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const bundles = await db.collection("categories").where("categoryType", "==", "bundle").get();
console.log(`bundles: ${bundles.size}\n`);

let made = 0;
let skipped = 0;

for (const doc of bundles.docs) {
  const ids = doc.get("bundleProductIds") ?? [];
  const urls = [];
  for (const pid of ids) {
    const p = await db.collection("products").doc(pid).get();
    const img = p.exists ? p.get("mainImage") : null;
    if (typeof img === "string" && img.startsWith("/media/")) urls.push(img);
  }

  if (urls.length < 2) {
    /*
     * One tile is not a collage. Compositing a single photo onto a white
     * canvas produces a cover indistinguishable from that member's own
     * photo but with worse framing, so the member image is the better answer.
     */
    console.log(`– ${doc.id}: ${urls.length} usable member image(s) — skipped`);
    skipped += 1;
    continue;
  }

  const slots = layoutFor(urls.length);
  const use = urls.slice(0, slots.length);

  const buffers = [];
  for (const u of use) {
    const raw = await loadMediaImage(u);
    if (!raw) {
      console.warn(`  ! ${doc.id}: ${u} did not resolve — dropped from the collage`);
      continue;
    }
    buffers.push(raw);
  }
  if (buffers.length < 2) {
    console.log(`– ${doc.id}: only ${buffers.length} image(s) resolved — skipped`);
    skipped += 1;
    continue;
  }

  // Re-layout for what actually resolved, so a dropped member does not leave
  // an empty quadrant.
  const finalSlots = layoutFor(buffers.length).slice(0, buffers.length);
  const composites = [];
  for (let i = 0; i < buffers.length; i += 1) {
    const s = finalSlots[i];
    composites.push({ input: await cell(buffers[i], s.w, s.h), left: s.left, top: s.top });
  }

  const dest = path.join(OUT_DIR, `bundle-cover-${doc.id}.webp`);
  if (DRY_RUN) {
    console.log(`[dry-run] ${doc.id}: ${buffers.length}-up mosaic → ${path.basename(dest)}`);
    made += 1;
    continue;
  }

  await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite(composites)
    .webp({ quality: 86 })
    .toFile(dest);

  console.log(`✓ ${doc.id}: ${buffers.length}-up mosaic (${fs.statSync(dest).size} bytes)`);
  made += 1;
}

console.log(`\n${DRY_RUN ? "[dry-run] " : ""}made ${made} · skipped ${skipped}`);
