#!/usr/bin/env node
/*
 * Emit the case ids that must be re-tested in the NEXT Test Run.
 *
 *   node scripts/tester-carry-forward.mjs --run <runId> --out <path>
 *
 * Replaces the inline `node -e` snippet that lived inside a JSON string field
 * in loop-state.json. That snippet produced pass2-failed-ids.txt /
 * pass2-blocked-ids.txt, and being a string in a config file it could not be
 * reviewed, tested, or fixed — the plan calls it out as one of three gaps.
 *
 * 🛑 WHAT CARRIES FORWARD, AND WHAT DOES NOT
 *
 *   FAIL            → carried. Obviously.
 *   BLOCKED         → carried. The spec is explicit: many blocked cases were
 *                     blocked BY the defect just fixed, so a run that re-tests
 *                     only failures leaves that coverage unrecovered.
 *   Accepted exception → NOT carried, but ONLY when it is also BLOCKED. A case
 *                     needing an interactive Google popup will be blocked again
 *                     for the same reason forever; re-driving it burns a session
 *                     to re-learn a known fact. They stay listed in every run
 *                     report so they are visible, not forgotten.
 *
 *                     🛑 A human-channel case that FAILED is carried like any
 *                     other failure. The flag says "this cannot be FULLY
 *                     automated", not "ignore its results" — and in
 *                     run-1789432098900 exactly one such case
 *                     (…forgot-reset-password-pages) reached a real defect
 *                     before running out of channel. Skipping on the flag alone
 *                     silently drops a genuine finding, which is how a defect
 *                     disappears from a regression cycle without anyone
 *                     deciding it should.
 *   control-*       → NOT carried. Controls are injected per batch by the
 *                     harness; naming them here would be a hard exit 1 from
 *                     fetch-cases (an id matching no catalogue case).
 *   PASS            → NOT carried. Each run is strictly smaller than the last;
 *                     a case that has passed is done. `--include-pass` exists
 *                     for a deliberate full regression sweep and is never the
 *                     default.
 *   NEVER ANSWERED  → carried. A case that was in the run's SCOPE but has no
 *                     verdict was not tested, and "not tested" is not "passed".
 *                     See the scope reconciliation below — this is the one way
 *                     the set is allowed to grow, and it exists to stop the
 *                     dangerous kind of shrinkage.
 *
 * 🛑 TWO KINDS OF SMALLER, AND ONLY ONE IS GOOD
 *
 * Dropping a case because it PASSED is the point of the cycle. Dropping one
 * because the run ended before reaching it is silent coverage loss, and it
 * looks identical in the numbers: run N+1 is smaller either way. So the scope
 * is reconciled against the verdicts, and anything scoped-but-unanswered is
 * carried with the rest.
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readRun, listRuns, FAIL, BLOCKED, PASS, RUNS_DIR } from "./lib/tester-runs.mjs";

function flag(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const runId = flag("run");
const out = flag("out");
const includePass = flag("include-pass") === true;

if (!runId || !out || out === true) {
  console.error("usage: tester-carry-forward.mjs --run <runId> --out <path> [--include-pass]");
  process.exit(2);
}

const { records } = readRun(runId);
if (records.length === 0) {
  console.error(`✗ ${runId} has no verdicts.`);
  process.exit(1);
}

/*
 * 🛑 ONCE PASSED, NEVER RE-RUN — BUT ON THE *LATEST* VERDICT, NOT ANY VERDICT.
 *
 * Checking only run N is too weak: a case that passed in run 2 and was carried
 * for an unrelated reason would return in run 4 and the suite would stop
 * shrinking. So the whole ledger is consulted.
 *
 * But "passed ANYWHERE in its history" is too strong, and the difference is not
 * academic. Measured here: 552 cases have a PASS somewhere, while Test Run 1
 * recorded only 495 — the extra ~50 come from two older PARTIAL runs. Some of
 * those passed early and then FAILED in Test Run 1, which is later and better
 * evidence. Retiring them on the strength of a stale pass would drop currently
 * broken cases out of the cycle and call it convergence.
 *
 * So: runs are walked newest-first and only the MOST RECENT verdict counts —
 * the same rule the traceability ledger's Final column uses.
 *
 * The cost, stated once rather than discovered later: a retired case is never
 * re-checked, so a future regression in it will not be caught by this cycle.
 * That is the deliberate trade for a suite that converges. `--include-pass`
 * still gives a full sweep on demand.
 */
