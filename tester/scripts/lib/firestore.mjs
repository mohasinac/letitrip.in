/*
 * Firestore admin connection + the host guard.
 *
 * Copies the standalone-script pattern from appkit/scripts/purge-test-data.mjs
 * verbatim (.env.local loader, createRequire for CJS firebase-admin, exit 2 on
 * misconfiguration) so there is one way these scripts authenticate, not two.
 *
 * Exit codes, matching the sibling scripts: 0 success, 1 errors during run,
 * 2 misconfiguration.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Parse one dotenv-shaped file into process.env. Existing process.env always wins. */
function applyEnvFile(path) {
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

/**
 * Loads the consumer's `.env.local`, then the harness's own `tester/.env`.
 *
 * Existing `process.env` always wins, so CI can override either without editing a
 * file — that contract predates this function's second half and must survive it.
 *
 * 🛑 WHY THERE ARE TWO FILES. `tester/.env` holds harness-only secrets, currently
 * the test mailbox the email cases read over IMAP. It is deliberately NOT in the
 * consumer's `.env.local`: the app only ever SENDS mail (resend) and never reads
 * it, so a live mailbox credential does not belong in the env the Vercel build
 * sees. `tester/.gitignore` ignores it — the rule was added before the file
 * existed, because this is a submodule that ships via pointer bumps.
 *
 * Absent `tester/.env` is normal and silent: only the email cases need it, and
 * warning on every Firestore script would train people to ignore the warning.
 */
export function loadEnvLocal(repoRoot = process.cwd()) {
  const envLocalPath = resolve(repoRoot, ".env.local");
  if (existsSync(envLocalPath)) {
    applyEnvFile(envLocalPath);
  } else {
    console.warn(`⚠ .env.local not found at ${envLocalPath} — relying on existing process.env`);
  }

  const testerEnvPath = resolve(repoRoot, "tester", ".env");
  if (existsSync(testerEnvPath)) applyEnvFile(testerEnvPath);
}

const parsePrivateKey = (raw) => (raw && raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw);

/**
 * 🛑 THE HOST GUARD.
 *
 * A tester run deletes documents. The single thing that must never vary is WHICH
 * project it deletes them from, so the target is stated explicitly in the
 * environment and compared against the credentials actually in use.
 *
 * TESTER_TARGET_PROJECT is REQUIRED and has no default. A default would be a
 * project id sitting in the repo that some future clone silently points at.
 */
export function assertTargetProject() {
  const target = process.env.TESTER_TARGET_PROJECT;
  const actual = process.env.FIREBASE_ADMIN_PROJECT_ID;

  if (!target) {
    console.error("✗ TESTER_TARGET_PROJECT is not set.");
    console.error("  This run would delete documents, so the project must be named explicitly.");
    console.error(`  Set it in .env.local. The credentials currently loaded are for: ${actual ?? "(none)"}`);
    process.exit(2);
  }
  if (!actual) {
    console.error("✗ FIREBASE_ADMIN_PROJECT_ID is not set — no credentials to check against.");
    process.exit(2);
  }
  if (target !== actual) {
    console.error(`✗ Project mismatch. Refusing to run.`);
    console.error(`    TESTER_TARGET_PROJECT   = ${target}`);
    console.error(`    FIREBASE_ADMIN_PROJECT_ID = ${actual}`);
    console.error("  The credentials point somewhere other than the project you named.");
    process.exit(2);
  }
  return actual;
}

/** Connects firebase-admin. `serviceAccountPath` overrides the env-var credentials. */
export function connect({ repoRoot = process.cwd(), serviceAccountPath = null } = {}) {
  const admin = require("firebase-admin");

  const required = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (!serviceAccountPath && missing.length > 0) {
    console.error(`✗ Missing required env vars: ${missing.join(", ")}`);
    console.error("  Either set them in .env.local or pass --service-account <path-to-key.json>");
    process.exit(2);
  }

  if (!admin.apps.length) {
    if (serviceAccountPath) {
      const key = JSON.parse(readFileSync(resolve(repoRoot, serviceAccountPath), "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(key) });
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
          privateKey: parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
        }),
      });
    }
  }
  return { admin, db: admin.firestore(), auth: admin.auth() };
}

/**
 * Deletes refs with a `BulkWriter`. Returns the count actually deleted.
 *
 * 🛑 500 IS THE OPERATION CAP, NOT THE ONLY CAP — and chunking at 500 fails.
 *
 * This chunked into `db.batch()` at 500, citing "the Firestore batch cap". That
 * cap is real but it is only the operation COUNT; a commit also has a total SIZE
 * limit, and a delete is not free — the backend must also remove every index
 * entry the document owns. `categories` rows carry `parentIds`, `ancestors` and
 * `mosaicImages` arrays against a wide composite-index set, so 500 of them
 * exceeds the size limit while sitting exactly on the documented count limit.
 *
 * Measured 2026-10-15: `tester:setup` died on the very first wiped collection
 * with `3 INVALID_ARGUMENT: Transaction too big. Decrease transaction size.`,
 * having deleted nothing. The identical failure hit the seed path earlier in the
 * same session on the same collection, and was fixed the same way.
 *
 * `BulkWriter` is Firestore's own answer: it sizes and parallelises its own
 * batches, and retries with backoff. Lowering the constant instead would be a
 * guess at a limit that moves with the document, and the next wide collection
 * would re-break it.
 *
 * 🛑 It THROWS on any ref it could not delete, deliberately. A wipe that
 * silently leaves rows behind hands the run a half-seeded catalogue, and every
 * verdict after that is measured against state nobody described.
 */
export async function batchDelete(db, refs) {
  if (!refs.length) return 0;
  const writer = db.bulkWriter();
  /* Retry transient contention, but bound it: one poisoned ref must not stall
   * the whole wipe behind infinite backoff. */
  writer.onWriteError((err) => err.failedAttempts < 5);

  let written = 0;
  const failures = [];
  for (const ref of refs) {
    writer
      .delete(ref)
      .then(() => {
        written += 1;
      })
      .catch((err) => {
        failures.push(`${ref.path}: ${err?.message ?? err}`);
      });
  }
  await writer.close();

  if (failures.length) {
    throw new Error(
      `batchDelete: ${failures.length} of ${refs.length} deletes failed\n  ` +
        failures.slice(0, 5).join("\n  ") +
        (failures.length > 5 ? `\n  …and ${failures.length - 5} more` : ""),
    );
  }
  return written;
}

/** Firestore caps `in` / `array-contains-any` at 30 values. */
export const IN_QUERY_CHUNK = 30;

export function chunk(arr, size = IN_QUERY_CHUNK) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Simple `--flag value` / `--flag` parser, matching the sibling scripts' shape. */
export function flag(name, fallback = undefined, argv = process.argv.slice(2)) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
