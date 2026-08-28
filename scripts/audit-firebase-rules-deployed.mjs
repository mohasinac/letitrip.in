#!/usr/bin/env node
/**
 * audit-firebase-rules-deployed.mjs — committed is not deployed.
 *
 * WHY THIS EXISTS SEPARATELY FROM audit-firebase-rules-generated
 *
 *   That audit proves the root config files match their appkit source. It says
 *   nothing about whether the live Firebase project is running them. Those are
 *   different failures and only one of them is visible in a diff:
 *
 *     generated-drift  →  the committed file is stale vs appkit/firebase/base
 *     THIS one         →  the committed file is correct, and production is
 *                         still serving the previous version
 *
 *   A rules change can sit correct, committed, reviewed and green for weeks
 *   while the live project serves something else entirely. For a SECURITY
 *   change that gap is the whole point: on 2026-08-29 `auction-bids` was
 *   `.read: true`, publishing a bidder's display name to anyone with a product
 *   id. Committing `.read: false` changed nothing until
 *   `npm run firebase -- deploy --only database` actually ran — and nothing in
 *   the repo would have said so.
 *
 * HOW
 *   `scripts/firebase.mjs` writes a sha256 per artifact into
 *   `firebase-deployed.json` after a deploy exits 0. This audit re-hashes the
 *   committed files and compares. Offline, no credentials, no network — so it
 *   is safe in `npm run check` and in CI.
 *
 *   It is a record of intent, not proof of server state: someone can deploy by
 *   hand with the firebase CLI and leave the record stale. That is a fair
 *   trade — the alternative is authenticating to Firebase inside the gate,
 *   which makes `npm run check` require credentials and network.
 *
 * FIX when it fails
 *   npm run firebase -- deploy --only database      (or the named target)
 *   then commit the updated firebase-deployed.json.
 *
 * Strict-zero. No suppression marker: a rules file is either deployed or it is
 * not, and "we meant to" is exactly the state this blocks.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECORD = join(ROOT, "firebase-deployed.json");

/** file -> the `--only` target that ships it. */
const ARTIFACT_TARGET = {
  "database.rules.json": "database",
  "firestore.rules": "firestore:rules",
  "firestore.indexes.json": "firestore:indexes",
  "storage.rules": "storage",
};

function hash(file) {
  return createHash("sha256")
    .update(readFileSync(file, "utf8").replace(/\r\n/g, "\n"))
    .digest("hex");
}

if (!existsSync(RECORD)) {
  console.error(
    `\n[audit-firebase-rules-deployed] no firebase-deployed.json\n\n` +
      `  Nothing records what was last pushed, so a rules change committed today is\n` +
      `  indistinguishable from one live in production since March.\n\n` +
      `  Fix: npm run firebase -- deploy --only database   (writes the record)\n`,
  );
  process.exit(1);
}

const record = JSON.parse(readFileSync(RECORD, "utf8"));
const stale = [];
const untracked = [];

for (const [file, target] of Object.entries(ARTIFACT_TARGET)) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) continue;
  const current = hash(abs);
  const deployed = record[file];
  if (!deployed) {
    // NOT a failure. An artifact enters coverage the first time it is deployed
    // through `npm run firebase -- deploy`, and seeding the record by hand would
    // be asserting a deploy that never happened — the exact dishonesty this
    // audit exists to prevent. Warn so the gap is visible rather than assumed.
    untracked.push({ file, target });
  } else if (deployed !== current) {
    stale.push({ file, target, why: "changed since the last deploy" });
  }
}

if (untracked.length > 0) {
  console.warn(
    `[audit-firebase-rules-deployed] ${untracked.length} artifact(s) not yet tracked — ` +
      `they join coverage on their next deploy through the wrapper:`,
  );
  for (const u of untracked) console.warn(`    ${u.file}  (--only ${u.target})`);
}

if (stale.length > 0) {
  console.error(
    `\n[audit-firebase-rules-deployed] ${stale.length} artifact(s) not deployed:\n`,
  );
  for (const s of stale) {
    console.error(`  ${s.file} — ${s.why}`);
    console.error(`      npm run firebase -- deploy --only ${s.target}`);
  }
  console.error(
    `\n  These files are what Firebase SERVES. A committed-but-undeployed change is\n` +
      `  invisible in every diff and every green build: the repo says one thing and\n` +
      `  production does another. For a rule that closes a public read, that gap is\n` +
      `  the entire security exposure.\n\n` +
      `  Deploy, then commit the updated firebase-deployed.json.\n`,
  );
  process.exit(1);
}

console.log(
  `[audit-firebase-rules-deployed] OK — deployed record matches (last: ${record.deployedAt ?? "unknown"})`,
);
process.exit(0);
