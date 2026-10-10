#!/usr/bin/env node
/**
 * B4 — canonicalise product identity from the LOCAL corpus.
 *
 * Parses `linka/beys/**` (a completed crawl the user owns) into the canonical
 * bey list that B5/B6 seed from, applying the three mandatory normalisers and
 * routing anything that self-flags to a REVIEW list rather than guessing.
 *
 * ## Why local rather than the Beyblade Wiki
 *
 * The plan originally called for a network crawl of beyblade.fandom.com. Its
 * HTML returns 403 even with a full browser header set, so that needed
 * throttling and a workaround. This corpus is already on disk, has no rate
 * limit, and — being facts (names, codes, types, weights, dates) — carries no
 * licensing question. The Wiki API stays the gap-filler for JP/romaji names.
 *
 * ## 🛑 Three normalisers, and skipping any one reproduces Root Cause #33
 *
 * A filter value that is not a stored value returns zero rows, silently,
 * forever. The corpus has 100% `Type` coverage in ~90 spellings and 97% `Spin`
 * in 54, so seeding it raw would produce one-off strings like
 * `feature-attack-hammer-variant-heavy-slow-smash` — a vocabulary that has
 * already failed.
 *
 *   Type         -> the 4-value enum (leading enum word; parenthetical kept as prose)
 *   Spin         -> right | left | dual
 *   Product Code -> bare code (strip markdown, split on `/`, keep the marque)
 *
 * ## 🛑 Two exclusions, by PATH or by self-declaration, never by heuristic
 *
 *   game-original/ — the user's own game inventions. A path test, so there is
 *                    no judgement call and no way for one to leak.
 *   never-retailed — `Product Code: none (anime-exclusive…)`, `[VERIFY …]`,
 *                    `(presumed)`. An anime-exclusive bey that never retailed
 *                    is not a catalog leaf; it goes to the review list, not to
 *                    the seed with a guess attached.
 *
 * ## 🛑 The label set differs BY GENERATION, and that is the main trap
 *
 * gen3 docs say `Owner (Anime)` / `Series (anime, JP)` / `Full Name (TT JP)`;
 * gen1 docs say `Owner` / `Series` / `Japanese Name`. A single-label lookup
 * written from reading one gen3 file reports every gen1 doc as missing the
 * field. The first run of this script did exactly that, and the tell was an era
 * histogram far below the known per-directory file counts (gen1/plastic 48 vs
 * 123 files on disk).
 *
 * Label counts measured across all 320 docs, so the candidate lists below are
 * OBSERVED rather than guessed:
 *   Owner 352 · Owner (Anime) 227 · Type 320 · Spin Direction 312 ·
 *   Product Code 299 · System 284 · Generation 279 · Series 252 ·
 *   Succeeded by 136 · Preceded by 90 · Evolution Path 113 ·
 *   Full Name (TT JP) 113 · Full Name 108 · Hasbro EN counterpart 60 ·
 *   Hasbro Name 56 · Also Known As 38 · English/Hasbro Name 22
 *
 * Usage:  node scripts/parse-bey-corpus.mjs [--corpus <path>] [--out <path>]
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const CORPUS = argOf("--corpus", "C:/Users/mohsi/Downloads/Beyblade-Game-master");
const OUT_DIR = argOf("--out", "docs/research/bey-corpus-2026-10");

const BEYS_DIR = join(CORPUS, "linka", "beys");
const CASE_DIR = join(CORPUS, "case study");

if (!existsSync(BEYS_DIR)) {
  console.error(`No corpus at ${BEYS_DIR}`);
  console.error(`Pass --corpus <path to Beyblade-Game-master>.`);
  process.exit(2);
}

// ── field extraction ────────────────────────────────────────────────────────

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * `**Field:** value` on its own line, trying several candidate labels in order.
 *
 * 🛑 A label may carry a TRAILING PARENTHETICAL, and matching it is structural
 * rather than another enumeration. The corpus spells one field nine ways —
 * `Full Name`, `Full Name (TT JP)`, `Full Name (JP/EN)`,
 * `Full Name (Takara canonical)`, `Full Name (Hasbro)`, `Full Name (Takara)` …
 * — and the first version of this function required an exact match, so
 * `Full Name` matched 108 docs and the other spellings matched none. That is
 * how `luinor-l2` lost BOTH its names: its label is `Full Name (JP/EN)` and
 * its value is *"Lost Lúinor L2 (Hasbro stylization) / Lost Longinus (Takara
 * Tomy JP)"*, i.e. the exact TT↔Hasbro pair this corpus is mined for.
 *
 * The casing is already handled by the `i` flag — adding `Hasbro name` beside
 * `Hasbro Name` would have been noise.
 */
