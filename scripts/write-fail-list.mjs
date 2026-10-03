#!/usr/bin/env node
/**
 * write-fail-list.mjs — emit the case IDs a run recorded as FAILED, one per line.
 *
 * Feeds `fetch-cases.mjs --cases <file>`, which already accepts a
 * newline-delimited ID list (tester/scripts/fetch-cases.mjs:618-652) and rebuilds
 * batches from only those cases. That flag has existed all along; the only missing
 * piece was something to generate its input, which is this file.
 *
 * Usage:
 *   TEST_RUN_ID=run-3 node scripts/write-fail-list.mjs            > fails.txt
 *   TEST_RUN_ID=run-3 node scripts/write-fail-list.mjs --unreachable >> fails.txt
 *   TEST_RUN_ID=run-3 node scripts/write-fail-list.mjs --count     # summary to stderr
 *
 * ## Why the IDs come from `tally()` and not from a fresh walk of the verdicts
 *
 * `scripts/lib/test-run.mjs` already computes `failedCases` as `{ id, key, comment }`
 * for every `answer === "no"`, and it already does the two things a hand-rolled walk
 * gets wrong: it drops control cases via `isControlId`, and it joins verdicts to
 * their batch by `row.key` from `scope.json` rather than by filename. Re-deriving
 * that here would be a second implementation of the same rule — the exact shape
 * Root Cause #75 is about.
 *
 * ## `--unreachable` is a RECLASSIFICATION, not a convenience
 *
 * 29 of run-3's nulls are not abstentions at all: their comments say the surface or
 * the control does not exist ("there is NO X section", "returns 404", "could not
 * locate"). A page that cannot be reached is a defect recorded in the wrong column,
 * and leaving those in the null pool guarantees they are re-abstained by whoever
 * works that page next. This flag lifts them into the fail list so Run 4 drives them
 * as the defects they are.
 *
 * 🛑 It matches on the VERDICT COMMENT, which is prose, so it is a triage aid and
 * not an oracle. Print them with `--count` and read the list before appending it —
 * a case whose comment merely MENTIONS a 404 (e.g. "the 404 page renders correctly")
 * is a false positive, and the cost of one is a Run 4 batch spent re-driving a case
 * that was never broken.
 */

import { RUN_ID, tally, readVerdicts } from "./lib/test-run.mjs";

const args = new Set(process.argv.slice(2));
const wantUnreachable = args.has("--unreachable");
const wantCount = args.has("--count");
const wantSiblings = args.has("--with-siblings");

/*
 * The surface-absent vocabulary, derived from the run-3 corpus rather than guessed.
 * Deliberately narrow: it requires a phrase asserting ABSENCE, not merely the word
 * "404" or "missing" appearing somewhere in a long comment.
 */
const UNREACHABLE =
  /there is NO\b|does not exist|could not locate|cannot be reached|unreachable|returns? (a )?404|404s?\b.{0,30}(instead|rather|for every)|no such (page|route|section|control|tab)|never rendered|renders nothing/i;

/* A comment that merely describes a 404 page behaving correctly is not a defect. */
const FALSE_POSITIVE =
  /404 page (renders|loads|is) correct|correctly 404|404 is correct|as expected.{0,20}404|not-found page renders/i;

/*
 * 🛑 PRIORITY EXCLUSIONS — without these the match is 4.7x too wide.
 *
 * Measured: the bare UNREACHABLE pattern above matches 138 of the 669 nulls, while
 * the number whose PRIMARY reason is an absent surface is 29. The gap is because
 * most nulls stack two or three reasons, and a comment that refuses on PRESERVE
 * grounds or reports an upstream blocker will often also mention that some control
 * was missing. Counting those as "surface unreachable" would pull ~109 cases into
 * Run 4 that belong in Run 5 behind a different unlock.
 *
 * So a candidate is only reclassified if it matches NONE of the higher-priority
 * reasons. This mirrors the priority-ordered classifier the bucket table was built
 * with: policy and environment blockers first, then case quality, then budget.
 *
 * This is the same failure mode as Root Cause #84 — a measurement wider than the
 * rule it feeds, returning a confident number nobody can act on. The tell here was
 * 138 against an expected 29, which is why the count is printed before anything is
 * appended.
 */
