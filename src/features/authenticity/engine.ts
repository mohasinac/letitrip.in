/**
 * The authenticity assessment engine. Pure, synchronous, zero I/O.
 *
 * 🛑 Zero Firestore reads, by design. The whole knowledge base is bundled, so a
 * lookup costs one function invocation and nothing else (Rule #6). That is also
 * why it is safe behind a sign-in gate without a rate-limit story: there is no
 * per-query backend cost to protect.
 *
 * Research and provenance: docs/research/beyblade-authenticity-2026-10/README.md
 *
 * 🛑 READ THIS BEFORE ADDING A VERDICT PATH. The engine may never return
 * "counterfeit". Its most severe outcome is `likely-reproduction`, reachable on
 * exactly two grounds — a matched midfake code family, or a named unlicensed
 * marque — and both are statements about a BATCH or a BRAND. This codebase's own
 * crawl research puts it plainly: "a false counterfeit accusation against a real
 * seller is worse than a missed one."
 */
import {
  CONTESTED_DATE_CODES,
  MIDFAKE_DATE_CODES,
  ORIGINAL_DATE_CODES,
  SERIES_WINDOWS,
  UNCLEAR_DATE_CODES,
  type DateCodeRow,
} from "./data/date-codes.generated";
import { KNOWLEDGE_BASE_SIZES } from "./data/knowledge-sizes.generated";
import { CANONICAL_BEYS, type CanonicalBey } from "./data/canonical-index.generated";
import { modelCodesFor } from "./data/model-codes.generated";
import { GENERATION_BY_ID, GENERATIONS, UNIVERSAL_CHECKS } from "./data/generations";
import { AFTERMARKET_FRAMING_NOTE, findCounterfeitMarque, isLicensedMarque } from "./data/marques";
import type {
  AssessmentSignal,
  AuthenticityAssessment,
  AuthenticityRequest,
  ClarifyingQuestion,
  DateCodeAnalysis,
  DateCodeReading,
  GenerationId,
  ManualCheck,
  MatchedBey,
  ModelCodeSummary,
} from "./types";

/* ------------------------------------------------------------------ codes -- */

/** `bb 105` / `BB-105` / `bb105` all normalise to `BB-105`-comparable form. */
function normaliseToken(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s\-_.]+/g, "");
}

/** A box DATE code: one letter then four digits (`A0813`). */
const DATE_CODE_RE = /^([A-Z])(\d{4})$/;

/** A retail PRODUCT code: letters then digits (`BB105`, `B174`, `BX34`, `MA09`). */
const PRODUCT_CODE_RE = /^([A-Z]{1,3})(\d{1,3})$/;

/**
 * 🛑 LONGEST PREFIX FIRST, and this ordering is load-bearing.
 *
 * `BB-105` also starts with `B`, and `BBG-01` starts with both `B` and `BB`. A
 * naive scan would classify every Metal Fight bey as Burst and every Zero-G bey
 * as Metal Fight — silently, and then hand the user the wrong generation's
 * entire checklist. Sorted by descending prefix length at module load so the
 * order cannot be broken by editing `GENERATIONS`.
 */
const PREFIX_TO_GENERATION: readonly { readonly prefix: string; readonly generation: GenerationId }[] =
  GENERATIONS.flatMap((g) => g.codePrefixes.map((p) => ({ prefix: normaliseToken(p), generation: g.id })))
    .slice()
    .sort((a, b) => b.prefix.length - a.prefix.length);

export function generationFromProductCode(raw: string): GenerationId | null {
  const n = normaliseToken(raw);
  const m = PRODUCT_CODE_RE.exec(n);
  if (!m) return null;
  const letters = m[1];
  // Exact letter-group match, never a substring: `MA` must not match `A`.
  const hit = PREFIX_TO_GENERATION.find((p) => p.prefix === letters);
  return hit?.generation ?? null;
}

/**
 * 🛑 CONTESTED IS NOT IN THIS LIST, and that is deliberate — it is checked
 * before the list runs, in `analyseDateCode`.
 *
 * Putting it here would make it one more table in a precedence scan, and the
 * entire reason the contested table exists is that precedence is the wrong
 * instrument: the four codes in it are recorded as genuine by one source and as
 * a midfake batch by another, so whichever table won would be an answer nobody
 * chose, in a direction that costs a real person money either way.
 * `audit-authenticity-data-parity`'s R5 holds the other half of this — a code
 * may be in exactly one table, so these three can never collide.
 */
const CODE_TABLES: readonly { readonly rows: readonly DateCodeRow[]; readonly kind: "known-original" | "known-midfake" | "unclear" }[] =
  [
    { rows: MIDFAKE_DATE_CODES, kind: "known-midfake" },
    { rows: ORIGINAL_DATE_CODES, kind: "known-original" },
    { rows: UNCLEAR_DATE_CODES, kind: "unclear" },
  ];

/**
 * How strongly a row's own provenance supports what it says.
 *
 * Two independent compilations agreeing is a materially stronger claim than one
 * file drop with no permalink saying it alone — and the sources here genuinely
 * differ in weight (see the generated table's header). A row the SOURCE ITSELF
 * hedged on ("the picture was blurry", "might be Hong Kong") can never be more
 * than reported, whatever corroborates it.
 */
function rowConfidence(row: DateCodeRow): "verified" | "reported" {
  if (row.uncertain) return "reported";
  return row.sources.length > 1 || row.sources.includes("reddit-kzyzt1") ? "verified" : "reported";
}

/**
 * Which named Metal-series production run an ISO date (`YYYY-MM-DD`) falls
 * inside, or `null` when it predates/postdates all four.
 *
 * Plain string comparison is correct here because ISO dates sort
 * lexicographically — no `Date` parsing, no timezone, nothing that could
 * disagree with how the windows were authored.
 */
function seriesWindowFor(isoDate: string): (typeof SERIES_WINDOWS)[number] | null {
  return SERIES_WINDOWS.find((w) => isoDate >= w.startIso && isoDate <= w.endIso) ?? null;
}