const latestStatus = new Map();
for (const prior of listRuns()) {
  // listRuns() is oldest-first, so a later run overwrites an earlier verdict.
  for (const rec of readRun(prior).records) latestStatus.set(rec.id, rec.status);
}
const everPassed = new Set(
  [...latestStatus.entries()].filter(([, s]) => s === PASS).map(([id]) => id),
);

const carried = [];
const skippedAccepted = [];
const skippedEverPassed = [];
let passSkipped = 0;

for (const r of records) {
  // Accepted exception === human channel AND blocked. A human-channel FAIL is
  // a real finding and falls through to the carry rule below.
  if (r.requiresHumanChannel && r.status === BLOCKED) { skippedAccepted.push(r.id); continue; }
  if (!includePass && everPassed.has(r.id)) { skippedEverPassed.push(r.id); continue; }
  if (r.status === FAIL || r.status === BLOCKED) { carried.push(r.id); continue; }
  if (r.status === PASS) {
    if (includePass) carried.push(r.id);
    else passSkipped += 1;
  }
}

/*
 * Scope reconciliation — the guard against silent shrinkage.
 *
 * Read what the run was ASKED to cover and compare it to what it actually
 * answered. A batch with no verdict file, or a partial one, leaves its cases
 * untested; those must carry forward or they disappear from the cycle entirely
 * while every number gets smaller and looks like progress.
 */
const answered = new Set(records.map((r) => r.id));
const unanswered = [];
try {
  const scope = JSON.parse(readFileSync(join(RUNS_DIR, runId, "scope.json"), "utf8"));
  for (const row of scope.batches ?? []) {
    let batch;
    try {
      batch = JSON.parse(readFileSync(join(RUNS_DIR, runId, "batches", row.name), "utf8"));
    } catch {
      continue; // batch file gone; nothing to reconcile against
    }
    for (const c of batch.cases ?? []) {
      if (c.id.startsWith("control-")) continue;
      // A case that has passed before is retired even if THIS run never reached
      // it — otherwise the never-answered path quietly readmits it and the
      // cumulative rule above is defeated by the very guard meant to protect
      // coverage.
      if (!includePass && everPassed.has(c.id)) continue;
      if (!answered.has(c.id)) unanswered.push(c.id);
    }
  }
} catch {
  console.warn("⚠ no scope.json — cannot tell scoped-but-untested from out-of-scope.");
  console.warn("  The carry file may be SMALLER than it should be. Verify before relying on it.");
}

// A case can legitimately appear in more than one batch slice (the same case
// tested as guest and as buyer). Ids must be unique or fetch-cases will match
// it twice and inflate the scope.
const unique = [...new Set([...carried, ...unanswered])];

mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  [
    `# Carry-forward from ${runId}`,
    `# FAIL + BLOCKED, excluding accepted exceptions and controls.`,
    `# Generated ${new Date().toISOString()} by scripts/tester-carry-forward.mjs`,
    ...unique,
    "",
  ].join("\n"),
);

const uniqueUnanswered = new Set(unanswered).size;

console.log(`✓ ${out}`);
console.log(`  carried : ${unique.length} case id(s)`);
console.log(`    · failed or blocked : ${new Set(carried).size}`);
console.log(`    · scoped but never answered : ${uniqueUnanswered}`);
console.log(
  `  dropped : ${passSkipped} passing this run · ${new Set(skippedEverPassed).size} passed in an earlier run · ${skippedAccepted.length} accepted exception`,
);

// The suite must converge. If it did not shrink, say so plainly.
const priorScope = (() => {
  try {
    const s = JSON.parse(readFileSync(join(RUNS_DIR, runId, "scope.json"), "utf8"));
    return (s.batches ?? []).reduce((n, b) => n + (b.cases ?? 0), 0);
  } catch { return null; }
})();
if (priorScope !== null) {
  const delta = priorScope - unique.length;
  console.log(`  scope   : ${priorScope} → ${unique.length} (${delta >= 0 ? "-" : "+"}${Math.abs(delta)})`);
  if (delta <= 0) {
    console.log(`\n⚠ the next run is NOT smaller. Nothing passed, or something readmitted retired cases.`);
  }
}
if (uniqueUnanswered > 0) {
  console.log(
    `\n⚠ ${uniqueUnanswered} case(s) were in scope and never tested. They are carried, not dropped —\n` +
      `  "not tested" is not "passed", and a run that ends early must not quietly shrink coverage.`,
  );
}
