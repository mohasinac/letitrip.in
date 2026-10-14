#!/usr/bin/env node
/**
 * Measure the dominant colour of each cached PART photo, and emit it as a
 * committed map.
 *
 * ── Why measured, not invented ─────────────────────────────────────────────
 *
 * A colourway names the COLOUR and the Beyblade it shipped in. The corpus has
 * no colour field at all — but 309 real part photographs are now cached, and a
 * photograph is evidence. This reads the pixels.
 *
 * ── 🛑 THE PLASTIC COLOUR, NOT THE BIT-BEAST / MOTIF COLOUR ───────────────
 *
 * First version read the whole frame and returned the ARTWORK colour: a bit
 * chip is a sticker of a bit beast on a coloured chip, so "most common colour"
 * is the beast, not the part. `bit-chip--wolborg` came back Red when Wolborg's
 * plastic is white/blue.
 *
 * Two corrections, both from the physical shape of these parts:
 *
 *   1. Sample an ANNULUS — only pixels outside 55% of the radius. On every one
 *      of these (chips, bolts, rings, discs, tracks, tips) the moulded plastic
 *      is the outer form and any printed motif sits centrally. The rim is the
 *      part; the middle is the picture of a monster.
 *   2. Skip the slots that ARE the artwork. A `bit-chip`'s visible face is
 *      entirely sticker, and a `face-bolt`'s is near enough — so those get NO
 *      colour rather than a confident wrong one, and therefore no colourway.
 *
 * ── 🛑 WHITE HAS TO BE EXCLUDED, OR EVERY PART IS WHITE ───────────────────
 *
 * `fetch-part-images.mjs` flattens transparent PNGs onto white so they do not
 * render as black on a dark card. That means white is the single most common
 * pixel in most of these files and a naive "most common colour" returns White
 * for nearly all 309. Near-white and near-black pixels are dropped before
 * counting, and a part that is genuinely white-or-grey only falls back to a
 * neutral once no chromatic pixel survives.
 *
 * ── 🛑 WHAT THIS CAN AND CANNOT SAY ───────────────────────────────────────
 *
 * The wiki exposes ONE lead image per part. So for a part released in several
 * models this is the colour of the photographed release — exact for that one,
 * indicative for the others. The MODEL half of a colourway is always exact
 * (it comes from `usedBy`); the COLOUR half carries this caveat.
 *
 * Per-release photos were checked and rejected: a part page's gallery
 * sometimes encodes the model in a filename
 * (`BeybladeLegendsRockLeone145WBSpinTrack.png`) and usually does not
 * (`Track 145 img.jpg`), so matching file to release would be guesswork — and
 * a wrong colour is a false claim about real merchandise. Replacing these with
 * your own per-release photography later is the intended fix, and the same
 * path already documented for the model covers.
 *
 * Usage: node scripts/derive-part-colours.mjs
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:fs — writes one generated map
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE_DIR = path.join(ROOT, ".media-cache/parts");
const OUT = path.join(ROOT, "appkit/src/seed/_helpers/part-colours-generated.ts");

if (!fs.existsSync(CACHE_DIR)) {
  console.error(`✗ ${path.relative(ROOT, CACHE_DIR)} missing — run fetch-part-images.mjs first.`);
  process.exit(2);
}

/*
 * A deliberately SMALL palette of names a buyer would actually use in a search
 * box. A 200-name colour list would produce "Dark Khaki" and "Rosy Brown",
 * which nobody types and which reads as false precision from a 480px JPEG.
 */
const PALETTE = [
  ["Black", 25, 25, 25],
  ["White", 240, 240, 240],
  ["Grey", 128, 128, 128],
  ["Silver", 190, 190, 195],
  ["Red", 200, 35, 40],
  ["Maroon", 120, 30, 40],
  ["Orange", 235, 130, 30],
  ["Gold", 205, 165, 60],
  ["Yellow", 235, 215, 70],
  ["Green", 60, 150, 70],
  ["Teal", 50, 150, 150],
  ["Blue", 45, 85, 195],
  ["Navy", 30, 45, 100],
  ["Purple", 120, 60, 170],
  ["Pink", 225, 120, 170],
  ["Brown", 120, 80, 50],
  ["Bronze", 150, 100, 60],
];