/** `YYYY-MM` from a `DD.MM.YYYY` derived-date string. */
function monthKeyOf(derivedDate: string): string {
  const [, mm, yyyy] = derivedDate.split(".");
  return `${yyyy}-${mm}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Both readings of a box date code, never collapsed.
 *
 * 🛑 The month-day-year reading is what the reference post states and uses. A
 * factory/week/year reading also circulates. Takara Tomy has published neither,
 * and the post itself says there is no official statement. Printing one date as
 * fact would be the tool's single most likely way to mislead, so it prints both
 * and says they disagree.
 */
export function analyseDateCode(raw: string): DateCodeAnalysis {
  const normalised = normaliseToken(raw);
  const m = DATE_CODE_RE.exec(normalised);

  if (!m) {
    return {
      raw,
      normalised,
      wellFormed: false,
      readings: [],
      match: { kind: "unknown" },
      // Nothing to suggest: this is not code-shaped, so "did you mean" would
      // be guessing at what the user was even trying to type.
      nearMisses: [],
      seriesWindow: null,
      temporalContext: null,
    };
  }

  const letter = m[1];
  const digits = m[2];
  const monthIndex = letter.charCodeAt(0) - 65;
  const day = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));

  const readings: DateCodeReading[] = [];
  if (monthIndex >= 0 && monthIndex <= 11 && day >= 1 && day <= 31) {
    readings.push({
      interpretation: "month-day-year",
      label: "Letter = month, next two digits = day",
      value: `${day} ${MONTH_NAMES[monthIndex]} ${year}`,
    });
  }
  readings.push({
    interpretation: "factory-week-year",
    label: "Letter = factory, next two digits = week of the year",
    value: `factory ${letter}, week ${day} of ${year}`,
  });

  /*
   * A FACT ABOUT THE CALENDAR, computed once and reused on every return path
   * below — it does not depend on whether the code matched anything. Only
   * exists when the month-day-year reading does (the letter must be A–L).
   */
  const hasMonthDayReading = monthIndex >= 0 && monthIndex <= 11 && day >= 1 && day <= 31;
  const isoDate = hasMonthDayReading
    ? `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    : null;
  const window = isoDate ? seriesWindowFor(isoDate) : null;
  const seriesWindow = window
    ? { name: window.name, generation: window.generation as GenerationId, startLabel: window.startLabel, endLabel: window.endLabel }
    : null;

  /*
   * A code that MATCHED needs no suggestion — offering "did you mean" beside
   * a definite answer reads as doubt about it.
   */
  const nearMisses: readonly string[] = [];

  /*
   * 🛑 CONTESTED FIRST, and outside the precedence scan below. A code the
   * sources disagree about must not be resolved by whichever table happens to
   * be read first — see the comment on CODE_TABLES.
   */
  const contested = CONTESTED_DATE_CODES.find((r) => r.code === normalised);
  if (contested) {
    return {
      raw,
      normalised,
      wellFormed: true,
      readings,
      nearMisses,
      seriesWindow,
      // The match already carries every product name a side of the dispute
      // names; month-context would only dilute the thing the user most needs
      // to read, which is that the sources disagree about THIS code.
      temporalContext: null,
      match: {
        kind: "contested",
        products: contested.products,
        recordedOriginalBy: contested.recordedOriginalBy,
        recordedMidfakeBy: contested.recordedMidfakeBy,
        families: contested.families,
      },
    };
  }

  for (const table of CODE_TABLES) {
    const row = table.rows.find((r) => r.code === normalised);
    if (!row) continue;

    if (table.kind === "known-original") {
      return {
        raw,
        normalised,
        wellFormed: true,
        readings,
        nearMisses,
        seriesWindow,
        // The matched row already names what was in production that day.
        temporalContext: null,
        match: {
          kind: "known-original",
          products: row.products,
          /*
           * The derived date, not the source's written one — six codes in the
           * source contradict its own stated rule, and `sourceDateDiffers`
           * records which. Showing the derived value keeps the table internally
           * consistent; the UI surfaces the disagreement separately.
           */
          date: row.derivedDate ?? "date not derivable from this code",
          regions: row.regions,
          notes: row.notes,
          uncertain: row.uncertain,
        },
      };
    }
    if (table.kind === "known-midfake") {
      return {
        raw,
        normalised,
        wellFormed: true,
        readings,
        nearMisses,
        seriesWindow,
        temporalContext: null,
        match: {
          kind: "known-midfake",
          products: row.products,
          /*
           * 🛑 The note is PER FAMILY, because the three families are different
           * claims and flattening them was the single most misleading thing
           * this branch could do. `chinese-font` in particular is not a claim
           * about the code at all — the source's own words are "the code itself
           * should be authentic however the font looks like a midfake one", so
           * a user whose box shows that code is being told to compare a
           * TYPEFACE, not that their code is a fake code.
           */
          note: row.families.includes("chinese-font")
            ? "A Chinese midfake batch has been observed printing this code. 🛑 The source's point is the TYPEFACE, not the code — on three of these it says the code itself should be authentic and only the font differs. So this is a prompt to compare how the code is printed: on the reference pair the source supplies, the genuine code is pressed into the card and the midfake one is ink-printed in a different face. One example each, so treat it as a thing to look at rather than a rule."
            : row.families.includes("sonokong-highquality")
              ? "This code is recorded on Korean boxes the community classes as high-quality Sonokong fakes. 🛑 These reproduce the importer panel, both logos and a plausible barcode, so packaging inspection does not settle one — go to the physical checks below."
              : "This code belongs to a batch the community records as a midfake run — Takara-Tomy-blueprint product of reduced quality. There is no official Takara Tomy statement about these batches.",
          confidence: rowConfidence(row),
          families: row.families,
          regions: row.regions,
          notes: row.notes,
          uncertain: row.uncertain,
        },
      };
    }
    return {
      raw,
      normalised,
      wellFormed: true,
      readings,
      nearMisses,
      seriesWindow,
      temporalContext: null,
      match: {
        kind: "unclear",
        products: row.products,
        note:
          "Recorded against a New Boy (Middle East) regional release, where the source itself could only say the code 'seems legit'. Carried with that hedge intact.",
      },
    };
  }

  /*
   * Well-formed and in none of the tables. The verdict for this is unchanged
   * and must stay unchanged: an absent code means "not recorded", not "fake",
   * new genuine codes turn up regularly, and counterfeiters use REAL codes
   * anyway — so a code's presence proves nothing in either direction.
   *
   * What was missing is help with the INPUT. `A0831` against a known `A0813`
   * said only "not in either table", and a transposed pair is the commonest
   * way to mistype five characters.
   */
  return {
    raw,
    normalised,
    wellFormed: true,
    readings,
    match: { kind: "unknown" },
    nearMisses: findNearMissCodes(normalised),
    seriesWindow,
    temporalContext: hasMonthDayReading ? temporalContextFor(year, monthIndex) : null,
  };
}

/**
 * What the ORIGINAL and MIDFAKE tables record from the same calendar month as
 * `(year, monthIndex)` — every product name seen that month on either side,
 * capped and de-duplicated.
 *
 * 🛑 This is CONTEXT for a code that matched nothing, built from the one
 * reading the source actually states (month-day-year). It never changes a
 * verdict and is never rendered as though it does — see the field's own
 * doc comment on `DateCodeAnalysis.temporalContext`.
 */
const TEMPORAL_CONTEXT_LIMIT = 8;

function temporalContextFor(year: number, monthIndex: number): DateCodeAnalysis["temporalContext"] {
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const inMonth = (rows: readonly DateCodeRow[]) =>
    rows.filter((r) => r.derivedDate && monthKeyOf(r.derivedDate) === monthKey);

  const originalRows = inMonth(ORIGINAL_DATE_CODES);
  const midfakeRows = inMonth(MIDFAKE_DATE_CODES);
  if (originalRows.length === 0 && midfakeRows.length === 0) return null;

  const names = (rows: readonly DateCodeRow[]) => [...new Set(rows.flatMap((r) => r.products))].sort();

  return {
    monthLabel: `${MONTH_NAMES[monthIndex]} ${year}`,
    originalProducts: names(originalRows).slice(0, TEMPORAL_CONTEXT_LIMIT),
    originalTotal: names(originalRows).length,
    midfakeProducts: names(midfakeRows).slice(0, TEMPORAL_CONTEXT_LIMIT),
    midfakeTotal: names(midfakeRows).length,
  };
}

/**
 * Codes exactly one edit away from `code` across every table.
 *
 * 🛑 Distance ONE, and capped. Two edits over a 5-character alphanumeric
 * string matches a large share of a 98-row table, at which point the
 * suggestion is noise that happens to look authoritative — and this is a
 * surface where looking authoritative is the hazard. One edit covers the
 * real cases: a transposition, a wrong digit, a letter off by one.
 *
 * A linear pass over ~98 rows, so no index and no library.
 */
function findNearMissCodes(code: string): string[] {
  const out: string[] = [];
  for (const table of CODE_TABLES) {
    for (const row of table.rows) {
      if (row.code === code) continue;
      if (isOneEditApart(code, row.code)) out.push(row.code);
      if (out.length >= NEAR_MISS_LIMIT) return out;
    }
  }
  return out;
}

const NEAR_MISS_LIMIT = 3;

/**
 * True when `a` and `b` differ by one substitution or one adjacent
 * transposition.
 *
 * Deliberately NOT full Levenshtein: box codes are fixed-width (one letter,
 * four digits), so an insertion or a deletion produces a string that is not
 * code-shaped and would have failed `DATE_CODE_RE` before reaching here.
 * Implementing the two operations that can actually occur keeps the rule
 * easy to reason about on a surface where a wrong suggestion is costly.
 */
function isOneEditApart(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const diffs: number[] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diffs.push(i);
      if (diffs.length > 2) return false;
    }
  }
  if (diffs.length === 1) return true;
  if (diffs.length !== 2) return false;
  // Adjacent transposition: "A0831" vs "A0813".
  const [i, j] = diffs;
  return j === i + 1 && a[i] === b[j] && a[j] === b[i];
}

