#!/usr/bin/env node
/*
 * next-batch.mjs — which batch should I work next?
 *
 *   node tester/scripts/next-batch.mjs --run <id>
 *   node tester/scripts/next-batch.mjs --run <id> --all      # list every outstanding batch
 *
 * 🛑 THIS SCRIPT SPAWNS NOTHING, AND THAT IS ITS ENTIRE POINT.
 *
 * It replaces the only part of run.mjs still needed after 2026-09-14. run.mjs
 * picked the next batch AND spawned a headless `claude` to work it — one session
 * per batch, fanned across five workers by pool.mjs, re-issued every turn by the
 * Stop hook. That loop produced roughly 300 sessions in a day. The picking was
 * never the problem; the spawning was. So this does the picking and stops.
 *
 * Batches are worked in THIS session, one at a time, on request:
 *   fetch-cases → seed-batch-fixtures → drive the browser → record-verdicts.
 *
 * @see scripts/audit-tester-plugin-wiring.mjs R17 — no file under tester/scripts
 *      may spawn the claude binary.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { flag } from "./lib/firestore.mjs";
import { verdictFileName } from "./lib/batch-keys.mjs";

const REPO_ROOT = process.cwd();
const RUN_ID = flag("run");
const ALL = flag("all") === true;

if (typeof RUN_ID !== "string" || !RUN_ID) {
  console.error("✗ --run <id> is required.");
  console.error("  It is not defaulted: guessing a run id would silently answer about the wrong run.");
  process.exit(2);
}

const RUNS_DIR = resolve(REPO_ROOT, "tester/.tester-runs", RUN_ID);
const VERDICT_DIR = resolve(RUNS_DIR, "verdicts");
const BATCH_DIR = resolve(RUNS_DIR, "batches");

const scopePath = resolve(RUNS_DIR, "scope.json");
if (!existsSync(scopePath)) {
  console.error(`✗ Run ${RUN_ID} has no scope manifest (tester/.tester-runs/${RUN_ID}/scope.json).`);
  console.error("  Run fetch-cases.mjs first — it writes the scope for the batches it fetches.");
  console.error("  Do NOT infer scope from batches/: that directory accumulates across runs.");
  process.exit(1);
}

const scope = JSON.parse(readFileSync(scopePath, "utf8"));

if (scope.abandoned === true) {
  console.error(`✗ Run ${RUN_ID} is marked abandoned — ${scope.abandonedReason ?? "no reason recorded"}.`);
  console.error("  Start a new run rather than resuming it.");
  process.exit(1);
}

/*
 * "Recorded" is deliberately stricter than "a file exists" — the same argument
 * record-verdicts makes for its own gate. A verdict file can exist and be
 * truncated, hand-edited, or written for a different batch; any of those would
 * make this script skip a batch that was never actually answered.
 */
function isRecorded(row) {
  const vf = resolve(VERDICT_DIR, verdictFileName(row.key));
  if (!existsSync(vf)) return false;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(vf, "utf8"));
  } catch {
    return false;
  }
  const answered = new Set((parsed?.verdicts ?? []).map((v) => v.id));
  if (!answered.size) return false;

  const bf = resolve(BATCH_DIR, row.name);
  if (!existsSync(bf)) return answered.size > 0;
  try {
    const batch = JSON.parse(readFileSync(bf, "utf8"));
    return (batch?.cases ?? []).every((c) => answered.has(c.id));
  } catch {
    return false;
  }
}

const rows = (scope.batches ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const outstanding = rows.filter((r) => !isRecorded(r));

/** Does this batch carry a per-batch fixture manifest that must be seeded first? */
function hasFixtures(key) {
  const dir = resolve(REPO_ROOT, "appkit/src/features/tester/seed-data/fixtures");
  if (!existsSync(dir)) return false;
  const stem = key.replace(/\//g, "__").replace(/--.*$/, "");
  return readdirSync(dir).some((f) => f === `${stem}.mjs`);
}

/*
 * 🛑 STDOUT IS A DATA CHANNEL: batch keys, one per line, and nothing else.
 * Commentary — including "nothing outstanding" — goes to stderr.
 *
 * This is not tidiness. The Stop hook counts stdout lines to decide whether
 * cases are still pending, and these two lines used to be `console.log`. The
 * second one survived the hook's "skip ✓/✗ prefixes" filter, so a FULLY RECORDED
 * run reported one pending batch and the loop could never end. Caught only by
 * measuring the hook's real exit code on a fully-recorded fixture; every
 * partial-state test passed happily.
 */
if (!outstanding.length) {
  console.error(`✓ Nothing outstanding — all ${rows.length} batch(es) in ${RUN_ID} are recorded.`);
  console.error(`  node tester/scripts/record-verdicts.mjs --run ${RUN_ID} --finish`);
  process.exit(0);
}

const show = ALL ? outstanding : outstanding.slice(0, 1);
for (const row of show) {
  const fixtures = hasFixtures(row.key) ? "  [has fixtures]" : "";
  console.log(`${row.key}${fixtures}`);
}

if (!ALL) {
  const row = show[0];
  console.error("");
  console.error(`  ${outstanding.length} of ${rows.length} batch(es) outstanding in ${RUN_ID}.`);
  console.error(`  identity: ${row.identity}   cases: ${row.cases}`);
  if (hasFixtures(row.key)) {
    console.error(`  node tester/scripts/seed-batch-fixtures.mjs --batch ${row.key}`);
  }
  console.error(`  Then work it in THIS session — there is no runner to call.`);
}
