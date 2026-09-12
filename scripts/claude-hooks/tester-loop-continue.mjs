#!/usr/bin/env node
/*
 * Stop hook: keep the sequential tester phase loop going.
 *
 * Exit 0 -> the turn ends normally.
 * Exit 2 -> the turn is BLOCKED and this script's stdout is fed back to the
 *           assistant as its next instruction.
 *
 * 🛑 WHY THIS EXISTS. Across one session the user had to type "continue", "why
 * stop?" and "do not stop" repeatedly, because the assistant treats writing a
 * status summary as a turn boundary. A memory entry was written about it and the
 * behaviour recurred anyway. A note is not a mechanism; this is the mechanism.
 *
 * 🛑 THIS SCRIPT CAN RE-INVOKE THE ASSISTANT INDEFINITELY. Three independent
 * safeguards, because a runaway loop here costs real money and real rate limit:
 *
 *   1. DEFAULT OFF. No state file, unreadable state file, or `active` anything
 *      other than exactly `true` -> exit 0. It can never switch itself on, and a
 *      corrupt file fails toward silence rather than toward spinning.
 *   2. AN OFF SWITCH A HUMAN CAN REACH IN ONE STEP. Delete the file, or set
 *      `active: false`. No code edit, no restart.
 *   3. A HARD BOUND. `continuations` increments on every fire; at
 *      `maxContinuations` it stands down loudly. The bound should never be
 *      reached — that is exactly why it must exist.
 *
 * The state file is also what makes the loop survive a context compaction: the
 * assistant does not have to remember which phase it is on, because the hook
 * tells it. That is the difference between a loop that resumes and one that
 * restarts from the beginning.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { budgetStatus, formatDuration, ESTIMATED_READS_PER_BATCH } from "../../tester/scripts/lib/quota-budget.mjs";

const REPO = process.cwd();
const STATE = resolve(REPO, "tester/.tester-runs/loop-state.json");
const PROGRESS = resolve(REPO, "docs/TESTING-PROGRESS.md");

/** Stand down silently. Used for every ambiguous case. */
function standDown(reason) {
  if (reason) console.log(reason);
  process.exit(0);
}

if (!existsSync(STATE)) standDown();

let state;
try {
  state = JSON.parse(readFileSync(STATE, "utf8"));
} catch {
  standDown("tester loop: state file is unreadable — standing down (delete it to silence this).");
}

// `=== true` and not a truthy check: "false", 0 and "" must all mean off.
if (state?.active !== true) standDown();

const runId = String(state.runId ?? "");
const nextPhase = Number(state.nextPhase ?? 0);
const totalPhases = Number(state.totalPhases ?? 35);
const continuations = Number(state.continuations ?? 0);
const maxContinuations = Number(state.maxContinuations ?? 500);

if (!runId || !Number.isFinite(nextPhase) || nextPhase < 1) {
  standDown("tester loop: state file has no usable runId/nextPhase — standing down.");
}

if (continuations >= maxContinuations) {
  standDown(
    `🛑 tester loop: hit maxContinuations (${maxContinuations}) and is standing down.\n` +
      `   This bound exists to stop a runaway; reaching it means something is wrong.\n` +
      `   Inspect ${STATE}, then raise maxContinuations or set active:false.`,
  );
}

/** Persist the incremented counter before exiting 2, or the bound never advances. */
function bump(extra = {}) {
  try {
    writeFileSync(
      STATE,
      JSON.stringify({ ...state, ...extra, continuations: continuations + 1, updatedAt: new Date().toISOString() }, null, 2),
    );
  } catch {
    /* a failed write must not crash the hook — worst case the bound advances slowly */
  }
}

