#!/usr/bin/env node
/**
 * Fetch a cover image per taxonomy BRANCH — generation roots, generation waves,
 * retail lines, brand rows, franchise rows — into the staging cache the
 * uploader reads.
 *
 * ── Why this exists alongside fetch-taxonomy-images.mjs ────────────────────
 *
 * That script covers the 504 model and part LEAVES, and it is driven by
 * `canonical-beys.json`, one row per physical bey. A generation wave is not a
 * bey: "Burst God" has no product code, no corpus row and no `hasbroName`
 * field, so there is nothing for that script to iterate. Hence a manifest.
 *
 * The split is also a licensing one. A leaf's image is a product shot; a
 * branch's image is a WORDMARK — a logo, which is the more clearly
 * trademark-bearing of the two. Both are recorded in provenance; see the
 * fair-use note on the help pages.
 *
 * ── 🛑 CORPUS FIRST, AND USUALLY CORPUS ONLY ───────────────────────────────
 *
 * The local mirror at `$BEY_CORPUS/linka/images/**` already holds ~36,500
 * images, including a wordmark for almost every Beyblade generation and wave.
 * Resolving from it means ZERO network calls, no hotlink-protection dance, and
 * a run that works offline and is byte-reproducible.
 *
 * 🛑 It mirrors TWO wikis — `images/fandom/**` and
 * `images/wiki.worldbeyblade.org/**` — so the source host is derived per file
 * (`hostForMirrorPath`) rather than assumed. Three manifest entries resolve
 * from the second one.
 *
 * A `wiki` entry is the fallback for a subject the mirror does not hold.
 *
 * 🛑 A domain earns a `wiki` entry only after a real request has been SHOWN to
 * return a usable lead image for that subject. Guessing that
 * `<franchise>.fandom.com` has a clean key-art page produces an entry that
 * fails quietly on every run and reads, in the gap report, exactly like a
 * subject nobody tried. There are currently ZERO wiki entries for that reason:
 * the non-Beyblade subjects are listed under `knownGaps` instead, which is
 * honest about never having been attempted.
 *
 * ── 🛑 LOCAL FILES, NEVER seedExtMedia() ───────────────────────────────────
 *
 * Same rule as the sibling script, same reason: Root Cause #104. A persisted
 * `/api/media/ext?url=…` makes every render a lambda plus an upstream fetch
 * plus a sharp pass, which is what took Fast Origin Transfer to 52.52 GB
 * against a 10 GB allowance. These bytes get uploaded to our own Storage and
 * referenced as `/media/<slug>`.
 *
 * Usage (from the consumer root):
 *   node scripts/fetch-category-images.mjs --dry-run   resolve only, write nothing
 *   node scripts/fetch-category-images.mjs             fetch what is missing
 *   node scripts/fetch-category-images.mjs --force     re-encode everything
 *   node scripts/fetch-category-images.mjs --corpus <path>
 *
 * Idempotent: an entry whose webp already exists is skipped unless `--force`.
 *
 * @tag domain:categories
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:fs — reads the corpus mirror; writes .media-cache/categories + provenance
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const CORPUS_DIR = (() => {
  const i = args.indexOf("--corpus");
  if (i !== -1 && args[i + 1]) return args[i + 1];
  return process.env.BEY_CORPUS || "C:/Users/mohsi/Downloads/Beyblade-Game-master";
})();

const MANIFEST = path.join(ROOT, "docs/research/taxonomy-images-2026-10/manifest.json");
const OUT_DIR = path.join(ROOT, ".media-cache/categories");
const PROVENANCE = path.join(ROOT, "docs/research/taxonomy-images-2026-10/image-provenance.json");

/*
 * Same 480px / q78 budget as the leaf script, for the same reason: a category
 * cover renders at most ~300px CSS wide, so 480 covers 1.5x DPR with no waste.
 *
 * 🛑 `flatten` onto white matters MORE here than for product shots. Almost
 * every one of these is a transparent PNG wordmark, and an unflattened
 * transparent logo renders as black-on-black the moment the card behind it is
 * a dark-theme surface.
 */
