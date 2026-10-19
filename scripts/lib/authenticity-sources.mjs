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
 *   docs/research/beyblade-authenticity-2026-10/sources/godkillgroth-model-codes.md
 *   docs/research/beyblade-authenticity-2026-10/sources/godkillgroth-midfake-codes.md
 *
 * Provenance and the reasoning behind every rule:
 *   docs/research/beyblade-authenticity-2026-10/README.md
 */
import fs from "node:fs";
import path from "node:path";
import { categoryIdForModel } from "./bey-model-id.mjs";

const ROOT = process.cwd();
const CORPUS = path.join(ROOT, "docs/research/bey-corpus-2026-10/canonical-beys.json");
const SOURCE_DIR = path.join(ROOT, "docs/research/beyblade-authenticity-2026-10/sources");
const REDDIT = path.join(SOURCE_DIR, "reddit-kzyzt1.md");
const MODEL_CODES = path.join(SOURCE_DIR, "godkillgroth-model-codes.md");
const MIDFAKE_CODES = path.join(SOURCE_DIR, "godkillgroth-midfake-codes.md");

/**
 * Which archived file a row came from. Carried all the way to the engine,
 * because the three do NOT deserve equal weight: the reddit post has a public
 * permalink, a score and a comment thread; the two later files were handed over
 * as a file drop with no URL recorded. A code both sources agree on is a
 * stronger claim than one only the undated drop makes, and the engine says so
 * rather than flattening them into one "the table says".
 */
export const SOURCE_IDS = Object.freeze({
  reddit: "reddit-kzyzt1",
  models: "godkillgroth-model-codes",
  midfakes: "godkillgroth-midfake-codes",
});

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
 * A row in the reddit post looks like:
 *   * Big Bang Pegasus: **C1011** = 10.03.2011
 *   * 7x Phantom Orion: **I2611** (*Sonokong*) = 26.09.2011
 *   * Pisces DF145BS: **F2810** (*Random Booster TT*) = 28.06.2010
 */
const ROW_RE = /^\*\s+(.+?):\s+\*\*([A-Za-z]\d{4})\*\*\s*(?:\(\*([^*]+)\*\))?\s*(?:=\s*([0-9.]+))?/;

/**
 * Region of sale, derived from a distributor header or a parenthetical.
 *
 * 🛑 ORDER IS LOAD-BEARING TWICE, and both cases are real rows in the sources:
 *
 *  - EVERY header in the model list begins "Takara Tomy", so a bare
 *    `takara tomy` pattern claims all 777 rows for Japan. It matched 454 rows
 *    and erased Taiwan, Hong Kong and Indonesia entirely on the first run here.
 *    Japan is therefore matched on `Japanese` / `JP release` / the reddit post's
 *    exact `Takara Tomy` parenthetical — never on the words appearing anywhere.
 *  - "Takara Tomy JP release with sticker in Indonesian" is a JAPANESE box
 *    carrying an importer sticker, not an Indonesian release, so Japan must be
 *    tested before Indonesia.
 *
 * An unmatched header throws rather than defaulting, because a region silently
 * becoming "unknown" is how a buyer gets told their Korean Sonokong box is
 * unrecorded when it is recorded under Korea.
 */
const REGION_PATTERNS = [
  { re: /taiwan/i, label: "Taiwan (Funbox Toys)" },
  { re: /hong kong|mani limited/i, label: "Hong Kong (Mani Limited)" },
  { re: /korean|sonokong/i, label: "Korea (Sonokong)" },
  { re: /middle east|newboy|new boy/i, label: "Middle East (NewBoy)" },
  { re: /japanese|jp\s+release|^takara[- ]tomy$|random booster tt/i, label: "Japan" },
  { re: /indonesian|indonesia/i, label: "Indonesia" },
];

function regionOf(header) {
  for (const { re, label } of REGION_PATTERNS) if (re.test(header)) return label;
  return null;
}

