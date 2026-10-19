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
  MIDFAKE_DATE_CODES,
  ORIGINAL_DATE_CODES,
  UNCLEAR_DATE_CODES,
  type DateCodeRow,
} from "./data/date-codes.generated";
import { CANONICAL_BEYS, type CanonicalBey } from "./data/canonical-index.generated";
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

const CODE_TABLES: readonly { readonly rows: readonly DateCodeRow[]; readonly kind: "known-original" | "known-midfake" | "unclear" }[] =
  [
    { rows: MIDFAKE_DATE_CODES, kind: "known-midfake" },
    { rows: ORIGINAL_DATE_CODES, kind: "known-original" },
    { rows: UNCLEAR_DATE_CODES, kind: "unclear" },
  ];

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
   * A code that MATCHED needs no suggestion — offering "did you mean" beside
   * a definite answer reads as doubt about it.
   */
  const nearMisses: readonly string[] = [];

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
        match: {
          kind: "known-midfake",
          products: row.products,
          note:
            "This code belongs to a batch the community records as a midfake run — Takara-Tomy-blueprint product of reduced quality. There is no official Takara Tomy statement about these batches.",
          confidence: "verified",
        },
      };
    }
    return {
      raw,
      normalised,
      wellFormed: true,
      readings,
      nearMisses,
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

  if (match.kind === "known-midfake") {
    return {
      id: "date-code-midfake",
      label: `${dateCode.normalised} is a recorded midfake batch code`,
      detail: `${match.note} Observed on: ${match.products.slice(0, 6).join(", ")}.`,
      direction: "concern",
      confidence: match.confidence,
      source: "r/Beyblade reference post, archived in docs/research/beyblade-authenticity-2026-10/sources/",
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
        `Recorded on genuine boxes of: ${match.products.slice(0, 6).join(", ")}. ` +
        (notThisBey
          ? `Note it is not recorded against ${matchedBey.name} specifically — the same production date covers whatever was boxed that day, so this is weak support rather than confirmation.`
          : ""),
      direction: "supports-original",
      confidence: "verified",
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
      label: `${dateCode.normalised} is not in either table`,
      detail:
        "The reference table is 90 distinct codes compiled by collectors from boxes they held — it was never complete, so an absent code means 'not recorded', not 'fake'. New genuine codes turn up regularly.",
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
    return {
      verdict: "consistent-with-original",
      headline: "Everything I can check is consistent with a genuine release.",
      caveat:
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
  if (!name && !code && !marque && !request.generation) {
    return {
      verdict: "needs-input",
      headline: "Tell me what you are looking at.",
      caveat:
        "A model name, the code on the box, or the brand printed on the packaging — any one of the three is enough to start.",
      generation: null,
      generationSource: "unknown",
      matchedBey: null,
      dateCode: null,
      signals: [],
      manualChecks: [],
      question: GENERATION_QUESTION,
      safetyNote: null,
      related: [],
      suggestedListingAuthenticity: null,
    };
  }

  /* --- resolve the bey and the generation ------------------------------- */
  const candidates = name ? matchBeys(name) : [];
  const pinned = request.modelSlug ? candidates.find((c) => c.slug === request.modelSlug) ?? null : null;

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
  }

  /* --- verdict ---------------------------------------------------------- */
  const hasMidfakeCode = dateCode?.match.kind === "known-midfake";
  const hasOriginalCode = dateCode?.match.kind === "known-original";
  const hasConcern = signals.some((s) => s.direction === "concern");

  const { verdict, headline, caveat, suggested } = decideVerdict({
    hasMidfakeCode,
    hasOriginalCode,
    hasConcern,
    counterfeitMarque,
    generation,
    hasName: name.length > 0,
    hasCode: code.length > 0,
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

/** Exported for the UI's "what does this tool know" panel and for the tester. */
export const KNOWLEDGE_BASE_SIZES = {
  canonicalBeys: CANONICAL_BEYS.length,
  originalCodes: ORIGINAL_DATE_CODES.length,
  midfakeCodes: MIDFAKE_DATE_CODES.length,
  unclearCodes: UNCLEAR_DATE_CODES.length,
  generations: GENERATIONS.length,
} as const;

export { AFTERMARKET_FRAMING_NOTE };
