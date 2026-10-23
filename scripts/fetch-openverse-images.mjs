#!/usr/bin/env node
/**
 * Fetch editorial images from OPENVERSE into `.media-cache/editorial/`.
 *
 *   node scripts/fetch-openverse-images.mjs [--dry-run] [--force] [--only <key>]
 *
 * Runs alongside `fetch-editorial-images.mjs` (Commons) rather than replacing
 * it: a slot picks its API with `source: "openverse"` in the manifest, and
 * both write into the same cache directory and the same provenance file, so
 * `push-editorial-images.mjs` needs no changes at all — it reads the directory.
 *
 * ## Why Openverse and not Google Images
 *
 * Asked for as "citable sources or google image search, but only relevant to
 * the topic". Google Image Search cannot be used here and the reason is not
 * fussiness: a result carries NO LICENCE, there is no API without a paid CSE
 * key, and scraping it is against its terms. Publishing an unlicensed
 * photograph on a commercial marketplace is a real liability, not a style
 * choice — the manifest header already records the same verdict for Imgur.
 *
 * Openverse is the citable source that satisfies the intent. It indexes
 * Wikimedia Commons, Flickr, and ~40 museum and archive collections, and every
 * result carries machine-readable `license`, `license_version`, `creator`,
 * `foreign_landing_url` and a ready-made `attribution` string — which is
 * exactly the shape `image-provenance.json` already records.
 *
 * ## "Relevant only, no randoms" is solved by PINNING, not by querying
 *
 * This pipeline's worst incident was a free-text search reporting "resolved
 * 33/33" while being mostly wrong — the One Piece TCG slot got a photograph of
 * Stephan's Quintet, a galaxy cluster, and "quality inspection checklist" got
 * an NTSB airliner crash investigation. Every one would have shipped onto a
 * live editorial page under a green success line.
 *
 * So a slot may name `pin: "<openverse id>"`, which skips search entirely and
 * fetches that one reviewed result. Queries remain as a fallback for slots
 * where any member of a genre will do, and the title-relevance guard still
 * runs over them.
 *
 * @tag layer:script
 * @tag access:node-only
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ASPECTS,
  EDITORIAL_SLOTS,
  LICENCE_RANK,
  NO_ATTRIBUTION_LICENCES,
  normaliseLicence,
} from "./lib/editorial-image-manifest.mjs";
import { downloadCropped } from "./lib/download-cropped.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".media-cache", "editorial");
const PROVENANCE = path.join(ROOT, "docs", "research", "editorial-images", "image-provenance.json");

const API = "https://api.openverse.org/v1/images/";

/*
 * Openverse asks anonymous clients to identify themselves and rate-limits
 * harder when they do not. Same honest, contactable form the Commons fetcher
 * uses — a real address on the site making the request.
 */
const UA = "LetItRipEditorialBot/1.0 (https://letitrip.in; admin@letitrip.in) node-fetch";

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const FORCE = argv.includes("--force");
const ONLY = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;

/** Words too generic to carry a title match on their own. */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "at", "for", "with", "to",
  "dark", "light", "abstract", "background", "image", "photo", "picture",
]);

function licenceRank(licence) {
  const l = String(licence ?? "").toLowerCase();
  return LICENCE_RANK.findIndex((ok) => l === ok || l.startsWith(ok));
}

function isNoAttribution(licence) {
  const l = String(licence ?? "").toLowerCase();
  return NO_ATTRIBUTION_LICENCES.some((ok) => l === ok || l.startsWith(ok));
}

/**
 * Normalise an Openverse result into the SAME 11-field candidate the Commons
 * fetcher produces, so `pick()` below and the provenance writer are identical
 * in both scripts and a future reader does not have to hold two shapes.
 */
function toCandidate(r) {
  return {
    title: r.title ?? "",
    pageUrl: r.foreign_landing_url ?? r.url ?? "",
    fileUrl: r.url ?? "",
    originalUrl: r.url ?? "",
    mime: r.filetype ? `image/${r.filetype}` : "",
    width: Number(r.width ?? 0),
    height: Number(r.height ?? 0),
    licence: normaliseLicence(r.license, r.license_version),
    author: r.creator || "Unknown",
    credit: r.attribution || r.source || "",
    provider: r.provider ?? r.source ?? "",
    openverseId: r.id ?? "",
  };
}

async function openverseGet(url, { attempt = 1 } = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  /*
   * 🛑 429 IS HANDLED EXPLICITLY, and that is the whole reason this helper
   * exists. The Commons fetcher has no retry at all: a rate-limited query
   * throws, the loop `continue`s to the next candidate query, and the slot
   * ends up in `unresolved` — so a rate limit presents as "no acceptable
   * image for this slot", which is indistinguishable from a genuine miss and
   * sends you looking for a better search term that was never the problem.
   */
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("retry-after") ?? 0);
    const waitMs = retryAfter > 0 ? retryAfter * 1000 : Math.min(2 ** attempt * 1000, 30_000);
    if (attempt > 4) {
      throw new Error(`Openverse rate-limited after ${attempt} attempts — try again later, this is not a bad query`);
    }
    console.warn(`  · rate-limited, waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt})`);
    await new Promise((r) => setTimeout(r, waitMs));
    return openverseGet(url, { attempt: attempt + 1 });
  }

  if (!res.ok) throw new Error(`Openverse ${res.status} ${res.statusText}`);
  return res.json();
}

/** One exact result by id. No search, no relevance guessing. */
async function fetchPinned(id) {
  const data = await openverseGet(`${API}${encodeURIComponent(id)}/`);
  return toCandidate(data);
}

