#!/usr/bin/env node
/*
 * WHY: The tracer's correctness lives entirely in numbers `tsc` cannot see.
 *      Every real defect so far was found by running it over the reference
 *      scans and reading a table — the local-threshold regression, the merge
 *      that reported zero merges for four runs straight, the line filter that
 *      fixed art sheets. None of those produced an error; each produced a
 *      wrong COUNT, which is invisible to every other gate in this repo.
 * WHAT: Run the core over a corpus of scans and print what it found.
 *
 * Deliberately NOT a unit test — this project forbids those, and for the right
 * reason (CLAUDE.md Root Cause #83: a mock is a second implementation, and the
 * one you assert against is the one you believed in). This asserts nothing. It
 * measures real scans and prints the result, and a human reads it.
 *
 * Usage:
 *   node scripts/probe-sticker-trace.mjs <image...> [--tier standard] [--expect 12,14,…]
 *   node scripts/probe-sticker-trace.mjs --dir "C:/path/to/scans"
 *
 * 🛑 It imports the BUILT core from appkit/dist, not the TypeScript source, and
 * prints `dist/.build-stamp.json` so the reader knows which commit produced the
 * numbers. The alternative — bundling src/ on the fly — needs a bundler this
 * repo does not install at either root (esbuild arrives only via tsup inside
 * functions/), so it meant `npx esbuild`, i.e. measuring the core through
 * whatever version npx happened to fetch. Naming the pair is the point
 * (Root Cause #105): these numbers describe the commit in the stamp, and
 * audit-appkit-dist-sync is what keeps that stamp honest.
 *
 * Run `npm --prefix appkit run build` first after any change to the core, or
 * the table below is a measurement of the previous one.
 *
 * sharp resolves from the CONSUMER root. appkit must never depend on it — see
 * scripts/audit-sticker-trace-purity.mjs.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const ROOT = process.cwd();
const DIST = path.join(
  ROOT,
  "node_modules/@mohasinac/appkit/dist/_internal/shared/features/sticker-trace",
);

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const tier = flag("tier", "standard");
const expectArg = flag("expect", "");
const dir = flag("dir", "");

const IMAGE_RE = /\.(jpe?g|png|webp|tiff?|bmp)$/i;

let files = args.filter((a) => !a.startsWith("--") && IMAGE_RE.test(a));
if (dir) {
  files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_RE.test(f))
    .map((f) => path.join(dir, f));
}

if (files.length === 0) {
  console.error("probe-sticker-trace: no images given.\n");
  console.error("  node scripts/probe-sticker-trace.mjs <image...> [--tier standard]");
  console.error('  node scripts/probe-sticker-trace.mjs --dir "C:/path/to/scans"');
  process.exit(2);
}

if (!fs.existsSync(path.join(DIST, "index.js"))) {
  console.error("probe-sticker-trace: the built core is not present at");
  console.error(`  ${path.relative(ROOT, DIST)}`);
  console.error("\nRun:  npm --prefix appkit run build");
  process.exit(2);
}

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("probe-sticker-trace: sharp is not installed in the consumer root.");
  process.exit(2);
}

const toUrl = (p) => `file:///${p.replace(/\\/g, "/")}`;
const { traceStickerSheet } = await import(toUrl(path.join(DIST, "index.js")));
const { paramsForTier } = await import(toUrl(path.join(DIST, "config.js")));

/*
 * Provenance, printed rather than assumed. `dirty: true` means the stamp
 * cannot prove which source produced this dist — report it, never guess past
 * it (the same rule audit-appkit-dist-sync applies).
 */
let stamp = null;
try {
  stamp = JSON.parse(
    fs.readFileSync(
      path.join(ROOT, "node_modules/@mohasinac/appkit/dist/.build-stamp.json"),
      "utf8",
    ),
  );
} catch {
  /* no stamp — say so below rather than implying provenance */
}

const expected = expectArg ? expectArg.split(",").map((n) => Number(n.trim())) : [];

/*
 * 🛑 The decode size comes from the TIER, never from a literal here.
 *
 * The first draft of this harness resized every scan to 1600px regardless of
 * tier, so it was not measuring what a tier means — `standard` declares 3000,
 * and on the one 34MP multi-sheet scan in the corpus the difference was 0
 * parts versus a real count. A harness whose input differs from production's
 * input reports on something nobody ships.
 */
const params = paramsForTier(tier);
const longEdge = params.workingLongEdge;

console.log(`\nsticker-trace probe — tier=${tier}, longEdge=${longEdge}, ${files.length} scan(s)`);
console.log(
  stamp
    ? `core: ${stamp.head ?? "?"}${stamp.dirty ? " (DIRTY TREE — provenance unprovable)" : ""} · built ${stamp.builtAt ?? "?"}\n`
    : "core: no build stamp — cannot say which commit these numbers describe\n",
);