/* ------------------------------------------------------------------ names -- */

function normaliseName(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Whitespace-insensitive form.
 *
 * 🛑 This exists because without it "Dran Sword" — the obvious way to type it —
 * matched the corpus's "DranSword" at edit distance 1 and was reported as a
 * FUZZY hit, which attaches the trademark-evasion warning. The tool was telling
 * a buyer that typing a space might indicate a counterfeit. A difference of
 * spacing alone is never a signal about anything.
 */
function collapseSpaces(normalised: string): string {
  return normalised.replace(/ /g, "");
}

/** Bounded Levenshtein — returns `limit + 1` as soon as it cannot beat `limit`. */
function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > limit) return limit + 1;
    prev = cur;
  }
  return prev[b.length];
}

interface NameIndexEntry {
  readonly normalised: string;
  readonly bey: CanonicalBey;
  readonly how: "exact" | "alias";
}

/**
 * Canonical names carry their part code — `Storm Pegasus 105RF`,
 * `Big Bang Pegasus F:D`, `AeroPegasus 3-70A`. Buyers type the bare name. So the
 * index also carries a base form with trailing part-code tokens removed, or
 * "Storm Pegasus" would miss the bey it obviously means.
 */
function baseName(name: string): string {
  const tokens = normaliseName(name).split(" ");
  while (tokens.length > 1) {
    const last = tokens[tokens.length - 1];
    // A trailing token with a digit, or a short all-letters code like `fd`
    // (from `F:D`), is a part code rather than part of the name.
    if (/\d/.test(last) || (tokens.length > 1 && last.length <= 2)) tokens.pop();
    else break;
  }
  return tokens.join(" ");
}

/**
 * 🛑 "Pegasis" is TAKARA TOMY'S OWN ROMANISATION, not only a counterfeiter's
 * misspelling — and conflating the two would be this tool's worst failure mode.
 *
 * The corpus proves it in its own rows: `Storm Pegasus 105RF` carries the
 * Japanese `ストームペガシス`, which romanises to *Pegashisu* / Pegasis. Takara
 * Tomy spells the line Pegasis; Hasbro spells it Pegasus. Meanwhile this
 * project's counterfeit crawl lists `Pegasis` among the trademark-evasion
 * spellings — true of that catalogue, and NOT a general rule.
 *
 * So the pair is registered as a legitimate variant: typing either spelling
 * resolves as an `alias` hit, and the evasion-spelling warning (which only fires
 * on a `fuzzy` hit) stays silent. Without this, the tool would tell a buyer that
 * the spelling printed on a genuine Takara Tomy box is a sign of a fake.
 */
const LEGITIMATE_SPELLING_VARIANTS: readonly (readonly [string, string])[] = [["pegasus", "pegasis"]];

function spellingVariants(normalisedName: string): string[] {
  const out: string[] = [];
  for (const [a, b] of LEGITIMATE_SPELLING_VARIANTS) {
    if (normalisedName.includes(a)) out.push(normalisedName.split(a).join(b));
    if (normalisedName.includes(b)) out.push(normalisedName.split(b).join(a));
  }
  return out;
}

/** Built once at module load: 220 beys, their aliases, base names and variants. */
const NAME_INDEX: readonly NameIndexEntry[] = CANONICAL_BEYS.flatMap((bey) => {
  const full = normaliseName(bey.name);
  const base = baseName(bey.name);
  const entries: NameIndexEntry[] = [
    { normalised: full, bey, how: "exact" },
    ...(base && base !== full ? [{ normalised: base, bey, how: "exact" as const }] : []),
    ...bey.aliases.map((a) => ({ normalised: normaliseName(a), bey, how: "alias" as const })),
  ];
  for (const source of [full, base]) {
    for (const v of spellingVariants(source)) {
      entries.push({ normalised: v, bey, how: "alias" });
    }
  }
  return entries;
}).filter((e) => e.normalised.length > 1);

/**
 * Prefer an `exact` hit over an `alias` one, then the more specific (longer)
 * name. Without the first key, "Storm Pegasus" resolves through a long Japanese
 * alias and reports itself as an alias match, which reads as though the user
 * typed something non-canonical when they typed the name exactly.
 */
function preferBetter(a: NameIndexEntry, b: NameIndexEntry): number {
  if (a.how !== b.how) return a.how === "exact" ? -1 : 1;
  if (a.normalised.length !== b.normalised.length) return b.normalised.length - a.normalised.length;
  return a.bey.slug.localeCompare(b.bey.slug);
}

/** How many models the UI will offer when a name is ambiguous. */
const MAX_CANDIDATES = 6;

/**
 * Resolve a typed name to candidate beys, best first and de-duplicated by bey.
 *
 * 🛑 It returns a LIST, not a single answer, and that is the whole point.
 * "Valkyrie" is the name of a dozen real releases; picking one and announcing
 * "Matched Ultimate Valkyrie Legacy Variable'-9" is a confident answer to a
 * question the user did not ask. An ambiguous name becomes a question instead.
 *
 * 🛑 The fuzzy tier is what catches the trademark-evasion spellings this project
 * measured on a counterfeit catalogue — `Scythee`, `Jupitar`, `Fireblase`. Those
 * are also the strings a real buyer mistypes, so a fuzzy hit is reported as a
 * NAME-SPELLING observation, never on its own as evidence of a fake. Hits that
 * differ only by spacing or by a registered legitimate romanisation are
 * deliberately NOT fuzzy.
 */
export function matchBeys(rawName: string): MatchedBey[] {
  const q = normaliseName(rawName);
  if (q.length < 3) return [];
  const qc = collapseSpaces(q);

  const dedupe = (list: MatchedBey[]): MatchedBey[] => {
    const seen = new Set<string>();
    return list.filter((m) => !seen.has(m.slug) && seen.add(m.slug)).slice(0, MAX_CANDIDATES);
  };

  // 1. Exact, including whitespace-insensitive equality.
  const exact = NAME_INDEX.filter((e) => e.normalised === q || collapseSpaces(e.normalised) === qc).sort(preferBetter);
  if (exact.length > 0) return dedupe(exact.map((e) => ({ ...e.bey, how: e.how })));

  // 2. Containment. Several distinct beys legitimately match here.
  const contained = NAME_INDEX.filter(
    (e) =>
      e.normalised.length >= 6 &&
      (q.includes(e.normalised) ||
        e.normalised.includes(q) ||
        collapseSpaces(e.normalised).includes(qc) ||
        qc.includes(collapseSpaces(e.normalised))),
  ).sort(preferBetter);
  if (contained.length > 0) return dedupe(contained.map((e) => ({ ...e.bey, how: e.how })));

  // 3. Edit distance, scaled to length. Two edits on a short name is a
  // different bey, not a typo — "driger" and "dranzer" must never collapse.
  const scored: { entry: NameIndexEntry; dist: number }[] = [];
  for (const e of NAME_INDEX) {
    const limit = e.normalised.length >= 10 ? 2 : 1;
    const d = editDistance(q, e.normalised, limit);
    if (d <= limit) scored.push({ entry: e, dist: d });
  }
  scored.sort((a, b) => a.dist - b.dist || preferBetter(a.entry, b.entry));
  return dedupe(scored.map((s) => ({ ...s.entry.bey, how: "fuzzy" as const, typedAs: rawName.trim() })));
}

/** Single best match, or null. Kept for callers that genuinely want one. */
export function matchBey(rawName: string): MatchedBey | null {
  return matchBeys(rawName)[0] ?? null;
}