async function searchOpenverse(query, { publicDomainOnly }, limit = 12) {
  const u = new URL(API);
  u.searchParams.set("q", query);
  u.searchParams.set("page_size", String(limit));
  // Ask the API to pre-filter rather than fetching everything and refusing it
  // here — fewer results to rank, and it never returns a licence we'd reject.
  u.searchParams.set("license", publicDomainOnly ? "cc0,pdm" : "cc0,pdm,by,by-sa");
  u.searchParams.set("extension", "jpg,png");
  u.searchParams.set("size", "large");
  const data = await openverseGet(u);
  return (data.results ?? []).map(toCandidate);
}

/**
 * Title relevance, same guard as the Commons fetcher and for the same reason.
 * Openverse ranks on title + tags rather than on whole-article prose, so it is
 * less prone to the galaxy-cluster failure — but "less prone" is not "immune",
 * and a cheap check costs nothing.
 */
function titleMatches(title, query) {
  const t = String(title).toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (terms.length === 0) return true;
  return terms.some((w) => t.includes(w));
}

function pick(candidates, slot, query) {
  const want = ASPECTS[slot.aspect];
  return candidates
    .filter((c) => licenceRank(c.licence) !== -1)
    .filter((c) => !slot.publicDomainOnly || isNoAttribution(c.licence))
    .filter((c) => c.fileUrl && !/\.svg($|\?)/i.test(c.fileUrl))
    .filter((c) => c.width >= Math.min(want.width, 800))
    .filter((c) => titleMatches(c.title, query))
    .sort((a, b) => licenceRank(a.licence) - licenceRank(b.licence) || b.width - a.width)[0] ?? null;
}

function readProvenance() {
  try {
    return JSON.parse(fs.readFileSync(PROVENANCE, "utf8"));
  } catch {
    return { generatedBy: "scripts/fetch-openverse-images.mjs", images: {}, updatedAt: null };
  }
}

async function main() {
  const slots = EDITORIAL_SLOTS.filter((s) => s.source === "openverse").filter(
    (s) => !ONLY || s.key === ONLY,
  );

  if (slots.length === 0) {
    console.log("No Openverse slots match. (Slots opt in with `source: \"openverse\"`.)");
    return;
  }

  console.log(`Openverse: ${slots.length} slot(s)${DRY_RUN ? " — DRY RUN" : ""}`);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const provenance = readProvenance();
  const unresolved = [];
  let fetched = 0;
  let skipped = 0;

  for (const slot of slots) {
    const dest = path.join(CACHE_DIR, `${slot.key}.webp`);
    if (!FORCE && fs.existsSync(dest)) {
      skipped += 1;
      console.log(`  = ${slot.key} (cached)`);
      continue;
    }

    let chosen = null;
    let usedQuery = null;

    if (slot.pin) {
      try {
        const c = await fetchPinned(slot.pin);
        // A pin still has to clear the licence bar — a pinned id whose licence
        // changed upstream must fail loudly, not ship.
        if (licenceRank(c.licence) === -1) {
          throw new Error(`pinned result licence "${c.licence}" is not accepted`);
        }
        if (slot.publicDomainOnly && !isNoAttribution(c.licence)) {
          throw new Error(`pinned result is "${c.licence}" but the slot is publicDomainOnly`);
        }
        chosen = c;
        usedQuery = `pin:${slot.pin}`;
      } catch (err) {
        console.warn(`  ! ${slot.key} pin failed: ${err.message}`);
      }
    }

    if (!chosen) {
      for (const query of slot.queries ?? []) {
        try {
          const results = await searchOpenverse(query, slot);
          const c = pick(results, slot, query);
          if (c) {
            chosen = c;
            usedQuery = query;
            break;
          }
        } catch (err) {
          console.warn(`  ! ${slot.key} query "${query}": ${err.message}`);
        }
      }
    }

    if (!chosen) {
      unresolved.push(slot.key);
      console.warn(`  ✗ ${slot.key} — nothing acceptable`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  → ${slot.key}: ${chosen.title} [${chosen.licence}] via ${usedQuery}`);
      continue;
    }

    try {
      const { width, height } = ASPECTS[slot.aspect];
      /*
       * 🛑 No Referer. Openverse bytes come from third-party CDNs, so the
       * Fandom Referer that `wiki-images.mjs` needs would be wrong here and
       * some hosts refuse a mismatched one outright.
       */
      const size = await downloadCropped(chosen.fileUrl, dest, {
        width,
        height,
        headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
      });
      fetched += 1;
      console.log(`  ✓ ${slot.key} (${Math.round(size / 1024)} KB) — ${chosen.licence}`);

      provenance.images[slot.key] = {
        sourcePage: chosen.pageUrl,
        fileUrl: chosen.originalUrl,
        title: chosen.title,
        licence: chosen.licence,
        author: chosen.author,
        credit: chosen.credit,
        provider: chosen.provider,
        openverseId: chosen.openverseId,
        query: usedQuery,
        aspect: slot.aspect,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      unresolved.push(slot.key);
      console.warn(`  ✗ ${slot.key} download failed: ${err.message}`);
    }
  }

  if (!DRY_RUN) {
    provenance.updatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(PROVENANCE), { recursive: true });
    fs.writeFileSync(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`);
  }

  console.log(`\nfetched ${fetched}, cached ${skipped}, unresolved ${unresolved.length}`);
  if (unresolved.length) {
    console.log(`unresolved: ${unresolved.join(", ")}`);
    // A slot with no image is not a crash — the event simply renders its type
    // glyph instead — but it must not pass silently as success either.
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
