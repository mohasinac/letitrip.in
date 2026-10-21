#!/usr/bin/env node
/**
 * Fetch one real, openly-licensed photograph per editorial image slot from
 * Wikimedia Commons into a gitignored staging cache, and record provenance.
 *
 * Companion: `scripts/push-editorial-images.mjs` uploads the cache to Firebase
 * Storage, writes the `mediaAssets` rows that make `/media/<shortId>` resolve,
 * and patches the live documents.
 *
 *   fetch-editorial-images.mjs   Commons -> .media-cache/editorial/<key>.webp
 *   push-editorial-images.mjs    cache   -> Storage + mediaAssets + Firestore
 *
 * ── 🛑 LOCAL BYTES, NEVER `seedExtMedia()` ────────────────────────────────
 *
 * Root Cause #104: persisting `/api/media/ext?url=<third party>` makes every
 * single render a Node lambda plus an upstream round trip plus a sharp
 * decode/encode. ~400 of those contributed 52.52 GB of Fast Origin Transfer
 * against a 10 GB allowance and suspended the project. These bytes land in our
 * own bucket and are served behind a 30-day immutable cache instead.
 *
 * ── Licensing ─────────────────────────────────────────────────────────────
 *
 * Only licences in `LICENCE_RANK` are accepted, best first, so a public-domain
 * image beats a CC BY-SA one for the same query. Author, licence, source page
 * and fetch date are written per image to
 * `docs/research/editorial-images/image-provenance.json`, which makes
 * attribution possible and a takedown mechanical: delete the row, delete the
 * object, re-run.
 *
 * Usage (from the consumer root):
 *   node scripts/fetch-editorial-images.mjs --dry-run   resolve only, write nothing
 *   node scripts/fetch-editorial-images.mjs             fetch what is missing
 *   node scripts/fetch-editorial-images.mjs --force     re-fetch everything
 *   node scripts/fetch-editorial-images.mjs --only blog-cover-auction-launch
 *
 * Idempotent: a slot whose webp already exists is skipped unless `--force`.
 *
 * Exit: 0 = every slot resolved, 1 = one or more unresolved.
 *
 * @tag domain:blog,events
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network,fs — read-only GETs; writes .media-cache + provenance
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  EDITORIAL_SLOTS,
  ASPECTS,
  LICENCE_RANK,
  NO_ATTRIBUTION_LICENCES,
} from "./lib/editorial-image-manifest.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, ".media-cache/editorial");
const PROV_DIR = path.join(ROOT, "docs/research/editorial-images");
const PROVENANCE = path.join(PROV_DIR, "image-provenance.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const ONLY = (() => {
  const i = args.indexOf("--only");
  return i === -1 ? null : args[i + 1];
})();

const API = "https://commons.wikimedia.org/w/api.php";
/*
 * Wikimedia's UA policy asks for a descriptive agent with contact details and
 * will rate-limit or block a generic one. This is a real address on the site
 * that owns the request, which is what the policy is actually for.
 */
const UA = "LetItRipEditorialBot/1.0 (https://letitrip.in; admin@letitrip.in) node-fetch";

/** Strip the HTML Commons returns inside extmetadata values. */
const plain = (v) =>
  typeof v === "string"
    ? v.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
    : "";

/** Rank a licence string; -1 means refused. */
function licenceRank(raw) {
  const l = plain(raw).toLowerCase();
  if (!l) return -1;
  const i = LICENCE_RANK.findIndex((ok) => l === ok || l.startsWith(ok));
  return i;
}