const TARGET_WIDTH = 480;
const WEBP_QUALITY = 78;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/*
 * 🛑 The two hosts want OPPOSITE things, and getting it backwards 429s you.
 *
 * Wikimedia's robot policy REQUIRES a descriptive agent naming the tool and a
 * contact; a spoofed browser UA is refused with "Your request does not comply
 * with our robot policy" (measured: 15 of 21 downloads failed that way). It
 * needs no Referer.
 *
 * Fandom's CDN is the reverse — it does hotlink protection on `Referer` and
 * returns 403 text/html without one, which is what the sibling leaf script's
 * header documents at length.
 */
const WIKIMEDIA_UA =
  "LetItRipTaxonomyImageFetcher/1.0 (https://letitrip.in; admin@letitrip.in) node-fetch";

function downloadHeadersFor(host) {
  const base = { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" };
  if (/wikimedia\.org$|wikipedia\.org$/.test(host)) {
    return { ...base, "User-Agent": WIKIMEDIA_UA };
  }
  return { ...base, "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" };
}

/**
 * The cache key for one entry — also what the uploader parses back.
 *
 * 🛑 The separator is `__`, not `-`, and that is not cosmetic. The first
 * version used `-hasbro`, and the uploader's validation immediately rejected
 * `brand-hasbro.webp`: that is the Hasbro BRAND row, a real category whose id
 * legitimately ends in `-hasbro`, so stripping the suffix produced `brand` and
 * the entry resolved to nothing. Category ids are kebab-case — lowercase,
 * digits and single hyphens — so `__` cannot occur in one and the split is
 * unambiguous for every id, including the one that broke it.
 */
const VARIANT_SEP = "__";

function keyFor(entry) {
  return entry.variant === "hasbro" ? `${entry.categoryId}${VARIANT_SEP}hasbro` : entry.categoryId;
}

/*
 * Which wiki a mirrored file actually came from.
 *
 * 🛑 The mirror holds MORE THAN ONE wiki — measured: `linka/images/fandom/**`
 * and `linka/images/wiki.worldbeyblade.org/**`, and three manifest entries
 * resolve from the second. Hard-coding beyblade.fandom.com as the source page
 * for every corpus file would put a wrong citation in the attribution record,
 * which is the one file whose entire job is to be correct — a fair-use claim
 * resting on provenance is worth exactly as much as the provenance.
 */
function hostForMirrorPath(fullPath) {
  const rel = path.relative(IMAGES_ROOT, fullPath).replace(/\\/g, "/");
  const first = rel.split("/")[0];
  if (first === "fandom") return "beyblade.fandom.com";
  if (first.includes(".")) return first;
  return null;
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

if (!fs.existsSync(MANIFEST)) {
  console.error(`✗ no manifest at ${path.relative(ROOT, MANIFEST)}`);
  process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const entries = manifest.entries ?? [];

/*
 * A duplicate key is fatal rather than last-write-wins. Two entries for one
 * (categoryId, variant) means one silently overwrites the other and the
 * manifest stops describing what shipped — the same argument `buildBrandRows`
 * makes for throwing on a duplicate brand id.
 */
const seen = new Set();
for (const e of entries) {
  const k = keyFor(e);
  if (seen.has(k)) {
    console.error(`✗ duplicate manifest entry for ${k}`);
    process.exit(2);
  }
  seen.add(k);
}

const corpusEntries = entries.filter((e) => e.source === "corpus");
const wikiEntries = entries.filter((e) => e.source === "wiki");
const unknownSource = entries.filter((e) => e.source !== "corpus" && e.source !== "wiki");
if (unknownSource.length > 0) {
  console.error(`✗ unknown source on: ${unknownSource.map(keyFor).join(", ")}`);
  process.exit(2);
}

console.log(
  `manifest: ${entries.length} entries (${corpusEntries.length} corpus, ${wikiEntries.length} wiki)`,
);
console.log(`knownGaps: ${Object.keys(manifest.knownGaps ?? {}).length - 1} recorded\n`);

// ---------------------------------------------------------------------------
// Corpus index — ONE directory walk, then O(1) lookups by filename
// ---------------------------------------------------------------------------

const IMAGES_ROOT = path.join(CORPUS_DIR, "linka/images");

/*
 * 🛑 Built by filename, not by path. The mirror shards into two hash-bucket
 * levels (`images/fandom/a/ab/Name.png`) and that layout is an implementation
 * detail of whatever fetched it — keying on it would break the manifest the
 * first time the mirror was re-pulled with a different sharding.
 *
 * A filename COLLISION across buckets is possible in principle. First wins and
 * the count is reported, so a manifest resolving the wrong duplicate is at
 * least visible rather than silent.
 */
function indexCorpus(dir) {
  const byName = new Map();
  let files = 0;
  let collisions = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const cur = stack.pop();
    let dirents;
    try {
      dirents = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const d of dirents) {
      const full = path.join(cur, d.name);
      if (d.isDirectory()) {
        stack.push(full);
      } else if (d.isFile()) {
        files++;
        if (byName.has(d.name)) collisions++;
        else byName.set(d.name, full);
      }
    }
  }
  return { byName, files, collisions };
}

let corpusIndex = { byName: new Map(), files: 0, collisions: 0 };
if (corpusEntries.length > 0) {
  if (!fs.existsSync(IMAGES_ROOT)) {
    console.error(
      `✗ corpus image mirror not found at ${IMAGES_ROOT}\n` +
        `  Pass --corpus <path> or set BEY_CORPUS. This script needs it for the\n` +
        `  ${corpusEntries.length} corpus-sourced entries; it is read-only.`,
    );
    process.exit(2);
  }
  corpusIndex = indexCorpus(IMAGES_ROOT);
  console.log(
    `corpus index: ${corpusIndex.files} files, ${corpusIndex.byName.size} distinct names` +
      (corpusIndex.collisions > 0 ? `, ${corpusIndex.collisions} name collisions (first wins)` : ""),
  );
}

// ---------------------------------------------------------------------------
// Resolve
// ---------------------------------------------------------------------------

const resolved = [];
const missing = [];

for (const e of corpusEntries) {
  const src = corpusIndex.byName.get(e.file);
  if (src) resolved.push({ ...e, localPath: src });
  else missing.push({ ...e, why: `not in corpus mirror: ${e.file}` });
}

/*
 * Wiki entries resolve through the same `prop=pageimages` lookup the leaf
 * script uses, including the `Referer` header the image CDN actually checks.
 * There are none today — see the header — so this path is exercised only when
 * somebody adds a VERIFIED domain.
 */
/*
 * 🛑 The API path is NOT the same on every MediaWiki host.
 *
 * Fandom serves `/api.php` at the root; Wikipedia serves `/w/api.php` and
 * answers a plain `/api.php` with a 404. Hard-coding the Fandom spelling made
 * every single Wikipedia entry fail — and fail the QUIET way, because
 * `resolveWiki` treats any non-ok response as "no image for this subject", so
 * 22 brands and franchises would have been reported as unresolved gaps rather
 * than as a broken URL. A manifest entry would have looked wrong when the
 * script was.
 */
function apiFor(domain) {
  return domain.endsWith("wikipedia.org") || domain.endsWith("wikimedia.org")
    ? `https://${domain}/w/api.php`
    : `https://${domain}/api.php`;
}

/*
 * 🛑 Throttle, because Wikipedia will tell you to and then stop answering.
 *
 * Hit back-to-back, the API returns a PLAIN-TEXT body — "You are making too
 * many requests to the API." — which `res.json()` throws on. `resolveWiki`
 * catches, returns null, and the subject is reported as "no lead image": a
 * rate limit disguised as a missing picture, which would have been recorded
 * in `knownGaps` as a fact about the subject rather than about the run.
 *
 * 200ms is well inside their guidance for a serial client and costs ~5s
 * across this manifest.
 */
const WIKI_DELAY_MS = 200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Resolve one named `File:` to its URL.
 *
 * 🛑 This is the PREFERRED wiki path, and `pageimages` below is the fallback.
 * `pageimages` returns the article's LEAD image, which on a company article is
 * usually the headquarters building — measured: The Pokémon Company resolved
 * to a photo of a Tokyo skyscraper, Banpresto to an office tower, Dragon Ball
 * to a file named `SANY2051.jpg`. Every one of those would have shipped as a
 * brand card and looked like a bug nobody could explain.
 *
 * Pinning the file in the manifest also makes the choice reviewable: the
 * filename is right there next to the category id, so a wrong logo is visible
 * in a diff instead of only on the rendered page.
 */
async function resolveWikiFile(entry) {
  const url =
    apiFor(entry.wikiDomain) +
    "?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      prop: "imageinfo",
      iiprop: "url",
      titles: entry.wikiFile,
    });
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const page = json.query?.pages?.[0];
    const src = page?.imageinfo?.[0]?.url;
    return src ? { title: entry.wikiFile, src } : null;
  } catch {
    return null;
  }
}

