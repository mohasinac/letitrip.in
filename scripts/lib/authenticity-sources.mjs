/*
 * WHY: The authenticity knowledge base is delivered THREE ways — bundled TS for
 *      the engine (zero Firestore reads, Rule #6), a Firestore collection for
 *      admin access and ad-hoc lookup, and the generation table rendered on the
 *      public page. Three emitters parsing the same sources independently is
 *      Root Cause #75's shape: the copies agree until one of them learns
 *      something, and then they silently disagree forever.
 *
 * WHAT: The ONE parse of each primary source. Every generator imports from here
 *       and emits; none of them parses.
 *
 * Sources:
 *   docs/research/bey-corpus-2026-10/canonical-beys.json
 *   docs/research/beyblade-authenticity-2026-10/sources/reddit-kzyzt1.md
 *
 * Provenance and the reasoning behind every rule:
 *   docs/research/beyblade-authenticity-2026-10/README.md
 */
import fs from "node:fs";
import path from "node:path";
import { categoryIdForModel } from "./bey-model-id.mjs";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/research/bey-corpus-2026-10/canonical-beys.json");
const REDDIT = path.join(ROOT, "docs/research/beyblade-authenticity-2026-10/sources/reddit-kzyzt1.md");

/**
 * Corpus `era` -> our generation id. Deliberately exhaustive rather than a
 * prefix match: an unmapped era must be a loud failure, because silently
 * dropping a generation would make every bey in it "unknown" at the exact
 * moment the tool claims to cover it.
 */
const ERA_TO_GENERATION = {
  "gen1/plastic": "plastic",
  "gen1/hms": "hms",
  "gen2/mfb": "mfb",
  "gen2/zerog": "zerog",
  "gen3/burst": "burst",
  "gen3/god": "burst",
  "gen3/choz": "burst",
  "gen3/gt": "burst",
  "gen3/superking": "burst",
  "gen3/bu": "burst",
  "gen3/db": "burst",
  "gen4/bx": "x",
};

/* ------------------------------------------------------------- canonical -- */

/** 220 canonical releases with their product code, era and lookup aliases. */
export function buildCanonicalIndex() {
  const raw = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
  const rows = raw.canonical;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`authenticity-sources: no canonical rows in ${CORPUS}`);
  }

  const unmappedEras = new Set();
  const entries = [];

  for (const row of rows) {
    const era = String(row.era ?? "");
    const generation = ERA_TO_GENERATION[era];
    if (!generation) {
      unmappedEras.add(era || "(empty)");
      continue;
    }

    /*
     * A bey with no product code is still worth indexing: the name lookup and
     * the generation answer both work without one, and ~34 corpus rows
     * legitimately have no retail code (anime-only, prize, or part-of-set).
     * Only the name-vs-code consistency check needs the code, and it skips null.
     */
    const code = String(row.productCode ?? "").trim() || null;

    /*
     * Aliases feed the lookup, not the display. `altNames` carries the Japanese
     * and romanised forms, `hasbroName` the Western retail name — a buyer in
     * India is as likely to type the Hasbro name as the Takara Tomy one, and
     * treating that as "unknown bey" would be the tool failing on a real product.
     */
    const aliases = [
      ...(Array.isArray(row.altNames) ? row.altNames : []),
      ...(Array.isArray(row.aliases) ? row.aliases : []),
      row.hasbroName,
    ]
      .map((a) => String(a ?? "").trim())
      .filter((a) => a.length > 1 && a !== row.name);

    entries.push({
      slug: String(row.slug),
      name: String(row.name),
      code,
      generation,
      /*
       * 🛑 From the SHARED helper, never a re-derived slug. CLAUDE.md records
       * that re-deriving it mismatched 58 of 195 ids against the real category
       * leaves — and here a mismatch sends a buyer to a 404 instead of the
       * model's own page.
       */
      categoryId: categoryIdForModel(row),
      aliases: [...new Set(aliases)],
    });
  }

  if (unmappedEras.size > 0) {
    throw new Error(
      `authenticity-sources: ${unmappedEras.size} unmapped era(s): ` +
        `${[...unmappedEras].join(", ")}. Add them to ERA_TO_GENERATION.`,
    );
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  return entries;
}

/* ------------------------------------------------------------- date codes -- */