async function searchCommons(query, limit = 8) {
  const u = new URL(API);
  u.searchParams.set("action", "query");
  u.searchParams.set("format", "json");
  u.searchParams.set("generator", "search");
  u.searchParams.set("gsrsearch", `filetype:bitmap ${query}`);
  u.searchParams.set("gsrnamespace", "6");
  u.searchParams.set("gsrlimit", String(limit));
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "url|size|mime|extmetadata");
  u.searchParams.set("iiurlwidth", "1600");
  const res = await fetch(u, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Commons ${res.status} for "${query}"`);
  const json = await res.json();
  const pages = json?.query?.pages ? Object.values(json.query.pages) : [];
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return null;
      const meta = ii.extmetadata ?? {};
      return {
        title: p.title,
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
        fileUrl: ii.thumburl || ii.url,
        originalUrl: ii.url,
        mime: ii.mime,
        width: ii.thumbwidth || ii.width,
        height: ii.thumbheight || ii.height,
        licence: plain(meta.LicenseShortName?.value),
        author: plain(meta.Artist?.value) || "Unknown",
        credit: plain(meta.Credit?.value),
      };
    })
    .filter(Boolean);
}

/*
 * 🛑 COMMONS SEARCH MATCHES PAGE PROSE, NOT IMAGE SUBJECT.
 *
 * The first run of this script reported "resolved 33/33" and was mostly
 * WRONG — because every slot found *something* and nothing checked what. The
 * One Piece TCG slot got a photograph of **Stephan's Quintet**, a galaxy
 * cluster; "quality inspection checklist" got an **NTSB airliner crash
 * investigation**; "cardboard parcel packaging" got a 1944 propaganda photo
 * captioned "A package for Hitler". Those would have shipped onto live
 * editorial pages under a green success line.
 *
 * The fix is the cheapest available signal: a Commons file TITLE is written by
 * the uploader to describe the photograph, whereas the indexed text is the
 * whole description page. Requiring a meaningful query token in the title
 * kills all three of the above outright.
 *
 * STOPWORDS exist so "card"/"game"/"collection" alone cannot carry a match —
 * they are the generic words that let the galaxy through ("...Quintet" page
 * mentioned "card").
 */
const STOPWORDS = new Set([
  "the", "and", "for", "with", "online", "collection", "collectibles",
  "collectible", "game", "play", "shop", "store", "display", "model", "kit",
  "toy", "toys", "box", "case", "set", "figures", "figure", "notes",
  "security", "house", "room", "close", "precision", "digital", "mobile",
  "parts", "cut", "die", "packaging", "quality", "glass", "market", "car",
  "cards", "trading", "pack",
]);

/** Meaningful tokens from a query — the ones a correct file title should carry. */
function queryTokens(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Pick the best candidate: acceptable licence, wide enough to crop without
 * upscaling, raster, and TITLE-RELEVANT to the query.
 *
 * 🛑 A slot with no acceptable candidate returns null and is reported — never
 * substituted. An illustration that contradicts the article is worse than none.
 */
/** Title with every separator stripped, for phrase matching. */
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function pick(candidates, aspect, query, { allowMark = false, phrase = null, publicDomainOnly = false } = {}) {
  const { width: wantW } = ASPECTS[aspect];
  const tokens = queryTokens(query);
  return (
    candidates
      .map((c) => ({ ...c, rank: licenceRank(c.licence) }))
      .filter((c) => c.rank !== -1)
      /*
       * "Zero copyright" slots: CC BY and CC BY-SA are free but REQUIRE
       * visible credit, and a full-bleed carousel background has nowhere to
       * put it. Enforced here rather than left to review.
       */
      .filter((c) => {
        if (!publicDomainOnly) return true;
        const l = plain(c.licence).toLowerCase();
        return NO_ATTRIBUTION_LICENCES.some((ok) => l === ok || l.startsWith(ok));
      })
      .filter((c) => c.mime !== "image/svg+xml")
      // Allow a little slack: Commons reports the thumb width we asked for.
      .filter((c) => (c.width ?? 0) >= Math.min(wantW, 800))
      /*
       * Relevance. A `phrase` slot demands the whole brand survive in the
       * title with separators stripped — "Hot Wheels" as two loose tokens
       * matched "Hay rakes, farm WHEELS, HOT-water tanks". Otherwise any one
       * meaningful token in the title is enough. A query made entirely of
       * stopwords has no tokens and cannot match, deliberately: such a query
       * cannot be checked at all, so it must not pass.
       */
      .filter((c) => {
        if (phrase) return squash(c.title).includes(squash(phrase));
        const title = c.title.toLowerCase();
        return tokens.length > 0 && tokens.some((t) => title.includes(t));
      })
      // An "icon"/"logo"/"map marker" is line art, not a photograph — it crops
      // to a smear at 1200x630. Only refused when the slot did not ask for one.
      .filter((c) => {
        const title = c.title.toLowerCase();
        const wantsMark = allowMark || tokens.some((t) => ["logo", "icon"].includes(t));
        return wantsMark || !/\b(icon|map marker|logo)\b/.test(title);
      })
      .sort((a, b) => a.rank - b.rank || (b.width ?? 0) - (a.width ?? 0))[0] ?? null
  );
}

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const slots = EDITORIAL_SLOTS.filter((s) => !ONLY || s.key === ONLY);
  if (slots.length === 0) {
    console.error(`✗ no slot matches --only ${ONLY}`);
    process.exit(2);
  }

  if (!DRY_RUN) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.mkdirSync(PROV_DIR, { recursive: true });
  }

  const provenance = fs.existsSync(PROVENANCE)
    ? JSON.parse(fs.readFileSync(PROVENANCE, "utf8"))
    : { generatedBy: "scripts/fetch-editorial-images.mjs", images: {} };

  const unresolved = [];
  let fetched = 0;
  let skipped = 0;

  for (const slot of slots) {
    const dest = path.join(OUT_DIR, `${slot.key}.webp`);
    if (!FORCE && fs.existsSync(dest)) {
      skipped += 1;
      continue;
    }

    let chosen = null;
    let usedQuery = null;
    for (const q of slot.queries) {
      let candidates;
      try {
        candidates = await searchCommons(q);
      } catch (err) {
        console.warn(`  ! ${slot.key}: "${q}" — ${err.message}`);
        continue;
      }
      chosen = pick(candidates, slot.aspect, q, {
        allowMark: slot.allowMark === true,
        phrase: slot.phrase ?? null,
        publicDomainOnly: slot.publicDomainOnly === true,
      });
      if (chosen) {
        usedQuery = q;
        break;
      }
    }

    if (!chosen) {
      unresolved.push(slot.key);
      console.warn(`✗ ${slot.key} — no acceptable image for any of: ${slot.queries.join(" | ")}`);
      continue;
    }

    console.log(
      `✓ ${slot.key}\n    q="${usedQuery}" ${chosen.title}\n    ${chosen.licence} · ${chosen.author.slice(0, 60)}`,
    );

    if (DRY_RUN) {
      fetched += 1;
      continue;
    }

    const { width, height } = ASPECTS[slot.aspect];
    try {
      const raw = await download(chosen.fileUrl);
      await sharp(raw)
        .resize(width, height, { fit: "cover", position: "attention" })
        .webp({ quality: 82 })
        .toFile(dest);
    } catch (err) {
      unresolved.push(slot.key);
      console.warn(`✗ ${slot.key} — fetch/convert failed: ${err.message}`);
      continue;
    }

    provenance.images[slot.key] = {
      sourcePage: chosen.pageUrl,
      fileUrl: chosen.originalUrl,
      title: chosen.title,
      licence: chosen.licence,
      author: chosen.author,
      credit: chosen.credit,
      query: usedQuery,
      aspect: slot.aspect,
      fetchedAt: new Date().toISOString(),
    };
    fetched += 1;
  }

  if (!DRY_RUN) {
    provenance.updatedAt = new Date().toISOString();
    fs.writeFileSync(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`);
  }

  console.log(
    `\n${DRY_RUN ? "[dry-run] " : ""}resolved ${fetched}/${slots.length} · skipped(cached) ${skipped} · unresolved ${unresolved.length}`,
  );
  if (unresolved.length) {
    console.log(`unresolved: ${unresolved.join(", ")}`);
    process.exit(1);
  }
}

await main();