/** "Starter" / "Booster" / "Random Booster Vol. 8 Jade Jupiter", where stated. */
function packagingOf(header) {
  const rb = /random booster[^()]*/i.exec(header);
  if (rb) return cleanLabel(rb[0]);
  if (/exclusive/i.test(header)) return "Japanese exclusive";
  if (/starter/i.test(header)) return "Starter";
  if (/booster/i.test(header)) return "Booster";
  return null;
}

/** Date under the month-day-year reading the post states. Null outside A–L. */
function derivedDateOf(code) {
  const cm = CODE_RE.exec(code);
  if (!cm) return null;
  const [, letter, dd, yy] = cm;
  const day = Number(dd);
  if (day < 1 || day > 31) return null;
  return `${String(day).padStart(2, "0")}.${String(MONTH_OF(letter)).padStart(2, "0")}.${2000 + Number(yy)}`;
}

/** Which of the reddit post's own sections a line belongs to. */
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

/** "April 5, 2009" -> {iso: "2009-04-05", label: "5 April 2009"}. */
function parseLongDate(text) {
  const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const monthIndex = MONTH_NAMES_LONG.indexOf(m[1]);
  if (monthIndex < 0) return null;
  const day = Number(m[2]);
  const year = m[3];
  const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { iso, label: `${day} ${m[1]} ${year}` };
}

const MONTH_NAMES_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Which generation a named production series belongs to. */
const SERIES_TO_GENERATION = {
  "Metal Fusion": "mfb",
  "Metal Masters": "mfb",
  "Metal Fury": "mfb",
  "Shogun Steel": "zerog",
};

const SERIES_LINE_RE = /^\*\s+(.+?)\s+[–-]\s+(.+?)\s+\(([^)]+)\)\s*$/;

/**
 * The post's own "Additional Information" block: four named production
 * windows, each with a start and end date and which series it names.
 *
 *   * April 5, 2009 – March 28, 2010 (Metal Fusion)
 *   * April 4, 2010 – March 27, 2011 (Metal Masters)
 *   * April 3, 2011 – April 1, 2012 (Metal Fury)
 *   * April 8, 2012 – December 23, 2012 (Shogun Steel)
 *
 * 🛑 This is the ONLY place in any of the three sources that states a
 * manufacturing WINDOW rather than a single box-code date — it is what lets
 * the engine say "this falls inside the Metal Fury production run" as a fact
 * about the calendar rather than about any one code.
 */
function parseSeriesWindows(text) {
  const lines = text.split("\n").map((l) => l.trim());
  const startIdx = lines.findIndex((l) => /^\*\*Additional Information\*\*/.test(l));
  if (startIdx < 0) {
    throw new Error("authenticity-sources: 'Additional Information' section not found in the reddit post");
  }
  const endIdx = lines.findIndex((l, i) => i > startIdx && /^\*\*MFB Product List/.test(l));
  const block = lines.slice(startIdx, endIdx > 0 ? endIdx : startIdx + 10);

  const windows = [];
  for (const line of block) {
    const m = SERIES_LINE_RE.exec(line);
    if (!m) continue;
    const start = parseLongDate(m[1]);
    const end = parseLongDate(m[2]);
    const name = m[3].trim();
    if (!start || !end) continue;
    const generation = SERIES_TO_GENERATION[name];
    if (!generation) {
      throw new Error(
        `authenticity-sources: production window names an unmapped series "${name}". ` +
          `Add it to SERIES_TO_GENERATION.`,
      );
    }
    windows.push({ name, generation, startIso: start.iso, startLabel: start.label, endIso: end.iso, endLabel: end.label });
  }

  if (windows.length < 4) {
    throw new Error(
      `authenticity-sources: parsed only ${windows.length} production window(s) from 'Additional ` +
        `Information', expected 4. The source format drifted.`,
    );
  }
  return windows;
}

/** The four Metal-series production windows, parsed once. */
export function buildSeriesWindows() {
  return parseSeriesWindows(fs.readFileSync(REDDIT, "utf8"));
}

