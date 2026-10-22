#!/usr/bin/env node
/*
 * Run lifecycle: back up → wipe the catalog → seed a known state → (test) → wipe again.
 *
 * Usage (from the CONSUMER repo root, d:/proj/letitrip.in):
 *   node tester/scripts/lifecycle.mjs plan                 # dry run — prints counts, touches nothing
 *   node tester/scripts/lifecycle.mjs setup  --run <id>    # backup + wipe + seed
 *   node tester/scripts/lifecycle.mjs teardown --run <id>  # wipe + seed a clean baseline
 *   node tester/scripts/lifecycle.mjs recover --run <id>   # re-run teardown from a stored backup
 *
 * Flags: --run <id> --yes-i-am <projectId> --window <minutes> --service-account <path>
 *
 * Exit: 0 success, 1 errors during run, 2 misconfiguration.
 *
 * 🛑 This deletes documents from a live project. Three things stand between it and
 *    a mistake, and none of them is a comment:
 *      1. assertTargetProject() — the credentials must match a project named in the env.
 *      2. assertDeletable()     — an unclassified collection is preserved, not swept.
 *      3. The user-count assertion — captured before, re-checked after; any drop aborts.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

import { PRESERVE, SEED_OWNED, SEED_TRANSACTIONAL, DERIVED, CASCADE, assertDeletable, allTiers } from "./lib/collections.mjs";
import { assertTargetProject, batchDelete, chunk, connect, flag, loadEnvLocal } from "./lib/firestore.mjs";

const REPO_ROOT = process.cwd();
const COMMAND = process.argv[2];
const RUN_ID = String(flag("run", `run-${Date.now()}`));
const RUNS_DIR = resolve(REPO_ROOT, "tester/.tester-runs", RUN_ID);
const SERVICE_ACCOUNT = typeof flag("service-account") === "string" ? flag("service-account") : null;

if (!["plan", "setup", "clear", "teardown", "recover"].includes(COMMAND)) {
  console.error("Usage: lifecycle.mjs <plan|setup|clear|teardown|recover> [--run <id>] [--yes-i-am <projectId>]");
  process.exit(2);
}

loadEnvLocal(REPO_ROOT);
const PROJECT = assertTargetProject();
const { db, auth } = connect({ repoRoot: REPO_ROOT, serviceAccountPath: SERVICE_ACCOUNT });

/* ── Confirmation ────────────────────────────────────────────────────────────
 * Typed, not a bare -y. The operator types the project id, so muscle memory
 * cannot approve a run against the wrong project. `plan` never asks — it is the
 * command you are supposed to reach for first, and gating it behind a
 * confirmation would train people to type the id without reading. */
function requireTypedConfirmation() {
  const typed = flag("yes-i-am");
  if (typed !== PROJECT) {
    console.error(`✗ This will DELETE the seeded catalog in project "${PROJECT}".`);
    console.error(`  Re-run with:  --yes-i-am ${PROJECT}`);
    console.error(`  Run 'lifecycle.mjs plan' first to see exactly what would be deleted.`);
    process.exit(2);
  }
}

/* ── Counting ────────────────────────────────────────────────────────────── */

async function countCollection(name) {
  const snap = await db.collection(name).count().get();
  return snap.data().count;
}

/**
 * The preserve-tier fingerprint. Captured before the wipe and re-asserted after.
 *
 * Auth users are counted separately from the Firestore `users` docs because they
 * are separate systems that can diverge — and Auth is the one that cannot be
 * rebuilt from a seed.
 */
async function preserveFingerprint() {
  const counts = {};
  for (const name of PRESERVE) counts[name] = await countCollection(name);

  let authUsers = 0;
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers += page.users.length;
    pageToken = page.pageToken;
  } while (pageToken);

  const settings = await db.collection("siteSettings").doc("global").get();
  const credentials = settings.exists ? (settings.data().credentials ?? null) : null;
  const credentialsHash = credentials
    ? createHash("sha256").update(JSON.stringify(credentials)).digest("hex").slice(0, 16)
    : null;

  return { counts, authUsers, credentialsHash };
}

