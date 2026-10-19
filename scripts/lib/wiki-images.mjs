/**
 * Shared wiki image resolution + download, used by BOTH the model-cover fetcher
 * and the part-image fetcher.
 *
 * Extracted rather than copied: the two differ only in which titles they try,
 * and everything underneath — the batched `pageimages` query, following
 * redirects AND normalizations, the Referer the CDN actually checks, the
 * resize/flatten/webp transcode — is identical. Two copies of that is how the
 * `Referer` discovery, or the next one like it, ends up fixed in one and not
 * the other.
 *
 * @tag domain:research
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network,fs
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const API = "https://beyblade.fandom.com/api.php";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const JSON_HEADERS = { "User-Agent": UA, Accept: "application/json" };

/*
 * 🛑 `Referer` is what `static.wikia.nocookie.net` checks — measured
 * 2026-10-14: a browser User-Agent alone gets **403 text/html**; the identical
 * request with this Referer gets **200 image/webp**. Hotlink protection, not
 * UA filtering, so piling on more browser-ish headers changes nothing.
 *
 * Note what this is used for: ONE fetch, stored locally and re-served from our
 * own bucket. That is the opposite of the hotlinking the header guards against.
 */
const IMAGE_HEADERS = {
  "User-Agent": UA,
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://beyblade.fandom.com/",
};