/**
 * A bey the user PICKED, by canonical slug or by category leaf id.
 *
 * 🛑 Resolved against the whole canonical index, NOT against the candidates the
 * typed name produced. The picker offers all 221 beys, so a pick can legitimately
 * disagree with the typing — somebody holding a box that says "Pegasis Storm"
 * can pick "Storm Pegasus 105RF" to say what it is *meant* to be. Intersecting
 * the two would discard the half the user was most sure about, and would make
 * the picker silently stop working the moment the two disagreed, which is
 * exactly the case it is most useful in.
 *
 * `how: "exact"` because it was chosen from a list rather than matched from a
 * string: there is no spelling to be suspicious of, so the trademark-evasion
 * signal must not fire on it. The typed name keeps its own separate signal.
 */
export function pinnedBey(slugOrCategoryId: string): MatchedBey | null {
  const key = slugOrCategoryId.trim();
  if (!key) return null;
  const bey =
    CANONICAL_BEYS.find((b) => b.slug === key) ?? CANONICAL_BEYS.find((b) => b.categoryId === key);
  return bey ? { ...bey, how: "exact" } : null;
}

/* ------------------------------------------------------------ model codes -- */

/**
 * What the tables record about one bey, and where the supplied code sits in it.
 *
 * 🛑 `recorded-elsewhere` is its own status and the distinction is the point: a
 * code that is in the tables but not against THIS bey is a weak observation,
 * because a production date covers whatever was boxed that day. It is not a
 * mismatch and it must never render as one.
 */
function summariseModelCodes(
  bey: MatchedBey | null,
  dateCode: DateCodeAnalysis | null,
): ModelCodeSummary | null {
  if (!bey) return null;
  const record = modelCodesFor(bey.slug);
  if (!record) return null;

  const supplied = dateCode?.wellFormed ? dateCode.normalised : null;
  const status: ModelCodeSummary["suppliedCodeStatus"] = !supplied
    ? "not-checked"
    : record.contestedCodes.includes(supplied)
      ? "contested-for-this-model"
      : record.midfakeCodes.includes(supplied)
        ? "midfake-for-this-model"
        : record.originalCodes.includes(supplied)
          ? "recorded-for-this-model"
          : dateCode && dateCode.match.kind !== "unknown"
            ? "recorded-elsewhere"
            : "unrecorded";

  return {
    slug: record.slug,
    name: record.name,
    categoryId: record.categoryId,
    retailCode: record.retailCode,
    originalCodes: record.originalCodes,
    midfakeCodes: record.midfakeCodes,
    contestedCodes: record.contestedCodes,
    unclearCodes: record.unclearCodes,
    suppliedCodeStatus: status,
  };
}

/**
 * The one signal the per-model index produces.
 *
 * 🛑 It never returns a `concern`. The strongest negative it can express is
 * "the tables have not recorded this code against this bey", and the tables are
 * a collectors' compilation of boxes people happened to photograph — treating a
 * gap in them as a finding would manufacture suspicion out of incompleteness,
 * on the one axis where this engine has the least excuse for it. The genuinely
 * adverse readings (midfake, contested) already have their own signals from the
 * code tables and reach the verdict there.
 */
function modelCodeSignal(summary: ModelCodeSummary | null): AssessmentSignal | null {
  if (!summary) return null;
  const recorded = summary.originalCodes.length;

  if (summary.suppliedCodeStatus === "recorded-for-this-model") {
    return {
      id: "model-code-match",
      label: `That code is recorded on genuine boxes of ${summary.name}`,
      detail: `It is one of ${recorded} box codes the collectors' tables record against this exact bey — the strongest agreement this tool can produce from data alone, and still not proof: counterfeiters print real codes, and the physical checks below are what settle it.`,
      direction: "supports-original",
      confidence: "verified",
    };
  }

  if (summary.suppliedCodeStatus === "recorded-elsewhere") {
    return {
      id: "model-code-other-bey",
      label: `That code is recorded, but not against ${summary.name}`,
      detail: `The tables place it on other beys boxed around the same date. That is weak support rather than a mismatch — a production date covers whatever ran that day, and ${recorded} codes are recorded for ${summary.name} without this one being among them.`,
      direction: "neutral",
      confidence: "reported",
    };
  }

  if (summary.suppliedCodeStatus === "unrecorded" && recorded > 0) {
    return {
      id: "model-code-unrecorded",
      label: `Not among the ${recorded} codes recorded for ${summary.name}`,
      detail:
        "Which means unrecorded, not wrong. These tables are what collectors photographed, never a manufacturing record, and new genuine codes turn up regularly. Compare it against the list below and check the box again if one is a transposition away.",
      direction: "neutral",
      confidence: "reported",
    };
  }

  if (summary.suppliedCodeStatus === "not-checked" && recorded > 0) {
    return {
      id: "model-code-available",
      label: `${recorded} box codes are recorded for ${summary.name}`,
      detail:
        "Find the letter-and-four-digits code stamped on the box — usually the bottom panel or a side flap — and check it against the list below. It is the one data check left that can actually move this answer.",
      direction: "neutral",
      confidence: "verified",
    };
  }

  return null;
}

/* ----------------------------------------------------------------- assess -- */

const GENERATION_QUESTION: ClarifyingQuestion = {
  field: "generation",
  question: "Which generation is it?",
  why:
    "The checks that matter are completely different per generation — tri-wing screws mean something on Burst and nothing on a 2001 plastic bey, and the box date-code table only covers Metal Fight. Rather than guess and hand you the wrong checklist, pick the one in front of you.",
  options: GENERATIONS.map((g) => ({
    value: g.id,
    label: `${g.label} (${g.years})`,
    hint: g.codePrefixes.length ? `Box codes like ${g.codePrefixes.map((p) => `${p}00`).join(", ")}` : g.years,
  })),
};

const SAFETY_NOTE =
  "Unlicensed tops have been found to contain lead and cadmium in metal parts and metallic paint, and they break more readily — which is how those materials get onto hands. If you suspect one, do not let a child handle it and do not battle it against parts you care about.";

/** The one piece of safety guidance specific to a generation. */
const PLASTIC_EXPLOSIVE_NOTE =
  "🛑 On the original plastic generation specifically: some counterfeits shipped an oversized round Weight Disk containing Armstrong's mixture, a sensitive explosive that made the bey throw sparks on impact. If a vintage bey has a large round disk you cannot identify, do not spin it.";

/**
 * Which generation, and how we know.
 *
 * Guard clauses in PRECEDENCE order, and the order is the whole content of this
 * function: what the user told us beats what a code implies, which beats what a
 * name implies. Written as early returns rather than an if-else ladder so each
 * rule reads as "this is sufficient, stop here".
 */
function resolveGeneration(input: {
  supplied?: GenerationId;
  fromProductCode: GenerationId | null;
  matchedBey: MatchedBey | null;
  ambiguous: boolean;
  candidates: readonly MatchedBey[];
  dateCode: DateCodeAnalysis | null;
}): { generation: GenerationId | null; generationSource: AuthenticityAssessment["generationSource"] } {
  const { supplied, fromProductCode, matchedBey, ambiguous, candidates, dateCode } = input;

  if (supplied) return { generation: supplied, generationSource: "supplied" };
  if (fromProductCode) return { generation: fromProductCode, generationSource: "inferred-from-code" };
  if (matchedBey) return { generation: matchedBey.generation, generationSource: "inferred-from-name" };

  /*
   * The model is ambiguous but every candidate is from the same generation —
   * every "Valkyrie" is Burst — so the generation is known even though the
   * model is not, and the right checklist can be shown while the model question
   * is still open.
   */
  if (ambiguous && new Set(candidates.map((c) => c.generation)).size === 1) {
    return { generation: candidates[0].generation, generationSource: "inferred-from-name" };
  }

  /*
   * 🛑 A code present in any of the three tables tells us the generation on its
   * own, because all three tables are Metal-series only — the source is a
   * "Metal Series" compilation, and its midfake section explicitly covers
   * Shogun Steel too. Without this a user who types a known midfake code and
   * nothing else gets "needs-input" and never sees the one finding that
   * actually mattered.
   */
  if (dateCode && dateCode.match.kind !== "unknown") {
    return { generation: "mfb", generationSource: "inferred-from-code" };
  }

  return { generation: null, generationSource: "unknown" };
}