const HIGHER_PRIORITY = [
  /* PRESERVE-tier refusal */
  /PRESERVE|safety rule|real account|saved address|Site Settings|permanent damage|NOT DRIVEN BY DESIGN|REFUSING THIS CASE/i,
  /* human channel */
  /real (gmail|email|inbox)|email inbox|interactive Google|Google sign-in|\bOTP\b|WhatsApp|mailbox/i,
  /* external console */
  /firebase console|google cloud|gcp console|cloud scheduler|\brtdb\b|realtime database|cloud console/i,
  /* upstream blocker */
  /batch-?21[0-9]|upstream|blocked (on|by)|BLOCKED|gated on|gated by|same root cause|image upload (never|does not)|product creation/i,
  /* precondition consumed or never produced by an earlier case */
  /READS the|supposed to leave behind|earlier case|depends on the|consumed by|does not exist: creation/i,
  /* mutation needing teardown */
  /teardown|would (create|publish|delete|save)|restore step|mutates real|irreversible|pollut/i,
  /* needs two identities */
  /two (different )?(buyers|accounts|identities|sessions)|second (account|identity|buyer)|needs two/i,
  /* real timer — not shortenable inside a session */
  /FIXTURE GAP|real timer|time-bound|15-minute|48-hour|wait .{0,20}(hours|days)|\bcron\b|scheduled (job|function)|elapsed/i,
  /* missing session for a named identity */
  /no session|holds no session|no stored session|no persona/i,
  /* fixture / data gap — the queue is empty, no such row exists to act on */
  /no EMI order|Inbox zero|No pending|All caught up|is empty\b|no rows|zero rows|nothing to (find|open|reject|act)|one cannot be created|no banned/i,
];

const { fail, abstain, failedCases } = tally();

if (wantUnreachable) {
  const rows = [];
  for (const [key, verdicts] of readVerdicts()) {
    for (const v of verdicts) {
      if (v.answer !== null && v.answer !== undefined) continue;
      const c = String(v.comment ?? "");
      if (!UNREACHABLE.test(c) || FALSE_POSITIVE.test(c)) continue;
      if (HIGHER_PRIORITY.some((re) => re.test(c))) continue;
      rows.push({ id: v.id, key, comment: c.replace(/\s+/g, " ").slice(0, 150) });
    }
  }
  if (wantCount) {
    process.stderr.write(
      `run ${RUN_ID}: ${rows.length} null(s) assert an absent surface, of ${abstain} nulls\n\n`,
    );
    for (const r of rows) process.stderr.write(`  [${r.key}] ${r.id}\n      ${r.comment}\n`);
  } else {
    for (const r of rows) process.stdout.write(r.id + "\n");
    process.stderr.write(`✓ ${rows.length} reclassified-unreachable id(s) from run ${RUN_ID}\n`);
  }
} else if (wantSiblings) {
  /*
   * 🛑 --with-siblings — emit EVERY case on any page that holds a failure.
   *
   * Fail-only scoping silently drops precondition PRODUCERS. Measured on run-4:
   * 3 of the first 8 real cases were unanswerable for this reason alone —
   * buyer-addresses' edit-address-persists and set-default-address both key on a
   * "QA Addr create" row, and seller-listing's listing-appears-in-seller-list on
   * a "QA Listing seller-listing" row. Each row is created by a SIBLING case that
   * PASSED in run-3, so it was never emitted, `--cases` excluded it, and the
   * dependents arrived with no precondition. Every one of those three underlying
   * defects was independently verified FIXED; the cases simply could not say so.
   *
   * Why whole PAGES and not a dependency graph: no case declares what it needs.
   * `TesterChecklistItemDocument` has no `precondition` / `requires` field, so a
   * real graph would have to be inferred from prose. But the dependency is always
   * WITHIN a page — a case consumes what an earlier case in its own batch left
   * behind, which is exactly why the skill says to work a batch in order. Taking
   * the whole page is therefore sound by construction rather than by guesswork.
   *
   * The cost is a bigger run: every failing page contributes its passing cases
   * too. That is the right trade for a re-verification pass — a sibling that
   * passes again costs one re-drive, whereas a missing precondition costs a
   * verdict that cannot be earned at all.
   */
  const pages = new Map();
  for (const [key, verdicts] of readVerdicts()) {
    pages.set(key, verdicts.map((v) => v.id).filter((id) => !/^control-/.test(id)));
  }
  const failingKeys = new Set(failedCases.map((f) => f.key));
  const ids = new Set();
  for (const key of failingKeys) for (const id of pages.get(key) ?? []) ids.add(id);

  if (wantCount) {
    process.stderr.write(
      `run ${RUN_ID}: ${failedCases.length} failure(s) across ${failingKeys.size} page(s)\n` +
        `  emitting ${ids.size} id(s) — the failures plus ${ids.size - failedCases.length} sibling(s)\n`,
    );
  } else {
    for (const id of ids) process.stdout.write(id + "\n");
    process.stderr.write(
      `✓ ${ids.size} id(s) from run ${RUN_ID}: ${failedCases.length} failure(s) + ` +
        `${ids.size - failedCases.length} sibling(s) across ${failingKeys.size} page(s)\n`,
    );
  }
} else {
  if (wantCount) {
    process.stderr.write(`run ${RUN_ID}: ${fail} failure(s), ${abstain} null(s)\n\n`);
    for (const f of failedCases) {
      process.stderr.write(`  [${f.key}] ${f.id}\n`);
    }
  } else {
    for (const f of failedCases) process.stdout.write(f.id + "\n");
    process.stderr.write(`✓ ${failedCases.length} failed case id(s) from run ${RUN_ID}\n`);
  }
}