/**
 * The reddit post's three tables, as flat rows.
 *
 * 🛑 THE DATE IS DERIVED FROM THE CODE, never read from the post's own date
 * text. The post contains six codes whose written date contradicts its own
 * stated rule, and a parser that trusted the prose would ship all six. Where
 * they disagree the row records `statedDiffers` so the UI can say the source is
 * internally inconsistent there rather than silently picking a side.
 */
function parseRedditPost() {
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
    let product = cleanLabel(labelRaw.replace(/^\d+x\s+/i, ""));

    /*
     * The unclear rows carry their region INSIDE the label — `Poison Serpent
     * (New Boy "arabic version")`. Lifting it into `regions` is what lets the
     * later model-by-model list resolve those five rows: both sources then
     * describe the same thing (a New Boy regional release) in the same field,
     * instead of one saying it in prose where nothing can compare it.
     */
    const inLabel = /\(([^)]*(?:new boy|newboy|sonokong|arabic)[^)]*)\)/i.exec(product);
    if (inLabel) product = cleanLabel(product.replace(inLabel[0], ""));

    const regionSource = `${distributorRaw ?? ""} ${inLabel?.[1] ?? ""}`.trim();
    const derivedDate = derivedDateOf(code.toUpperCase());

    rows.push({
      code: code.toUpperCase(),
      product,
      /*
       * `Takara Tomy` and `Random Booster TT` both mean a Japanese release; the
       * second also tells us the packaging, which is what the engine's Random
       * Booster exception is about. A row in the ORIGINAL section with no
       * parenthetical takes the post's own default, stated in its header:
       * Takara-Tomy Japan.
       *
       * 🛑 That default stops at the section boundary. A midfake row carries no
       * region at all unless one is stated — the midfake batches are Taiwanese
       * production under Takara-Tomy blueprints, so inheriting "Japan" would
       * have the table assert a Japanese release for the one class of row where
       * that is the opposite of what the source says.
       */
      region: regionSource ? regionOf(regionSource) : section === "original" ? "Japan" : null,
      packaging: regionSource ? packagingOf(regionSource) : null,
      note: null,
      uncertain: false,
      family: section === "midfake" ? "taiwan-batch" : null,
      source: SOURCE_IDS.reddit,
      section,
      derivedDate,
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
      `authenticity-sources: ${unparsedCodeLines} bullets in the reddit post carry a code but did ` +
        `not parse (1 is expected — the decoder key). Fix ROW_RE rather than shipping a partial table.`,
    );
  }

  /*
   * 🛑 The floor is 98 because 98 is what the post ACTUALLY LISTS. Its own
   * per-year headers claim 111 and three of five are inflated. The first
   * version of this guard trusted the 111 and failed the whole run — the right
   * direction of failure with the wrong number (Root Cause #84).
   */
  const MIN_ORIGINAL_ROWS = 98;
  const originals = rows.filter((r) => r.section === "original").length;
  if (originals < MIN_ORIGINAL_ROWS) {
    throw new Error(
      `authenticity-sources: only ${originals} original rows parsed from the reddit post, expected at ` +
        `least ${MIN_ORIGINAL_ROWS}. Refusing to ship a truncated table — a missing code reads to a ` +
        `user as "unknown code", which is the one answer this table exists to prevent.`,
    );
  }

  return {
    rows,
    yearGaps: [...yearClaims.entries()]
      .filter(([, v]) => v.claimed !== v.actual)
      .map(([y, v]) => `${y}: source claims ${v.claimed}, lists ${v.actual}`),
  };
}

/** One letter, four digits, optionally a second code, a `?`, and a note. */
const MODEL_CODE_LINE =
  /^([A-La-l]\d{4})(?:\s*\/\s*([A-La-l]\d{4}))?\s*(\?)?\s*(?:[-–—]\s*(.*)|\((.*)\))?\s*$/;

/**
 * The model-by-model list: 45 models × 6 regions, ~777 rows.
 *
 * Its shape is positional — a model line, then a distributor header, then bare
 * codes — so the classification of a non-code line decides everything. The rule
 * used here is STRUCTURAL rather than a keyword guess: a line is a MODEL header
 * when the next non-empty line is a distributor header, and a per-batch NOTE
 * when the next non-empty line is a code. Four lines in the file are notes
 * ("JP Box with Mani Limited sticker", "Not sure which version", …) and a
 * keyword list would have to be maintained against every future note; the
 * structural rule needs nothing.
 */
