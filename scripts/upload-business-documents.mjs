#!/usr/bin/env node
/**
 * Encrypt the statutory business documents and upload them to Firebase
 * Storage, writing one `businessDocuments` metadata row per file.
 *
 * ── Why these do not live in git ──────────────────────────────────────────
 *
 * The GST certificate, the Udyam registration and the bank passbook are
 * staged under `public/business/`, which is gitignored by pattern — and that
 * is only a staging location. `public/` is served VERBATIM by Next.js: no
 * rewrite intercepts `/business`, so an unignored file there is reachable at
 * https://www.letitrip.in/business/<name> the moment it deploys.
 *
 * After this script runs, the bytes live in Storage (encrypted) and the repo
 * copy is disposable — exactly the relationship `.media-cache/` has with the
 * taxonomy images, and for the same reason.
 *
 * 🛑 The payment QR is NOT handled here and must not be. It is deliberately
 * public (a UPI collect QR exists to be scanned) and deliberately STATIC: a
 * QR served through `/api/media/[...slug]` would be watermarked — that proxy
 * composites a mark onto every image with no opt-out — and a mark over a QR
 * can corrupt enough modules to break the scan.
 *
 * ── Why encrypted, when `digital-content/` is not ─────────────────────────
 *
 * `storage.rules` is `allow read: if true` for every object in the bucket. The
 * private prefix and the absence of a `mediaAssets` row are what keep these
 * unreachable, and both are conventions rather than enforcement. A bank
 * passbook is worth a second, real lock: `encryptBuffer` (AES-256-GCM under
 * SETTINGS_ENCRYPTION_KEY) means an object leaked straight out of the bucket
 * is still ciphertext.
 *
 * Usage (from the consumer root):
 *   node scripts/upload-business-documents.mjs --dry-run
 *   node scripts/upload-business-documents.mjs --yes
 *   node scripts/upload-business-documents.mjs --yes --dir /path/to/docs
 *   node scripts/upload-business-documents.mjs --yes --force   re-upload all
 *
 * Idempotent: a kind whose current row already records the same plaintext size
 * and filename is skipped, so a re-run after a partial failure costs only the
 * remainder. `--force` uploads a new revision regardless — which is the right
 * action for a RE-ISSUED certificate, and why old revisions are kept rather
 * than overwritten (the superseded document is the evidence of what was true
 * at the time).
 *
 * Exit: 0 = success, 1 = some uploads failed, 2 = misconfiguration.
 *
 * @tag domain:business-documents
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:storage-write,firestore-write,fs
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
// The `enc:v1:` binary envelope. A second implementation of appkit's, kept
// honest by scripts/audit-business-doc-envelope.mjs — see that file's header
// for why importing the real one from a pure-ESM script does not work.
import { encryptBuffer } from "./lib/business-doc-crypto.mjs";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, "..");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CONFIRMED = args.includes("--yes");
const FORCE = args.includes("--force");
const dirArg = args.indexOf("--dir");
const SRC_DIR = dirArg !== -1 && args[dirArg + 1]
  ? path.resolve(args[dirArg + 1])
  : path.join(ROOT, "public/business");

if (!DRY_RUN && !CONFIRMED) {
  console.error("✗ Refusing to upload without --yes. Use --dry-run to preview.");
  process.exit(2);
}

const COLLECTION = "businessDocuments";
const STORAGE_PREFIX = "private/business-documents";

/*
 * Which file is which kind.
 *
 * Matched case-insensitively on a SUBSTRING of the filename rather than an
 * exact name, because these arrive named by whoever issued them and the names
 * are not stable — "GST Certificate.pdf" today, "gst_cert_2026.pdf" on
 * re-issue. An unmatched file is reported and skipped, never guessed at: a
 * passbook filed as a GST certificate would be served to the wrong surface.
 */
const KIND_PATTERNS = [
  { kind: "gst_certificate", match: /gst/i },
  { kind: "udyam_certificate", match: /udyam/i },
  { kind: "bank_passbook", match: /passbook/i },
];

