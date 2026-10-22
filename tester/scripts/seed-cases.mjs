#!/usr/bin/env node
/**
 * Seed the checklist catalogue into Firestore — `testerChecklistItems`.
 *
 * ## Why this lives here and not in `appkit-seed`
 *
 * The cases are AUTHORING DATA for this harness, not application code. They
 * used to sit in `appkit/src/features/tester/seed-data` — 145 files inside the
 * component library that ships to every consumer build — and nothing in the
 * application read them: `/admin/tester-checklist`, `/admin/tester-feedback`
 * and `GET/PUT /api/user/tester-checklist` all read the `testerChecklistItems`
 * COLLECTION through two repositories that stay in appkit. The only importers
 * were appkit's own seed loader.
 *
 * So the collection is the contract, and whoever authors the cases should own
 * writing them. That is this repository.
 *
 * ## 🛑 What this does NOT do
 *
 * It does not delete. A case removed from the corpus is left standing in
 * Firestore, because `appkit-seed`'s merge-write has the same property and
 * CLAUDE.md records what happens when someone assumes otherwise: 13 stale
 * `requiresHumanChannel: true` values survived every reseed for weeks and were
 * reported as un-automatable in every run. Pass `--prune` to remove rows the
 * corpus no longer defines, which is the only way to drop a field or a case.
 *
 * ## Usage
 *
 *   node tester/scripts/seed-cases.mjs --yes-i-am <projectId>
 *   node tester/scripts/seed-cases.mjs --yes-i-am <projectId> --prune
 *   node tester/scripts/seed-cases.mjs --dry-run
 *
 * `--dry-run` needs no confirmation and writes nothing.
 */
import { connect, assertTargetProject, flag, chunk } from "./lib/firestore.mjs";
import { validateCases } from "./lib/validate-cases.mjs";

const COLLECTION = "testerChecklistItems";
/** Firestore's hard ceiling on one batched write. */
const BATCH_LIMIT = 400;

const dryRun = process.argv.includes("--dry-run");
const prune = process.argv.includes("--prune");

const { testerChecklistSeedData } = await import("../cases/index.mjs");
const cases = testerChecklistSeedData;

/*
 * 🛑 VALIDATE BEFORE WRITING, and refuse the whole run on a failure.
 *
 * The cases were TypeScript until this move, so `AuthoredCase` caught a
 * missing `startPage` at compile time — and it did: deleting 33 of them during
 * the migration failed `tsc` immediately. Plain `.mjs` has no such check, so
 * the guarantee has to be re-made here or it is simply lost.
 *
 * Refusing the batch rather than skipping the bad rows is deliberate: a
 * partial catalogue is indistinguishable from a complete one once it is in
 * Firestore, and the harness reports "could not test" for the gap.
 */
const problems = validateCases(cases);
if (problems.length) {
  console.error(`\n✗ ${problems.length} invalid case(s) — nothing written:\n`);
  for (const p of problems.slice(0, 25)) console.error(`  ${p}`);
  if (problems.length > 25) console.error(`  … and ${problems.length - 25} more`);
  process.exit(1);
}
console.log(`✓ ${cases.length} case(s) validated`);

if (dryRun) {
  console.log(`[dry run] would upsert ${cases.length} doc(s) into ${COLLECTION}`);
  if (prune) console.log("[dry run] --prune would also delete rows absent from the corpus");
  process.exit(0);
}

assertTargetProject();
const { db } = connect({ repoRoot: process.cwd() });

let written = 0;
for (const slice of chunk(cases, BATCH_LIMIT)) {
  const batch = db.batch();
  for (const c of slice) {
    // `merge: true`, matching appkit-seed — a reseed must not clobber the
    // reviewer fields an admin set on a case (bugConfirmed, bugHunterId).
    batch.set(db.collection(COLLECTION).doc(c.id), c, { merge: true });
  }
  await batch.commit();
  written += slice.length;
  process.stdout.write(`\r  upserted ${written}/${cases.length}`);
}
process.stdout.write("\n");

if (prune) {
  const live = await db.collection(COLLECTION).select().get();
  const defined = new Set(cases.map((c) => c.id));
  const stale = live.docs.filter((d) => !defined.has(d.id));
  if (!stale.length) {
    console.log("✓ nothing to prune");
  } else {
    const writer = db.bulkWriter();
    writer.onWriteError((err) => {
      console.warn(`  prune failed for ${err.documentRef.path}: ${err.message}`);
      return false;
    });
    for (const d of stale) void writer.delete(d.ref);
    await writer.close();
    console.log(`✓ pruned ${stale.length} case(s) no longer in the corpus`);
  }
}

console.log(`✓ ${COLLECTION}: ${written} case(s) upserted`);
void flag;
