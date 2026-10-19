#!/usr/bin/env node
/**
 * Turn the crawled `{{Product Infobox}}` wikitext into committed product JSON —
 * sets, random boosters, battle sets, stadiums and vendor exclusives.
 *
 *   node scripts/extract-wiki-products.mjs [--corpus <path>] [--quiet]
 *
 * Reads `linka/api-products-2026-10/*.wikitext` and writes
 * `docs/research/bey-products-2026-10/wiki-products.json` plus a report.
 * No network.
 *
 * ── 🛑 WHY A PRODUCT IS NOT A BEY AND NOT A PART ───────────────────────────
 *
 * A product is the SEALED THING a buyer orders: a starter, a booster, a random
 * booster, a deck set, a stadium bundle. It CONTAINS beys, and in the random
 * case it contains one of N with stated odds. Neither `partGlossary` nor the
 * bey data can hold that — one is a component, the other a finished bey, and
 * the thing a listing is actually for is this.
 *
 * ── 🛑 THE THREE SECTIONS THAT MAKE THIS WORTH EXTRACTING ──────────────────
 *
 * Measured on `Random Booster Vol. 1`:
 *
 *   ==Assortment==   one line per possible bey, each with its OWN code
 *                    (`BX-14 01`), and the prize marked `(Prize)`
 *   ==Breakdown==    the per-carton distribution — "3 SharkEdge 3-60LF,
 *                    5 HellsScythe 4-80LF" out of 24. These are PULL RATES,
 *                    and nothing else in any source we hold carries them
 *   ==Gallery==      `File|Caption` pairs that map a photo to a specific bey
 *                    AND its assortment code
 *
 * ── 🛑 `(Prize)` IS A FACT, AND IT IS THE WHOLE POINT OF A RANDOM BOOSTER ──
 *
 * The prize bey is the rare one. Dropping the marker turns a random booster
 * into an unordered list of six equally-likely beys, which is exactly what it
 * is not, and no amount of later cleanup can recover which one it was.
 *
 * ── 🛑 BOLD MEANS "NEW TO THE SERIES", AND IT IS INSIDE THE LINK ───────────
 *
 * The page states it outright: "Parts marked in bold are new to the series."
 * The bold lives inside the display half of `[[Target|Display]]`, so it has to
 * be read BEFORE the link is flattened or the signal is gone. It is recorded
 * per-item rather than thrown away, because "which part debuted here" is a
 * real question about a release.
 *
 * ── 🛑 FACTS ONLY — CC-BY-SA ───────────────────────────────────────────────
 *
 * Codes, prices, dates, series, contents, counts, file names. The prose
 * paragraph after the infobox and the `==Trivia==` section are never read.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:writes-docs-research
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { parseInfobox, cleanValue, imageFilename, productCodes } from "./lib/wiki-infobox.mjs";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const OUT_DIR = "docs/research/bey-products-2026-10";
const WIKI = "https://beyblade.fandom.com/wiki/";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const CORPUS = arg("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const CRAWL = path.join(CORPUS, "linka/api-products-2026-10");
const QUIET = process.argv.includes("--quiet");
const log = (...a) => {
  if (!QUIET) console.log(...a);
};

/**
 * The body of one `==Section==`, or "".
 *
 * ── 🛑 WALKED BY LINE, NOT MATCHED BY REGEX ───────────────────────────────
 *
 * The first version was
 *   `^==\s*${name}\s*==\s*$([\s\S]*?)(?=^==[^=]|\Z)`  /im
 * and it matched NOTHING, on every page, for two independent reasons:
 *
 *   `\Z`      does not exist in JavaScript regex. It is a literal `Z`, so the
 *             "or end of input" alternative could only match a page whose
 *             next character was a capital Z.
 *   `\s*$`    under /m — `\s` matches `\n`, so `\s*` greedily eats the line
 *             break and `$` then has to match mid-text.
 *
 * The damage was invisible: `parseAssortment` falls back to `Contents` and
 * `Includes`, so it still reported 175 pages with an assortment and the run
 * looked successful. The tell was `prize: 0` on a corpus whose every random
 * booster marks one — a count that should never be zero.
 *
 * A line walk has no such subtleties and is easier to read than the regex it
 * replaces. `===Sub===` is deliberately NOT a terminator: a subsection belongs
 * to the section it sits under.
 */