/** The one signal a box date code produces, or null when it produces none. */
function dateCodeSignal(
  dateCode: DateCodeAnalysis,
  generation: GenerationId | null,
  matchedBey: MatchedBey | null,
): AssessmentSignal | null {
  const match = dateCode.match;

  /*
   * 🛑 CONTESTED IS NOT A MIDFAKE FINDING AND NOT AN ORIGINAL ONE. It is the
   * one place this engine says "my sources contradict each other", and it says
   * so in the signal rather than picking the side that happens to be read
   * first. Direction is `concern` because it genuinely is something to resolve
   * before money moves — but the verdict it feeds is `discrepancy-found`
   * ("resolve this"), never `likely-reproduction` ("this is a reproduction").
   */
  if (match.kind === "contested") {
    const sideNames = (ids: readonly string[]) =>
      ids
        .map((id) =>
          id === "reddit-kzyzt1"
            ? "the 2021 reference post"
            : id === "godkillgroth-model-codes"
              ? "the model-by-model code list"
              : "the midfake code list",
        )
        .join(" and ");
    return {
      id: "date-code-contested",
      label: `${dateCode.normalised}: the sources disagree about this exact code`,
      detail:
        `${sideNames(match.recordedOriginalBy)} records it on genuine boxes of ${match.products.slice(0, 4).join(", ")}, ` +
        `while ${sideNames(match.recordedMidfakeBy)} lists it as a ${
          match.families.includes("sonokong-highquality")
            ? "high-quality Sonokong fake"
            : "Chinese midfake-font"
        } code. ` +
        "I will not pick a side for you: reporting the midfake reading would accuse the holder of a genuine box, and reporting the other would reassure the holder of a fake. The physical checks below settle it and the code cannot.",
      direction: "concern",
      confidence: "disputed",
      source: "docs/research/beyblade-authenticity-2026-10/sources/ — all three archived files",
    };
  }

  if (match.kind === "known-midfake") {
    return {
      id: "date-code-midfake",
      label: `${dateCode.normalised} is a recorded midfake batch code`,
      detail:
        `${match.note} Observed on: ${match.products.length > 0 ? match.products.slice(0, 6).join(", ") : "Metal-series beys the source did not name individually"}.` +
        (match.notes.length > 0 ? ` Source note: ${match.notes.join(" ")}` : ""),
      direction: "concern",
      confidence: match.confidence,
      source: "docs/research/beyblade-authenticity-2026-10/sources/",
    };
  }

  if (match.kind === "known-original") {
    const notThisBey =
      matchedBey &&
      !match.products.some((pr) => normaliseName(pr).includes(normaliseName(matchedBey.name)));
    return {
      id: "date-code-original",
      label: `${dateCode.normalised} appears in the known-original table`,
      detail:
        `Recorded on genuine boxes of: ${match.products.slice(0, 6).join(", ")}.` +
        (match.regions.length > 0 ? ` Recorded on ${match.regions.join(" and ")} releases.` : "") +
        (match.notes.length > 0 ? ` Source note: ${match.notes.join(" ")}` : "") +
        (match.uncertain
          ? " 🛑 The source hedged on this row — a blurry photo, or two codes it could not separate — so read it as 'probably recorded' rather than 'recorded'."
          : "") +
        (notThisBey
          ? ` Note it is not recorded against ${matchedBey.name} specifically — the same production date covers whatever was boxed that day, so this is weak support rather than confirmation.`
          : ""),
      direction: "supports-original",
      confidence: match.uncertain ? "reported" : "verified",
    };
  }

  if (match.kind === "unclear") {
    return {
      id: "date-code-unclear",
      label: `${dateCode.normalised} is recorded, but unresolved`,
      detail: match.note,
      direction: "neutral",
      confidence: "disputed",
    };
  }

  if (generation && GENERATION_BY_ID[generation].hasKnownDateCodeTable) {
    return {
      id: "date-code-unknown",
      label: `${dateCode.normalised} is not in any of the tables`,
      detail:
        `The tables are ${KNOWLEDGE_BASE_SIZES.originalCodes} original and ${KNOWLEDGE_BASE_SIZES.midfakeCodes} midfake codes compiled by collectors from boxes they held, across ${KNOWLEDGE_BASE_SIZES.modelsWithCodeHistory} models and ${KNOWLEDGE_BASE_SIZES.regions} regions — thorough, and still not complete. An absent code means 'not recorded', not 'fake'; new genuine codes turn up regularly, and a regional batch nobody has photographed is simply missing.`,
      direction: "neutral",
      confidence: "reported",
    };
  }

  if (generation) {
    return {
      id: "date-code-no-table",
      label: `No box date-code table exists for ${GENERATION_BY_ID[generation].label}`,
      detail:
        "The letter-plus-four-digits table only covers Metal Fight and Zero-G. No decoding has been established for Burst or Beyblade X boxes, and applying the Metal Fight rule to them would be inventing an answer.",
      direction: "neutral",
      confidence: "reported",
    };
  }

  return null;
}

/** What we can say about the typed NAME: resolved, ambiguous, or unknown. */
function nameSignal(
  name: string,
  matchedBey: MatchedBey | null,
  ambiguous: boolean,
  candidates: readonly MatchedBey[],
): AssessmentSignal | null {
  if (matchedBey) {
    const fuzzy = matchedBey.how === "fuzzy";
    return {
      id: "name-resolved",
      label: fuzzy ? `Read as "${matchedBey.name}"` : `Matched "${matchedBey.name}"`,
      detail: fuzzy
        ? `You typed "${matchedBey.typedAs}". The closest canonical name is ${matchedBey.name}${matchedBey.code ? ` (${matchedBey.code})` : ""}. Worth knowing: systematic misspellings of canonical names are a documented trademark-evasion tactic, so if that spelling is what is printed on the box rather than your typing, it is a concern in its own right.`
        : `${matchedBey.name}${matchedBey.code ? ` is ${matchedBey.code}` : " has no retail product code on record"}, ${GENERATION_BY_ID[matchedBey.generation].label}.`,
      direction: fuzzy ? "neutral" : "supports-original",
      confidence: "verified",
    };
  }

  if (ambiguous) {
    return {
      id: "name-ambiguous",
      label: `"${name}" matches ${candidates.length} releases`,
      detail: `Could be ${candidates
        .slice(0, 4)
        .map((c) => `${c.name}${c.code ? ` (${c.code})` : ""}`)
        .join(", ")}${candidates.length > 4 ? ", and others" : ""}. Pick one and I will check the code and the generation against it; until then I am only showing checks that apply regardless.`,
      direction: "neutral",
      confidence: "verified",
    };
  }

  if (name) {
    return {
      id: "name-unresolved",
      label: `"${name}" is not in the canonical list`,
      detail:
        "The list covers 220 canonical releases, so a miss is not proof of anything — it may be a release the corpus does not cover, a part rather than a whole bey, or a spelling I could not resolve. But a product name that matches no official release at all is worth asking the seller about.",
      direction: "neutral",
      confidence: "reported",
    };
  }

  return null;
}

/**
 * How many recorded releases the verdict caveat names before summarising.
 *
 * Four, not all of them: the longest row in the table carries nine, and a
 * verdict whose evidence runs to a paragraph of product names stops being a
 * verdict. The full list is one tap away in the working-out.
 */
const VERDICT_PRODUCT_LIMIT = 4;

/**
 * The verdict ladder, highest severity first.
 *
 * 🛑 There is no "counterfeit" rung and there must never be one. The top rung is
 * `likely-reproduction`, reachable on exactly two grounds — a matched midfake
 * batch code, or a named unlicensed marque — both statements about a batch or a
 * brand rather than about a seller.
 */
