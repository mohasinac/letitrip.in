#!/usr/bin/env node
/**
 * Crawl the Beyblade Wiki's PART pages through the MediaWiki API into `linka/`.
 *
 *   node scripts/crawl-wiki-parts.mjs [--corpus <path>] [--limit N] [--force]
 *                                     [--category Category:Parts] [--out api-2026-10]
 *
 * ── 🛑 THE API, NOT THE HTML — MEASURED, NOT ASSUMED ───────────────────────
 *
 * Probed 2026-10-20 against the live site:
 *
 *   api.php?action=query…           browser UA + Referer   -> 200 application/json
 *   /wiki/<Page>                    browser UA + Referer   -> 403
 *   /wiki/<Page>                    bare                   -> 403
 *
 * `docs/research/bey-corpus-2026-10/README.md` already recorded this ("Its HTML
 * returns 403 even with a full browser header set… The Wiki API stays the
 * gap-filler"). No header set fixes the HTML, so there is nothing to try there.
 *
 * The API is also simply the better source: `prop=revisions&rvslots=main`
 * returns the raw `{{Part Infobox}}` wikitext — structured `key=value` pairs —
 * instead of rendered HTML needing a DOM parse and a lazyload unwind.
 *
 * ── 🛑 WHY THIS EXISTS AT ALL ──────────────────────────────────────────────
 *
 * The local crawl in `linka/` is dated 2026-05-19 and fetched ZERO per-part
 * pages for the legacy slots. Measured against the live category:
 *
 *   slot            wiki   May crawl
 *   Attack Ring      115      0
 *   Face Bolt         86      0
 *   Fusion Wheel      81      0
 *   Energy Ring       78      0
 *   Spin Track        46      0
 *   Ratchet           38      0
 *   Spin Gear         32      0
 *   Weight Disk       30      1
 *
 * So "fandom only has Burst/X parts, hence a 10.6% join rate" was a fact about
 * the CRAWL, not about the wiki. `Weight=` is populated on exactly the slots our
 * glossary has zero weights for — verified on Attack Ring - Cross Dranzer
 * (5.0 g), Weight Disk - Eight Heavy (15 g), Fusion Wheel - Lightning (30 g) and
 * Spin Track - 105 (1.1 g).
 *
 * ── 🛑 LICENSING ───────────────────────────────────────────────────────────
 *
 * Fandom is CC-BY-SA. This writes the fetched wikitext to disk as a local cache
 * and records the source URL for every page. Downstream extraction takes FACTS
 * ONLY (weights, codes, dates, classifications, names, stat numbers) and the
 * rendering side links back to the source page. The `==Description==` prose is
 * never extracted.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:network,writes-linka
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const API = "https://beyblade.fandom.com/api.php";
const WIKI = "https://beyblade.fandom.com/wiki/";

/**
 * A descriptive agent string. Fandom serves the API to this; it is also the
 * polite thing to send so an operator can see who we are.
 */
const UA =
  "LetItRipBot/1.0 (+https://www.letitrip.in; parts reference; contact via site) " +
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/131.0.0.0 Safari/537.36";

/** `titles=` accepts 50 per request, so 2,261 pages is ~46 calls, not 2,261. */
const TITLES_PER_REQUEST = 50;
/** Politeness pause between requests. The whole crawl is <100 calls either way. */
const DELAY_MS = 350;
const MAX_RETRIES = 4;

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const CORPUS = arg("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const CATEGORY = arg("--category", "Category:Parts");
const OUT_SUB = arg("--out", "api-2026-10");
const LIMIT = Number.parseInt(arg("--limit", "0"), 10) || 0;
const FORCE = process.argv.includes("--force");

const LINKA = path.join(CORPUS, "linka");
const OUT_DIR = path.join(LINKA, OUT_SUB);
/**
 * 🛑 A SIBLING manifest. `linka/_manifest.json` is the May crawl's index with
 * 6,291 entries and is what every existing reader keys on — overwriting or
 * merging into it would make the provenance of any single fact unrecoverable.
 */
const MANIFEST = path.join(LINKA, `_manifest-${OUT_SUB}.json`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Windows-safe filename for a wiki title, reversible enough to audit by eye. */
function fileFor(title) {
  const safe = title
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 180);
  return `${safe}.wikitext`;
}

async function apiGet(params, label) {
  const u = new URL(API);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  // Let Fandom serve from its own cache where it can.
  u.searchParams.set("maxage", "3600");
  u.searchParams.set("smaxage", "3600");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(u, {
        headers: { "User-Agent": UA, Referer: "https://beyblade.fandom.com/", Accept: "application/json" },
      });
      if (res.status === 429 || res.status >= 500) {
        const wait = DELAY_MS * 2 ** attempt;
        console.warn(`  [${label}] HTTP ${res.status}, backing off ${wait}ms (${attempt}/${MAX_RETRIES})`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) return { error: `HTTP ${res.status}` };
      return await res.json();
    } catch (err) {
      const wait = DELAY_MS * 2 ** attempt;
      console.warn(`  [${label}] ${err?.message ?? err}, retrying in ${wait}ms (${attempt}/${MAX_RETRIES})`);
      await sleep(wait);
    }
  }
  return { error: `failed after ${MAX_RETRIES} attempts` };
}

/** Localised mirrors of English pages — skipped, they carry the same infobox. */
function isLocalised(title) {
  return (
    /\/[a-z]{2}$/.test(title) ||
    /^(Anneau|Disque|Toupie|Couche|Anillo|Capa|Ruota|Rueda)/i.test(title)
  );
}