function parseModelCodeList() {
  const text = fs.readFileSync(MODEL_CODES, "utf8");
  const lines = text
    .replace(/<!--[\s\S]*?-->/, "") // the archive header this project prepends
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows = [];
  const models = new Set();
  const unmappedHeaders = new Set();
  let model = null;
  let header = null;
  let batchNote = null;

  const isHeader = (l) => /^Takara Tomy/i.test(l);
  const isCode = (l) => MODEL_CODE_LINE.test(l);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isCode(line)) {
      const m = MODEL_CODE_LINE.exec(line);
      const note = cleanLabel(m[4] ?? m[5] ?? "");
      /*
       * `H0610/H0910 - couldn't determine code since the image was blurry` is
       * ONE observation the author could not resolve to one code. Both are
       * recorded and both are marked uncertain, so the engine can say "recorded,
       * but the source could not read it confidently" rather than presenting
       * either as a clean hit.
       */
      const codes = [m[1], m[2]].filter(Boolean).map((c) => c.toUpperCase());
      const uncertain =
        Boolean(m[3]) || codes.length > 1 || /blurry|not sure|couldn|might be|probably|either/i.test(note);

      for (const code of codes) {
        rows.push({
          code,
          product: model,
          region: regionOf(header ?? ""),
          packaging: packagingOf(header ?? ""),
          note: [batchNote, note].filter(Boolean).join(" — ") || null,
          uncertain,
          family: null,
          source: SOURCE_IDS.models,
          section: "original",
          derivedDate: derivedDateOf(code),
          statedDiffers: false,
        });
      }
      continue;
    }

    if (isHeader(line)) {
      header = line;
      batchNote = null;
      if (!regionOf(line)) unmappedHeaders.add(line);
      continue;
    }

    // Model header, or a note attached to the batch that follows it.
    const next = lines[i + 1] ?? "";
    if (isCode(next)) {
      batchNote = line;
      continue;
    }
    model = line.replace(/\s*\|\s*/g, " / ").replace(/\s{2,}/g, " ").trim();
    header = null;
    batchNote = null;
    models.add(model);
  }

  if (unmappedHeaders.size > 0) {
    throw new Error(
      `authenticity-sources: ${unmappedHeaders.size} distributor header(s) map to no region: ` +
        `${[...unmappedHeaders].join(" | ")}. Add a pattern to REGION_PATTERNS — a header that falls ` +
        `through makes every code under it regionless, which reads to a buyer as "not recorded".`,
    );
  }

  const orphaned = rows.filter((r) => !r.product || !r.region);
  if (orphaned.length > 0) {
    throw new Error(
      `authenticity-sources: ${orphaned.length} code row(s) in the model list have no model or no ` +
        `region (first: ${orphaned[0].code}). The file's shape changed; fix the classifier rather ` +
        `than shipping rows that cannot say what they are about.`,
    );
  }

  /*
   * Floors, not equalities: the author adds models and codes over time, and a
   * guard that fails on GROWTH would be a guard everyone learns to edit. These
   * are set just under the 2026-10-19 drop (45 models / 777 rows / 483 codes),
   * and they catch the failure that actually happens — a classifier change that
   * silently drops most of the file.
   */
  const distinct = new Set(rows.map((r) => r.code)).size;
  if (models.size < 44 || rows.length < 760 || distinct < 470) {
    throw new Error(
      `authenticity-sources: the model list parsed to ${models.size} models / ${rows.length} rows / ` +
        `${distinct} distinct codes, below the floor (44 / 760 / 470). Refusing to ship a truncated ` +
        `table — a missing code reads to a user as "unknown code".`,
    );
  }

  return { rows, models: [...models] };
}

