#!/usr/bin/env node
/**
 * Fetch a photo per PART from beyblade.fandom.com into the staging cache.
 *
 * Sibling of `fetch-taxonomy-images.mjs` (which does complete models); both
 * share `scripts/lib/wiki-images.mjs` so the resolution, the Referer the CDN
 * actually checks, and the transcode exist once.
 *
 * ── 🛑 THE TITLE FORM IS "<Classification> - <Name>" ──────────────────────
 *
 * A first pass guessing bare part names ("Right SG", "145", "Ten Heavy")
 * resolved **9%**. The handful it did hit revealed the wiki's real convention —
 * `Weight Disk - Ten Heavy`, `Spin Gear - NEO Right SG` — and `classification`
 * is already a field on every glossary row, spelled exactly that way. Using it
 * took the yield to **41% (309 of 752)**, and 59 of the 119 parts that appear
 * in more than one model.
 *
 * That is the difference between "parts have no images" and "parts have
 * images"; the first conclusion was one wrong title guess away.
 *
 * ── What is NOT attempted ─────────────────────────────────────────────────
 *
 * 🛑 A PER-COLOURWAY photo. `prop=pageimages` returns ONE lead image per part
 * page. A part page often carries a gallery with several releases, but nothing
 * in the API says which file is which release — matching them would be
 * guesswork, and a wrong colourway photo is a false claim about real
 * merchandise. So every variant listing of a part shares that part's one photo,
 * and the colourway is carried as TEXT (the model it shipped in), which the
 * data does support exactly.
 *
 * Usage:
 *   node scripts/fetch-part-images.mjs --dry-run
 *   node scripts/fetch-part-images.mjs
 *   node scripts/fetch-part-images.mjs --force
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network,fs
 */

import fs from "node:fs";
import path from "node:path";
import {
  resolveLeadImages,
  resolveFileUrls,
  downloadAsWebp,
  wikiPageUrl,
} from "./lib/wiki-images.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");

const OUT_DIR = path.join(ROOT, ".media-cache/parts");
const PROVENANCE = path.join(ROOT, "docs/research/bey-corpus-2026-10/part-image-provenance.json");

/*
 * ── 🛑 THE INFOBOX NAMES ITS OWN IMAGE; GUESSING THE PAGE WAS SECOND-BEST ──
 *
 * The original flow built candidate article titles from `classification` and
 * `name`, asked for whatever lead image those articles carried, and resolved
 * 41% (309 of 752). That was the best available when the only input was a
 * part's name.
 *
 * `wiki-part-specs.json` now carries `wikiImage` — the infobox's own `Image=`
 * value — on 1,813 of 2,087 parts (87%). Naming the file beats guessing the
 * page by 5.9x and cannot resolve to the wrong picture.
 *
 * 🛑 READ FROM THE EXTRACTION JSON, NOT FROM `dist`. The previous import was
 * node_modules/@mohasinac/appkit/dist/seed/part-glossary-seed-data.js — the
 * INSTALLED copy, stale until someone rebuilds appkit and resyncs it (the
 * documented Windows gotcha). It handed this script 771 rows while the seed
 * source holds 2,490, so the run reported 42% of a third of the corpus and
 * looked finished.
 *
 * The title-guess pass is KEPT for parts with no `Image=`: a corpus-only row
 * has no wiki page to name a file, and 309 images already came from it.
 */
const SPECS = path.join(ROOT, "docs/research/part-specs-2026-10/wiki-part-specs.json");
if (!fs.existsSync(SPECS)) {
  console.error(`no ${SPECS}
  run: node scripts/extract-wiki-part-specs.mjs`);
  process.exit(2);
}
const partGlossarySeedData = Object.entries(
  JSON.parse(fs.readFileSync(SPECS, "utf8")),
).map(([id, v]) => ({ id, ...v }));

/** "Track: S130 Shield 130" -> "S130 Shield 130" */
function cleanName(p) {
  let n = String(p.name || "").trim();
  if (n.includes(":")) n = n.split(":").slice(1).join(":").trim();
  return n;
}

