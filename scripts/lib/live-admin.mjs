/**
 * Shared firebase-admin bootstrap for the live content scripts.
 *
 * Mirrors the env parsing in `upload-taxonomy-images.mjs` so there is one
 * spelling of "read `.env.local`, build a credential, open the bucket" rather
 * than a copy per script that can drift.
 *
 * 🛑 THE PROJECT GUARD IS NOT OPTIONAL. These scripts WRITE to live Firestore
 * and live Storage. `TESTER_TARGET_PROJECT` already exists in `.env.local` as
 * the tester harness's "which project am I allowed to touch" declaration, and
 * it is reused here for exactly that question — with no default, because a
 * default project id sitting in a repo is one clone away from writing to
 * somebody else's database.
 *
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:network
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const ROOT = path.resolve(import.meta.dirname, "..", "..");

/** Load `.env.local` without clobbering anything already in the environment. */
export function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    if (!(k in process.env)) {
      process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
}

/**
 * Initialise firebase-admin against the project named in `.env.local`, after
 * confirming it is the project the operator declared.
 *
 * @param {{ requireConfirm?: boolean }} opts
 *   `requireConfirm` demands `--yes-i-am <projectId>` on argv, matching the
 *   tester harness's typed-confirmation rail: a bare `-y` is muscle memory,
 *   typing the project id is a decision.
 */
export function initAdmin({ requireConfirm = true } = {}) {
  loadEnvLocal();

  const missing = [
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`✗ Missing env: ${missing.join(", ")}`);
    process.exit(2);
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID.trim();
  const declared = (process.env.TESTER_TARGET_PROJECT ?? "").trim();
  if (!declared) {
    console.error("✗ TESTER_TARGET_PROJECT is not set — refusing to write to any project.");
    process.exit(2);
  }
  if (declared !== projectId) {
    console.error(`✗ TESTER_TARGET_PROJECT (${declared}) != FIREBASE_ADMIN_PROJECT_ID (${projectId}).`);
    process.exit(2);
  }

  if (requireConfirm) {
    const i = process.argv.indexOf("--yes-i-am");
    const typed = i === -1 ? null : process.argv[i + 1];
    if (typed !== projectId) {
      console.error(`✗ Refusing to write. Pass --yes-i-am ${projectId} (or use --dry-run).`);
      process.exit(2);
    }
  }

  const admin = require("firebase-admin");
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${projectId}.firebasestorage.app`,
    });
  }
  return { admin, db: admin.firestore(), bucket: admin.storage().bucket(), projectId };
}
