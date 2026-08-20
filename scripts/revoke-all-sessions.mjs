#!/usr/bin/env node
// One-off admin action: revoke every user's Firebase Auth refresh tokens so
// every real user is force-logged-out and must re-authenticate on their next
// request. Existing ID tokens keep working until they naturally expire
// (up to ~1h) unless the session-cookie verification path checks revocation
// — src/lib/firebase/auth-server.ts already calls
// admin.auth().verifySessionCookie(cookie, /* checkRevoked */ true), so this
// takes effect immediately for cookie-based requests.
//
// Requires --yes to run for real; without it, prints a dry-run count only.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

const repoRoot = process.cwd();
const serviceAccountPath = resolve(repoRoot, "firebase-admin-key.json");

const envLocalPath = resolve(repoRoot, ".env.local");
if (existsSync(envLocalPath)) {
  const lines = readFileSync(envLocalPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const raw = trimmed.slice(eqIdx + 1).trim();
    const value = raw.replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const dryRun = !process.argv.includes("--yes");

if (!existsSync(serviceAccountPath)) {
  throw new Error(`Missing service account file: ${serviceAccountPath}`);
}

const serviceAccount = require(serviceAccountPath);
const projectId = serviceAccount.project_id;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId,
});

async function main() {
  console.log(`[revoke-all-sessions] Project: ${projectId}`);
  console.log(dryRun ? "[revoke-all-sessions] DRY RUN — pass --yes to actually revoke.\n" : "[revoke-all-sessions] LIVE — revoking refresh tokens for every user.\n");

  let nextPageToken;
  let total = 0;
  let revoked = 0;
  let failed = 0;

  do {
    const page = await admin.auth().listUsers(1000, nextPageToken);
    total += page.users.length;

    if (!dryRun) {
      for (const user of page.users) {
        try {
          await admin.auth().revokeRefreshTokens(user.uid);
          revoked++;
        } catch (err) {
          failed++;
          console.error(`  Failed to revoke ${user.uid}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    nextPageToken = page.pageToken;
  } while (nextPageToken);

  console.log(`\n[revoke-all-sessions] Total users found: ${total}`);
  if (!dryRun) {
    console.log(`[revoke-all-sessions] Revoked: ${revoked}, Failed: ${failed}`);
  } else {
    console.log("[revoke-all-sessions] Re-run with --yes to revoke for real.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[revoke-all-sessions] Fatal error:", err);
    process.exit(1);
  });
