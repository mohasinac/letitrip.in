#!/usr/bin/env node
/**
 * Rasterise the LetItRip brand mark into the editorial staging cache, so the
 * platform's own store carries the platform's own logo.
 *
 * ── Why generated and not fetched ─────────────────────────────────────────
 *
 * Every other image in this pipeline is fetched from Commons or a Fandom
 * wiki. This one must not be: `store-letitrip-official` is OUR store, so its
 * avatar is `public/logo.svg` — already in the repo, already the watermark
 * mark, and the one image here with no licence question at all. A fetched
 * stand-in would be both legally murkier and simply wrong.
 *
 * ── 🛑 Flattened onto a dark plate, not left transparent ──────────────────
 *
 * The mark is a blue→pink gradient on transparency. A store avatar renders
 * inside a `rounded-full` box on a surface that INVERTS with the theme, so a
 * transparent PNG shows as a gradient glyph on white in light mode and on
 * near-black in dark — two different-looking logos. `MediaAvatar` is also one
 * of only three call sites that pass `objectFit="cover"`, so a contained
 * glyph would be cropped. Compositing onto a fixed dark plate here makes it
 * theme-invariant and fills the circle.
 *
 * Usage:
 *   node scripts/make-store-logo.mjs
 *
 * Output: `.media-cache/editorial/store-logo-letitrip-official.webp`, which
 * `push-editorial-images.mjs` then uploads with its `mediaAssets` row.
 *
 * @tag domain:stores
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:fs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ASPECTS } from "./lib/editorial-image-manifest.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public/logo.svg");
const OUT_DIR = path.join(ROOT, ".media-cache/editorial");
const DEST = path.join(OUT_DIR, "store-logo-letitrip-official.webp");

if (!fs.existsSync(SRC)) {
  console.error(`✗ ${path.relative(ROOT, SRC)} not found.`);
  process.exit(2);
}

const { width, height } = ASPECTS.storeLogo;
// Matches `--appkit-color-zinc-900`-ish; a fixed dark plate rather than a
// theme token, because an SVG rasterised here has no stylesheet in scope.
const PLATE = { r: 24, g: 24, b: 27, alpha: 1 };
// Inset so the glyph is not flush to the edge of the circular crop.
const GLYPH = Math.round(width * 0.68);

fs.mkdirSync(OUT_DIR, { recursive: true });

const glyph = await sharp(SRC, { density: 384 })
  .resize(GLYPH, GLYPH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({ create: { width, height, channels: 4, background: PLATE } })
  .composite([{ input: glyph, gravity: "centre" }])
  .webp({ quality: 90 })
  .toFile(DEST);

console.log(`✓ ${path.relative(ROOT, DEST)} (${fs.statSync(DEST).size} bytes, ${width}x${height})`);