function section(text, name) {
  const want = name.toLowerCase();
  const lines = text.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const h = /^==\s*([^=].*?)\s*==\s*$/.exec(lines[i]);
    if (h && h[1].toLowerCase() === want) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return "";
  const body = [];
  for (let i = start; i < lines.length; i++) {
    if (/^==\s*[^=].*?\s*==\s*$/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n");
}

/**
 * The FIRST wiki link's target, plus whether the display half was bold.
 *
 * 🛑 `[[Target|Display]]` — the target is what identifies the bey, and the
 * display is where the bold lives. Taking the display as the identity means
 * `[[SharkEdge 3-60LF|'''SharkEdge''' 3-60'''LF''']]` becomes a name with
 * apostrophes in it; taking the target without checking the display first
 * loses the "new to the series" signal entirely.
 */
function firstLink(line) {
  const m = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/.exec(line);
  if (!m) return null;
  const target = m[1].trim();
  const display = (m[2] ?? m[1]).trim();
  return { target, display, bold: /'''/.test(display) };
}

/** `==Assortment==` → one entry per possible bey. */
function parseAssortment(text) {
  const body = section(text, "Assortment") || section(text, "Contents") || section(text, "Includes");
  if (!body) return [];
  const out = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("*")) continue;
    const link = firstLink(line);
    if (!link) continue;
    /*
     * The per-item code is the `BX-14 01:` prefix before the link. It is the
     * code a buyer reads off a sealed booster, so it is the join key between
     * a pull and this row — not decoration.
     */
    const code = /^\*+\s*([A-Z0-9][A-Z0-9-]*\s*\d{2})\s*:/i.exec(line)?.[1]?.replace(/\s+/g, " ");
    out.push({
      bey: link.target,
      ...(code ? { itemCode: code } : {}),
      /* `(Prize)` anywhere on the line, not only at the end — some pages put
       * it before a trailing note. */
      ...(/\(\s*prize\s*\)/i.test(line) ? { isPrize: true } : {}),
      ...(link.bold ? { newToSeries: true } : {}),
    });
  }
  return out;
}

/**
 * `==Breakdown==` → per-carton counts.
 *
 * 🛑 These are ODDS. "3 of 24" is a 1-in-8 pull, and that is the single most
 * commercially meaningful number on the page — it is what makes one bey in a
 * random booster worth more than another. Stored as the raw count plus the
 * carton size so the ratio is derived rather than rounded here.
 */
function parseBreakdown(text) {
  const body = section(text, "Breakdown");
  if (!body) return { cartonSize: null, counts: [] };
  const cartonSize = Number(/contains\s+(\d+)\s+individual\s+boosters/i.exec(body)?.[1] ?? 0) || null;
  const counts = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!/^\*{2,}/.test(line)) continue;
    const link = firstLink(line);
    if (!link) continue;
    const n = Number(/^\*{2,}\s*(\d+)\s/.exec(line)?.[1] ?? NaN);
    if (!Number.isFinite(n)) continue;
    counts.push({ bey: link.target, perCarton: n });
  }
  return { cartonSize, counts };
}

/** `==Gallery==` → `{ file, caption }`, skipping video entries. */
function parseGallery(text) {
  const body = section(text, "Gallery");
  if (!body) return [];
  const out = [];
  const block = /<gallery[^>]*>([\s\S]*?)<\/gallery>/gi;
  let g;
  while ((g = block.exec(body)) !== null) {
    for (const raw of g[1].split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      const [file, ...rest] = line.split("|");
      const name = file.trim();
      /*
       * 🛑 A `<gallery>` holds VIDEO entries too — a YouTube title with no
       * extension. Those are not images and an `<img src>` built from one
       * renders broken, so anything without a real image extension is skipped.
       */
      if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) continue;
      out.push({ file: name, caption: rest.join("|").trim() || null });
    }
  }
  return out;
}

function main() {
  if (!fs.existsSync(CRAWL)) {
    console.error(
      `[extract-wiki-products] no crawl at ${CRAWL}\n` +
        `  run: node scripts/crawl-wiki-parts.mjs --category "Category:Beyblade Sets" --out api-products-2026-10`,
    );
    process.exit(2);
  }

  const files = fs.readdirSync(CRAWL).filter((f) => f.endsWith(".wikitext"));
  const out = {};
  const unmapped = new Map();
  const byType = {};
  let pages = 0;
  let withBox = 0;
  let skippedAsBey = 0;
  const counts = {
    assortment: 0, breakdown: 0, gallery: 0, prize: 0, newToSeries: 0,
    productCode: 0, price: 0, series: 0,
  };

  for (const f of files) {
    pages += 1;
    const text = fs.readFileSync(path.join(CRAWL, f), "utf8");
    const box = parseInfobox(text, "Product Infobox") ?? parseInfobox(text);
    const title = f.replace(/\.wikitext$/, "").replace(/_/g, " ");
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const assortment = parseAssortment(text);
    const breakdown = parseBreakdown(text);
    const gallery = parseGallery(text);
    const hasBox = Boolean(box?.__keys?.length);
    if (hasBox) withBox += 1;

    /* A page with neither an infobox nor any contents is not a product. */
    if (!hasBox && !assortment.length && !gallery.length) continue;

    /*
     * 🛑 A BEY PAGE FILED UNDER A PRODUCT CATEGORY IS STILL A BEY.
     *
     * `Category:Random Boosters` contains both the booster AND the individual
     * beys it can yield (`Random Booster Vol. 10 Crash Ragnaruk.11R.Wd` is a
     * bey). Measured on the first run, that put BEY infobox keys at the top of
     * the unmapped list — system 300, type 180, driver 105, disc 104, layer 76
     * — i.e. ~300 of 546 pages were beys being recorded as products, with
     * `productType` unset and the real data dropped.
     *
     * They are not lost: `extract-wiki-beys.mjs` already holds them, keyed by
     * the same slug. So they are SKIPPED here and counted, rather than stored
     * twice in two shapes that would then disagree.
     *
     * The discriminator is a composition slot or a bey-only scalar, never the
     * title — `Beyblade Burst Surge Starter Pack` and `Starter Pack Achilles`
     * are a product and a bey with near-identical names.
     */
    const BEY_ONLY_KEYS = [
      "driver", "disc", "layer", "ratchet", "bit", "blade", "bladex",
      "facebolt", "energyring", "fusionwheel", "spintrack", "performancetip",
      "spindirection", "attackring", "weightdisk", "bladebase", "spingear",
    ];
    const boxKeys = new Set(
      (box?.__keys ?? []).map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "")),
    );
    const looksLikeBey = BEY_ONLY_KEYS.some((k) => boxKeys.has(k));
    if (looksLikeBey && !cleanValue(box?.producttype)) {
      skippedAsBey += 1;
      continue;
    }

    const READ = new Set([
      "__keys", "image", "productcode", "producttype", "price", "series",
      "releasejp", "releaseus", "releaseca", "releaseau", "releasekr",
      "nextrb", "prevrb", "name", "caption", "jpname", "romajiname",
    ]);
    for (const raw of box?.__keys ?? []) {
      const k = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (READ.has(k) || k.startsWith("image")) continue;
      if (!cleanValue(box[k] ?? box[raw])) continue;
      unmapped.set(k, (unmapped.get(k) ?? 0) + 1);
    }

    const type = cleanValue(box?.producttype) || null;
    if (type) byType[type] = (byType[type] ?? 0) + 1;
    const codes = productCodes(box?.productcode);

    if (assortment.length) counts.assortment += 1;
    if (breakdown.counts.length) counts.breakdown += 1;
    if (gallery.length) counts.gallery += 1;
    if (assortment.some((a) => a.isPrize)) counts.prize += 1;
    if (assortment.some((a) => a.newToSeries)) counts.newToSeries += 1;
    if (codes.length) counts.productCode += 1;
    if (cleanValue(box?.price)) counts.price += 1;
    if (cleanValue(box?.series)) counts.series += 1;

    out[slug] = {
      slug,
      name: cleanValue(box?.name) || title,
      ...(type ? { productType: type } : {}),
      ...(codes.length ? { productCodes: codes } : {}),
      ...(cleanValue(box?.price) ? { price: cleanValue(box.price) } : {}),
      ...(cleanValue(box?.series) ? { series: cleanValue(box.series) } : {}),
      ...(cleanValue(box?.jpname) ? { jpName: cleanValue(box.jpname) } : {}),
      ...(cleanValue(box?.releasejp) ? { releaseJP: cleanValue(box.releasejp) } : {}),
      ...(cleanValue(box?.releaseus) ? { releaseUS: cleanValue(box.releaseus) } : {}),
      ...(cleanValue(box?.releaseca) ? { releaseCA: cleanValue(box.releaseca) } : {}),
      ...(imageFilename(box?.image) ? { boxImage: imageFilename(box.image) } : {}),
      ...(assortment.length ? { assortment } : {}),
      ...(breakdown.counts.length
        ? { breakdown: breakdown.counts, ...(breakdown.cartonSize ? { cartonSize: breakdown.cartonSize } : {}) }
        : {}),
      ...(gallery.length ? { gallery } : {}),
      /* The random-booster chain, so a series can be walked in order. */
      ...(cleanValue(box?.nextrb) ? { nextProduct: cleanValue(box.nextrb) } : {}),
      ...(cleanValue(box?.prevrb) ? { previousProduct: cleanValue(box.prevrb) } : {}),
      sourceUrl: WIKI + encodeURIComponent(title.replace(/ /g, "_")),
      source: "fandom-infobox",
    };
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "wiki-products.json"),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "product-extraction-report.json"),
    `${JSON.stringify(
      {
        note:
          "Written by scripts/extract-wiki-products.mjs from linka/api-products-2026-10. " +
          "Facts only. `assortment` carries the per-item code and the (Prize) marker; " +
          "`breakdown` carries per-carton counts, which are PULL ODDS and exist in no " +
          "other source we hold. Bold in the display half of a link means 'new to the " +
          "series' and is recorded as newToSeries.",
        crawlDir: CRAWL,
        pagesRead: pages,
        withInfobox: withBox,
        skippedAsBeyPage: skippedAsBey,
        productsExtracted: Object.keys(out).length,
        coverage: counts,
        byProductType: Object.fromEntries(Object.entries(byType).sort((a, b) => b[1] - a[1])),
        unmappedInfoboxKeys: Object.fromEntries([...unmapped.entries()].sort((a, b) => b[1] - a[1])),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  log(`[extract-wiki-products] ${pages} pages, ${withBox} with an infobox`);
  log(`  products extracted: ${Object.keys(out).length}`);
  log(`  skipped as bey pages: ${skippedAsBey}  (already in wiki-beys.json)`);
  log("");
  for (const [k, v] of Object.entries(counts)) log(`  ${k.padEnd(14)} ${String(v).padStart(4)}`);
  log("\n  by product type:");
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 14)) {
    log(`    ${k.padEnd(28)} ${v}`);
  }
  const un = [...unmapped.entries()].sort((a, b) => b[1] - a[1]);
  if (un.length) {
    log(`\n  🛑 ${un.length} unmapped infobox key(s):`);
    for (const [k, n] of un.slice(0, 15)) log(`     ${k.padEnd(22)} ${n}`);
  }
}

main();
