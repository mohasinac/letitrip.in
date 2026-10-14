#!/usr/bin/env node
/**
 * Look a Beyblade up on beyblade.fandom.com, for resolving a corpus gap.
 *
 * ## 🛑 Use the API, not the HTML — the HTML really is 403
 *
 * `docs/research/bey-corpus-2026-10/README.md` records a 403 on the wiki
 * "even with a full browser header set", and that is still true: measured
 * 2026-10-14, `GET /wiki/<Page>` with a full Chrome header set returns **403**.
 *
 * `GET /api.php` with the same headers returns **200 JSON**. So the blocker was
 * never the headers — it was the surface. The API is the supported read path
 * and needs no scraping, no throttling and no HTML parsing.
 *
 * Facts only (names, codes, types, spin, systems, release dates), which is what
 * the corpus README already establishes as carrying no licensing question. Do
 * not lift prose.
 *
 * Usage:
 *   node scripts/wiki-lookup.mjs "Lord Spryzen Requiem"       # search + infobox
 *   node scripts/wiki-lookup.mjs --search "Hells Scythe"      # titles only
 *
 * @tag domain:research
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network — read-only GETs against beyblade.fandom.com
 */

const API = "https://beyblade.fandom.com/api.php";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

const searchOnly = process.argv.includes("--search");
const term = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ");
if (!term) {
  console.error("usage: node scripts/wiki-lookup.mjs [--search] \"<model name>\"");
  process.exit(2);
}

const found = await api({ action: "query", list: "search", srsearch: term, srlimit: "8" });
const hits = found.query?.search ?? [];
if (hits.length === 0) {
  console.log(`no wiki page matches "${term}"`);
  process.exit(0);
}

console.log(`\nmatches for "${term}":`);
for (const h of hits) console.log(`  ${h.title}`);
if (searchOnly) process.exit(0);

/*
 * The infobox fields live in the wikitext, so read the raw page rather than the
 * rendered HTML — same reason as the API choice above, and it keeps the parse
 * to a line regex instead of a DOM.
 */
const title = hits[0].title;
const page = await api({ action: "parse", page: title, prop: "wikitext", formatversion: "2" });
const wikitext = page.parse?.wikitext ?? "";

const WANT = [
  "type", "beytype", "spin", "spindirection", "spin direction",
  "productcode", "product code", "code", "system", "released", "release",
  "line", "productline", "weight", "owner",
];

console.log(`\n── ${title} ──`);
let shown = 0;
for (const line of wikitext.split(/\r?\n/)) {
  const m = line.match(/^\s*\|\s*([A-Za-z ]+?)\s*=\s*(.+?)\s*$/);
  if (!m) continue;
  const key = m[1].toLowerCase().replace(/\s+/g, " ").trim();
  if (!WANT.includes(key)) continue;
  const val = m[2].replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2").replace(/'''?/g, "").trim();
  if (!val) continue;
  console.log(`  ${key.padEnd(16)} ${val.slice(0, 110)}`);
  shown++;
}
if (shown === 0) {
  console.log("  (no recognised infobox fields — the page may use a different template)");
}
