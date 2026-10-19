/**
 * Types for the authenticity checker (`/tools/authenticity`).
 *
 * Research and provenance: docs/research/beyblade-authenticity-2026-10/README.md
 *
 * 🛑 The verdict vocabulary is deliberately NOT boolean. Three measured reasons,
 * each recorded in the research doc:
 *
 * 1. Counterfeit sellers in this market use REAL Takara Tomy product codes —
 *    516 `B-xx` and 189 `BB-xx` across one crawled catalogue — so a code that
 *    exists proves nothing and a true/false answer would be built on sand.
 * 2. The MFB box date-code decoding is a community reconstruction with TWO
 *    incompatible readings in circulation and no Takara Tomy statement.
 * 3. A false counterfeit accusation against a real seller is worse than a
 *    missed one (the crawl doc's own rule). The engine can reach
 *    "likely-reproduction" about a BATCH or a BRAND; it never accuses a seller.
 */

/** The six generations the tool covers. */
export type GenerationId = "plastic" | "hms" | "mfb" | "zerog" | "burst" | "x";

/**
 * How much weight to put on the answer.
 *
 * 🛑 `needs-input` is a first-class outcome, not an error. The user asked for
 * exactly this: when the generation cannot be inferred, ASK which generation it
 * is rather than guessing — a guess sends a Burst buyer an MFB date-code
 * decode, which is confidently wrong.
 */
export type AssessmentVerdict =
  /** A known-original box code matched, or name and code agree and nothing else is off. */
  | "consistent-with-original"
  /** Nothing contradicts it, but nothing confirms it either. The honest default. */
  | "inconclusive"
  /** A specific discrepancy worth resolving before buying. */
  | "discrepancy-found"
  /** Matched a midfake code family, or a named non-licensed marque. About a batch/brand. */
  | "likely-reproduction"
  /** Not enough to say anything at all; a clarifying question is attached. */
  | "needs-input";

/** Why a signal fired, and how much the sources actually support it. */
export type SignalConfidence =
  /** Multiple independent community sources, or this project's own measurement. */
  | "verified"
  /** One source, or a source we could not read directly (e.g. behind Cloudflare). */
  | "reported"
  /** Circulating with known disagreement. Shown with the disagreement intact. */
  | "disputed";

export type SignalDirection = "supports-original" | "concern" | "neutral";

export interface AssessmentSignal {
  /** Stable id, so the UI can key and the tester can assert on one row. */
  readonly id: string;
  readonly label: string;
  /** One sentence. What was checked and what came back. */
  readonly detail: string;
  readonly direction: SignalDirection;
  readonly confidence: SignalConfidence;
  /** Where this rule comes from, for the "why should I believe this" link. */
  readonly source?: string;
}

/** A manual check the buyer should perform, because the tool cannot. */
export interface ManualCheck {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  /** Checks that are conclusive on their own come first. */
  readonly decisive: boolean;
}

/**
 * A question the engine needs answered before it will commit to more.
 * Rendered as choices, so answering is one tap and cannot be mistyped.
 */
export interface ClarifyingQuestion {
  /**
   * `generation` — the checks differ completely per generation.
   * `model` — the typed name matches several real releases, and picking one
   * silently would be exactly the overconfidence this tool exists to avoid.
   */
  readonly field: "generation" | "model";
  readonly question: string;
  readonly why: string;
  readonly options: readonly { readonly value: string; readonly label: string; readonly hint: string }[];
}

/** Both readings of an MFB-style code, never collapsed into one. */
export interface DateCodeReading {
  readonly interpretation: "month-day-year" | "factory-week-year";
  readonly label: string;
  readonly value: string;
}