function decideVerdict(input: {
  hasMidfakeCode: boolean;
  hasOriginalCode: boolean;
  hasConcern: boolean;
  counterfeitMarque: { name: string } | null;
  generation: GenerationId | null;
  /**
   * Whether the caller supplied a model NAME.
   *
   * 🛑 It changes the COPY on the inconclusive rung and nothing else — not
   * the verdict, not the suggested listing authenticity, not a signal. The
   * tool already asks "which generation?" and already asks "which one?" on
   * an ambiguous name; asking for the missing half of a name/code pair is
   * the same mechanism one input over.
   *
   * The reason it is worth asking: name↔code agreement is one of the
   * engine's strongest signals, and with a code and a generation but no name
   * it simply cannot be computed. The user is handed the physical checklist
   * and never told that a second field would unlock a real check.
   */
  hasName: boolean;
  hasCode: boolean;
  /**
   * The releases the known-original table records against the supplied code,
   * and the code as normalised.
   *
   * 🛑 The verdict block NAMES them. "Everything I can check is consistent
   * with a genuine release" on its own is a reassurance with nothing behind
   * it — the one fact the tool actually holds, which releases that code is on
   * record for, sat only inside the collapsed working-out, and the page's own
   * intro promises it ("which box codes are on record for that exact
   * release"). A user who reads the top two lines and stops must get the
   * evidence, not just the conclusion.
   *
   * It does NOT claim the item is one of them: a production date covers
   * whatever was boxed that day, which is why the copy says "recorded on" and
   * the per-bey `model-code-other-bey` signal still carries the narrower
   * reading when a model was named.
   */
  originalProducts: readonly string[];
  codeLabel: string | null;
  /**
   * The bey is resolved, the tables DO record box codes for it, and the user
   * has not given one.
   *
   * 🛑 This is the gap the whole model-codes index exists to close, and it was
   * the reported bug: naming a bey the tool knows 33 recorded box codes for
   * produced "Nothing contradicts it, and nothing confirms it either" — true,
   * useless, and indistinguishable from knowing nothing about the bey at all.
   * The verdict is still not a judgement (nothing has been checked), but it is
   * `needs-input` with the next step named, not a shrug.
   */
  awaitingBoxCode: boolean;
  modelName: string | null;
  recordedCodeCount: number;
  /**
   * The code is in the CONTESTED table — one source records it on genuine
   * boxes, another on a midfake batch.
   *
   * 🛑 It gets its own rung ABOVE the generic discrepancy, and deliberately
   * does NOT reach `likely-reproduction`. "A source says this is a midfake" and
   * "the sources disagree" are different sentences, and only the second is
   * true here; promoting it would be the engine picking the harsher side of a
   * disagreement it exists to report.
   */
  hasContestedCode: boolean;
}): {
  verdict: AuthenticityAssessment["verdict"];
  headline: string;
  caveat: string;
  suggested: AuthenticityAssessment["suggestedListingAuthenticity"];
} {
  const { hasMidfakeCode, hasOriginalCode, hasConcern, counterfeitMarque, generation } = input;

  if (hasMidfakeCode || counterfeitMarque) {
    return {
      verdict: "likely-reproduction",
      headline: hasMidfakeCode
        ? "This matches a batch the community records as a midfake."
        : "The brand you gave is a known unlicensed producer.",
      caveat:
        "This is a statement about a production batch or a brand, not an accusation against whoever is selling it — plenty of sellers pass these on without knowing. Confirm with a physical check before you act on it.",
      suggested: "reproduction",
    };
  }

  if (input.hasContestedCode) {
    return {
      verdict: "discrepancy-found",
      headline: "My sources contradict each other about this exact code.",
      caveat:
        "One compilation records it on genuine boxes and another lists it as a midfake batch. That disagreement is the finding — I am not going to resolve it by picking whichever table I read first, because being wrong costs you money in both directions. The physical checks below do settle it.",
      suggested: null,
    };
  }

  if (hasConcern) {
    return {
      verdict: "discrepancy-found",
      headline: "Something here does not line up — worth resolving before you pay.",
      caveat:
        "A discrepancy is a question, not a verdict. Most have innocent explanations, and the fastest way to settle it is a photo of the box bottom and the screws.",
      suggested: null,
    };
  }

  if (hasOriginalCode && generation) {
    const named = input.originalProducts.slice(0, VERDICT_PRODUCT_LIMIT);
    const more = input.originalProducts.length - named.length;
    const onRecord =
      named.length > 0
        ? `${input.codeLabel ?? "That code"} is on record on genuine boxes of ${named.join(", ")}${
            more > 0 ? `, and ${more} more` : ""
          }. `
        : "";
    return {
      verdict: "consistent-with-original",
      headline: "Everything I can check is consistent with a genuine release.",
      caveat:
        onRecord +
        "That is as far as data gets you. The decisive checks are physical and only you can do them — the list below is ordered with the conclusive ones first.",
      suggested: "unverified",
    };
  }

  if (!generation) {
    return {
      verdict: "needs-input",
      headline: "I need to know which generation this is before the checks mean anything.",
      caveat: "Pick one below and I will give you the list that actually applies.",
      suggested: null,
    };
  }

  /*
   * 🛑 Sits BELOW every adverse rung and ABOVE inconclusive, and both
   * placements are deliberate. Below, because a matched midfake code or an
   * unlicensed marque is a finding and "go and read the box code" would bury
   * it. Above, because telling someone the answer is inconclusive while
   * holding 33 recorded codes for the exact bey they named — and not
   * mentioning them — is the failure this rung was added to fix.
   */
  if (input.awaitingBoxCode) {
    return {
      verdict: "needs-input",
      headline: `I know this one. Now find the code stamped on the box.`,
      caveat: `${input.recordedCodeCount} box codes are recorded on genuine ${input.modelName} boxes, listed below. Look for a letter followed by four digits — usually the bottom panel or a side flap — and enter it above. Nothing is confirmed or contradicted yet, and the physical checks at the end settle it either way.`,
      suggested: null,
    };
  }

  /*
   * Inconclusive, and a second field would genuinely add a check. Same
   * verdict, same suggested authenticity — only the caveat changes, because
   * the thing that was missing was never the verdict, it was telling the
   * user what would move it.
   *
   * The closing line is lifted verbatim in spirit from the discrepancy rung
   * ("the fastest way to settle it is a photo of the box bottom and the
   * screws"), which is exactly as applicable to a buyer who has not got the
   * item in hand yet — and is the one next step this rung never offered.
   */
  const missingHalf = !input.hasName && input.hasCode;
  return {
    verdict: "inconclusive",
    headline: "Nothing contradicts it, and nothing confirms it either.",
    caveat: missingHalf
      ? "This is the honest answer for most items. If you also give me the model name, I can check it against the code — that agreement is one of the strongest things I can test. Otherwise the physical checks below settle it, and if you have not got the item yet, ask the seller for a photo of the box bottom and the screws."
      : "This is the honest answer for most items: the data can rule things out, but authenticity is settled by the physical checks below. If you only do one, do the first. If you have not got the item in hand yet, ask the seller for a photo of the box bottom and the screws.",
    suggested: "unverified",
  };
}

