/**
 * The six-part case contract.
 *
 * ## 🛑 This file was committed EMPTY, and that silently blinded a rule
 *
 * `audit-case-corpus`' R11 derives the required field set by reading
 * `interface AuthoredCase` out of this file, specifically so the contract
 * cannot drift from what `fetch-cases.mjs` actually forwards to a batch. That
 * mechanism is the fix for a real incident: `toBatches()` once reduced
 * `steps` to a boolean `alreadyAuthored`, so **all 1,139 authored procedures
 * reached the tester as a label and a sentence and it improvised** — and the
 * symptom was a batch that ran and produced verdicts, i.e. it looked like it
 * was working.
 *
 * This file has been **0 bytes since the corpus moved into `tester/`**
 * (`8cd1226f8`), and `interface AuthoredCase` existed nowhere in the repo. So
 * R11 reported "the parser is broken, not the contract" on every run, and the
 * guarantee CLAUDE.md states — *"derives the required field set from
 * `interface AuthoredCase` so it cannot recur"* — had no mechanism behind it.
 * R11's own comment predicted exactly this: *"a parser that extracts nothing
 * reports OK forever, which is worse than no rule at all."* It was at least
 * loud about it rather than silent, which is the only reason it was findable.
 *
 * ## 🛑 The contract below was MEASURED, not reconstructed from memory
 *
 * Counted across every `tester/cases/authored/*.mjs`: **1,437 cases, and all
 * 1,437 carry exactly these six keys.** The optional ones are genuinely
 * optional — `inputs` 637, `expectedData` 568, and the four review/channel
 * fields in single digits. Nothing was invented to fill a gap.
 *
 * Note the key is **`roles`**, plural and an array. CLAUDE.md's prose calls it
 * "role"; the corpus has never used that spelling.
 *
 * ## 🛑 The INTERFACE BELOW IS THE SOURCE OF TRUTH, comment or not
 *
 * R11 does `indexOf("interface AuthoredCase")` and then matches two-space
 * indented `field?:` lines, so the block must stay un-prefixed — a JSDoc body
 * whose lines begin ` * ` does NOT match `^\s{2}(\w+)\??:` and would blind the
 * rule again in exactly the way this file already did once.
 *
 * Do not add a parallel runtime array of the same names. Two lists of one
 * contract is the mirror-drift problem (Root Cause #42), and the rule reads
 * this one.
 */

/*
interface AuthoredCase {
  roles: string[];
  startPage: string;
  steps: string[];
  expectedBehaviour: string;
  expectedUiState: string;
  endResult: string;
  inputs?: Record<string, string>;
  expectedData?: string;
  requiresHumanChannel?: boolean;
  humanChannelReason?: string;
  needsReview?: boolean;
  reviewNote?: string;
}
*/

export {};
