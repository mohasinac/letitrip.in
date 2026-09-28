#!/usr/bin/env node
/*
 * G1 — the batch is atomic, and an interrupted one announces itself.
 *
 * 🛑 THE FAILURE THIS PREVENTS. A context compaction lands in the middle of a
 * batch. The next turn inherits: fixtures seeded in Firestore, an identity copied
 * over session.json, a browser holding that session, four of twelve cases tested,
 * and no memory of any of it. What happens next is one of two bad things — the
 * batch is re-run from a half-mutated state (testing something nobody described),
 * or it is recorded with four verdicts and reads as complete.
 *
 * So a batch CLAIMS itself before it starts and RELEASES on successful record.
 * A marker found at the top of a turn means the previous attempt died mid-flight.
 *
 * 🛑 THE RECOVERY IS ALWAYS "TEAR DOWN AND RESTART THAT BATCH", NEVER "RESUME".
 * Resuming assumes the fixtures are in the state case 5 expects, and nothing on
 * disk can establish that — the browser did work Firestore does not record. A
 * restart costs one batch; a wrong resume costs a verdict nobody can trust, which
 * is worse, because it looks exactly like a good one.
 *
 * Usage:
 *   node scripts/test-run-inflight.mjs --check
 *   node scripts/test-run-inflight.mjs --start <batchKey> --identity <role> [--fixtures]
 *   node scripts/test-run-inflight.mjs --case <caseId>
 *   node scripts/test-run-inflight.mjs --done
 *
 * Exit: 0 nothing in flight / clean claim · 1 a stale claim needs recovery ·
 *       2 misuse.
 */

import { existsSync, unlinkSync } from "node:fs";
import { INFLIGHT_PATH, RUN_ID, ensureRunDirs, flag, readInflight, writeJson } from "./lib/test-run.mjs";

const IDENTITIES = new Set(["guest", "buyer", "seller", "admin", "bot"]);

function minutesSince(iso) {
  const t = Date.parse(iso ?? "");
  if (!Number.isFinite(t)) return null;
  return Math.round((Date.now() - t) / 60000);
}

function reportStale(cur) {
  const age = minutesSince(cur.startedAt);
  console.error("🛑 A BATCH WAS LEFT IN FLIGHT — recover before starting anything new.");
  console.error("");
  console.error(`  batch     ${cur.batchKey}`);
  console.error(`  identity  ${cur.identity}`);
  console.error(`  fixtures  ${cur.fixturesSeeded ? "SEEDED — must be torn down" : "none"}`);
  console.error(`  started   ${cur.startedAt}${age === null ? "" : `  (${age} min ago)`}`);
  console.error(`  cases done ${Array.isArray(cur.casesDone) ? cur.casesDone.length : 0}`);
  console.error("");
  console.error("  RECOVER — tear down, then restart that batch from case 1:");
  if (cur.fixturesSeeded) {
    console.error(`    node tester/scripts/seed-batch-fixtures.mjs --batch ${cur.batchKey} --teardown`);
    console.error(`    node tester/scripts/seed-batch-fixtures.mjs --batch ${cur.batchKey}`);
  }
  console.error(`    node scripts/test-run-inflight.mjs --done          # clear the stale claim`);
  console.error(`    node scripts/test-run-inflight.mjs --start ${cur.batchKey} --identity ${cur.identity}`);
  console.error("");
  console.error("  🛑 Do NOT resume from the cases already done. Nothing on disk can establish");
  console.error("     that the fixtures are still in the state the next case expects.");
}

const cur = readInflight();

if (flag("check") === true) {
  if (!cur) {
    console.log(`✓ nothing in flight (${RUN_ID})`);
    process.exit(0);
  }
  reportStale(cur);
  process.exit(1);
}

if (flag("done") === true) {
  if (!existsSync(INFLIGHT_PATH)) {
    console.log("✓ nothing in flight — nothing to release");
    process.exit(0);
  }
  unlinkSync(INFLIGHT_PATH);
  console.log(`✓ released ${cur?.batchKey ?? "(unknown)"}`);
  process.exit(0);
}

const caseId = flag("case");
if (typeof caseId === "string") {
  if (!cur) {
    console.error("✗ --case with no batch in flight. Claim one with --start first.");
    process.exit(2);
  }
  const done = Array.isArray(cur.casesDone) ? cur.casesDone : [];
  if (!done.includes(caseId)) done.push(caseId);
  writeJson(INFLIGHT_PATH, { ...cur, casesDone: done, updatedAt: new Date().toISOString() });
  console.log(`✓ ${cur.batchKey}: ${done.length} case(s) done`);
  process.exit(0);
}

const start = flag("start");
if (typeof start === "string") {
  /*
   * Refuse to claim over an existing claim. Overwriting would erase the only
   * record that a previous batch died mid-flight — the marker's whole job.
   */
  if (cur && cur.batchKey !== start) {
    reportStale(cur);
    process.exit(1);
  }
  const identity = flag("identity");
  if (typeof identity !== "string" || !IDENTITIES.has(identity)) {
    console.error(`✗ --identity must be one of: ${[...IDENTITIES].join(", ")}`);
    console.error("  The identity is part of the claim because a batch that dies mid-flight");
    console.error("  leaves the browser holding a session, and the recovery has to know which.");
    process.exit(2);
  }
  ensureRunDirs();
  writeJson(INFLIGHT_PATH, {
    batchKey: start,
    identity,
    fixturesSeeded: flag("fixtures") === true,
    startedAt: new Date().toISOString(),
    casesDone: [],
  });
  console.log(`✓ claimed ${start} as ${identity}`);
  process.exit(0);
}

console.error("Usage: --check | --start <batchKey> --identity <role> [--fixtures] | --case <caseId> | --done");
process.exit(2);