/** Candidate wiki titles, best first. */
function candidates(p) {
  const out = [];
  const push = (s) => {
    const t = String(s || "").trim();
    if (t && !out.includes(t)) out.push(t);
  };
  const cls = String(p.classification || "").trim();
  const n = cleanName(p);
  // The wiki shouts acronyms inconsistently ("NEO Right SG"), so try both the
  // glossary's casing and a title-cased form.
  const titled = n.replace(/\b[A-Z]{2,}\b/g, (w) => w[0] + w.slice(1).toLowerCase());
  if (cls) {
    push(`${cls} - ${n}`);
    push(`${cls} - ${titled}`);
  }
  push(n);
  push(titled);
  return out;
}

console.log(`parts in the extraction: ${partGlossarySeedData.length}`);

/* Pass 1 — the filenames the infoboxes state. No guessing. */
const named = partGlossarySeedData.filter((p) => p.wikiImage);
console.log(`
pass 1 — ${named.length} parts name their own image file`);
const byFile = await resolveFileUrls(
  named.map((p) => p.wikiImage),
  { thumbSize: 960 },
);
const resolved = new Map();
for (const p of named) {
  const hit = byFile.get(p.wikiImage);
  if (hit) resolved.set(p.id, hit);
}
console.log(`  -> ${resolved.size} resolved`);

/* Pass 2 — the original title guess, only for what pass 1 could not name. */
const unnamed = partGlossarySeedData.filter((p) => !resolved.has(p.id));
console.log(`
pass 2 — guessing titles for the remaining ${unnamed.length}`);
const guessed = await resolveLeadImages(
  unnamed.map((p) => ({ key: p.id, titles: candidates(p) })),
  { thumbSize: 960 },
);
for (const [k, v] of guessed) if (!resolved.has(k)) resolved.set(k, v);

const pct = Math.round((resolved.size / partGlossarySeedData.length) * 100);
console.log(
  `
resolved ${resolved.size}/${partGlossarySeedData.length} (${pct}%)` +
    `  [named ${byFile.size}, guessed ${guessed.size}]`,
);

const shared = partGlossarySeedData.filter((p) => (p.shippedIn ?? p.usedBy ?? []).length > 1);
console.log(
  `of the ${shared.length} parts shipped in >1 bey: ${shared.filter((p) => resolved.has(p.id)).length} have an image`,
);

if (DRY_RUN) {
  console.log("\n• DRY RUN — nothing written.");
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const provenance = fs.existsSync(PROVENANCE)
  ? JSON.parse(fs.readFileSync(PROVENANCE, "utf8"))
  : { note: "", fetchedAt: null, images: {} };

let written = 0,
  skipped = 0,
  failed = 0,
  bytes = 0;
for (const [glossaryId, { title, src }] of resolved) {
  // The glossary id is "slot--tail"; `--` is fine in a filename and keeps the
  // file traceable to its row without a second mapping.
  const dest = path.join(OUT_DIR, `${glossaryId}.webp`);
  if (!FORCE && fs.existsSync(dest)) {
    skipped++;
    bytes += fs.statSync(dest).size;
    continue;
  }
  try {
    bytes += await downloadAsWebp(src, dest);
    written++;
    provenance.images[glossaryId] = {
      sourcePage: wikiPageUrl(title),
      sourceFile: src,
      cachePath: path.relative(ROOT, dest).replace(/\\/g, "/"),
      fetchedAt: new Date().toISOString(),
    };
    if (written % 50 === 0) console.log(`  … ${written} downloaded`);
  } catch (err) {
    failed++;
    console.warn(`  ⚠ ${glossaryId}: ${err?.message ?? err}`);
  }
}

provenance.note =
  "Part photos from beyblade.fandom.com via the MediaWiki API (prop=pageimages), " +
  "transcoded locally to bounded webp. Same licensing caveat as the model covers: " +
  "Fandom TEXT is CC-BY-SA, these IMAGES are predominantly publisher product shots " +
  "with no explicit uploader grant. Recorded so attribution is possible and removal " +
  "is mechanical. ONE photo per part — the API exposes no per-colourway image, and " +
  "guessing which gallery file is which release would be a false claim.";
provenance.fetchedAt = new Date().toISOString();
fs.writeFileSync(PROVENANCE, JSON.stringify(provenance, null, 2) + "\n");

console.log(
  `\nwritten ${written}, skipped ${skipped}, failed ${failed} — ${(bytes / 1024 / 1024).toFixed(1)} MB`,
);
console.log(`wrote ${path.relative(ROOT, PROVENANCE)}`);
console.log(`\nNext: node scripts/upload-taxonomy-images.mjs --yes --parts`);
process.exit(failed > 0 && written === 0 ? 1 : 0);