/*
 * 🛑 `nodes` and `open` exist because `parts` CANNOT SEE THE CONTOUR STAGE.
 *
 * Measured 2026-10-18 by negative control: inverting the marching-squares
 * saddle rule — the one decision that chooses which corners a ring joins —
 * changed NOTHING in the parts/small/sheet columns on three scans. Part count
 * is decided by `labelComponents` on the mask, before a single contour is
 * traced, so every column this table had was blind to `math/marching-squares`,
 * `rdp` and `catmull-rom` — i.e. to the half of the pipeline that produces the
 * actual cut file.
 *
 * A harness that reports identical numbers whether the geometry is right or
 * inverted is the shape of a green test asserting a fiction (Root Cause #83),
 * and the only reason it was caught is that the control was run at all
 * (Root Cause #87).
 *
 *   nodes = total cubic Bézier segments across every part's path. Sensitive to
 *           ring assembly, so a changed saddle pairing moves it.
 *   open  = parts whose path did not close. Must be 0 on every scan, always:
 *           an unclosed path is a cut the machine starts and never finishes.
 */
console.log(
  "scan".padEnd(34) +
    "size".padEnd(12) +
    "parts".padStart(6) +
    "exp".padStart(5) +
    "sheets".padStart(7) +
    "bg".padStart(7) +
    "ridge%".padStart(8) +
    "bgCov%".padStart(8) +
    "small".padStart(7) +
    "sheet".padStart(6) +
    "nodes".padStart(7) +
    "open".padStart(6) +
    "ms".padStart(7),
);
console.log("-".repeat(115));

let i = 0;
for (const file of files) {
  const meta = await sharp(file, { limitInputPixels: false }).metadata();
  const { data, info } = await sharp(file, { limitInputPixels: false })
    .resize({ width: longEdge, height: longEdge, fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  /*
   * A declared density under ~150 is an encoder default, not a measurement —
   * five of the nine reference scans say 72 or 96. Passing one through would
   * produce confident millimetre figures from a number nobody measured, which
   * is a physical production error rather than a cosmetic one, so it is
   * dropped and mm output is withheld instead.
   */
  const scale = info.width / meta.width;
  const dpi = meta.density && meta.density > 150 ? meta.density * scale : undefined;

  const raster = {
    width: info.width,
    height: info.height,
    data: new Uint8Array(data),
    ...(dpi ? { dpi } : {}),
  };

  const t0 = Date.now();
  let r;
  try {
    r = traceStickerSheet(raster, params, meta.width);
  } catch (err) {
    console.log(
      path.basename(file).slice(0, 33).padEnd(34) +
        `${info.width}x${info.height}`.padEnd(12) +
        "THREW".padStart(6) +
        ` ${err instanceof Error ? err.message : String(err)}`,
    );
    i++;
    continue;
  }
  const ms = Date.now() - t0;
  const d = r.diagnostics;

  /*
   * Closure is tested against the path's OWN start point, with a tolerance of
   * a hundredth of a pixel rather than exact equality: the segments carry
   * floats through RDP and the Bézier fit, so demanding bit equality would
   * report every part open and the column would mean nothing.
   */
  let nodes = 0;
  let open = 0;
  for (const part of r.parts) {
    const segs = part.path?.segments ?? [];
    nodes += segs.length;
    const last = segs[segs.length - 1];
    const start = part.path?.start;
    if (!last || !start) {
      open++;
    } else if (Math.hypot(last.to.x - start.x, last.to.y - start.y) > 0.01) {
      open++;
    }
  }

  console.log(
    path.basename(file).slice(0, 33).padEnd(34) +
      `${info.width}x${info.height}`.padEnd(12) +
      String(r.parts.length).padStart(6) +
      String(expected[i] ?? "-").padStart(5) +
      String(r.clusters.length).padStart(7) +
      (d.paperColour ? "paper" : "art").padStart(7) +
      (d.ridgeCoverage * 100).toFixed(1).padStart(8) +
      (d.backgroundCoverage * 100).toFixed(1).padStart(8) +
      String(d.droppedBelowMinArea).padStart(7) +
      String(d.droppedSheetSized).padStart(6) +
      String(nodes).padStart(7) +
      String(open).padStart(6) +
      String(ms).padStart(7),
  );
  i++;
}

console.log(
  "\nbg=paper floods from the border; bg=art uses the Hessian line filter plus the",
);
console.log("region merge, and reports bgCov 100 because the flood never runs there.");
console.log(
  "`small` = components under minPartAreaMm2; `sheet` = components over 60% of the",
);
console.log("raster, i.e. the flood never got IN.\n");
console.log(
  "🛑 parts=0 with sheet>=1 AND a low bgCov is the montage signature: several",
);
console.log(
  "full-bleed sheets in one scan have no single background colour. Measured here,",
);
console.log(
  "paper scans that segment correctly sit at bgCov 27.7-74.2; the montage sits at",
);
console.log("7.8. Scan sheets individually, or crop. See trace/segment.ts.\n");