async function resolveWiki(entry) {
  if (entry.wikiFile) return resolveWikiFile(entry);
  const api = apiFor(entry.wikiDomain);
  const titles = entry.titleCandidates ?? [entry.subject];
  for (const title of titles) {
    const url =
      api +
      "?" +
      new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: "2",
        prop: "pageimages",
        piprop: "original|thumbnail",
        pithumbsize: String(TARGET_WIDTH * 2),
        redirects: "1",
        titles: title,
      });
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const page = json.query?.pages?.[0];
      const src = page?.original?.source || page?.thumbnail?.source;
      if (src) return { title: page.title, src };
    } catch {
      // Try the next candidate; a failed lookup is not a failed run.
    }
  }
  return null;
}

for (const e of wikiEntries) {
  const hit = await resolveWiki(e);
  if (hit) resolved.push({ ...e, remote: hit });
  else missing.push({ ...e, why: `not resolved on ${e.wikiDomain} (${e.wikiFile ?? "pageimages"})` });
  await sleep(WIKI_DELAY_MS);
}

console.log(`\nresolved ${resolved.length}/${entries.length}`);
if (missing.length > 0) {
  console.log(`unresolved ${missing.length}:`);
  for (const m of missing) console.log(`   ${keyFor(m)} — ${m.why}`);
}

