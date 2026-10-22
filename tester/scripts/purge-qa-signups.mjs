#!/usr/bin/env node
/*
 * Delete ONLY the throwaway accounts created by the signup checklist case.
 *
 *   node tester/scripts/purge-qa-signups.mjs --dry-run
 *   node tester/scripts/purge-qa-signups.mjs --yes-i-am <projectId>
 *
 * 🛑 WHY THIS IS A SEPARATE SCRIPT AND NOT A TEARDOWN TIER CHANGE
 *
 * `users` is PRESERVE, and `assertDeletable` refuses it outright — correctly.
 * That refusal is the single most valuable safety property the tester has: real
 * signups survive every run, so the harness can never destroy someone's account.
 *
 * But the signup case must create an account to test anything, and `users`
 * surviving the wipe means each run would leave one behind forever. The answer
 * is NOT to soften the tier — it is a separate tool that can only ever see a
 * population no real person can be in.
 *
 * 🛑 THE MARKER IS THE WHOLE SAFETY ARGUMENT
 *
 * `@letitrip-qa.test` is a reserved TLD (RFC 2606) — it can never be registered
 * and can never receive mail, so no real user can hold an address there. That is
 * stronger than a gmail plus-tag, which IS a real deliverable address someone
 * could legitimately sign up with.
 *
 * Every candidate is re-checked against the marker immediately before deletion,
 * not merely at query time, so a broadened query cannot widen the blast radius.
 */
import { connect, loadEnvLocal, assertTargetProject, flag } from "./lib/firestore.mjs";

/** The one population this script may touch. Anchored at both ends. */
const QA_EMAIL = /^qa-signup\+[a-z0-9-]+@letitrip-qa\.test$/i;

export function isQaSignupEmail(email) {
  return typeof email === "string" && QA_EMAIL.test(email.trim());
}

// ── Controls: refuse to run at all if the matcher is wrong ──────────────────
const MUST_MATCH = ["qa-signup+run-1789483929743@letitrip-qa.test", "QA-Signup+run-1@LETITRIP-QA.TEST"];
const MUST_NOT_MATCH = [
  "rehan.sheikh@gmail.com",
  "admin@letitrip.in",
  "tyson@beybladearena.in",
  "qa-signup+run-1@gmail.com",           // right local part, REAL domain
  "attacker@letitrip-qa.test.evil.com",  // marker domain as a prefix
  "xqa-signup+run-1@letitrip-qa.test",   // unanchored start
];
for (const e of MUST_MATCH) {
  if (!isQaSignupEmail(e)) {
    console.error(`✗ CONTROL FAILED — matcher rejects a QA address it must accept: ${e}`);
    process.exit(2);
  }
}
for (const e of MUST_NOT_MATCH) {
  if (isQaSignupEmail(e)) {
    console.error(`✗ CONTROL FAILED — matcher ACCEPTS an address it must refuse: ${e}`);
    process.exit(2);
  }
}

const dryRun = flag("dry-run") === true;
const confirm = flag("yes-i-am");

loadEnvLocal();
const projectId = assertTargetProject();
if (!dryRun && confirm !== projectId) {
  console.error(
    `✗ Refusing to delete. Pass --yes-i-am ${projectId} to confirm, or --dry-run to preview.`,
  );
  process.exit(2);
}

const { db, auth } = connect();

/*
 * 🛑 THE EMAIL IS READ FROM FIREBASE AUTH, NOT FROM FIRESTORE.
 *
 * `UserDocument.email` is PII-encrypted at rest — it reads back as
 * `enc:v1:oPlc6WjZi4Iy56bQ:dnwe7yvaz/91HwpXFf+8K4pl`, never as an address. The
 * first version of this script scanned Firestore and matched zero accounts
 * against a QA signup that had just been created, while reporting "Nothing to
 * purge" — a cleanup tool that silently cleans nothing is worse than no tool,
 * because you stop checking.
 *
 * Auth stores the address in plaintext and is the authority on it anyway, so
 * it is both the only workable source and the correct one. Firestore is still
 * where the profile document is deleted from; only the MATCH moves.
 */
const listed = await auth.listUsers(1000);
const victims = listed.users
  .filter((u) => isQaSignupEmail(u.email))
  .map((u) => ({ uid: u.uid, email: u.email }));

console.log(`auth accounts scanned : ${listed.users.length}`);
console.log(`QA signups matched    : ${victims.length}`);
for (const v of victims) console.log(`   ${v.uid}  ${v.email}`);

/*
 * Legacy QA accounts from before the marker existed (`qa-signup-N@mailnull.com`)
 * are REPORTED, never deleted. `mailnull.com` is a real, registrable domain, so
 * they fall outside the reserved-TLD population that makes this script safe to
 * point at the PRESERVE tier. Widening the matcher to cover them would trade
 * away the entire safety argument to save a human one decision.
 */
const legacy = listed.users.filter(
  (u) => !isQaSignupEmail(u.email) && /^qa-signup[-+]/i.test(u.email || ""),
);
if (legacy.length) {
  console.log(`\n⚠ ${legacy.length} legacy QA account(s) predate the marker and are NOT touched:`);
  for (const u of legacy) console.log(`   ${u.uid}  ${u.email}`);
  console.log(`   They sit on a real domain, outside this script's safe population.`);
  console.log(`   Deleting them is a human decision — this tool will not make it.`);
}

if (victims.length === 0) {
  console.log("\nNothing to purge.");
  process.exit(0);
}
if (dryRun) {
  console.log("\n--dry-run: nothing deleted.");
  process.exit(0);
}

let deleted = 0;
for (const v of victims) {
  // Re-check at the point of deletion. The query above could be widened by a
  // future edit; this cannot be, without also editing the matcher the controls
  // above already guard.
  if (!isQaSignupEmail(v.email)) {
    console.error(`✗ REFUSING ${v.uid} (${v.email}) — does not match the QA marker.`);
    continue;
  }
  try {
    await auth.deleteUser(v.uid);
  } catch (err) {
    // A Firestore profile with no Auth record is normal if signup half-failed;
    // that is not a reason to leave the profile behind.
    if (!String(err?.code || "").includes("user-not-found")) {
      console.error(`  auth delete failed for ${v.uid}: ${err?.message ?? err}`);
    }
  }
  await db.collection("users").doc(v.uid).delete();
  deleted += 1;
  console.log(`   purged ${v.uid}`);
}

console.log(`\n✓ purged ${deleted} QA signup account(s).`);
