#!/usr/bin/env node

/**
 * One-off script: creates the admin Firebase Auth user + Firestore user document.
 * Used after firebase-reset.mjs when you need login ability without seeding everything.
 *
 * Usage: node scripts/seed-admin-only.mjs
 */

import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, createCipheriv, createHmac } from "node:crypto";

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

const repoRoot = process.cwd();
const serviceAccountPath = resolve(repoRoot, "firebase-admin-key.json");

// Load .env.local
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

// --- Inline PII encryption (matches appkit/src/security/pii-encrypt.ts) ---

const ENC_PREFIX = "enc:v1:";
const HMAC_PREFIX = "hmac-sha256:";

function getEncKey() {
  const hex = (process.env.PII_ENCRYPTION_KEY ?? "").replace(/[\r\n]+$/g, "").trim();
  if (!hex || hex.length !== 64) throw new Error("PII_ENCRYPTION_KEY must be a 64-char hex string");
  return Buffer.from(hex, "hex");
}

function getHmacKey() {
  const raw = process.env.PII_HMAC_KEY ?? process.env.PII_ENCRYPTION_KEY ?? "";
  if (!raw) throw new Error("PII_HMAC_KEY env var is not set");
  return Buffer.from(raw, "hex");
}

function encryptValue(plaintext) {
  const key = getEncKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENC_PREFIX}${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
}

function hmacBlindIndex(value) {
  const key = getHmacKey();
  const hash = createHmac("sha256", key).update(value).digest("hex");
  return `${HMAC_PREFIX}${hash}`;
}

function encryptPiiFields(doc, piiFields) {
  const result = { ...doc };
  for (const field of piiFields) {
    const value = doc[field];
    if (typeof value !== "string" || !value) continue;
    if (value.startsWith(ENC_PREFIX)) continue;
    result[field] = encryptValue(value);
    result[`${field}Index`] = hmacBlindIndex(value);
  }
  return result;
}

function addPiiIndices(obj, mapping) {
  const result = { ...obj };
  for (const [sourceField, indexField] of Object.entries(mapping)) {
    const val = result[sourceField];
    if (typeof val === "string" && val) {
      result[indexField] = hmacBlindIndex(val);
    }
  }
  return result;
}

// --- Main ---

if (!existsSync(serviceAccountPath)) {
  throw new Error(`Missing service account file: ${serviceAccountPath}`);
}

const serviceAccount = require(serviceAccountPath);
const projectId = serviceAccount.project_id;

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId,
});

const auth = admin.auth(app);
const db = admin.firestore(app);

const USER_PII_FIELDS = ["email", "phoneNumber"];
const USER_PII_INDEX_MAP = { email: "emailIndex", phoneNumber: "phoneIndex" };

const NOW = new Date();
const UID = "user-admin-letitrip";

const adminUser = {
  uid: UID,
  email: "admin@letitrip.in",
  phoneNumber: "+919999900000",
  phoneVerified: true,
  displayName: "LetItRip Admin",
  photoURL: "https://images.ygoprodeck.com/images/cards/cropped/33396948.jpg",
  avatarMetadata: {
    url: "https://images.ygoprodeck.com/images/cards/cropped/33396948.jpg",
    position: { x: 50, y: 50 },
    zoom: 1.0,
  },
  role: "admin",
  emailVerified: true,
  disabled: false,
  storeId: "store-letitrip-official",
  storeSlug: "store-letitrip-official",
  storeStatus: "approved",
  publicProfile: {
    isPublic: true,
    showEmail: false,
    showPhone: false,
    showOrders: false,
    showWishlist: false,
    bio: "LetItRip platform administrator. India's largest YGO collectibles marketplace.",
    location: "Mumbai, Maharashtra",
    storeName: "LetItRip Official",
    storeCategory: "trading-cards",
  },
  stats: { totalOrders: 0, auctionsWon: 0, itemsSold: 0, reviewsCount: 0 },
  metadata: {
    lastSignInTime: NOW,
    creationTime: NOW.toISOString(),
    loginCount: 0,
  },
  createdAt: NOW,
  updatedAt: NOW,
};

async function main() {
  console.log(`[seed-admin] Project: ${projectId}`);

  // 1. Create Auth user
  console.log(`[seed-admin] Creating Auth user ${UID}...`);
  try {
    await auth.createUser({
      uid: UID,
      email: adminUser.email,
      phoneNumber: adminUser.phoneNumber,
      displayName: adminUser.displayName,
      photoURL: adminUser.photoURL,
      emailVerified: true,
      disabled: false,
      password: "TempPass123!",
    });
    console.log("[seed-admin] Auth user created.");
  } catch (err) {
    if (err.code === "auth/uid-already-exists") {
      console.log("[seed-admin] Auth user already exists, updating...");
      await auth.updateUser(UID, {
        email: adminUser.email,
        phoneNumber: adminUser.phoneNumber,
        displayName: adminUser.displayName,
        photoURL: adminUser.photoURL,
        emailVerified: true,
        disabled: false,
      });
    } else {
      throw err;
    }
  }

  // Set admin custom claim
  await auth.setCustomUserClaims(UID, { role: "admin" });
  console.log("[seed-admin] Custom claims set (role: admin).");

  // 2. Create Firestore user document with PII encryption
  let docData = { ...adminUser };
  docData = addPiiIndices(docData, USER_PII_INDEX_MAP);
  docData = encryptPiiFields(docData, USER_PII_FIELDS);

  await db.collection("users").doc(UID).set(docData);
  console.log(`[seed-admin] Firestore document users/${UID} created.`);

  console.log("\n[seed-admin] Done. Login with: admin@letitrip.in / TempPass123!");
  await app.delete();
}

main().catch((err) => {
  console.error("[seed-admin] Failed:", err.message || err);
  process.exit(1);
});