/** Consolidated batch rows, read from the progress document. */
function consolidatedCount() {
  try {
    return readFileSync(PROGRESS, "utf8").split("\n").filter((l) => /^\|\s*`/.test(l)).length;
  } catch {
    return 0;
  }
}

/* ── Finished? ─────────────────────────────────────────────────────────────── */
if (nextPhase > totalPhases) {
  standDown(
    `✓ tester loop: all ${totalPhases} phases are done.\n` +
      `  Run the final gate, then set active:false in ${STATE}:\n` +
      `    node tester/scripts/record-verdicts.mjs --run ${runId} --finish\n` +
      `  It must write a report WITHOUT --force-report. Anything less means a batch never recorded.`,
  );
}

/* ── Daily free-tier budget ────────────────────────────────────────────────
 *
 * 🛑 THE RUN MUST NOT TAKE PRODUCTION DOWN FOR REAL USERS.
 *
 * The tester drives real page loads, and those read Firestore on the same project
 * the live site uses. On 2026-09-11 a run consumed 47K of the 50K daily reads and
 * production began serving 500s — the run did not merely spend its own budget, it
 * broke the site for everyone and then recorded the wreckage as defects.
 *
 * So the loop stops itself at HALF the daily quota, leaving the rest for real
 * visitors, scheduled Functions and the admin surfaces.
 */
const budget = budgetStatus(state);
if (budget.exhausted) {
  bump({ blocked: "daily-quota-budget" });
  console.log(
    `⏸ TESTER LOOP PAUSED — daily free-tier budget reached
` +
      `
` +
      `  ${budget.used}/${budget.limit} batches run today (Pacific day ${budget.today}),
` +
      `  about ${budget.estimatedReadsUsed.toLocaleString()} Firestore reads of the 50,000/day free tier.
` +
      `  The remaining half is deliberately left for real visitors and scheduled jobs.
` +
      `
` +
      `  Quota resets in ${formatDuration(budget.resetInMs)} (midnight America/Los_Angeles).
` +
      `
` +
      `  DO NOT run another phase today. Wait with a harness-tracked background job:
` +
      `    Bash(run_in_background: true):
` +
      `      node -e "setTimeout(()=>process.exit(0), ${budget.resetInMs})" && echo QUOTA_RESET
` +
      `
` +
      `  Work that costs no quota meanwhile: re-verify suspect findings against source,
` +
      `  prepare fixes, keep npm run check green.
`,
  );
  process.exit(2);
}

/* ── Blocked? Re-check rather than trusting a stale flag ───────────────────── */
let blocked = state.blocked ?? null;
let healthLine = "";
if (blocked) {
  const health = spawnSync(process.execPath, ["tester/scripts/verify-prod-health.mjs", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 60_000,
  });
  let healthy = false;
  try {
    healthy = JSON.parse(String(health.stdout ?? "{}")).healthy === true;
  } catch {
    healthy = false;
  }
  if (healthy) {
    blocked = null;
    healthLine = "  Health:   ✓ RECOVERED — the block has cleared, resume testing";
  } else {
    bump({ blocked });
    /*
     * Still blocked. Exit 2 so the loop stays alive, but tell the assistant to
     * WAIT rather than test — a tight spin here would burn turns and rate limit
     * for hours while production is down.
     */
    console.log(
      `⏸ TESTER LOOP BLOCKED — ${blocked}\n` +
        `\n` +
        `  Production is still degraded. DO NOT run a phase: every verdict recorded\n` +
        `  now would be evidenced and wrong.\n` +
        `\n` +
        `  Do this instead — a harness-tracked background wait that notifies on exit,\n` +
        `  so the loop continues without spinning:\n` +
        `\n` +
        `    Bash(run_in_background: true):\n` +
        `      until node tester/scripts/verify-prod-health.mjs >/dev/null 2>&1; do sleep 600; done; echo RECOVERED\n` +
        `\n` +
        `  While waiting, useful work that needs NO quota:\n` +
        `    - re-read suspect findings in docs/TRIAGE-${runId}.md against source\n` +
        `    - prepare (do not apply) fixes for the confirmed-real ones\n` +
        `    - keep npm run check green\n`,
    );
    process.exit(2);
  }
}

/* ── Normal: tell the assistant exactly what to run next ───────────────────── */
bump({ blocked: null });

console.log(
  `▶ TESTER LOOP ACTIVE — run ${runId}, phase ${nextPhase} of ${totalPhases} (continuation ${continuations + 1})\n` +
    `\n` +
    `  Do NOT end the turn. The loop is not finished.\n` +
    `\n` +
    `  1. Health gate (FATAL — if it exits 1, set blocked:"firestore-quota" in the\n` +
    `     state file and wait; do not test):\n` +
    `       node tester/scripts/verify-prod-health.mjs\n` +
    `\n` +
    `  2. Run the phase, ONE session at a time:\n` +
    `       node tester/scripts/pool.mjs --run ${runId} --phase ${nextPhase} --workers 1\n` +
    `\n` +
    `  3. Triage by ROOT CAUSE, not per symptom:\n` +
    `       node scripts/triage-findings.mjs --run ${runId} --out docs/TRIAGE-${runId}.md\n` +
    `\n` +
    `  4. RE-VERIFY each failure against live production BEFORE fixing it (Rule #4).\n` +
    `     A route that exists in source but 404s in a report is usually the report.\n` +
    `\n` +
    `  5. Fix the confirmed ones, npm run check, commit. Then set nextPhase=${nextPhase + 1}\n` +
    `     in ${STATE}.\n` +
    `\n` +
    (healthLine ? healthLine + "\n" : "") +
    `  Progress: ${consolidatedCount()} batch rows consolidated\n` +
    `  Off switch: set active:false in the state file, or delete it.\n`,
);
process.exit(2);