/**
 * The midfake list: two families, and they are NOT the same claim.
 *
 * - `sonokong-highquality` — Korean boxes that reproduce the importer panel,
 *   both logos and a plausible barcode. The source's own side-by-side photo is
 *   archived next to it. Packaging inspection does not settle these.
 * - `chinese-font` — the author's note is the whole point: "the code itself
 *   should be authentic however the font looks like a midfake one". For this
 *   family the CODE is not the discriminator and the engine must not pretend it
 *   is; the printed typeface is.
 */
function parseMidfakeList() {
  const text = fs.readFileSync(MIDFAKE_CODES, "utf8");
  const rows = [];
  let family = null;

  const SINGLE = /^([A-La-l]\d{4})\s*(?:[-–—]\s*(.*))?$/;
  const MULTI = /^([A-La-l]\d{4}(?:\s*,\s*[A-La-l]\d{4})+)\s*(?:[-–—]\s*(.*))?$/;

  for (const rawLine of text.replace(/<!--[\s\S]*?-->/, "").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("![") || /^https?:/.test(line) || /discord\.gg/.test(line)) continue;

    const multi = MULTI.exec(line);
    const single = multi ? null : SINGLE.exec(line);
    if (multi || single) {
      const note = cleanLabel((multi?.[2] ?? single?.[2]) ?? "");
      const codes = (multi ? multi[1].split(/\s*,\s*/) : [single[1]]).map((c) => c.trim().toUpperCase());
      for (const code of codes) {
        rows.push({
          code,
          product: null,
          region: family === "sonokong-highquality" ? "Korea (Sonokong)" : null,
          packaging: null,
          note: note || null,
          /*
           * The author's own hedge on three of these — "the code itself should
           * be authentic however the font looks like a midfake one" — is
           * carried as uncertainty, not dropped. It is the difference between
           * "this code is a midfake code" and "this code has been seen printed
           * in the midfake typeface", and only the second is what was claimed.
           */
          uncertain: /should be authentic|not sure|appears on/i.test(note),
          family,
          source: SOURCE_IDS.midfakes,
          section: "midfake",
          derivedDate: derivedDateOf(code),
          statedDiffers: false,
        });
      }
      continue;
    }

    if (/sonokong/i.test(line)) family = "sonokong-highquality";
    else if (/chinese/i.test(line)) family = "chinese-font";
  }

  const unfamilied = rows.filter((r) => !r.family);
  if (unfamilied.length > 0) {
    throw new Error(
      `authenticity-sources: ${unfamilied.length} midfake code(s) parsed before any family heading ` +
        `(first: ${unfamilied[0].code}). The two families mean different things — one is a copied ` +
        `box, the other is a typeface on a genuine-looking code — so a familyless row cannot be shown.`,
    );
  }
  if (rows.length < 20) {
    throw new Error(
      `authenticity-sources: only ${rows.length} midfake rows parsed, expected at least 20.`,
    );
  }

  return rows;
}

/**
 * Group flat rows by code, unioning everything that can legitimately differ
 * between two observations of the same production batch.
 */
