#!/usr/bin/env node
/**
 * Fetch a cover image per bey-model taxonomy leaf from beyblade.fandom.com, and
 * emit the generated id -> local-path map the category seed splices in.
 *
 * ── 🛑 LOCAL FILES, NEVER `seedExtMedia()` ─────────────────────────────────
 *
 * The obvious move is to store the wiki URL wrapped in `/api/media/ext`, which
 * is what that proxy is for (watermarking third-party images). **Do not.**
 * Root Cause #104: ~400 placeholder assets were persisted that way and every
 * single render became a Node lambda plus a third-party round trip plus a full
 * sharp decode/watermark/encode. That contributed ~900K proxy responses and
 * **52.52 GB of Fast Origin Transfer against a 10 GB allowance**, and the
 * project is still suspended on it. Hotlinking 195 more would be actively
 * harmful.
 *
 * A file under `public/` is served from the CDN with no function involved, costs
 * nothing per view, works offline, and survives the wiki changing a URL.
 *
 * ── 🛑 PROVENANCE AND LICENSING ────────────────────────────────────────────
 *
 * Fandom's own text is CC-BY-SA, but the IMAGES are overwhelmingly publisher
 * product shots (Takara-Tomy / Hasbro) uploaded by editors with no explicit
 * grant. Using them as catalogue imagery on a site that sells things is a real
 * licensing question that this script cannot answer — so it records, per image,
 * the source page, the file URL and the fetch date in
 * `docs/research/bey-corpus-2026-10/image-provenance.json`.
 *
 * That makes attribution possible and a takedown mechanical: delete the
 * directory, delete the generated map, re-run the category seed. Nothing else
 * in the codebase references these paths directly.
 *
 * ── Why 89% and not 100% ───────────────────────────────────────────────────
 *
 * Measured 2026-10-14: 195 of the 220 canonical models resolve. The corpus
 * `name` often carries a parenthetical expansion ("Aero Knight MS (Aero Knight
 * Metal Sky)") and the wiki titles the page as one form or the other, so each
 * model is tried as its full name, then each half, then `hasbroName`, then its
 * aliases. Round 1 resolves 132, round 2 adds 63, rounds 3-4 add none — so the
 * remaining 25 genuinely have no lead image and are left without a cover rather
 * than given a wrong one.
 *
 * Usage (from the consumer root):
 *   node scripts/fetch-taxonomy-images.mjs --dry-run    resolve only, write nothing
 *   node scripts/fetch-taxonomy-images.mjs              fetch what is missing
 *   node scripts/fetch-taxonomy-images.mjs --force      re-fetch everything
 *   node scripts/fetch-taxonomy-images.mjs --limit 10   bound the run while testing
 *
 * Idempotent: a slug whose webp already exists is skipped unless `--force`, so a
 * re-run after a network failure costs only the unfetched remainder.
 *
 * @tag domain:categories
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network,fs — read-only GETs; writes public/images/beys + two generated files
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { categoryIdForModel } from "./lib/bey-model-id.mjs";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const LIMIT = (() => {
  const i = args.indexOf("--limit");
  return i === -1 ? Infinity : Number(args[i + 1]) || Infinity;
})();

const CORPUS = path.join(ROOT, "docs/research/bey-corpus-2026-10/canonical-beys.json");
/*
 * A gitignored STAGING CACHE, not `public/`. These bytes end up in Firebase
 * Storage and the seed references `/media/<shortId>`, so after the upload step
 * nothing reads this directory again — committing 195 binaries to carry files
 * that already live in Storage would bloat every clone and every Vercel upload
 * for no reader. Both scripts are idempotent and the provenance manifest records
 * every source URL, so the cache is rebuildable from a clean checkout.
 */
const OUT_DIR = path.join(ROOT, ".media-cache/beys");
const PROVENANCE = path.join(ROOT, "docs/research/bey-corpus-2026-10/image-provenance.json");

const API = "https://beyblade.fandom.com/api.php";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const HEADERS = { "User-Agent": UA, Accept: "application/json" };

/*
 * 🛑 `Referer` is what the image CDN actually checks — measured 2026-10-14.
 *
 * `static.wikia.nocookie.net` returns **403 text/html** for a request carrying
 * only a browser User-Agent, and **200 image/webp** for the identical request
 * with `Referer: https://beyblade.fandom.com/`. It is hotlink protection, not
 * UA filtering, so adding more browser-ish headers does nothing — the same
 * shape as the earlier finding that the wiki's 403 was about the SURFACE
 * (HTML vs api.php) rather than the headers. Guess the mechanism wrong and you
 * conclude the source is unavailable.
 *
 * Note what this script then does with it: ONE fetch, stored locally. That is
 * the opposite of hotlinking — the thing the header exists to prevent is a page
 * that serves their bandwidth on every view, which is exactly what persisting
 * the URL would have done.
 */