function field(body, labels) {
  for (const label of Array.isArray(labels) ? labels : [labels]) {
    const re = new RegExp(`^\\*\\*${escapeRe(label)}(?:\\s*\\([^)]*\\))?:?\\*\\*\\s*(.+)$`, "mi");
    const hit = body.match(re)?.[1]?.trim();
    if (hit) return hit;
  }
  return null;
}

/**
 * Is this value a NAME, or is it prose about a name?
 *
 * 🛑 The label does not tell you. Measured across the corpus: `Hasbro Release`
 * holds *"Appolon G"*, `Hasbro equivalent` holds *"Counter Leone 145D (the
 * Hasbro HWS-era release carries this name; …)"*, and `Hasbro note` holds
 * *"This specific toy (B-156) is a Hasbro western-market exclusive. The Takara
 * Tomy source material …"*. Three labels, three shapes, one of them a
 * paragraph.
 *
 * So the guard is on the VALUE, which is what lets the looser labels be added
 * at all. Without it, a sentence becomes a search alias and every token in it
 * — "this", "specific", "western" — matches the product. That is a search
 * index quietly filling with prose.
 */
function nameLike(s) {
  const v = (s ?? "").trim();
  if (!v || v.length > 60) return false;
  // A sentence: ends with a full stop, or contains one mid-string.
  if (/\.\s/.test(v) || /\.$/.test(v)) return false;
  // Opens like a clause rather than naming a thing.
  if (/^(this|the|released|not|no\b|unknown|none|n\/a|same|see |uses|carries)/i.test(v)) return false;
  // Must contain at least one letter — a bare code belongs on productCode.
  if (!/[a-z]/i.test(v)) return false;
  return true;
}

/**
 * Pull every distinct name out of a `Full Name`-style value.
 *
 * `"King Kerbeus K2 (Hasbro) / Kaiser Kerbeus (Takara Tomy JP)"` is TWO names
 * with their attribution in brackets, so it splits on `/`, drops the
 * attribution, and yields both. `"デスガーゴイル / Desu Gāgoiru"` is a JP name
 * and its romaji, which is also two useful search tokens.
 *
 * `;` splits too — `"Storm Spriggan / ストームスプリガン (Sutōmu Supurigan);
 * Hasbro localized variant = Storm Spryzen S2"` carries a third name after a
 * semicolon and an `=`.
 */
function splitNames(raw) {
  if (!raw) return [];
  const out = [];
  for (const part of stripMd(raw).split(/[/;]/)) {
    let v = part.trim();
    // "Hasbro localized variant = Storm Spryzen S2" -> the right-hand side.
    if (v.includes("=")) v = v.split("=").pop().trim();
    // Strip a trailing attribution bracket: "(Hasbro)", "(Takara Tomy JP)".
    v = v.replace(/\s*\([^)]*\)\s*$/, "").trim();
    /*
     * 🛑 Then an ORPHANED bracket, because splitting on `/` creates them:
     * "Dragoon Galaxy (ドラグーンギャラクシー / Doragūn Gyarakushī)" yields a
     * right-hand side of "Doragūn Gyarakushī)" whose opening bracket went to
     * the other half. The rule above cannot see it — it requires a matching
     * `(` — so the stray `)` rode into a search alias and would have rendered
     * in an "also known as" line.
     */
    v = v.replace(/^[)\]\s]+|[([\s]+$/g, "").trim();
    if (v.split(")").length - 1 !== v.split("(").length - 1) {
      v = v.replace(/[()[\]]/g, "").replace(/\s+/g, " ").trim();
    }
    if (nameLike(v)) out.push(v);
  }
  return Array.from(new Set(out));
}

/**
 * Is this string plausibly a MANUFACTURER?
 *
 * 🛑 Measured: 21 of the 144 rows carrying a `marque` have something that is
 * not one — `"Fukubako 2005 prize bey; not a standard MA-series retail
 * release"`, `"April 2nd, 2016 — 1404¥"`, `"Cho-Z Triple Booster Set"`, and
 * for `luinor-l2` the product NAME `"Lost Lúinor L2 Nine Spiral"`. The
 * parenthetical beside a product code holds whatever the author put there, and
 * the field was named `marque` on the assumption it held a marque.
 *
 * Presented in a description that reads "released by {marque}", the worst of
 * those produces *"released by April 2nd, 2016 — 1404¥"*. So the value is
 * checked against the eight manufacturers that actually make these, and
 * anything else is kept as a release NOTE rather than asserted as a maker.
 */