async function enumerateCategory(category) {
  const titles = [];
  let cont = null;
  let calls = 0;
  do {
    const params = {
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "500",
      cmnamespace: "0",
      format: "json",
    };
    if (cont) params.cmcontinue = cont;
    const j = await apiGet(params, `enumerate ${category}`);
    if (j.error) {
      console.error(`  enumeration failed: ${j.error}`);
      break;
    }
    titles.push(...(j.query?.categorymembers ?? []).map((m) => m.title));
    cont = j.continue?.cmcontinue ?? null;
    calls += 1;
    if (cont) await sleep(DELAY_MS);
  } while (cont && calls < 60);
  return titles;
}

function loadManifest() {
  if (!FORCE && fs.existsSync(MANIFEST)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    } catch {
      console.warn("  existing manifest unreadable, starting fresh");
    }
  }
  return { note: "", source: "", category: CATEGORY, fetchedAt: null, urls: {}, visited: [] };
}

async function main() {
  if (!fs.existsSync(LINKA)) {
    console.error(`[crawl-wiki-parts] no linka/ at ${LINKA}\n  pass --corpus <path> or set BEY_CORPUS.`);
    process.exit(2);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = loadManifest();
  manifest.note =
    "Beyblade Wiki part pages fetched through api.php (the HTML returns 403 for every " +
    "header set — measured). Wikitext cached one file per page. Fandom is CC-BY-SA: " +
    "downstream extraction takes facts only and the rendering side links to sourceUrl.";
  manifest.source = API;
  manifest.category = CATEGORY;

  console.log(`[crawl-wiki-parts] enumerating ${CATEGORY} …`);
  const all = await enumerateCategory(CATEGORY);
  const english = all.filter((t) => !isLocalised(t));
  console.log(`  ${all.length} members, ${english.length} English (${all.length - english.length} localised skipped)`);

  const already = new Set(Object.keys(manifest.urls).filter((t) => manifest.urls[t].status === 200));
  let todo = english.filter((t) => !already.has(t));
  if (LIMIT > 0) todo = todo.slice(0, LIMIT);

  console.log(`  ${already.size} already cached, ${todo.length} to fetch`);
  if (todo.length === 0) {
    console.log("  nothing to do.");
    writeManifest(manifest, english);
    return;
  }

  let written = 0;
  let missing = 0;
  let failed = 0;
  const batches = Math.ceil(todo.length / TITLES_PER_REQUEST);

  for (let b = 0; b < batches; b += 1) {
    const chunk = todo.slice(b * TITLES_PER_REQUEST, (b + 1) * TITLES_PER_REQUEST);
    const j = await apiGet(
      {
        action: "query",
        prop: "revisions",
        rvprop: "content",
        rvslots: "main",
        titles: chunk.join("|"),
        redirects: "1",
        format: "json",
      },
      `batch ${b + 1}/${batches}`,
    );

    if (j.error) {
      failed += chunk.length;
      for (const t of chunk) {
        manifest.urls[t] = { file: null, status: 0, len: 0, fetched_at: new Date().toISOString(), error: j.error };
      }
      console.warn(`  batch ${b + 1}/${batches} FAILED: ${j.error}`);
      await sleep(DELAY_MS);
      continue;
    }

    /*
     * 🛑 `redirects: 1` resolves a redirect server-side, so the canonical title
     * is what comes back. That is what collapses the 21 `Performance_Tip_-_*`
     * pages that are really Burst Drivers onto their real page, and it is why
     * the file is keyed on the RESOLVED title rather than the requested one —
     * the same `wgPageName` dedupe the HTML crawl needed, done for free.
     */
    const redirects = new Map((j.query?.redirects ?? []).map((r) => [r.from, r.to]));

    for (const page of Object.values(j.query?.pages ?? {})) {
      const title = page.title;
      if (page.missing !== undefined) {
        manifest.urls[title] = {
          file: null,
          status: 404,
          len: 0,
          fetched_at: new Date().toISOString(),
        };
        missing += 1;
        continue;
      }
      const text = page.revisions?.[0]?.slots?.main?.["*"] ?? "";
      const file = fileFor(title);
      fs.writeFileSync(path.join(OUT_DIR, file), text, "utf8");
      manifest.urls[title] = {
        file: `${OUT_SUB}/${file}`,
        url: WIKI + encodeURIComponent(title.replace(/ /g, "_")),
        status: 200,
        len: text.length,
        fetched_at: new Date().toISOString(),
      };
      written += 1;
    }
    for (const [from, to] of redirects) {
      manifest.urls[from] = { redirectTo: to, status: 301, len: 0, fetched_at: new Date().toISOString() };
    }

    if ((b + 1) % 5 === 0 || b + 1 === batches) {
      console.log(`  batch ${b + 1}/${batches} — ${written} written, ${missing} missing, ${failed} failed`);
      writeManifest(manifest, english);
    }
    await sleep(DELAY_MS);
  }

  writeManifest(manifest, english);
  console.log("");
  console.log(`  wrote    ${written} wikitext file(s) -> ${OUT_DIR.replace(/\\/g, "/")}`);
  console.log(`  missing  ${missing}`);
  console.log(`  failed   ${failed}`);
  console.log(`  manifest ${MANIFEST.replace(/\\/g, "/")}`);
  if (failed > 0) {
    console.log("");
    console.log("  🛑 re-run to retry the failures — cached pages are skipped, so a re-run is cheap.");
  }
}

function writeManifest(manifest, english) {
  manifest.fetchedAt = new Date().toISOString();
  manifest.visited = english;
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

main();