function assertPreserveIntact(before, after) {
  const problems = [];
  for (const name of PRESERVE) {
    if (after.counts[name] < before.counts[name]) {
      problems.push(`${name}: ${before.counts[name]} → ${after.counts[name]}`);
    }
  }
  if (after.authUsers < before.authUsers) {
    problems.push(`Firebase Auth users: ${before.authUsers} → ${after.authUsers}`);
  }
  if (before.credentialsHash && after.credentialsHash !== before.credentialsHash) {
    problems.push(`siteSettings.credentials changed (${before.credentialsHash} → ${after.credentialsHash})`);
  }
  if (problems.length) {
    console.error("✗ PRESERVE TIER WAS DAMAGED. Aborting before anything else runs.");
    for (const p of problems) console.error(`    ${p}`);
    console.error(`  Restore from tester/.tester-runs/${RUN_ID}/backup/ and investigate the cascade.`);
    process.exit(1);
  }
}

/* ── Backup ──────────────────────────────────────────────────────────────── */

async function backupPreserveTier() {
  mkdirSync(resolve(RUNS_DIR, "backup"), { recursive: true });
  for (const name of PRESERVE) {
    const snap = await db.collection(name).get();
    const docs = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    writeFileSync(resolve(RUNS_DIR, "backup", `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`  backed up ${name}: ${docs.length} docs`);
  }
}

/**
 * Restores siteSettings only. The other preserve-tier collections are never
 * deleted, so restoring them would overwrite legitimate changes a real user made
 * during the run — a "restore" that loses data is worse than no restore.
 * siteSettings is the exception because it is the one whose loss is silent and
 * expensive (the encrypted live API keys).
 */
async function restoreSiteSettings() {
  const path = resolve(RUNS_DIR, "backup", "siteSettings.json");
  if (!existsSync(path)) {
    console.error(`✗ No siteSettings backup at ${path} — cannot restore.`);
    process.exit(1);
  }
  const docs = JSON.parse(readFileSync(path, "utf8"));
  for (const { id, data } of docs) {
    await db.collection("siteSettings").doc(id).set(data, { merge: true });
  }
  console.log(`  restored siteSettings: ${docs.length} docs`);
}

/* ── Wipe ────────────────────────────────────────────────────────────────── */

async function collectSeedOwnedIds() {
  const ids = {};
  for (const name of [...SEED_OWNED, ...DERIVED]) {
    assertDeletable(name);
    const snap = await db.collection(name).select().get();
    ids[name] = snap.docs.map((d) => d.id);
  }
  return ids;
}

/**
 * Referential delete. A row goes only when it points at something being wiped —
 * this is what keeps a real customer's order against a non-seed product intact
 * while removing the ones whose product no longer exists.
 */
async function cascadeDelete(seedIds, { dryRun }) {
  const productIds = new Set(seedIds.products ?? []);
  const report = [];

  for (const rule of CASCADE) {
    assertDeletable(rule.collection);
    const targetCollection = rule.refTarget ?? "products";
    const targetIds = new Set(seedIds[targetCollection] ?? []);

    // What currently EXISTS in the target collection, so an FK pointing at a
    // already-deleted document can be recognised as an orphan rather than kept.
    const existingSnap = await db.collection(targetCollection).select().get();
    const existingTargetIds = new Set(existingSnap.docs.map((d) => d.id));

    const snap = await db.collection(rule.collection).get();

    const toDelete = [];
    const toPrune = [];

    for (const doc of snap.docs) {
      const data = doc.data();

      if (rule.pruneItems) {
        const items = data[rule.pruneItems.arrayField];
        if (!Array.isArray(items)) continue;
        const kept = items.filter((it) => !productIds.has(it?.[rule.pruneItems.refField]));
        if (kept.length !== items.length) toPrune.push({ ref: doc.ref, field: rule.pruneItems.arrayField, kept });
        continue;
      }

      // A rule may declare BOTH an array FK and a top-level one (orders carry two
      // document shapes). Only skip to the next document when the array shape is
      // actually present; otherwise fall through to the scalar check below.
      if (rule.arrayField && Array.isArray(data[rule.arrayField]) && data[rule.arrayField].length > 0) {
        const items = data[rule.arrayField];
        // Referencing something being wiped now…
        if (items.some((it) => targetIds.has(it?.[rule.refField]))) {
          toDelete.push(doc.ref);
          continue;
        }
        // …or referencing only things that no longer exist. 232 orders and 28 carts
        // survived an earlier clear because every product they pointed at had
        // already been deleted in a previous pass, so "is it in the set being wiped
        // now" was false for all of them. An order whose every line item points at a
        // missing product is not a record of anything.
        const fks = items.map((it) => it?.[rule.refField]).filter(Boolean);
        if (fks.length > 0 && fks.every((fk) => !existingTargetIds.has(fk))) toDelete.push(doc.ref);
        continue;
      }

      if (rule.field) {
        const fk = data[rule.field];
        // Delete when the FK points at something being wiped NOW, and also when it
        // points at something already gone. A previous clear left one bid behind
        // whose product had been removed in an earlier pass — the row referenced a
        // document that no longer existed, so "is it in the set being wiped" was
        // false and the orphan survived. Only applied to rules with a real FK
        // target collection, so a free-form field like notifications.entityId is
        // not treated as a dangling reference.
        if (targetIds.has(fk)) toDelete.push(doc.ref);
        else if (rule.orphanSweep && fk && !existingTargetIds.has(fk)) toDelete.push(doc.ref);
      }
    }

    if (!dryRun) {
      if (toDelete.length) await batchDelete(db, toDelete);
      for (const p of toPrune) await p.ref.update({ [p.field]: p.kept });
    }
    report.push({ collection: rule.collection, deleted: toDelete.length, pruned: toPrune.length });
  }
  return report;
}

async function wipeSeedOwned(seedIds, { dryRun }) {
  const report = [];
  for (const name of [...SEED_OWNED, ...DERIVED]) {
    assertDeletable(name);
    const ids = seedIds[name] ?? [];
    if (!dryRun && ids.length) {
      const refs = ids.map((id) => db.collection(name).doc(id));
      await batchDelete(db, refs);
    }
    report.push({ collection: name, deleted: ids.length });
  }
  return report;
}

/* ── Seed ────────────────────────────────────────────────────────────────── */

function runSeed(windowMinutes) {
  const env = { ...process.env };
  if (windowMinutes) env.TESTER_WINDOW_MINUTES = String(windowMinutes);
  console.log(`  seeding (TESTER_WINDOW_MINUTES=${env.TESTER_WINDOW_MINUTES ?? "default"})…`);
  /*
   * TWO passes, and the order is the point.
   *
   * SEED_OWNED first: it holds the products, stores, categories and events that
   * every transactional row points at. SEED_TRANSACTIONAL second, restoring the
   * orders, bids, payouts and event entries the cascade correctly deleted and
   * nothing previously put back — see the comment on SEED_TRANSACTIONAL for what
   * that silence cost (309 of 1,025 pending cases could only answer "blocked").
   *
   * One `appkit-seed` invocation per tier rather than one combined list, so a
   * failure names which tier failed instead of one opaque exit code.
   */
  execFileSync("npx", ["appkit-seed", "load", "--collections", SEED_OWNED.join(",")], {
    cwd: REPO_ROOT,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  console.log(`  seeding transactional fixtures (${SEED_TRANSACTIONAL.join(", ")})…`);
  execFileSync("npx", ["appkit-seed", "load", "--collections", SEED_TRANSACTIONAL.join(",")], {
    cwd: REPO_ROOT,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

/**
 * Remove every `isTestData: true` document.
 *
 * 🛑 A run must not leave test data behind. The seed load above deliberately brings
 * the tester-sandbox fixtures WITH it — the run needs them to test against — but they
 * must not still be there afterwards. Sandbox rows left live on production are the
 * exact leak measured 2026-09-01, when the homepage carried 44 sandbox mentions,
 * /categories 21 and /events 20, because the SSR first paint published them and only
 * the client refetch filtered them out.
 *
 * Delegates to the existing purge script rather than reimplementing the sweep: it and
 * the scheduled testDataCleanup both call runTestDataCleanup(ctx, {force}),
 * and a third copy of "what counts as sandbox" is how the three silently disagree.
 */
function purgeTestData() {
  console.log("  purging isTestData documents…");
  execFileSync(process.execPath, ["appkit/scripts/purge-test-data.mjs"], {
    cwd: REPO_ROOT,
    env: process.env,
    stdio: "inherit",
  });
}

/**
 * Reclaim the Storage bytes a run uploaded.
 *
 * A Firestore delete has no reach into Storage, so wiping `mediaAssets` removes
 * the RECORDS and leaves the objects — every run quietly accumulating megabytes
 * while reporting a clean teardown. `collections.mjs` has carried a 🛑 admitting
 * that since it was written.
 *
 * Non-fatal on failure, deliberately: leftover bytes cost money, but aborting a
 * teardown over them would leave the catalogue half-wiped, which costs more. The
 * warning names the command to run by hand.
 */
function purgeTestMedia() {
  try {
    execFileSync(process.execPath, ["tester/scripts/purge-test-media.mjs", "--yes-i-am", PROJECT], {
      cwd: REPO_ROOT,
      env: process.env,
      stdio: "inherit",
    });
  } catch {
    console.warn("  ⚠ Storage purge failed — the documents are gone but the bytes remain.");
    console.warn(`    Run by hand: node tester/scripts/purge-test-media.mjs --yes-i-am ${PROJECT}`);
  }
}

/** Fails loudly if anything `isTestData` survived — teardown's whole point. */
async function assertNoTestDataRemains() {
  const leftovers = [];
  for (const name of SEED_OWNED) {
    const snap = await db.collection(name).where("isTestData", "==", true).select().get();
    if (snap.size > 0) leftovers.push(`${name}: ${snap.size}`);
  }
  if (leftovers.length) {
    console.error("✗ Test data survived teardown — it would be publicly visible:");
    for (const l of leftovers) console.error(`    ${l}`);
    console.error("  Run `npm run test-data:purge` and investigate the purge scope.");
    process.exit(1);
  }
  console.log("  verified: 0 isTestData documents remain");
}

/* ── Commands ────────────────────────────────────────────────────────────── */

async function commandPlan() {
  const tiers = allTiers();
  console.log(`\nProject: ${PROJECT}\n`);
  console.log("PRESERVE — never touched (a non-zero delete count here is a bug):");
  for (const name of tiers.preserve) console.log(`  ${name.padEnd(20)} ${await countCollection(name)} docs   delete: 0`);

  const seedIds = await collectSeedOwnedIds();
  console.log("\nSEED_OWNED — wiped and re-seeded:");
  let total = 0;
  for (const name of SEED_OWNED) {
    const n = (seedIds[name] ?? []).length;
    total += n;
    console.log(`  ${name.padEnd(20)} delete: ${n}`);
  }

  console.log("\nCASCADE — deleted only where they reference a wiped document:");
  const cascade = await cascadeDelete(seedIds, { dryRun: true });
  for (const r of cascade) {
    total += r.deleted;
    console.log(`  ${r.collection.padEnd(20)} delete: ${r.deleted}${r.pruned ? `   prune items in: ${r.pruned}` : ""}`);
  }

  console.log(`\nTotal documents that would be deleted: ${total}`);
  console.log("Nothing was written. Re-run with `setup --yes-i-am <projectId>` to execute.\n");
}

async function commandSetup() {
  requireTypedConfirmation();
  const windowMinutes = flag("window");

  mkdirSync(RUNS_DIR, { recursive: true });
  console.log(`\n[1/5] Backing up the preserve tier → tester/.tester-runs/${RUN_ID}/backup/`);
  const before = await preserveFingerprint();
  await backupPreserveTier();

  console.log("[2/5] Collecting seed-owned ids");
  const seedIds = await collectSeedOwnedIds();

  console.log("[3/5] Wiping");
  const wiped = await wipeSeedOwned(seedIds, { dryRun: false });
  const cascaded = await cascadeDelete(seedIds, { dryRun: false });
  const deleted = [...wiped, ...cascaded].reduce((n, r) => n + r.deleted, 0);
  console.log(`  deleted ${deleted} documents`);

  console.log("[4/5] Verifying the preserve tier survived");
  assertPreserveIntact(before, await preserveFingerprint());
  console.log("  users, Auth records, addresses, sessions and siteSettings all intact");

  console.log("[5/5] Seeding");
  runSeed(windowMinutes);

  console.log("  verifying the reseed actually wrote back what was wiped");
  await assertReseedWroteBack(seedIds);

  writeFileSync(resolve(RUNS_DIR, "setup.json"), JSON.stringify({ runId: RUN_ID, project: PROJECT, before, deleted }, null, 2));
  console.log(`\n✓ Setup complete. Run id: ${RUN_ID}\n`);
}

/**
 * 🛑 `execFileSync` only catches a HARD CLI failure — `appkit-seed load`'s
 * `set(…, {merge:true})` writes can silently match zero rows (a stale
 * collection name, a seed module that failed to export, a path typo) and the
 * CLI still exits 0 reporting "created N, errors 0" for whatever N it DID
 * resolve. A wipe that is followed by a reseed writing nothing leaves the
 * run with an empty catalog and no error anywhere — exactly the state
 * `commandSetup` used to declare "✓ Setup complete" over.
 *
 * Compares the post-reseed count against how many ids were WIPED for that
 * collection, not against some separately-hardcoded expectation — a
 * collection that genuinely had 0 fixtures before the wipe is not a failure
 * now. Only a collection that had rows and now has none is.
 */
async function assertReseedWroteBack(wipedIds) {
  const failures = [];
  for (const name of SEED_OWNED) {
    const wiped = (wipedIds[name] ?? []).length;
    if (wiped === 0) continue;
    const after = await countCollection(name);
    if (after === 0) {
      failures.push(`${name}: wiped ${wiped}, reseed wrote 0`);
    }
  }
  if (failures.length > 0) {
    console.error("\n✗ Reseed verification failed — these collections are empty after seeding:");
    for (const f of failures) console.error(`  ${f}`);
    console.error("\nThe wipe succeeded and the reseed command exited 0, but wrote nothing back.");
    console.error("Check `npx appkit-seed status` and the seed module for each collection above.\n");
    process.exit(1);
  }
}

async function commandTeardown({ recovering = false } = {}) {
  requireTypedConfirmation();
  console.log(`\n[1/6] ${recovering ? "Recovering" : "Tearing down"} run ${RUN_ID}`);
  const before = await preserveFingerprint();

  console.log("[2/6] Wiping the run's catalog");
  const seedIds = await collectSeedOwnedIds();
  await wipeSeedOwned(seedIds, { dryRun: false });
  await cascadeDelete(seedIds, { dryRun: false });

  console.log("[3/6] Restoring siteSettings and re-seeding a clean baseline");
  await restoreSiteSettings();
  runSeed(null);
  await assertReseedWroteBack(seedIds);

  // The seed brings the sandbox fixtures back with it — necessary during a run,
  // unacceptable after one. This is what leaves production carrying only real content.
  console.log("[4/6] Removing test data");
  purgeTestData();
  await assertNoTestDataRemains();

  console.log("[5/6] Reclaiming uploaded Storage objects");
  purgeTestMedia();

  console.log("[6/6] Verifying the preserve tier");
  assertPreserveIntact(before, await preserveFingerprint());
  console.log(`\n✓ ${recovering ? "Recovery" : "Teardown"} complete — real catalog restored, no test data left.\n`);
}

/**
 * Wipe the catalog and DO NOT re-seed. Leaves only the preserve tier.
 *
 * Distinct from `teardown`, which restores a clean seeded baseline. Use this when
 * the intent is "hold nothing but real user data" — the public site will then
 * render with no products, categories, FAQs or homepage sections until something
 * is seeded again.
 *
 * Recoverable: everything it removes is seed data, so `npx appkit-seed load`
 * rebuilds it. What it must never touch is the preserve tier, which is not
 * regenerable — hence the same before/after assertion as every other command.
 */
async function commandClear() {
  requireTypedConfirmation();
  console.log(`\n[1/5] Backing up the preserve tier`);
  mkdirSync(RUNS_DIR, { recursive: true });
  const before = await preserveFingerprint();
  await backupPreserveTier();

  console.log("[2/5] Wiping the catalog (no re-seed)");
  const seedIds = await collectSeedOwnedIds();
  const wiped = await wipeSeedOwned(seedIds, { dryRun: false });
  const cascaded = await cascadeDelete(seedIds, { dryRun: false });
  console.log(`  deleted ${[...wiped, ...cascaded].reduce((n, r) => n + r.deleted, 0)} documents`);

  console.log("[3/5] Removing any remaining test data");
  purgeTestData();
  await assertNoTestDataRemains();

  console.log("[4/5] Reclaiming uploaded Storage objects");
  purgeTestMedia();

  console.log("[5/5] Verifying the preserve tier");
  assertPreserveIntact(before, await preserveFingerprint());

  const after = await preserveFingerprint();
  console.log(`\n✓ Cleared. Remaining: ${PRESERVE.map((c) => `${c}=${after.counts[c]}`).join(", ")}, Auth=${after.authUsers}.`);
  console.log(`  The catalog is now empty. Re-seed with: npx appkit-seed load\n`);
}

const COMMANDS = {
  plan: commandPlan,
  setup: commandSetup,
  clear: commandClear,
  teardown: () => commandTeardown(),
  recover: () => commandTeardown({ recovering: true }),
};

try {
  await COMMANDS[COMMAND]();
  process.exit(0);
} catch (err) {
  console.error(`✗ ${COMMAND} failed:`, err?.message ?? err);
  if (COMMAND === "setup") {
    console.error(`  The catalog may be half-wiped. Recover with:`);
    console.error(`    node tester/scripts/lifecycle.mjs recover --run ${RUN_ID} --yes-i-am ${PROJECT}`);
  }
  process.exit(1);
}