const IMAGE_HEADERS = {
  "User-Agent": UA,
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://beyblade.fandom.com/",
};

/*
 * A CEILING of 1280px, webp q80 — raised from 480/q78 on 2026-10-20 (plan A5).
 *
 * 480 was sized for the category-cover slot alone (~300px CSS, 1.5x DPR). But
 * the same webp is now the catalogue listing's cover, and `ImageLightbox`
 * offers 300% zoom — at which 480px is mush, and zoom is the one affordance
 * that matters for judging a pre-owned bey.
 *
 * 🛑 This is a CEILING, not a target, and the distinction is the whole safety
 * argument. `withoutEnlargement: true` below means a source smaller than the
 * ceiling is left at its own width rather than blown up. Measured against all
 * 196 resolvable models before changing the number:
 *
 *     min 150 · p25 349 · MEDIAN 512 · p75 1074 · p90 1100 · max 3552
 *     >=480px: 58%   >=1280px: 6%
 *
 * So a FLAT 1280 would have upscaled 94% of the set — more bytes, not one
 * pixel of new detail. What actually happens instead: the 42% below 480 are
 * untouched, the 58% above it stop being capped at 480, and the handful with
 * genuine detail (up to 3552) now reach 1280.
 *
 * Output stays bounded — a 1280px webp of product photography is ~60-120 KB,
 * and only 6% of the set is even eligible for the ceiling.
 */
const TARGET_WIDTH = 1280;
const WEBP_QUALITY = 80;

// ---------------------------------------------------------------------------
// Title candidates
// ---------------------------------------------------------------------------

/** Every title worth trying for one model, best first. */
function candidates(row) {
  const out = [];
  const push = (s) => {
    const t = String(s || "").trim();
    if (t && !out.includes(t)) out.push(t);
  };
  push(row.name);
  const paren = String(row.name || "").match(/^(.+?)\s*\((.+)\)\s*$/);
  if (paren) {
    push(paren[1]);
    push(paren[2]);
  }
  push(row.hasbroName);
  for (const a of row.aliases ?? []) push(a);
  push(row.jpName);
  return out;
}