export interface DateCodeAnalysis {
  readonly raw: string;
  readonly normalised: string;
  /** Whether it even looks like a TT box code (one letter + four digits). */
  readonly wellFormed: boolean;
  readonly readings: readonly DateCodeReading[];
  /** Matched against the known-original / midfake / contested / unclear tables. */
  readonly match:
    | {
        readonly kind: "known-original";
        readonly products: readonly string[];
        readonly date: string;
        /**
         * Regions the code is recorded in — Japan, Taiwan (Funbox Toys), Korea
         * (Sonokong), Hong Kong (Mani Limited), Middle East (NewBoy), Indonesia.
         *
         * Worth surfacing rather than keeping internal: a buyer holding a box
         * covered in Korean text and no Japanese is usually asking whether that
         * is wrong, and "this code is recorded on Korean Sonokong releases" is
         * the answer. The old table had no region data at all, so the tool could
         * only say the code existed.
         */
        readonly regions: readonly string[];
        /** Per-batch observations: mould variants, importer stickers, launcher colour. */
        readonly notes: readonly string[];
        /** The source itself hedged — a blurry photo, or two codes it could not separate. */
        readonly uncertain: boolean;
      }
    | {
        readonly kind: "known-midfake";
        readonly products: readonly string[];
        readonly note: string;
        readonly confidence: SignalConfidence;
        /**
         * Which midfake family. 🛑 `chinese-font` is not a claim about the code:
         * the source's own note is that the code is authentic and the printed
         * TYPEFACE is what differs, so the engine must point at the font rather
         * than treat the match as the finding.
         */
        readonly families: readonly string[];
        readonly regions: readonly string[];
        readonly notes: readonly string[];
        /**
         * The source hedged about THIS ROW — distinct from how strong the
         * source is in general.
         *
         * 🛑 It is what keeps the verdict off the top rung. Three
         * `chinese-font` rows carry the author's own note that *the code
         * itself should be authentic* and only the printed font differs;
         * returning "likely reproduction" for a code a source calls authentic
         * is the overclaim this engine exists to avoid.
         */
        readonly uncertain: boolean;
      }
    /**
     * 🛑 The sources CONTRADICT each other about this exact code — one records
     * it on genuine boxes, another on a midfake batch.
     *
     * This is its own kind rather than a weaker midfake because the two errors
     * are not symmetrical and both are expensive: presenting the midfake
     * reading accuses the holder of a genuine box, and presenting the original
     * reading reassures the holder of a fake. Four codes are in this state as
     * of the 2026-10-19 merge. Both readings are carried so the UI can show
     * both, and the verdict it drives is "resolve this before you pay".
     */
    | {
        readonly kind: "contested";
        readonly products: readonly string[];
        readonly recordedOriginalBy: readonly string[];
        readonly recordedMidfakeBy: readonly string[];
        readonly families: readonly string[];
      }
    | { readonly kind: "unclear"; readonly products: readonly string[]; readonly note: string }
    | { readonly kind: "unknown" };
  /**
   * Codes one character away from `normalised` that ARE in the tables.
   *
   * ## 🛑 This is INPUT CORRECTION. It is never evidence.
   *
   * A near-miss is ambiguous between a typo and a mimicking batch, and this
   * tool's third rule is that "a false counterfeit accusation against a real
   * seller is worse than a missed one". So a near miss must not become a
   * signal, must not fire the trademark-evasion warning, and must not move
   * the verdict by so much as one step. It is a "did you mean A0813?"
   * affordance and nothing else.
   *
   * It is also why the tool's name matching and the SITE SEARCH matcher stay
   * separate systems. Search's alias table is derived from a counterfeit
   * seller's own 1,277 titles on the insight that an evasion spelling is the
   * same string a real buyer mistypes — true for finding things, and exactly
   * backwards for judging them. Routing a verdict through that matcher would
   * silence the evasion warning by construction.
   *
   * Empty whenever the code matched, or is not well-formed, or nothing in the
   * tables is within one edit.
   */
  readonly nearMisses: readonly string[];
}

/** A canonical bey the input resolved to. */
export interface MatchedBey {
  readonly slug: string;
  readonly name: string;
  readonly code: string | null;
  readonly generation: GenerationId;
  readonly categoryId: string;
  /** "exact" | "alias" | "fuzzy" — fuzzy is what catches evasion misspellings. */
  readonly how: "exact" | "alias" | "fuzzy";
  /** Only set for a fuzzy hit: the spelling the user typed. */
  readonly typedAs?: string;
}

export interface AuthenticityRequest {
  /** Model name, as typed. Optional — a code alone is a valid query. */
  readonly name?: string;
  /** Box/product code (`BB-105`) or box date code (`A0813`). Optional. */
  readonly code?: string;
  /** Set once the user answers the generation question. */
  readonly generation?: GenerationId;
  /** Set once the user picks one of several matching models, by canonical slug. */
  readonly modelSlug?: string;
  /** "Is it a Random Booster?" — changes how a loose/mismatched part reads. */
  readonly randomBooster?: boolean;
  /** The marque printed on the box, if the buyer can see one. */
  readonly marque?: string;
}

export interface AuthenticityAssessment {
  readonly verdict: AssessmentVerdict;
  /** One plain sentence. Must survive being read on its own, out of context. */
  readonly headline: string;
  /** The hedge. Always present — there is no verdict here that needs no caveat. */
  readonly caveat: string;
  readonly generation: GenerationId | null;
  /** How the generation was established, so the UI can say "you told us". */
  readonly generationSource: "inferred-from-code" | "inferred-from-name" | "supplied" | "unknown";
  readonly matchedBey: MatchedBey | null;
  readonly dateCode: DateCodeAnalysis | null;
  readonly signals: readonly AssessmentSignal[];
  readonly manualChecks: readonly ManualCheck[];
  readonly question: ClarifyingQuestion | null;
  /** Safety text, shown whenever a reproduction tier is plausible. */
  readonly safetyNote: string | null;
  /** Links into the category system for the resolved generation / model. */
  readonly related: readonly { readonly label: string; readonly href: string }[];
  /**
   * Maps onto `ProductAuthenticity` so a seller can carry the result straight
   * into a listing's authenticity field. `null` when the tool will not suggest
   * one — which is most of the time, and is the point.
   */
  readonly suggestedListingAuthenticity: "original" | "reproduction" | "unverified" | null;
}