/** Batched `prop=pageimages`. Up to 50 titles per call. */
async function pageImages(titles, thumbSize) {
  const url =
    API +
    "?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      prop: "pageimages",
      piprop: "original|thumbnail",
      pithumbsize: String(thumbSize),
      redirects: "1",
      titles: titles.join("|"),
    });
  const res = await fetch(url, { headers: JSON_HEADERS, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Resolve a lead image for each item, trying its candidate titles in rounds.
 *
 * @param items  [{ key, titles: string[] }]
 * @returns Map<key, { title, src }>
 */
export async function resolveLeadImages(items, { thumbSize = 960, log = console.log } = {}) {
  const resolved = new Map();
  const maxRounds = Math.max(0, ...items.map((i) => i.titles.length));
  for (let round = 0; round < maxRounds; round++) {
    const todo = items.filter((i) => !resolved.has(i.key) && i.titles[round]);
    if (todo.length === 0) break;
    let hits = 0;
    for (let i = 0; i < todo.length; i += 50) {
      const batch = todo.slice(i, i + 50);
      let json;
      try {
        json = await pageImages(
          batch.map((b) => b.titles[round]),
          thumbSize,
        );
      } catch (err) {
        // A failed batch is not a failed run: later rounds and a re-run both
        // get another chance, and exiting here would discard earlier rounds.
        log(`  ⚠ batch failed (round ${round + 1}): ${err?.message ?? err}`);
        continue;
      }
      const byTitle = new Map();
      for (const p of json.query?.pages ?? []) byTitle.set(String(p.title).toLowerCase(), p);
      /* Follow BOTH `redirects` (a different page) and `normalized`
       * (capitalisation) — without either, a page that resolved perfectly well
       * reads as missing. */
      const alias = new Map();
      for (const r of [...(json.query?.redirects ?? []), ...(json.query?.normalized ?? [])]) {
        alias.set(String(r.from).toLowerCase(), String(r.to).toLowerCase());
      }
      for (const b of batch) {
        const want = String(b.titles[round]).toLowerCase();
        const page = byTitle.get(alias.get(want) ?? want) ?? byTitle.get(want);
        const src = page?.original?.source || page?.thumbnail?.source;
        if (src) {
          resolved.set(b.key, { title: page.title, src });
          hits++;
        }
      }
    }
    log(`  round ${round + 1}: tried ${todo.length}, +${hits} (total ${resolved.size})`);
  }
  return resolved;
}

/**
 * Resolve image URLs for EXACT `File:` names, via `prop=imageinfo`.
 *
 * ── 🛑 WHY THIS EXISTS BESIDE `resolveLeadImages` ─────────────────────────
 *
 * `resolveLeadImages` GUESSES an article title and asks the wiki for whatever
 * lead image that article happens to have. It is the right tool when all you
 * know is a part's name, and it yielded 41% (309 of 752) — the number in
 * `fetch-part-images.mjs`'s header.
 *
 * But the infobox states its own image outright: `Image=Armor1.png`. Measured
 * 2026-10-20, `wikiImage` is populated on **1,813 of 2,087** extracted parts
 * (87%), so naming the file beats guessing the page by a factor of two. There
 * is nothing to resolve and nothing to get wrong — `prop=imageinfo` on a
 * `File:` title either has that file or does not.
 *
 * Both are kept: a part with no `Image=` can still fall back to the guess.
 *
 * 🛑 `iiurlwidth` must be requested to get a THUMBNAIL url. Without it the
 * API returns only the original, which for these pages is routinely a
 * multi-megabyte PNG — 1,813 of those is a download nobody needs, since
 * everything downstream transcodes to a 480px webp anyway.
 *
 * 🛑 Titles are prefixed `File:` here rather than at the call site. The caller
 * holds bare filenames straight out of the infobox, and a missing prefix is
 * not an error — it silently resolves to an ARTICLE of that name, or to
 * nothing, and reads as "the wiki has no image for this part".
 *
 * @param filenames  bare infobox filenames, e.g. ["Armor1.png", "Valkyrie.png"]
 * @returns Map<filename, { title, src }>  keyed by the ORIGINAL filename
 */
export async function resolveFileUrls(filenames, { thumbSize = 960, log = console.log } = {}) {
  const out = new Map();
  const unique = [...new Set(filenames.filter(Boolean))];
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const url =
      API +
      "?" +
      new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: "2",
        prop: "imageinfo",
        iiprop: "url",
        iiurlwidth: String(thumbSize),
        titles: batch.map((f) => `File:${f}`).join("|"),
      });
    let json;
    try {
      const res = await fetch(url, { headers: JSON_HEADERS, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      json = await res.json();
    } catch (err) {
      // One failed batch is not a failed run — a re-run retries it.
      log(`  ⚠ imageinfo batch failed: ${err?.message ?? err}`);
      continue;
    }
    /*
     * The API normalises `File:armor1.png` -> `File:Armor1.png`, so map back
     * through `normalized` or the 50-file batch silently resolves nothing
     * whenever the infobox spelling differs in case from the wiki's.
     */
    const alias = new Map();
    for (const n of json.query?.normalized ?? []) {
      alias.set(String(n.to).toLowerCase(), String(n.from).toLowerCase());
    }
    const wanted = new Map(batch.map((f) => [`file:${f}`.toLowerCase(), f]));
    for (const p of json.query?.pages ?? []) {
      const info = p.imageinfo?.[0];
      const src = info?.thumburl || info?.url;
      if (!src) continue;
      const lower = String(p.title).toLowerCase();
      const original = wanted.get(lower) ?? wanted.get(alias.get(lower) ?? "");
      if (original) out.set(original, { title: p.title, src });
    }
  }
  log(`  imageinfo: ${out.size} of ${unique.length} filenames resolved`);
  return out;
}

/**
 * Download one image and transcode to a bounded webp.
 *
 * `withoutEnlargement` so a small source is not upscaled into a blurry file,
 * and `flatten` onto white because many of these are transparent PNGs that
 * would otherwise render as black on a dark-theme card.
 */
export async function downloadAsWebp(src, destPath, { width = 480, quality = 78 } = {}) {
  const sharp = require("sharp");
  const res = await fetch(src, { headers: IMAGE_HEADERS, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const input = Buffer.from(await res.arrayBuffer());
  const out = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .webp({ quality })
    .toBuffer();
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, out);
  return out.length;
}

/** The wiki page URL for a resolved title, for the provenance record. */
export const wikiPageUrl = (title) =>
  `https://beyblade.fandom.com/wiki/${encodeURIComponent(String(title).replace(/ /g, "_"))}`;