const KNOWN_MARQUES =
  /^(takara\s*tomy|takara|tomy|tt|hasbro|sonokong|funskool|young\s*toys|newboy|beys\s*&\s*bricks)\b/i;

/**
 * The CHARACTER who owns a bey, pulled out of a prose field.
 *
 * `Owner (Anime)` is 100% populated but it is a sentence, not a name:
 * `"Tyson Granger (Tyson's 9th and final bey)"`,
 * `"Kai Hiwatari (Kai's 7th bey — Dranzer GT → Dranzer MS, after BEGA
 * destroys GT)"`, `"No anime blader signature — Advance Averazer is a
 * competitive WBO standout"`.
 *
 * 🛑 PARENTHETICALS COME OFF FIRST, and getting that order wrong is the same
 * bug as the Salamalyon heading one directory up. Splitting on the em-dash
 * first cuts INSIDE the bracket — `"Tyson Granger (Tyson's 5th bey — Dragoon
 * G …"` becomes the owner `"Tyson Granger (Tyson's 5th bey"` — and that
 * produced 25 phantom owners that were really duplicates of real ones, with
 * Tyson Granger alone splitting four ways. A facet listing "Tyson Granger"
 * and "Tyson Granger (Tyson's 4th bey" as separate bladers is worse than no
 * facet.
 *
 * Returns `null` rather than guessing: a bey with no named blader, or a
 * placeholder like "Various SS-era bladers", must have no owner at all.
 */
const OWNER_PLACEHOLDER =
  /^(various|generic|unknown|none|n\/a|toyline|team\s+\S+\s+member|[\w-]+-line blader|\w+-faction|phoenic)/i;

/**
 * Spelling variants of ONE character. Kept tiny and explicit rather than
 * fuzzy-matched: the corpus writes Eddy Wheeler both ways across two beys of
 * the same line (Trypio and Trypio G), which is strong evidence they are one
 * person — but inferring that from edit distance would silently merge two
 * genuinely different bladers the day two similar names appear.
 */
const OWNER_ALIASES = new Map([["eddie", "Eddy"]]);