export function assess(request: AuthenticityRequest): AuthenticityAssessment {
  const name = request.name?.trim() ?? "";
  const code = request.code?.trim() ?? "";
  const marque = request.marque?.trim() ?? "";

  const signals: AssessmentSignal[] = [];

  /* --- nothing to go on ------------------------------------------------- */
  /*
   * 🛑 A GENERATION ALONE IS STILL NOTHING TO GO ON, and this condition used to
   * include `&& !request.generation` — which was correct only while the form
   * arrived empty.
   *
   * Now that the generation selector is pre-set to Metal Fight, every empty
   * submission carries one. Under the old condition that was enough to escape
   * this branch, so pressing "Check it" with nothing typed returned
   * "Nothing contradicts it, and nothing confirms it either" — a verdict, about
   * no item, phrased as reassurance. Knowing which generation someone is
   * holding is not knowing anything about the thing in their hands.
   *
   * It still USES the generation rather than discarding it: the checklist for
   * that generation is genuinely useful with no item named, and the generation
   * question is not asked when it has already been answered.
   */
  if (!name && !code && !marque && !request.modelSlug) {
    const supplied = request.generation ?? null;
    return {
      verdict: "needs-input",
      headline: "Tell me what you are looking at.",
      caveat:
        "A model name, the code on the box, or the brand printed on the packaging — any one of the three is enough to start." +
        (supplied
          ? ` The ${GENERATION_BY_ID[supplied].label} checks below apply to anything from that generation, so they are worth reading either way.`
          : ""),
      generation: supplied,
      generationSource: supplied ? "supplied" : "unknown",
      matchedBey: null,
      modelCodes: null,
      dateCode: null,
      signals: [],
      manualChecks: supplied
        ? [...GENERATION_BY_ID[supplied].checks, ...UNIVERSAL_CHECKS].sort(
            (a, b) => Number(b.decisive) - Number(a.decisive),
          )
        : [],
      question: supplied ? null : GENERATION_QUESTION,
      safetyNote: null,
      related: [],
      suggestedListingAuthenticity: null,
    };
  }

  /* --- resolve the bey and the generation ------------------------------- */
  const candidates = name ? matchBeys(name) : [];
  const pinned = request.modelSlug ? pinnedBey(request.modelSlug) : null;

  /*
   * 🛑 AMBIGUITY IS NOT RESOLVED SILENTLY. "Valkyrie" matches a dozen real
   * releases; announcing one of them would be a confident answer to a question
   * nobody asked, and every per-model fact downstream (the expected product
   * code above all) would then be about the wrong bey. So several candidates at
   * the same quality become a question, unless the user has already picked one.
   */
  const ambiguous = pinned === null && candidates.length > 1;
  const matchedBey = pinned ?? (ambiguous ? null : candidates[0] ?? null);

  const modelQuestion: ClarifyingQuestion | null = ambiguous
    ? {
        field: "model",
        question: `Which one? "${name}" matches ${candidates.length} releases.`,
        why:
          "The product code, the generation and the checks that apply are all different per release, so I would rather ask than pick one and be confidently wrong about the rest.",
        options: candidates.map((c) => ({
          value: c.slug,
          label: c.name,
          hint: `${c.code ?? "no retail code"} · ${GENERATION_BY_ID[c.generation].label}`,
        })),
      }
    : null;

  const fromProductCode = code ? generationFromProductCode(code) : null;

  /* --- the date code ---------------------------------------------------- */
  const looksLikeDateCode = code ? DATE_CODE_RE.test(normaliseToken(code)) : false;
  const dateCode = looksLikeDateCode ? analyseDateCode(code) : null;

  const { generation, generationSource } = resolveGeneration({
    supplied: request.generation,
    fromProductCode,
    matchedBey,
    ambiguous,
    candidates,
    dateCode,
  });

  /*
   * 🛑 The supplied generation still WINS — the person holding the box is the
   * better authority than a prefix — but a disagreement can no longer pass
   * silently, and that became load-bearing the day the form started arriving
   * pre-set to Metal Fight.
   *
   * The failure it prevents: a buyer types a Burst code into a form whose
   * generation selector they never touched, and gets the entire Metal Fight
   * checklist — die-cast Performance Tips, Fusion Wheel edges — none of which
   * exists on the thing in their hands, with nothing anywhere saying why. A
   * pre-set default that can be wrong has to be able to say "I may be the
   * wrong one here".
   *
   * `neutral`, not `concern`: picking the wrong item in a dropdown says
   * nothing whatever about the item's authenticity, and routing it through
   * `hasConcern` would turn a UI mismatch into "discrepancy found".
   */
  const impliedGeneration = fromProductCode ?? matchedBey?.generation ?? null;
  if (request.generation && impliedGeneration && impliedGeneration !== request.generation) {
    signals.push({
      id: "generation-mismatch",
      label: `You have ${GENERATION_BY_ID[request.generation].label} selected, but this looks like ${GENERATION_BY_ID[impliedGeneration].label}`,
      detail:
        `${fromProductCode ? `${code} is a ${GENERATION_BY_ID[impliedGeneration].label} code` : `${matchedBey?.name} is a ${GENERATION_BY_ID[impliedGeneration].label} release`}. ` +
        `I have gone with what you selected, because you can see the box and I cannot — but the checks below are the ${GENERATION_BY_ID[request.generation].label} ones, and if the selector is simply left on its default, change it and run this again.`,
      direction: "neutral",
      confidence: "verified",
    });
  }

  /* --- marque ----------------------------------------------------------- */
  const counterfeitMarque = marque ? findCounterfeitMarque(marque) : null;
  const licensed = marque ? isLicensedMarque(marque) : false;

  if (counterfeitMarque) {
    signals.push({
      id: "marque-unlicensed",
      label: `"${marque}" matches a known unlicensed producer`,
      detail: `${counterfeitMarque.name} — ${counterfeitMarque.note}`,
      direction: "concern",
      confidence: "verified",
      source: "beyblade.fandom.com/wiki/Counterfeit_Beyblades",
    });
  } else if (licensed) {
    signals.push({
      id: "marque-licensed",
      label: `"${marque}" is a licensed marque`,
      detail:
        "Takara Tomy, Hasbro, Sonokong and the regional importers (Funskool in India, NewBoy in the Middle East, Sheng Tai in Singapore and others) are all legitimate. A licensed importer's sticker is a positive signal, not a substitute marque.",
      direction: "supports-original",
      confidence: "verified",
    });
  } else if (marque) {
    signals.push({
      id: "marque-unrecognised",
      label: `"${marque}" is not a marque I recognise`,
      detail:
        "That is not the same as it being fake — my list is of named producers, and it is not exhaustive. But if that name is the most prominent branding on the box rather than Takara Tomy or Hasbro, treat it as an unlicensed product regardless of what it is called.",
      direction: "concern",
      confidence: "reported",
    });
  }

  /* --- name vs code consistency ----------------------------------------- */
  const expectedCode = matchedBey?.code ? normaliseToken(matchedBey.code) : null;
  const givenProductCode = code && !looksLikeDateCode ? normaliseToken(code) : null;

  const nameSignalRow = nameSignal(name, matchedBey, ambiguous, candidates);
  if (nameSignalRow) signals.push(nameSignalRow);


  if (expectedCode && givenProductCode) {
    if (expectedCode === givenProductCode) {
      signals.push({
        id: "code-matches-name",
        label: "The name and the product code agree",
        detail: `${matchedBey?.name} is ${matchedBey?.code}, which is the code you gave.`,
        direction: "supports-original",
        confidence: "verified",
      });
    } else if (request.randomBooster) {
      /*
       * 🛑 The Random Booster exception, and it is a real one rather than a
       * courtesy. A Random Booster box carries the BOOSTER's code — the
       * reference post records several, e.g. Pisces DF145BS under F2810 marked
       * "Random Booster TT" — so the bey inside legitimately does not match the
       * code on the box. Reporting that as a discrepancy would flag a large
       * class of genuine product as suspicious.
       */
      signals.push({
        id: "code-mismatch-random-booster",
        label: "Code does not match the model — but you said this is a Random Booster",
        detail: `A Random Booster box carries the booster's own code, not the code of the bey inside, so a mismatch here is expected and this one is very likely fine. ${matchedBey?.name} would be ${matchedBey?.code} if sold as its own Starter or Booster.`,
        direction: "neutral",
        confidence: "verified",
      });
    } else {
      signals.push({
        id: "code-mismatch",
        label: "The name and the product code do not agree",
        detail: `You gave ${code}, but ${matchedBey?.name} is ${matchedBey?.code}. Ask the seller which one the box actually says. If it is a Random Booster or a multi-pack, a mismatch is normal — say so and I will re-read it that way.`,
        direction: "concern",
        confidence: "verified",
      });
    }
  }

  /*
   * 🛑 A product code that merely EXISTS is not a signal, and saying so is the
   * most important thing this engine does. Measured on a counterfeit catalogue
   * crawled for this project: 516 real `B-xx`, 189 `BB-xx` and 147 `BX-xx`
   * codes across 1,277 unlicensed products. Only name-vs-code CONSISTENCY
   * carries information.
   */
  if (givenProductCode && fromProductCode) {
    signals.push({
      id: "product-code-shape",
      label: `${code} is a well-formed ${GENERATION_BY_ID[fromProductCode].label} code`,
      detail:
        "That tells us the generation, and nothing about authenticity — unlicensed sellers print real Takara Tomy codes routinely. One counterfeit catalogue measured for this site carried over 900 genuine product codes.",
      direction: "neutral",
      confidence: "verified",
      source: "docs/research/competitor-crawl-2026-10/counterfeit-signals.md",
    });
  }

  /* --- date code signals ------------------------------------------------ */
  if (dateCode) {
    const dcSignal = dateCodeSignal(dateCode, generation, matchedBey);
    if (dcSignal) signals.push(dcSignal);

    if (dateCode.wellFormed && dateCode.readings.length > 1) {
      signals.push({
        id: "date-code-disputed-decoding",
        label: "How this code decodes is disputed",
        detail: `Two readings circulate and Takara Tomy has published neither: ${dateCode.readings
          .map((r) => `${r.label} → ${r.value}`)
          .join("; ")}. Treat the date as indicative, not as a fact about the item.`,
        direction: "neutral",
        confidence: "disputed",
      });
    }

    /*
     * 🛑 A FACT ABOUT THE CALENDAR, not about the code — worth saying even
     * when the code itself matched nothing, which is why this sits outside
     * `dateCodeSignal`'s per-match branching rather than inside it.
     */
    if (dateCode.seriesWindow) {
      const w = dateCode.seriesWindow;
      signals.push({
        id: "date-code-series-window",
        label: `Falls inside the ${w.name} production window`,
        detail: `${w.name} ran ${w.startLabel} – ${w.endLabel}, per the source's own release-date notes — this places the DATE within a known manufacturing period, and says nothing about this specific code. (Under the month-day-year reading, which is disputed — see above.)`,
        direction: "neutral",
        confidence: "reported",
      });
    }

    /*
     * 🛑 CONTEXT, NEVER EVIDENCE. Only ever populated for `match.kind ===
     * "unknown"` (see the field's doc comment on `DateCodeAnalysis`), so this
     * only fires for a code that matched nothing — precisely the case where
     * the tool otherwise has nothing to offer beyond "not recorded".
     */
    if (dateCode.temporalContext) {
      const tc = dateCode.temporalContext;
      const listOf = (names: readonly string[], total: number) =>
        names.length === 0
          ? "none recorded"
          : names.join(", ") + (total > names.length ? `, and ${total - names.length} more` : "");
      signals.push({
        id: "date-code-temporal-context",
        label: `What the tables record from ${tc.monthLabel}`,
        detail:
          `Genuine releases: ${listOf(tc.originalProducts, tc.originalTotal)}. ` +
          `Midfake batches: ${listOf(tc.midfakeProducts, tc.midfakeTotal)}. ` +
          "This is context, not a match for your code — it says what else was moving through production or counterfeit batches around the same time, not that your item is one of these. The tables are a collectors' compilation, not a complete record, so your item matching none of them is not evidence of anything either.",
        direction: "neutral",
        confidence: "reported",
      });
    }
  }

  /* --- what the tables record about this bey ----------------------------- */
  const modelCodes = summariseModelCodes(matchedBey, dateCode);
  const modelCodeRow = modelCodeSignal(modelCodes);
  if (modelCodeRow) signals.push(modelCodeRow);

  /* --- verdict ---------------------------------------------------------- */
  /*
   * 🛑 A HEDGED MIDFAKE ROW DOES NOT REACH THE TOP RUNG.
   *
   * `likely-reproduction` is the most severe thing this engine can say, and it
   * must rest on a source that actually asserted it. Three `chinese-font` rows
   * carry their author's own words that *the code itself should be authentic*
   * and only the printed typeface differs — so answering "this matches a batch
   * recorded as a midfake" for one of them would be the engine asserting
   * something no source did, about a person's property, in the harshest
   * direction available to it.
   *
   * The finding is not dropped: the signal is still a `concern`, which lands
   * the verdict on `discrepancy-found` — "resolve this before you pay", with
   * the font comparison spelled out in the signal.
   */
  const hasMidfakeCode =
    dateCode?.match.kind === "known-midfake" && !dateCode.match.uncertain;
  const hasOriginalCode = dateCode?.match.kind === "known-original";
  const hasContestedCode = dateCode?.match.kind === "contested";
  const hasConcern = signals.some((s) => s.direction === "concern");

  const { verdict, headline, caveat, suggested } = decideVerdict({
    hasMidfakeCode,
    hasOriginalCode,
    hasContestedCode,
    hasConcern,
    counterfeitMarque,
    generation,
    /*
     * 🛑 A PICK counts as naming the model, even with the text field empty.
     * Otherwise the inconclusive rung tells somebody who just picked
     * "Lightning L-Drago 100HF" from a list that giving the model name would
     * unlock a check — the one thing they unambiguously did.
     */
    hasName: name.length > 0 || matchedBey !== null,
    hasCode: code.length > 0,
    originalProducts: dateCode?.match.kind === "known-original" ? dateCode.match.products : [],
    codeLabel: dateCode?.wellFormed ? dateCode.normalised : null,
    awaitingBoxCode: modelCodes?.suppliedCodeStatus === "not-checked" && modelCodes.originalCodes.length > 0,
    modelName: modelCodes?.name ?? null,
    recordedCodeCount: modelCodes?.originalCodes.length ?? 0,
  });

  /* --- manual checks ---------------------------------------------------- */
  const generationChecks: readonly ManualCheck[] = generation ? GENERATION_BY_ID[generation].checks : [];
  const manualChecks = [...generationChecks, ...UNIVERSAL_CHECKS].sort(
    (a, b) => Number(b.decisive) - Number(a.decisive),
  );

  /* --- related links into the taxonomy ---------------------------------- */
  const related: { label: string; href: string }[] = [];
  if (generation) {
    const g = GENERATION_BY_ID[generation];
    related.push({ label: `Browse ${g.label}`, href: `/categories/${g.categoryId}` });
  }
  if (matchedBey) {
    related.push({ label: `${matchedBey.name} listings`, href: `/categories/${matchedBey.categoryId}` });
    related.push({ label: `What ${matchedBey.name} sells for`, href: `/tools/price-index?q=${encodeURIComponent(matchedBey.name)}` });
  }
  related.push({ label: "The full spot-a-fake guide", href: "/spot-a-fake" });

  const reproductionPlausible = verdict === "likely-reproduction" || verdict === "discrepancy-found";
  const safetyNote = reproductionPlausible
    ? generation === "plastic"
      ? `${SAFETY_NOTE} ${PLASTIC_EXPLOSIVE_NOTE}`
      : SAFETY_NOTE
    : null;

  return {
    verdict,
    headline,
    caveat,
    generation,
    generationSource,
    matchedBey,
    modelCodes,
    dateCode,
    signals,
    manualChecks,
    /*
     * The model question outranks the generation one: resolving the model
     * usually answers the generation for free, so asking both at once would be
     * two questions where one will do.
     */
    question: modelQuestion ?? (generation ? null : GENERATION_QUESTION),
    safetyNote,
    related,
    suggestedListingAuthenticity: suggested,
  };
}

/**
 * Re-exported for server-side callers and the tester.
 *
 * 🛑 CLIENT CODE MUST NOT IMPORT IT FROM HERE. The numbers used to be computed
 * from `ORIGINAL_DATE_CODES.length` and friends right in this module, which
 * meant the "what this tool actually knows" panel — four integers in a client
 * component — dragged the engine, the 495-row code table and the 220-row
 * canonical index into the browser bundle. They are generated into
 * `data/knowledge-sizes.generated.ts`, which has no imports at all; import that.
 */
export { KNOWLEDGE_BASE_SIZES };

export { AFTERMARKET_FRAMING_NOTE };
