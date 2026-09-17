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
 *   PASS            → NOT carried by default. `--include-pass` adds them for a
 *                     full regression sweep, which is a deliberate, expensive
 *                     choice rather than the default.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { readRun, FAIL, BLOCKED, PASS } from "./lib/tester-runs.mjs";

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

const carried = [];
const skippedAccepted = [];
let passSkipped = 0;

for (const r of records) {
  // Accepted exception === human channel AND blocked. A human-channel FAIL is
  // a real finding and falls through to the carry rule below.
  if (r.requiresHumanChannel && r.status === BLOCKED) { skippedAccepted.push(r.id); continue; }
  if (r.status === FAIL || r.status === BLOCKED) { carried.push(r.id); continue; }
  if (r.status === PASS) {
    if (includePass) carried.push(r.id);
    else passSkipped += 1;
  }
}

// A case can legitimately appear in more than one batch slice (the same case
// tested as guest and as buyer). Ids must be unique or fetch-cases will match
// it twice and inflate the scope.
const unique = [...new Set(carried)];

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

console.log(`✓ ${out}`);
console.log(`  carried: ${unique.length} case id(s)`);
console.log(`  skipped: ${passSkipped} passing · ${skippedAccepted.length} accepted exception`);
if (unique.length !== carried.length) {
  console.log(`  note: ${carried.length - unique.length} duplicate id(s) collapsed (same case in >1 identity slice)`);
}