function normaliseOwner(raw) {
  if (!raw) return { name: null, note: null };
  const note = stripMd(String(raw)).trim() || null;
  let v = note ?? "";
  if (/^(no\b|none\b|unknown|n\/a|not\s)/i.test(v)) return { name: null, note };

  // 1. Parentheticals off FIRST — closed ones removed, an UNCLOSED one
  //    truncates, because the corpus has several (`"Gary (All Starz"`).
  v = v.replace(/\([^)]*\)/g, " ");
  const open = v.indexOf("(");
  if (open >= 0) v = v.slice(0, open);

  // 2. Then the trailing clause, on any separator the corpus uses.
  v = v.split(/\s+[—–]\s+|\s+-\s+|→|;|,|\//)[0];

  v = v.replace(/\s+/g, " ").trim();

  /*
   * 🛑 A TRAILING `?` MEANS THE CORPUS IS UNSURE — so there is no owner, and
   * stripping the mark to assert the name anyway is the one thing not to do.
   *
   * The real value is `"Tsubasa Otori? / Hyoma? — Legendary Blader of the
   * Sun's domain (varied …)"`: two candidate bladers, both questioned. An
   * earlier version removed the `?` and confidently filed that bey under
   * Tsubasa Otori, which also collided with his two REAL beys at the same
   * slug. B4's standing rule is that a self-flagged row goes to review rather
   * than being seeded with a guess, and a question mark is exactly that flag.
   *
   * (The `.trim()` had to move above this: the `/` split left a trailing
   * space, so a `$`-anchored strip never matched and the `?` survived into a
   * facet value regardless.)
   */
  if (/\?$/.test(v)) return { name: null, note };
  v = v.replace(/["'!.]+$/g, "").trim();

  if (!v || v.length > 40 || !/[a-z]/i.test(v)) return { name: null, note };
  if (OWNER_PLACEHOLDER.test(v)) return { name: null, note };
  return { name: OWNER_ALIASES.get(v.toLowerCase()) ?? v, note };
}

/**
 * Everything before the first em-dash (or ` -- `/` - `) that sits at bracket
 * depth ZERO. Returns the whole string when there is no such separator.
 *
 * See the call site for the single heading that needs this.
 */
function splitAtTopLevelDash(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    else if (depth === 0) {
      if (c === "—" && /\s/.test(s[i - 1] ?? " ")) return s.slice(0, i).trim();
      if (c === "-" && /\s/.test(s[i - 1] ?? "") && /[-\s]/.test(s[i + 1] ?? "")) {
        return s.slice(0, i).trim();
      }
    }
  }
  return s.trim();
}

/** Every value of a repeated label, deduped — lineage uses one line per edge. */
function fieldAll(body, labels) {
  const out = [];
  for (const label of Array.isArray(labels) ? labels : [labels]) {
    const re = new RegExp(`^\\*\\*${escapeRe(label)}:?\\*\\*\\s*(.+)$`, "gmi");
    for (const m of body.matchAll(re)) out.push(m[1].trim());
  }
  return Array.from(new Set(out));
}

const stripMd = (s) => (s ?? "").replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();

// ── normalisers ─────────────────────────────────────────────────────────────

/** Attack / Defense / Stamina / Balance, from ~90 freeform spellings. */
const TYPE_MAP = new Map([
  ["attack", "attack"],
  ["defense", "defense"],
  ["defence", "defense"],
  ["stamina", "stamina"],
  ["balance", "balance"],
  // The corpus's own synonym, used on 5 docs.
  ["endurance", "stamina"],
]);

function normaliseType(raw) {
  if (!raw) return { value: null, qualifier: null, raw: null };
  const clean = stripMd(raw);
  // The leading WORD is the enum; everything after it is prose ABOUT it.
  const lead = clean.match(/^[A-Za-z]+/)?.[0]?.toLowerCase() ?? "";
  const value = TYPE_MAP.get(lead) ?? null;
  const qualifier =
    clean.slice(lead.length).replace(/^[\s—–\-:(]+/, "").replace(/\)$/, "").trim() || null;
  return { value, qualifier, raw: clean };
}

/** right | left | dual, from 54 spellings. */
function normaliseSpin(raw) {
  if (!raw) return { value: null, qualifier: null, raw: null };
  const clean = stripMd(raw).replace(/[⭐✔️❌]/g, "").trim();
  const lower = clean.toLowerCase();
  /*
   * 🛑 The LEADING WORD wins, same rule as `normaliseType` — and getting this
   * wrong is subtle rather than loud.
   *
   * The first version scanned the whole string in the order dual → left →
   * right, reasoning that a dual-spin document mentions both directions. It
   * does, but so does a right-spin document describing a gimmick: the real
   * value `"Right (normal) — REVERSES to Left mid-battle (gimmick)"`
   * resolved to **left**, because "Left" appears in the prose. A right-spin
   * bey filed as left-spin is exactly the kind of wrong that no audit catches
   * and no page renders as an error — it just sits in the wrong facet.
   *
   * So: match the leading word, and keep the whole-string "dual" test only as
   * a fallback for a value that opens with something else.
   */
  const lead = lower.match(/^[a-z]+/)?.[0] ?? "";
  let value =
    lead === "dual" ? "dual" : lead === "left" ? "left" : lead === "right" ? "right" : null;
  if (!value && /\bdual\b/.test(lower)) value = "dual";
  const qualifier =
    clean
      .replace(/^(dual[- ]spin|left[- ]spin|right[- ]spin|dual|left|right)/i, "")
      .replace(/^[\s—–\-:(]+/, "")
      .replace(/\)$/, "")
      .trim() || null;
  return { value, qualifier, raw: clean };
}

/**
 * `**BBG-23** (Takara Tomy)` -> `{ code: "BBG-23", marque: "Takara Tomy" }`
 *
 * Splits on `/` and keeps the FIRST code: `MA-21 (Takara) / TAK14371` is one
 * product with a TT code and a distributor SKU, and the TT code is the one a
 * buyer searches and the one every competitor's Brand field carries.
 *
 * 🛑 `none`, `n/a` and `—` are treated as an EXPLICIT "never retailed", not as
 * a parse failure. The distinction matters: the plan measured `Product Code`
 * coverage at 83% by counting the FIELD, and ~30 of those say `none
 * (anime-exclusive; never released as a retail product)`. Both measurements are
 * right about different things, and this one is the one seeding needs.
 */
/**
 * NEVER RETAILED — exclude from the catalogue entirely.
 *
 * Matched anywhere in the value, not just at the start: the corpus writes these
 * as `❌ None — never released as a physical toy`, and a `^none` anchor is
 * defeated by the emoji. Measured forms: "Anime Exclusive — no retail
 * release", "anime-exclusive / manga-exclusive (no retail … release)",
 * "Not assigned (Takara Tomy)", "never commercially released".
 */
const NEVER_RETAILED_RE =
  /\bnone\b|\bn\/a\b|anime[- ]exclusive|manga[- ]exclusive|anime\/manga exclusive|no retail|never (?:released|commercially)|not assigned/i;

/**
 * RETAILED WITHOUT ITS OWN CODE — keep; it is a real catalogue candidate.
 *
 * 🛑 This is a DIFFERENT thing from "never retailed" and conflating them loses
 * real products. A bey sold only inside a Random Booster did reach shops and
 * does reach our catalogue; it simply has no standalone `A-xx` of its own.
 * Measured forms: "~RBA4 (Takara Random Booster Act 4; no standalone MA-
 * product code)", "Random Booster 10 (Takara, April 2003) — no standalone
 * Takara product code listed", "2023-09-09 (JP, Random Booster Vol.1 prize)".
 */
const NO_STANDALONE_CODE_RE =
  /random booster|bey booster|\bRBA\d|face-?off pack|no individual|not listed in infobox/i;

function normaliseProductCode(raw) {
  const none = { code: null, marque: null, extra: [], neverRetailed: false, boosterOnly: false, raw: null };
  if (!raw) return none;
  const clean = stripMd(raw);

  // Order matters: a Random Booster line often ALSO says "no standalone
  // product code", which NEVER_RETAILED_RE would match on "no retail"… it
  // does not, but the booster test runs first regardless so the distinction
  // cannot be lost to a future widening of the never-retailed pattern.
  if (NO_STANDALONE_CODE_RE.test(clean)) {
    return { ...none, boosterOnly: true, raw: clean };
  }
  if (NEVER_RETAILED_RE.test(clean)) {
    return { ...none, neverRetailed: true, raw: clean };
  }

  const parts = clean.split("/").map((p) => p.trim()).filter(Boolean);
  const first = parts[0] ?? "";
  /*
   * Two shapes, both real:
   *   `B-180`, `BBG-23`, `BX-36`, `MA-21`  — the modern prefixed form
   *   `34 (Takara)`, `40 (Takara catalog number)` — a bare Spin-Gear-era
   *      catalog number. Accepted because it IS the code those products
   *      shipped under; rejecting it sent ~6 real gen1 beys to review.
   */
  const code =
    // `BB-P01` is real (a PSP-exclusive release), so a LETTER may follow the
    // dash before the digits. The first pattern required a digit there and
    // sent that bey to review as unparsed.
    first.match(/^([A-Za-z]{1,4}-?[A-Za-z]?\d+[A-Za-z0-9-]*)/)?.[1] ??
    first.match(/^(\d{1,3})\s*\(/)?.[1] ??
    null;
  const paren = first.match(/\(([^)]*)\)/)?.[1] ?? null;
  return { code, marque: paren, extra: parts.slice(1), neverRetailed: false, boosterOnly: false, raw: clean };
}

/** Anything the corpus itself marks as uncertain. */
const UNCERTAIN_RE = /\[VERIFY|\(presumed\)|\bpresumed\b|anime-exclusive|not sold at retail|never released/i;

// ── parse ───────────────────────────────────────────────────────────────────

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const files = walk(BEYS_DIR).filter((f) => !f.endsWith(`${sep}index.md`));

const canonical = [];
const review = [];
const excluded = [];

for (const file of files) {
  const rel = relative(BEYS_DIR, file).split(sep).join("/");

  // 🛑 PATH test, not a heuristic. These are the user's own game inventions and
  // must never reach the marketplace catalog.
  if (rel.startsWith("game-original/")) {
    excluded.push({ rel, reason: "game-original — the user's own game inventions" });
    continue;
  }

  const body = readFileSync(file, "utf8"); // UTF-8 in Node; PowerShell mangles it.
  /*
   * The heading is `## <Name> — <era descriptor> Bey Doc`, so the name is
   * everything before the first em-dash.
   *
   * 🛑 BALANCE-AWARE, because one heading puts the dash INSIDE its brackets:
   * `## Salamalyon (Salamalyon — Hidden Spirits)`. A plain lazy match stopped
   * at that dash and produced the name `Salamalyon (Salamalyon` — an
   * unbalanced paren which then became the leaf's display name, and which
   * `splitTrailingParenthetical` could not repair downstream because its
   * regex requires a closing bracket.
   *
   * One row of 320, and it is the kind that survives forever: it renders as a
   * plausible-looking name with a stray bracket, and no check anywhere counts
   * brackets. Splitting only at depth 0 fixes the class rather than the row.
   */
  const rawHeading = body.match(/^##\s+(.+?)\s*$/m)?.[1] ?? null;
  const heading = rawHeading ? splitAtTopLevelDash(rawHeading) : null;
  const name = heading ? stripMd(heading).replace(/\s*\.\s*/g, " ").replace(/\s+/g, " ").trim() : null;

  const rawType = field(body, "Type");
  const rawSpin = field(body, ["Spin Direction", "Spin"]);
  /*
   * 🛑 NOT "Release" and NOT "Product Line". `Release` holds a DATE
   * ("July 2002 (Japan)") and `Product Line` holds the Beyblade X TIER
   * ("Basic Line", "Unique Line (UX)", "Custom Line (CX-00)") — 25 of the 33
   * unparsed values came from that one fallback. A label that describes
   * something else is Root Cause #51's shape, and BOTH were found by sampling
   * the unparsed values rather than assuming the regex was at fault.
   *
   * `Product Line` is captured as its own field instead — the Basic/Unique/
   * Custom split is a real tree axis for Beyblade X (see the forest in
   * docs/research/competitor-crawl-2026-10/taxonomy.md).
   */
  const rawCode = field(body, ["Product Code"]);

  const type = normaliseType(rawType);
  const spin = normaliseSpin(rawSpin);
  const code = normaliseProductCode(rawCode);

  const row = {
    file: rel,
    name,
    slug: name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      : null,
    generation: stripMd(field(body, "Generation")) || rel.split("/")[0],
    era: rel.split("/").slice(0, 2).join("/"),
    type: type.value,
    typeQualifier: type.qualifier,
    spin: spin.value,
    spinQualifier: spin.qualifier,
    productCode: code.code,
    /*
     * 🛑 Only a RECOGNISED manufacturer reaches `marque`. See KNOWN_MARQUES —
     * 21 rows carried a set name, a release date or a price here. Everything
     * else is preserved as `releaseNote`, because the information is real and
     * occasionally useful ("Fukubako 2005 prize bey", "PSP game exclusive");
     * it is just not a manufacturer and must never be rendered as one.
     */
    marque: code.marque && KNOWN_MARQUES.test(code.marque) ? code.marque : "",
    releaseNote: code.marque && !KNOWN_MARQUES.test(code.marque) ? code.marque : "",
    /* Retailed inside a booster or pack, so no standalone code of its own. */
    boosterOnly: code.boosterOnly,
    /* Beyblade X tier: Basic (BX) / Unique (UX) / Custom (CX). A tree axis. */
    productLine: stripMd(field(body, ["Product Line"])),
    system: stripMd(field(body, ["Toy line / Layer System", "System", "Part System"])),
    series: stripMd(field(body, ["Series (anime, JP)", "Series"])),
    /*
     * TWO fields, because the prose is worth keeping and is not a name.
     *
     * `ownerName` is the clickable linkage — "Dragoon G -> Tyson Granger" —
     * and becomes a `character`-group feature every listing under that model
     * leaf inherits. `animeOwner` keeps the full sentence, which carries
     * genuinely useful colour ("Tyson's 9th and final bey", "after BEGA
     * destroys GT") that belongs in prose rather than in a facet value.
     */
    ownerName: normaliseOwner(field(body, ["Owner (Anime)", "Owner"])).name,
    animeOwner: stripMd(field(body, ["Owner (Anime)", "Owner"])),
    // 🛑 Three labels, ~138 docs between them. The plan said the corpus does NOT
    // carry the TT<->Hasbro map (NAME_CONFLICTS.md has 2 real pairs) — true of
    // that FILE, false of the per-doc fields. Recorded as a plan correction.
    /*
     * 🛑 Three labels, ~138 docs between them. The plan said the corpus does
     * NOT carry the TT<->Hasbro map (NAME_CONFLICTS.md has 2 real pairs) —
     * true of that FILE, false of the per-doc fields. Recorded as a plan
     * correction.
     *
     * The looser four were added after measuring what each actually holds, and
     * are safe only because `nameLike()` drops prose: `Hasbro Release` holds a
     * name, `Hasbro equivalent` a name followed by a clause, `Hasbro
     * localization` either. `Hasbro note` is DELIBERATELY ABSENT — both its
     * values are whole paragraphs.
     */
    hasbroName: (() => {
      const raw = stripMd(
        field(body, [
          "Hasbro EN counterpart",
          "Hasbro Name",
          "English/Hasbro Name",
          "Hasbro EN name",
          "Hasbro Release",
          "Hasbro equivalent",
          "Hasbro localization",
        ]) ?? "",
      );
      // "Sea Drake MS (localization noise — TT canonical name is Sea Dragon)"
      const head = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
      return nameLike(head) ? head : "";
    })(),
    jpName: stripMd(field(body, ["Full Name", "Japanese Name", "Japanese Name / Romaji", "TT Name"])),
    /*
     * Every alternate spelling worth indexing, from the `Full Name` pair plus
     * any explicit "Also Known As". This is what makes `luinor-l2` findable by
     * "Lost Longinus" — the name every buyer actually uses for it.
     */
    altNames: Array.from(
      new Set([
        ...splitNames(field(body, ["Full Name", "Japanese Name / Romaji", "TT Name"])),
        ...fieldAll(body, ["Also Known As"]).flatMap((v) => splitNames(v)),
      ]),
    ),
    aliases: fieldAll(body, ["Also Known As"]).map(stripMd).filter(nameLike),
    // The lineage edges: `Succeeded by` on 136 docs, `Preceded by` on 90.
    succeededBy: fieldAll(body, ["Succeeded by", "Succeeded by (storyline)"]).map(stripMd),
    precededBy: fieldAll(body, ["Preceded by"]).map(stripMd),
    evolutionPath: stripMd(field(body, ["Evolution Path", "Evolution Path / Lineage", "Evolution"])),
  };

  // Route anything uncertain to REVIEW rather than seeding a guess.
  const flags = [];
  if (!row.name) flags.push("no parseable name");
  if (!row.type) flags.push(`unmapped Type: ${JSON.stringify(rawType)}`);
  if (!row.spin) flags.push(`unmapped Spin: ${JSON.stringify(rawSpin)}`);
  if (code.neverRetailed) flags.push("never retailed — not a catalogue leaf");
  else if (!row.productCode && !code.boosterOnly) {
    /*
     * 🛑 A doc with a PRODUCT LINE but no code still RETAILED — "Basic Line",
     * "Unique Line (UX)", "Custom Line (CX-00)" are the Beyblade X retail
     * tiers, so the product exists and the doc simply does not record its SKU.
     * Treating those as unparsed sent ~25 real gen3/gen4 beys to review.
     *
     * Only a doc with neither a code nor a line is genuinely unidentifiable.
     */
    if (row.productLine) row.boosterOnly = true;
    else flags.push(`no product code or line: ${JSON.stringify(rawCode)}`);
  }
  const uncertainIn = [
    ["Type", rawType],
    ["Spin Direction", rawSpin],
    ["Product Code", rawCode],
  ].filter(([, v]) => v && UNCERTAIN_RE.test(v)).map(([l]) => l);
  if (uncertainIn.length) flags.push(`self-flagged uncertain in: ${uncertainIn.join(", ")}`);

  if (flags.length) review.push({ ...row, flags });
  else canonical.push(row);
}

/*
 * ── SLUG COLLISIONS ────────────────────────────────────────────────────────
 *
 * 🛑 A document id is derived from the slug, so two canonical rows sharing one
 * slug means a seed `load` writes the first and then SILENTLY OVERWRITES it
 * with the second — no error, no count discrepancy, and `appkit-seed status`
 * cannot see it because it counts ids and the id exists either way (the same
 * blind spot that hid four orphaned checklist cases in B2).
 *
 * 16 collisions were measured on the first clean run: the corpus carries
 * separate docs for a TT release and its Hasbro variant under the same display
 * name — "Rage Longinus Destroy' 3A" appears twice with DIFFERENT Hasbro names
 * ("Rage Longinus Lm' 3A" vs "Rage Luinor Lm' 3A"), and "Dead Phoenix 0
 * Atomic" three times.
 *
 * Both are legitimate documents. Which one is the catalogue leaf is a product
 * decision, so every member of a colliding group goes to REVIEW with its
 * siblings named — never auto-picked by file order, which would make the answer
 * depend on readdir() ordering.
 */
const bySlug = new Map();
for (const row of canonical) {
  if (!row.slug) continue;
  const list = bySlug.get(row.slug) ?? [];
  list.push(row);
  bySlug.set(row.slug, list);
}
const collided = new Set();
for (const [slug, rows] of bySlug) {
  if (rows.length < 2) continue;
  for (const row of rows) {
    collided.add(row);
    review.push({
      ...row,
      flags: [
        `slug collision on "${slug}" — ${rows.length} docs resolve to one id: ` +
          rows.map((r) => r.file).join(", "),
      ],
    });
  }
}
for (let i = canonical.length - 1; i >= 0; i--) {
  if (collided.has(canonical[i])) canonical.splice(i, 1);
}

// ── part glossary, from `case study/` ───────────────────────────────────────

const parts = [];
if (existsSync(CASE_DIR)) {
  for (const f of walk(CASE_DIR)) {
    const body = readFileSync(f, "utf8");
    for (const m of body.matchAll(
      /^##\s*Case\s+\d+\s*[—–-]\s*(.+?)(?:\s*\(([\d.]+)\s*g\))?\s*$/gm,
    )) {
      const label = stripMd(m[1]);
      const weightG = m[2] ? Number(m[2]) : null;
      /*
       * 🛑 A WEIGHT is the only reliable signal that a case header names a
       * PART, and this is a plan correction worth stating.
       *
       * The plan read `case study/` as a part glossary — "1,920 parseable
       * `## Case N — Part Name (X.X g)` headers". 1,920 headers do parse, but
       * the corpus is a MECHANICS analysis: "Case 1 — Hit to a Freely
       * Suspended Body (at rest, in free space)", "Gyro + Contact Points +
       * TILT", "Per-Tick Integration". Only the ~87 headers carrying a gram
       * figure name a real component.
       *
       * The first version of this parser split EVERY header on `/`, so
       * "Hit to a Body Already in Motion (falling / rising)" produced a part
       * code of "rising" — 392 fabricated codes out of 522. Splitting only
       * when a weight is present removes the whole class.
       */
      if (weightG == null) continue;
      // `Wing 105 Track / W105` -> name + code; the code follows the slash.
      const [namePart, codePart] = label.split("/").map((s) => s.trim());
      parts.push({
        name: namePart || label,
        code: codePart ?? null,
        weightG,
        source: relative(CASE_DIR, f).split(sep).join("/"),
      });
    }
  }
}

// ── report ──────────────────────────────────────────────────────────────────

const tally = (rows, key) => {
  const m = new Map();
  for (const r of rows) {
    const v = r[key] ?? "(none)";
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m].sort((a, b) => b[1] - a[1]);
};

console.log(`corpus:       ${CORPUS}`);
console.log(`bey docs:     ${files.length}`);
console.log(`excluded:     ${excluded.length} (game-original, by path)`);
console.log(`candidates:   ${files.length - excluded.length}`);
console.log(`canonical:    ${canonical.length}`);
console.log(`review list:  ${review.length}`);
console.log(
  `part glossary:  ${parts.length} components with a confirmed weight (${parts.filter((p) => p.code).length} with a code). ` +
    `The other ~2,030 case headers are mechanics derivations, not parts — see the note in the parser.`,
);

console.log(`\ntype:  ${tally(canonical, "type").map(([k, n]) => `${k}=${n}`).join("  ")}`);
console.log(`spin:  ${tally(canonical, "spin").map(([k, n]) => `${k}=${n}`).join("  ")}`);
console.log(`era:`);
for (const [k, n] of tally(canonical, "era")) console.log(`  ${String(n).padStart(3)}  ${k}`);

const succEdges = canonical.reduce((n, r) => n + r.succeededBy.length, 0);
const precEdges = canonical.reduce((n, r) => n + r.precededBy.length, 0);
console.log(`\nanime owner (-> groupTheme "character"):  ${canonical.filter((r) => r.animeOwner).length}`);
console.log(`succeeded-by edges (-> "lineage"):        ${succEdges} across ${canonical.filter((r) => r.succeededBy.length).length} beys`);
console.log(`preceded-by edges:                       ${precEdges}`);
console.log(`Hasbro name recorded:                    ${canonical.filter((r) => r.hasbroName).length}`);
console.log(`JP / full name (-> searchTxt aliases):   ${canonical.filter((r) => r.jpName).length}`);
console.log(`product code:                            ${canonical.filter((r) => r.productCode).length}`);
console.log(`retailed with no standalone code:        ${canonical.filter((r) => r.boosterOnly).length}`);
console.log(`product line (BX tier) recorded:         ${canonical.filter((r) => r.productLine).length}`);
console.log(`
CANONICAL TOTAL: ${canonical.length} of ${files.length - excluded.length} candidates (${Math.round(canonical.length / (files.length - excluded.length) * 100)}%)`);

if (review.length) {
  console.log(`\n── review list (${review.length}, NOT seeded) ──`);
  const byFlag = new Map();
  for (const r of review) {
    for (const f of r.flags) {
      const key = f.replace(/:.*$/, "");
      byFlag.set(key, (byFlag.get(key) ?? 0) + 1);
    }
  }
  for (const [f, n] of [...byFlag].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${f}`);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, "canonical-beys.json"),
  JSON.stringify({ canonical, review, excluded, parts }, null, 2),
);
console.log(`\nwrote ${join(OUT_DIR, "canonical-beys.json")}`);