async function pageImages(titles) {
  const url =
    API +
    "?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      prop: "pageimages",
      piprop: "original|thumbnail",
      /*
       * 🛑 Exactly TARGET_WIDTH, NOT `* 2`, and this matters only on the
       * fallback path — `original.source` is preferred below and present for
       * 196 of 201 models, so sharp normally sees the true source and
       * `withoutEnlargement` protects it.
       *
       * When `original` is absent we take `thumbnail.source`, and the WIKI
       * upscales its own thumbnails without saying so: measured, a 600x450
       * original returns a thumbnail reporting 2560x1920 at pithumbsize=2560.
       * sharp cannot undo that — it sees a 2560px input and dutifully
       * downscales it to 1280, yielding a 1280px file carrying 600px of
       * detail. Asking for no more than the ceiling keeps the fallback honest.
       */
      pithumbsize: String(TARGET_WIDTH),
      redirects: "1",
      titles: titles.join("|"),
    });
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${titles.length} titles`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Resolve
// ---------------------------------------------------------------------------

const corpus = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
const models = corpus.canonical.map((r) => ({ slug: r.slug, name: r.name, titles: candidates(r) }));
console.log(`canonical models: ${models.length}`);

const resolved = new Map(); // slug -> { title, src }
const maxRounds = Math.max(...models.map((m) => m.titles.length));

for (let round = 0; round < maxRounds; round++) {
  const todo = models.filter((m) => !resolved.has(m.slug) && m.titles[round]);
  if (todo.length === 0) break;
  let hits = 0;
  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    let json;
    try {
      json = await pageImages(batch.map((m) => m.titles[round]));
    } catch (err) {
      // A failed batch is not a failed run — the next round and a re-run both
      // get another chance, and a hard exit here would discard earlier rounds.
      console.warn(`  ⚠ batch failed (round ${round + 1}): ${err?.message ?? err}`);
      continue;
    }
    const byTitle = new Map();
    for (const p of json.query?.pages ?? []) byTitle.set(String(p.title).toLowerCase(), p);
    /* `redirects:1` rewrites a requested title to its target, and `normalized`
     * does the same for capitalisation — without following both, a page that
     * resolved perfectly well looks missing. */
    const alias = new Map();
    for (const r of json.query?.redirects ?? [])
      alias.set(String(r.from).toLowerCase(), String(r.to).toLowerCase());
    for (const r of json.query?.normalized ?? [])
      alias.set(String(r.from).toLowerCase(), String(r.to).toLowerCase());

    for (const m of batch) {
      const want = String(m.titles[round]).toLowerCase();
      const page = byTitle.get(alias.get(want) ?? want) ?? byTitle.get(want);
      const src = page?.original?.source || page?.thumbnail?.source;
      if (src) {
        resolved.set(m.slug, { title: page.title, src });
        hits++;
      }
    }
  }
  console.log(`  round ${round + 1}: tried ${todo.length}, +${hits} (total ${resolved.size})`);
}

const unresolved = models.filter((m) => !resolved.has(m.slug));
console.log(
  `\nresolved ${resolved.size}/${models.length} (${Math.round((resolved.size / models.length) * 100)}%), ${unresolved.length} with no lead image`,
);

if (DRY_RUN) {
  console.log("\n• DRY RUN — nothing written. Unresolved:");
  for (const m of unresolved) console.log(`   ${m.name}`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Download + transcode
// ---------------------------------------------------------------------------

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("✗ sharp is not installed — it is needed to bound the image size.");
  process.exit(2);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const provenance = fs.existsSync(PROVENANCE)
  ? JSON.parse(fs.readFileSync(PROVENANCE, "utf8"))
  : { note: "", fetchedAt: null, images: {} };

let written = 0;
let skipped = 0;
let failed = 0;
let bytes = 0;
let n = 0;

for (const [slug, { title, src }] of resolved) {
  if (++n > LIMIT) break;
  const dest = path.join(OUT_DIR, `${slug}.webp`);
  if (!FORCE && fs.existsSync(dest)) {
    skipped++;
    bytes += fs.statSync(dest).size;
    continue;
  }
  try {
    const res = await fetch(src, {
      headers: IMAGE_HEADERS,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const input = Buffer.from(await res.arrayBuffer());
    /*
     * `withoutEnlargement` so a small source is not upscaled into a blurry
     * 480px file, and `flatten` onto white because many of these are PNGs with
     * transparency that would render as black on a dark theme card.
     */
    const out = await sharp(input)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    fs.writeFileSync(dest, out);
    bytes += out.length;
    written++;
    provenance.images[slug] = {
      sourcePage: `https://beyblade.fandom.com/wiki/${encodeURIComponent(String(title).replace(/ /g, "_"))}`,
      sourceFile: src,
      cachePath: path.relative(ROOT, dest).replace(/\\/g, "/"),
      fetchedAt: new Date().toISOString(),
    };
    if (written % 25 === 0) console.log(`  … ${written} downloaded`);
  } catch (err) {
    failed++;
    console.warn(`  ⚠ ${slug}: ${err?.message ?? err}`);
  }
}

provenance.note =
  "Cover images for bey-model taxonomy leaves, fetched from beyblade.fandom.com via the " +
  "MediaWiki API (prop=pageimages) and transcoded locally to bounded webp. " +
  "Fandom TEXT is CC-BY-SA; these IMAGES are predominantly publisher product shots " +
  "(Takara-Tomy / Hasbro) with no explicit grant from the uploader, so their use as " +
  "catalogue imagery on a commercial site is an open licensing question. Recorded here " +
  "so attribution is possible and removal is mechanical: delete public/images/beys, " +
  "delete appkit/src/seed/_helpers/category-images-generated.ts, re-run the category seed.";
provenance.fetchedAt = new Date().toISOString();
fs.writeFileSync(PROVENANCE, JSON.stringify(provenance, null, 2) + "\n");

console.log(
  `\nwritten ${written}, skipped ${skipped} (already present), failed ${failed} — ${(bytes / 1024 / 1024).toFixed(1)} MB on disk`,
);

console.log(`wrote ${path.relative(ROOT, PROVENANCE)}`);
console.log(
  `\nNext: node scripts/upload-taxonomy-images.mjs --yes\n` +
    `  That uploads these files to Firebase Storage, emits the mediaAssets seed\n` +
    `  rows, and writes the category id -> /media/<shortId> map the seed reads.\n` +
    `  This script deliberately writes NO generated TS: the local directory is\n` +
    `  the reseedable source, and the uploader is the single owner of the refs.`,
);
process.exit(failed > 0 && written === 0 ? 1 : 0);