/** Magic-byte signatures. The declared extension is a claim; these are evidence. */
const MAGIC = [
  { type: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
];

function sniffContentType(buf) {
  for (const sig of MAGIC) {
    if (sig.bytes.every((b, i) => buf[i] === b)) return sig.type;
  }
  // WEBP is RIFF....WEBP — a four-byte gap the flat table above cannot express.
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Collect
// ---------------------------------------------------------------------------
if (!fs.existsSync(SRC_DIR)) {
  console.error(`✗ ${path.relative(ROOT, SRC_DIR)} does not exist.`);
  process.exit(2);
}

const entries = [];
const unmatched = [];
for (const name of fs.readdirSync(SRC_DIR).sort()) {
  const full = path.join(SRC_DIR, name);
  if (!fs.statSync(full).isFile()) continue;
  // The QR is public and static by design — see the header.
  if (/payment-qr/i.test(name)) continue;

  const hit = KIND_PATTERNS.find((k) => k.match.test(name));
  if (!hit) {
    unmatched.push(name);
    continue;
  }

  const buf = fs.readFileSync(full);
  const contentType = sniffContentType(buf);
  if (!contentType) {
    console.error(`✗ ${name}: unrecognised file type (magic bytes). Refusing to upload.`);
    process.exit(2);
  }

  entries.push({ kind: hit.kind, fileName: name, local: full, buf, contentType });
}

if (unmatched.length > 0) {
  console.warn(`▌ skipped, no kind matched: ${unmatched.join(", ")}`);
}
if (entries.length === 0) {
  console.error("✗ nothing to upload.");
  process.exit(2);
}

console.log(`staged documents: ${entries.length}`);
for (const e of entries) {
  console.log(`  ${e.kind.padEnd(20)} ${e.fileName}  ${(e.buf.length / 1024).toFixed(0)} KB  ${e.contentType}`);
}

if (DRY_RUN) {
  console.log("\n--dry-run: nothing written.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// .env.local + firebase-admin
// ---------------------------------------------------------------------------
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    if (!(k in process.env)) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
}

const missing = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
  // Without this there is no key and encryptBuffer throws. Checked up front so
  // the failure is one line here rather than a stack trace after the first
  // file has already been read.
  "SETTINGS_ENCRYPTION_KEY",
].filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`✗ Missing env: ${missing.join(", ")}`);
  process.exit(2);
}

const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebasestorage.app`,
  });
}
const bucket = admin.storage().bucket();
const db = admin.firestore();
console.log(`bucket:  ${bucket.name}`);
console.log(`project: ${process.env.FIREBASE_ADMIN_PROJECT_ID}`);

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------
let uploaded = 0;
let skipped = 0;
let failed = 0;

for (const e of entries) {
  try {
    if (!FORCE) {
      const existing = await db
        .collection(COLLECTION)
        .where("kind", "==", e.kind)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
      const cur = existing.docs[0]?.data();
      if (cur && cur.sizeBytes === e.buf.length && cur.fileName === e.fileName) {
        console.log(`  = ${e.kind} unchanged, skipping`);
        skipped++;
        continue;
      }
    }

    /*
     * A RANDOM object name, against the SEO-slug convention used everywhere
     * else in this codebase. Media filenames here are content-derived and
     * therefore guessable, and guessable is the one property a document behind
     * a bucket whose rules say `read: if true` must not have.
     */
    const ext = path.extname(e.fileName) || ".bin";
    const storagePath = `${STORAGE_PREFIX}/${crypto.randomUUID()}${ext}`;

    await bucket.file(storagePath).save(encryptBuffer(e.buf), {
      // The STORED bytes are ciphertext, so the stored contentType must say so.
      // Declaring application/pdf over an encrypted blob would make anything
      // that bypassed the decrypt route hand a browser a broken PDF instead of
      // an obviously-opaque download. The real type is in the Firestore row and
      // is what the download route sets on the response.
      contentType: "application/octet-stream",
      metadata: { cacheControl: "private, no-store" },
    });

    await db.collection(COLLECTION).add({
      kind: e.kind,
      storagePath,
      fileName: e.fileName,
      contentType: e.contentType,
      sizeBytes: e.buf.length,
      encrypted: true,
      uploadedBy: "script:upload-business-documents",
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`  + ${e.kind} -> ${storagePath}`);
    uploaded++;
  } catch (err) {
    console.error(`  ✗ ${e.kind}: ${err?.message ?? err}`);
    failed++;
  }
}

console.log(`\nuploaded ${uploaded}, skipped ${skipped}, failed ${failed}`);
if (failed === 0 && uploaded > 0) {
  console.log(
    "\nThe staged copies under public/business/ are now disposable — the bytes\n" +
    "live in Storage and are readable only via GET /api/admin/business-documents/<id>.",
  );
}
process.exit(failed > 0 ? 1 : 0);