function nearestName(r, g, b) {
  let best = PALETTE[0];
  let bestD = Infinity;
  for (const p of PALETTE) {
    // Weighted euclidean — green carries most perceived luminance, blue least.
    const d = 2 * (r - p[1]) ** 2 + 4 * (g - p[2]) ** 2 + 3 * (b - p[3]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best[0];
}

/*
 * Slots whose visible face is printed artwork rather than moulded plastic.
 * A colour read off these describes the bit beast, not the part.
 */
const ARTWORK_SLOTS = new Set(["bit-chip", "face-bolt"]);

const DIST = `file:///${ROOT.replace(/\\/g, "/")}/node_modules/@mohasinac/appkit/dist/`;
const { partGlossarySeedData } = await import(
  new URL("seed/part-glossary-seed-data.js", DIST).href
);
const slotById = new Map(partGlossarySeedData.map((p) => [p.id, p.slot]));

const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".webp")).sort();
console.log(`cached part photos: ${files.length}`);

const colours = new Map();
let neutralFallback = 0;

let artworkSkipped = 0;
for (const f of files) {
  const glossaryId = f.replace(/\.webp$/, "");
  if (ARTWORK_SLOTS.has(slotById.get(glossaryId))) {
    artworkSkipped++;
    continue;
  }
  try {
    const { data, info } = await sharp(path.join(CACHE_DIR, f))
      .resize(64, 64, { fit: "inside" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width,
      h = info.height;
    const cx = (w - 1) / 2,
      cy = (h - 1) / 2;
    // Outside 55% of the radius: the moulded rim, not the printed centre.
    const rMin2 = (0.55 * Math.min(cx, cy)) ** 2;

    const buckets = new Map();
    let chromatic = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        if (d2 < rMin2) continue; // central motif — skip
        const i = (y * w + x) * info.channels;
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        const max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        // Drop the flattened white background, near-black shadow, and anything
        // too desaturated to be a colour claim.
        if (max > 232 && min > 220) continue;
        if (max < 28) continue;
        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat < 0.22) continue;
        chromatic++;
        const key = `${r >> 5}_${g >> 5}_${b >> 5}`;
        const cur = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
        cur.n++;
        cur.r += r;
        cur.g += g;
        cur.b += b;
        buckets.set(key, cur);
      }
    }

    if (chromatic < 40) {
      /*
       * Genuinely neutral — a white/grey/black part. Fall back to a LUMINANCE
       * read over the same annulus rather than a hue that is not there.
       *
       * 🛑 Not `sharp().stats()`: that averages the WHOLE frame including the
       * flattened white background and the central motif, which is the exact
       * mistake the annulus exists to avoid — it would report White for every
       * part with a lot of backdrop.
       */
      let lum = 0,
        n = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const d2 = (x - cx) ** 2 + (y - cy) ** 2;
          if (d2 < rMin2) continue;
          const i = (y * w + x) * info.channels;
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          if (Math.max(r, g, b) > 232 && Math.min(r, g, b) > 220) continue;
          lum += (r + g + b) / 3;
          n++;
        }
      }
      const mean = n > 0 ? lum / n : 255;
      colours.set(glossaryId, mean > 200 ? "White" : mean < 70 ? "Black" : "Grey");
      neutralFallback++;
      continue;
    }

    let top = null;
    for (const v of buckets.values()) if (!top || v.n > top.n) top = v;
    colours.set(
      glossaryId,
      nearestName(Math.round(top.r / top.n), Math.round(top.g / top.n), Math.round(top.b / top.n)),
    );
  } catch (err) {
    console.warn(`  ⚠ ${glossaryId}: ${err?.message ?? err}`);
  }
}

const dist = {};
for (const c of colours.values()) dist[c] = (dist[c] ?? 0) + 1;
console.log(
  `derived: ${colours.size}  (neutral fallback: ${neutralFallback}, artwork slots skipped: ${artworkSkipped})`,
);
console.log(
  "distribution:",
  Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}=${v}`)
    .join("  "),
);

const body = [...colours.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([id, c]) => `  ${JSON.stringify(id)}: ${JSON.stringify(c)},`)
  .join("\n");

fs.writeFileSync(
  OUT,
  `/**
 * GENERATED by scripts/derive-part-colours.mjs — do not edit by hand.
 *
 * Part glossary id -> the dominant colour MEASURED from that part's cached
 * reference photograph. Not invented: the pixels are the evidence.
 *
 * 🛑 The wiki exposes ONE photo per part, so for a part released in several
 * models this is the colour of the photographed release — exact for that one,
 * indicative for the others. The MODEL half of a colourway is always exact
 * (it comes from \`usedBy\`); this half carries that caveat. Replacing these
 * with real per-release photography is the intended fix.
 *
 * White is excluded before counting, because the fetcher flattens transparent
 * PNGs onto white and a naive dominant-colour read returns White for almost
 * everything.
 */
export const GENERATED_PART_COLOURS: Readonly<Record<string, string>> = {
${body}
};

export const GENERATED_PART_COLOUR_COUNT = ${colours.size};
`,
);
console.log(`\nwrote ${path.relative(ROOT, OUT)} (${colours.size} entries)`);
process.exit(0);