if (DRY_RUN) {
  console.log("\n• DRY RUN — nothing written.");
  for (const r of resolved) {
    const from = r.localPath ? path.relative(CORPUS_DIR, r.localPath) : r.remote.src;
    console.log(`   ${keyFor(r)}  <-  ${from}`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Transcode
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

for (const r of resolved) {
  const key = keyFor(r);
  const dest = path.join(OUT_DIR, `${key}.webp`);
  if (!FORCE && fs.existsSync(dest)) {
    skipped++;
    bytes += fs.statSync(dest).size;
    continue;
  }
  try {
    let input;
    if (r.localPath) {
      input = fs.readFileSync(r.localPath);
    } else {
      const host = new URL(r.remote.src).host;
      const headers = downloadHeadersFor(host);
      // Fandom needs the Referer; Wikimedia must NOT be sent a spoofed one.
      if (!/wikimedia\.org$|wikipedia\.org$/.test(host)) {
        headers.Referer = `https://${r.wikiDomain}/`;
      }
      const res = await fetch(r.remote.src, { headers, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      input = Buffer.from(await res.arrayBuffer());
      // Serial + polite: these are third-party hosts doing us a favour.
      await sleep(WIKI_DELAY_MS);
    }
    const out = await sharp(input)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    fs.writeFileSync(dest, out);
    bytes += out.length;
    written++;
    provenance.images[key] = {
      categoryId: r.categoryId,
      variant: r.variant,
      subject: r.subject,
      ...(r.localPath
        ? {
            source: "corpus-mirror",
            sourceWiki: hostForMirrorPath(r.localPath) ?? "unknown",
            sourceFile: r.file,
            /*
             * Omitted rather than guessed when the host is unrecognised: a
             * citation pointing at the wrong wiki is worse than none, and the
             * filename plus `sourceWiki` is still enough to find the original.
             */
            ...(hostForMirrorPath(r.localPath)
              ? {
                  sourcePage: `https://${hostForMirrorPath(r.localPath)}/wiki/File:${encodeURIComponent(r.file)}`,
                }
              : {}),
          }
        : {
            source: r.wikiDomain,
            sourceFile: r.remote.src,
            sourcePage: `https://${r.wikiDomain}/wiki/${encodeURIComponent(String(r.remote.title).replace(/ /g, "_"))}`,
          }),
      cachePath: path.relative(ROOT, dest).replace(/\\/g, "/"),
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    failed++;
    console.warn(`  ⚠ ${key}: ${err?.message ?? err}`);
  }
}

/*
 * 🛑 PRUNE, do not merely merge.
 *
 * This file is read, updated and rewritten, so a key whose cache file no
 * longer exists survives forever — and the entries were renamed once already
 * when the variant separator changed from `-hasbro` to `__hasbro`, leaving 5
 * orphans against 28 real images. An attribution record that lists files which
 * do not exist is worse than a short one: it is the document whose entire job
 * is to be accurate, and the fair-use notice points at it.
 *
 * Same failure shape as `appkit-seed load`'s merge-write, which also cannot
 * remove a field and left 13 stale `requiresHumanChannel` flags behind.
 */
const liveKeys = new Set(
  fs.existsSync(OUT_DIR)
    ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webp")).map((f) => f.replace(/\.webp$/, ""))
    : [],
);
const orphaned = Object.keys(provenance.images).filter((k) => !liveKeys.has(k));
for (const k of orphaned) delete provenance.images[k];
if (orphaned.length > 0) {
  console.log(`pruned ${orphaned.length} provenance entr${orphaned.length === 1 ? "y" : "ies"} with no cached file`);
}

provenance.note =
  "Wordmark / cover images for taxonomy BRANCH rows (generation roots and waves, " +
  "retail lines, brand rows, franchise rows), transcoded locally to bounded webp. " +
  "Predominantly publisher LOGOS (Takara-Tomy / Hasbro / Sonokong) rather than product " +
  "shots, so the trademark question is more direct than for the model leaves: they are " +
  "used to identify the line a listing belongs to, which is the nominative use the " +
  "fair-use notice on the help pages states. Removal is mechanical: delete " +
  ".media-cache/categories, delete the generated map, re-run the category seed.";
provenance.fetchedAt = new Date().toISOString();
fs.writeFileSync(PROVENANCE, JSON.stringify(provenance, null, 2) + "\n");

console.log(
  `\nwritten ${written}, skipped ${skipped} (already present), failed ${failed} — ${(bytes / 1024).toFixed(0)} KB on disk`,
);
console.log(`wrote ${path.relative(ROOT, PROVENANCE)}`);
console.log(
  `\nNext: node scripts/upload-taxonomy-images.mjs --yes\n` +
    `  It uploads BOTH caches (.media-cache/beys and .media-cache/categories),\n` +
    `  emits the mediaAssets seed rows, and writes the id -> /media/<slug> maps.`,
);
process.exit(failed > 0 && written === 0 ? 1 : 0);