/** Strip markdown emphasis from a product label so it renders as plain text. */
const cleanLabel = (s) =>
  s
    .replace(/\*+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

/** `A`..`L` -> 1..12. The post's stated rule: the letter is the month. */
const MONTH_OF = (letter) => letter.toUpperCase().charCodeAt(0) - 64;

const CODE_RE = /^([A-L])(\d{2})(\d{2})$/;
const YEAR_HEADER_RE = /^\*Year (\d{4})\* \*\*\[(\d+)x?\]\*\*/;

/**
 * A row looks like:
 *   * Big Bang Pegasus: **C1011** = 10.03.2011
 *   * 7x Phantom Orion: **I2611** (*Sonokong*) = 26.09.2011
 *   * Pisces DF145BS: **F2810** (*Random Booster TT*) = 28.06.2010
 */
const ROW_RE = /^\*\s+(.+?):\s+\*\*([A-Za-z]\d{4})\*\*\s*(?:\(\*([^*]+)\*\))?\s*(?:=\s*([0-9.]+))?/;

/** Which of the post's own sections a line belongs to. */
function sectionOf(line, current) {
  if (/^\*\*Original \*Takara-Tomy\* codes\*\*/.test(line)) return "original";
  if (/^\*\*Mid-fake codes\*\*/.test(line)) return "midfake";
  if (/Seen on several \*MFB\*/.test(line)) return "midfake";
  if (/^\*\*Unclear\*\*/.test(line)) return "unclear";
  if (/^\*\*100% Fakes\*\*/.test(line)) return "fake-brand";
  if (
    /^\*\*MFB Product List|^\*\*Additional Information|^\*\*Metal Fusion\*\*|^\*\*Metal Masters\*\*|^\*\*Metal Fury\*\*|^\*\*Shogun Steel\*\*/.test(
      line,
    )
  )
    return "release-list";
  if (/^\*\*Mid-fake proof video|^\*\*Sources:/.test(line)) return "tail";
  return current;
}

/**
 * The three box-code tables, grouped by code.
 *
 * 🛑 THE DATE IS DERIVED FROM THE CODE, never read from the post's own date
 * text. The post contains six codes whose written date contradicts its own
 * stated rule, and a parser that trusted the prose would ship all six. Where
 * they disagree the row records `sourceDateDiffers` so the UI can say the source
 * is internally inconsistent there rather than silently picking a side.
 *
 * 🛑 It derives under the MONTH-DAY-YEAR reading only, because that is the
 * reading the post states and uses throughout. That reading is DISPUTED — a
 * factory/week/year reading also circulates — which is why the engine shows both
 * at runtime. This is the post's table, not a ruling on the decoding.
 */
export function buildDateCodeTables() {
  const text = fs.readFileSync(REDDIT, "utf8");

  const rows = [];
  const yearClaims = new Map();
  let section = null;
  let currentYear = null;
  let unparsedCodeLines = 0;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    section = sectionOf(line, section);
    if (!section || section === "release-list" || section === "tail") continue;

    const yh = YEAR_HEADER_RE.exec(line);
    if (yh) {
      currentYear = yh[1];
      yearClaims.set(currentYear, { claimed: Number(yh[2]), actual: 0 });
      continue;
    }
    const isCodeBullet = /^\*\s/.test(line) && /\*\*[A-Za-z]\d{4}\*\*/.test(line);
    if (section === "original" && currentYear && isCodeBullet) {
      yearClaims.get(currentYear).actual += 1;
    }

    const m = ROW_RE.exec(line);
    if (!m) {
      if (isCodeBullet) unparsedCodeLines += 1;
      continue;
    }

    const [, labelRaw, code, distributorRaw, statedDate] = m;
    const product = cleanLabel(labelRaw.replace(/^\d+x\s+/i, ""));
    const quantitySeen = Number((/^(\d+)x\s/i.exec(labelRaw) ?? [, "1"])[1]);
    const cm = CODE_RE.exec(code);

    let derivedDate = null;
    if (cm) {
      const [, letter, dd, yy] = cm;
      const day = Number(dd);
      if (day >= 1 && day <= 31) {
        derivedDate = `${String(day).padStart(2, "0")}.${String(MONTH_OF(letter)).padStart(2, "0")}.${2000 + Number(yy)}`;
      }
    }

    rows.push({
      code: code.toUpperCase(),
      product,
      quantitySeen,
      distributor: distributorRaw?.trim() ?? null,
      section,
      derivedDate,
      statedDate: statedDate ?? null,
      statedDiffers: Boolean(statedDate && derivedDate && statedDate !== derivedDate),
    });
  }

  if (unparsedCodeLines > 1) {
    /*
     * One unparsed bullet is EXPECTED: the decoder key at the top of the post
     * (`* **A0813** = 08.01.2013`) carries a code and no product label. More
     * than that means the source format drifted.
     */
    throw new Error(
      `authenticity-sources: ${unparsedCodeLines} bullets carry a code but did not parse ` +
        `(1 is expected — the decoder key). Fix ROW_RE rather than shipping a partial table.`,
    );
  }

  const originals = rows.filter((r) => r.section === "original");
  const midfakes = rows.filter((r) => r.section === "midfake");
  const unclear = rows.filter((r) => r.section === "unclear");

  /*
   * 🛑 The floor is 98 because 98 is what the post ACTUALLY LISTS. Its own
   * per-year headers claim 111 and three of five are inflated. The first
   * version of this guard trusted the 111 and failed the whole run — the right
   * direction of failure with the wrong number (Root Cause #84).
   */
  const MIN_ORIGINAL_ROWS = 98;
  if (originals.length < MIN_ORIGINAL_ROWS) {
    throw new Error(
      `authenticity-sources: only ${originals.length} original rows parsed, expected at least ` +
        `${MIN_ORIGINAL_ROWS}. Refusing to ship a truncated table — a missing code reads to a user ` +
        `as "unknown code", which is the one answer this table exists to prevent.`,
    );
  }

  /** Group by code: several products legitimately share one production date. */
  const group = (list) => {
    const map = new Map();
    for (const r of list) {
      const cur = map.get(r.code) ?? {
        code: r.code,
        products: [],
        distributors: new Set(),
        derivedDate: r.derivedDate,
        statedDiffers: false,
      };
      cur.products.push(r.product);
      if (r.distributor) cur.distributors.add(r.distributor);
      if (r.statedDiffers) cur.statedDiffers = true;
      map.set(r.code, cur);
    }
    return [...map.values()]
      .map((g) => ({
        ...g,
        distributors: [...g.distributors],
        products: [...new Set(g.products)],
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  return {
    original: group(originals),
    midfake: group(midfakes),
    unclear: group(unclear),
    counts: {
      originalRows: originals.length,
      midfakeRows: midfakes.length,
      unclearRows: unclear.length,
    },
    yearGaps: [...yearClaims.entries()]
      .filter(([, v]) => v.claimed !== v.actual)
      .map(([y, v]) => `${y}: source claims ${v.claimed}, lists ${v.actual}`),
  };
}
