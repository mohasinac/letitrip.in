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

/** `**Field:** value` on its own line, trying several candidate labels in order. */
function field(body, labels) {
  for (const label of Array.isArray(labels) ? labels : [labels]) {
    const re = new RegExp(`^\\*\\*${escapeRe(label)}:?\\*\\*\\s*(.+)$`, "mi");
    const hit = body.match(re)?.[1]?.trim();
    if (hit) return hit;
  }
  return null;
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
  const heading = body.match(/^##\s+(.+?)(?:\s+—|\s+--?\s|$)/m)?.[1]?.trim() ?? null;
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
    marque: code.marque,
    /* Retailed inside a booster or pack, so no standalone code of its own. */
    boosterOnly: code.boosterOnly,
    /* Beyblade X tier: Basic (BX) / Unique (UX) / Custom (CX). A tree axis. */
    productLine: stripMd(field(body, ["Product Line"])),
    system: stripMd(field(body, ["Toy line / Layer System", "System", "Part System"])),
    series: stripMd(field(body, ["Series (anime, JP)", "Series"])),
    animeOwner: stripMd(field(body, ["Owner (Anime)", "Owner"])),
    // 🛑 Three labels, ~138 docs between them. The plan said the corpus does NOT
    // carry the TT<->Hasbro map (NAME_CONFLICTS.md has 2 real pairs) — true of
    // that FILE, false of the per-doc fields. Recorded as a plan correction.
    hasbroName: stripMd(field(body, ["Hasbro EN counterpart", "Hasbro Name", "English/Hasbro Name"])),
    jpName: stripMd(field(body, ["Full Name (TT JP)", "Japanese Name", "Full Name", "TT Name"])),
    aliases: fieldAll(body, ["Also Known As"]).map(stripMd),
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