function groupByCode(list) {
  const map = new Map();
  for (const r of list) {
    const cur = map.get(r.code) ?? {
      code: r.code,
      products: new Set(),
      regions: new Set(),
      packaging: new Set(),
      notes: new Set(),
      families: new Set(),
      sources: new Set(),
      uncertain: false,
      derivedDate: r.derivedDate,
      statedDiffers: false,
    };
    if (r.product) cur.products.add(r.product);
    if (r.region) cur.regions.add(r.region);
    if (r.packaging) cur.packaging.add(r.packaging);
    if (r.note) cur.notes.add(r.note);
    if (r.family) cur.families.add(r.family);
    cur.sources.add(r.source);
    if (r.uncertain) cur.uncertain = true;
    if (r.statedDiffers) cur.statedDiffers = true;
    map.set(r.code, cur);
  }
  return [...map.values()]
    .map((g) => ({
      code: g.code,
      products: [...g.products].sort(),
      regions: [...g.regions].sort(),
      packaging: [...g.packaging].sort(),
      notes: [...g.notes],
      families: [...g.families].sort(),
      sources: [...g.sources].sort(),
      uncertain: g.uncertain,
      derivedDate: g.derivedDate,
      statedDiffers: g.statedDiffers,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * The four box-code tables, grouped by code and merged across all three
 * archived sources.
 *
 * 🛑 THE FOURTH TABLE IS THE POINT OF THE MERGE. Measured on the 2026-10-19
 * drop, four codes are recorded as GENUINE by one source and as a midfake batch
 * by another — `I2211` and `I2611` sit in the model-by-model list as Sonokong
 * and Japanese releases while the midfake file lists them as Sonokong
 * high-quality fakes, and `I0511` / `J2712` are in the reddit post's original
 * table while the midfake file lists them as Chinese midfake-font codes.
 *
 * Resolving that by table precedence would be a coin flip with a person's money
 * on it in both directions: call them midfake and the tool accuses the holder of
 * a genuine box; call them original and it reassures the holder of a fake. So
 * they go in their own table, the engine reports BOTH readings, and the verdict
 * it produces is "resolve this before you pay" rather than either answer.
 *
 * 🛑 It also RESOLVES the reddit post's five "unclear" rows rather than leaving
 * them hedged forever. Those are New Boy (Middle East) codes the post could only
 * say "seem legit" about; the later model list records every one of them under a
 * New Boy release of the same bey. A code the newer source records as a genuine
 * regional release is promoted to the original table, carrying the earlier
 * hedge in its notes so the upgrade is visible rather than silent.
 */
export function buildDateCodeTables() {
  const reddit = parseRedditPost();
  const models = parseModelCodeList();
  const midfakes = parseMidfakeList();

  const all = [...reddit.rows, ...models.rows, ...midfakes];

  const originalRows = all.filter((r) => r.section === "original");
  const midfakeRows = all.filter((r) => r.section === "midfake");
  const unclearRows = all.filter((r) => r.section === "unclear");

  const originalCodes = new Set(originalRows.map((r) => r.code));
  const midfakeCodes = new Set(midfakeRows.map((r) => r.code));

  /* The five New Boy rows the model list settles. */
  const resolvedUnclear = unclearRows.filter((r) => originalCodes.has(r.code));
  const stillUnclear = unclearRows.filter((r) => !originalCodes.has(r.code));
  const promoted = resolvedUnclear.map((r) => ({
    ...r,
    section: "original",
    note: [r.note, "The 2021 post could only say this New Boy regional code 'seems legit'; the later model-by-model list records it as a genuine New Boy release."]
      .filter(Boolean)
      .join(" — "),
  }));

  const contestedCodes = new Set([...midfakeCodes].filter((c) => originalCodes.has(c)));

  const take = (rows) => rows.filter((r) => !contestedCodes.has(r.code));

  const original = groupByCode(take([...originalRows, ...promoted]));
  const midfake = groupByCode(take(midfakeRows));
  const unclear = groupByCode(stillUnclear);
  const contested = groupByCode(
    [...originalRows, ...promoted, ...midfakeRows].filter((r) => contestedCodes.has(r.code)),
  ).map((g) => ({
    ...g,
    /** Which side of the disagreement each source is on, for the engine's copy. */
    recordedOriginalBy: [
      ...new Set(
        [...originalRows, ...promoted].filter((r) => r.code === g.code).map((r) => r.source),
      ),
    ].sort(),
    recordedMidfakeBy: [
      ...new Set(midfakeRows.filter((r) => r.code === g.code).map((r) => r.source)),
    ].sort(),
  }));

  return {
    original,
    midfake,
    unclear,
    contested,
    seriesWindows: buildSeriesWindows(),
    models: models.models,
    counts: {
      originalRows: originalRows.length + promoted.length,
      midfakeRows: midfakeRows.length,
      unclearRows: unclearRows.length,
      resolvedUnclear: resolvedUnclear.length,
      contestedCodes: contestedCodes.size,
      redditRows: reddit.rows.length,
      modelListRows: models.rows.length,
      midfakeListRows: midfakes.length,
      models: models.models.length,
    },
    yearGaps: reddit.yearGaps,
  };
}
