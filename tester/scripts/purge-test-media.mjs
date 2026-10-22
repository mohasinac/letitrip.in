#!/usr/bin/env node
/*
 * Delete the Storage objects a tester run uploaded.
 *
 * Usage (from the consumer repo root):
 *   node tester/scripts/purge-test-media.mjs --plan                  # count, delete nothing
 *   node tester/scripts/purge-test-media.mjs --yes-i-am <projectId>
 *   node tester/scripts/purge-test-media.mjs --yes-i-am <id> --older-than 24
 *
 * Exit: 0 done, 1 errors during run, 2 misconfiguration or refused.
 *
 * 🛑 WHY THIS EXISTS SEPARATELY FROM THE FIRESTORE WIPE
 *
 * `lifecycle.mjs clear` deletes the `mediaAssets` DOCUMENTS. It does not, and
 * cannot, delete the bytes: a Firestore delete has no reach into Storage. So every
 * run left its uploads behind, accumulating silently and billing quietly, while
 * the run reported a clean teardown. collections.mjs has carried a 🛑 admitting
 * this since it was written; this is the job it was deferring to.
 *
 * 🛑 AND WHY IT IS NOT SIMPLY "DELETE THE BUCKET PREFIX"
 *
 * Real sellers' product photos live in the same bucket. The only thing separating
 * a tester's upload from a real listing's image is the object PATH, so this deletes
 * strictly under known-disposable prefixes and refuses everything else — the same
 * shape as `assertDeletable`, for the same reason. An unrecognised prefix is
 * PRESERVED, never swept.
 */


import { assertTargetProject, connect, flag, loadEnvLocal } from "./lib/firestore.mjs";

const REPO_ROOT = process.cwd();
const PLAN = flag("plan") === true;
const CONFIRM = flag("yes-i-am");
const OLDER_THAN_H = Number(flag("older-than", 0));

loadEnvLocal(REPO_ROOT);
const projectId = assertTargetProject();

/**
 * Every prefix that may be deleted, and why it is disposable.
 *
 * `tmp/` is the staging area every upload lands in before finalize moves it, so
 * anything still there is by definition an abandoned or in-flight upload — the
 * existing `mediaTmpCleanup` job already sweeps it on a 24h TTL and this is the
 * same rule run on demand.
 *
 * The tester's own uploads finalize into the ordinary content paths, which is why
 * `--older-than` exists: scoping by time is the only safe way to catch them
 * without also catching a real seller's photo that happens to share a directory.
 */
const DELETABLE_PREFIXES = Object.freeze([
  { prefix: "tmp/", why: "staging area — anything here is an abandoned or in-flight upload" },
  { prefix: "test-media/", why: "fixtures uploaded by a tester run" },
  { prefix: "tester-screenshot/", why: "screenshots attached to checklist verdicts" },
]);

if (!PLAN && CONFIRM !== projectId) {
  console.error(`✗ Refusing to delete without confirmation.`);
  console.error(`  Re-run with:  --yes-i-am ${projectId}`);
  console.error(`  Or inspect first with --plan, which writes nothing.`);
  // Typed, not a bare -y, for the same reason lifecycle.mjs demands it: muscle
  // memory must not be able to approve a run against the wrong project.
  process.exit(2);
}

function getBucket() {
  // connect() returns the admin namespace, not an app handle — storage() hangs
  // off the namespace and uses the already-initialised default app.
  const { admin } = connect({ repoRoot: REPO_ROOT });
  const name =
    process.env.FIREBASE_ADMIN_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!name) {
    console.error("✗ No storage bucket configured (FIREBASE_ADMIN_STORAGE_BUCKET / NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET).");
    process.exit(2);
  }
  return { bucket: admin.storage().bucket(name), name };
}

const { bucket, name } = getBucket();
const cutoff = OLDER_THAN_H > 0 ? new Date(Date.now() - OLDER_THAN_H * 3600_000) : null;

console.log(`Bucket ${name} (project ${projectId})${cutoff ? `, objects older than ${OLDER_THAN_H}h` : ""}\n`);

let totalDeleted = 0;
let totalBytes = 0;
let errors = 0;

for (const { prefix, why } of DELETABLE_PREFIXES) {
  let files;
  try {
    [files] = await bucket.getFiles({ prefix, autoPaginate: true });
  } catch (err) {
    console.error(`  ✗ ${prefix} — could not list: ${err.message}`);
    errors++;
    continue;
  }

  const targets = [];
  for (const file of files) {
    // Belt and braces: getFiles already filtered, but a prefix match is the ONLY
    // thing standing between this and a real seller's photos.
    if (!file.name.startsWith(prefix)) continue;
    if (cutoff) {
      const md = file.metadata ?? {};
      const at = md.updated ?? md.timeCreated;
      // No timestamp means we cannot prove it is old — so we do not touch it.
      if (!at || new Date(at) >= cutoff) continue;
    }
    targets.push(file);
  }

  const bytes = targets.reduce((n, f) => n + Number(f.metadata?.size ?? 0), 0);
  console.log(`  ${prefix.padEnd(22)} ${String(targets.length).padStart(5)} object(s), ${(bytes / 1024 / 1024).toFixed(1)} MB  — ${why}`);

  if (PLAN) continue;

  for (const file of targets) {
    try {
      await file.delete();
      totalDeleted++;
      totalBytes += Number(file.metadata?.size ?? 0);
    } catch (err) {
      // A 404 means something else already removed it — idempotent, not an error.
      if (err?.code === 404) continue;
      console.error(`    ✗ ${file.name}: ${err.message}`);
      errors++;
    }
  }
}

if (PLAN) {
  console.log(`\n✓ Plan only — nothing deleted. Re-run with --yes-i-am ${projectId} to apply.`);
  process.exit(0);
}

console.log(`\n${errors ? "⚠" : "✓"} Deleted ${totalDeleted} object(s), ${(totalBytes / 1024 / 1024).toFixed(1)} MB${errors ? `, ${errors} error(s)` : ""}.`);
process.exit(errors ? 1 : 0);
