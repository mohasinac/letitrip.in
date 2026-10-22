#!/usr/bin/env node
/*
 * seed-batch-fixtures.mjs — put a batch's fixtures in place, and take them away.
 *
 *   node tester/scripts/seed-batch-fixtures.mjs --batch buying/bidding
 *   node tester/scripts/seed-batch-fixtures.mjs --batch buying/bidding --teardown
 *
 * 🛑 WHY THIS EXISTS AT ALL.
 *
 * Per-batch fixture seeding was real, load-bearing capability with exactly one
 * driver: run.mjs, which seeded before each batch and tore down after. run.mjs was
 * deleted 2026-09-14 for spawning a Claude session per batch — and lib/fixtures.mjs
 * then looked like an orphan, because nothing imported it any more.
 *
 * It is not an orphan; it is a capability that lost its driver. Three batches have
 * manifests today (buying__bidding, content-discovery__search,
 * money-flows__auction-win-to-payment), and deleting the lib would have left them
 * silently unseeded — which surfaces as "blocked", not as an error, and reads like
 * a product problem rather than a rig problem. This is the replacement driver, and
 * it spawns nothing.
 *
 * The worker slot is fixed at "w1": the in-session flow runs ONE batch at a time,
 * so there is no second worker to collide with. The {{w}} substitution is kept
 * because the manifests are written in terms of it.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

import { connect, flag, loadEnvLocal } from "./lib/firestore.mjs";
import { loadManifest, seedFixtures, teardownFixtures } from "./lib/fixtures.mjs";

const REPO_ROOT = process.cwd();
const BATCH_KEY = flag("batch");
const TEARDOWN = flag("teardown") === true;
const SLOT = "w1";

if (typeof BATCH_KEY !== "string" || !BATCH_KEY) {
  console.error("✗ --batch <groupKey/pageKey> is required.");
  process.exit(2);
}

/*
 * What was written is recorded on disk rather than recomputed at teardown. A
 * manifest whose `data` is a function produces different ids run to run, and a
 * teardown that re-derives them would delete the wrong documents or none at all.
 */
const LEDGER = resolve(REPO_ROOT, "tester/.tester-runs/_fixture-ledger", `${BATCH_KEY.replace(/\//g, "__")}.json`);

loadEnvLocal();

const manifest = await loadManifest(REPO_ROOT, BATCH_KEY);
if (!manifest.length) {
  console.log(`✓ ${BATCH_KEY} has no fixture manifest — nothing to ${TEARDOWN ? "tear down" : "seed"}.`);
  process.exit(0);
}

// connect() returns { admin, db, auth } — destructure it. Assigning the whole
// object here made every seed die on `db.collection is not a function`, which
// blocked every batch that declares fixtures.
const { db } = connect();

if (TEARDOWN) {
  if (!existsSync(LEDGER)) {
    console.error(`✗ No fixture ledger for ${BATCH_KEY} — nothing recorded as seeded.`);
    console.error("  Seeding writes it; tearing down twice is a no-op, not an error to work around.");
    process.exit(1);
  }
  const written = JSON.parse(readFileSync(LEDGER, "utf8"));
  const failed = await teardownFixtures(db, written);
  writeFileSync(LEDGER, "[]");
  if (failed.length) {
    // Per-document failures are reported, never fatal: one undeletable row must
    // not strand the other nine, and the run is over by the time this matters.
    console.error(`⚠ ${failed.length} fixture(s) could not be deleted:`);
    for (const f of failed) console.error(`    ${f}`);
  }
  console.log(`✓ Tore down ${written.length - failed.length}/${written.length} fixture(s) for ${BATCH_KEY}.`);
  process.exit(0);
}

const written = await seedFixtures(db, manifest, SLOT);
mkdirSync(dirname(LEDGER), { recursive: true });
writeFileSync(LEDGER, JSON.stringify(written, null, 2));

console.log(`✓ Seeded ${written.length} fixture(s) for ${BATCH_KEY} (slot ${SLOT}).`);
for (const w of written) console.log(`    ${w.collection}/${w.id}`);
console.error("");
console.error(`  🛑 Tear these down when the batch is recorded, pass or fail:`);
console.error(`     node tester/scripts/seed-batch-fixtures.mjs --batch ${BATCH_KEY} --teardown`);
