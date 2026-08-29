#!/usr/bin/env node
/**
 * Seed the three Playwright test users (admin, seller, buyer) into production Firestore.
 * Safe to run multiple times — uses set() with merge: false (overwrites).
 * Passwords are TempPass123! in Firebase Auth (matches SMOKE_* defaults in _setup.ts).
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { encryptUserForSeed } from "./lib/pii-seed.mjs";

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

const repoRoot = process.cwd();

// Load .env.local for PII keys
const envLocalPath = resolve(repoRoot, ".env.local");
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}

// PII helpers
const ENC_PREFIX = "enc:v1:";
const HMAC_PREFIX = "hmac-sha256:";
function getEncKey() {
  const hex = (process.env.PII_ENCRYPTION_KEY ?? "").trim();
  if (!hex || hex.length !== 64) throw new Error("PII_ENCRYPTION_KEY must be a 64-char hex string");
  return Buffer.from(hex, "hex");
}
function getHmacKey() {
  const raw = process.env.PII_HMAC_KEY ?? process.env.PII_ENCRYPTION_KEY ?? "";
  if (!raw) throw new Error("PII_HMAC_KEY env var not set");
  return Buffer.from(raw, "hex");
}
function encrypt(plain) {
  const key = getEncKey();
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `${ENC_PREFIX}${iv.toString("base64")}:${enc.toString("base64")}:${c.getAuthTag().toString("base64")}`;
}
function hmac(val) {
  return `${HMAC_PREFIX}${createHmac("sha256", getHmacKey()).update(val).digest("hex")}`;
}
function encryptPii(doc, fields) {
  const r = { ...doc };
  for (const f of fields) {
    if (typeof r[f] === "string" && r[f] && !r[f].startsWith(ENC_PREFIX)) {
      r[f] = encrypt(r[f]);
      r[`${f}Index`] = hmac(doc[f]);
    }
  }
  return r;
}

const serviceAccountPath = resolve(repoRoot, "firebase-admin-key.json");
if (!existsSync(serviceAccountPath)) throw new Error(`Missing: ${serviceAccountPath}`);

const serviceAccount = require(serviceAccountPath);
const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: serviceAccount.project_id });
const auth = admin.auth(app);
const db = admin.firestore(app);

const NOW = new Date();
const PW = "TempPass123!";
const PII_FIELDS = ["email", "phoneNumber"];

const USERS = [
  {
    uid: "user-admin-letitrip",
    email: "admin@letitrip.in",
    phoneNumber: "+919999900000",
    displayName: "LetItRip Admin",
    role: "admin",
    storeId: "store-letitrip-official",
    storeSlug: "store-letitrip-official",
    storeStatus: "approved",
  },
  {
    uid: "user-ash-ketchum",
    email: "ash@pokemonpalace.in",
    phoneNumber: "+919876543210",
    displayName: "Ash Ketchum",
    role: "seller",
    storeId: "store-pokemon-palace",
    storeSlug: "store-pokemon-palace",
    storeStatus: "approved",
  },
  {
    uid: "user-yugi-mutou",
    email: "yugi@duelkingdom.in",
    phoneNumber: "+919123456789",
    displayName: "Yugi Mutou",
    role: "user",
    storeId: null,
    storeSlug: null,
    storeStatus: null,
  },
];

async function upsertAuthUser(u) {
  try {
    await auth.createUser({ uid: u.uid, email: u.email, phoneNumber: u.phoneNumber, displayName: u.displayName, emailVerified: true, disabled: false, password: PW });
    console.log(`  Auth created: ${u.uid}`);
  } catch (err) {
    if (err.code === "auth/uid-already-exists") {
      await auth.updateUser(u.uid, { email: u.email, displayName: u.displayName, emailVerified: true, disabled: false });
      console.log(`  Auth updated: ${u.uid}`);
    } else throw err;
  }
  await auth.setCustomUserClaims(u.uid, { role: u.role });
}

async function upsertFirestoreUser(u) {
  const base = {
    uid: u.uid,
    email: u.email,
    phoneNumber: u.phoneNumber,
    phoneVerified: true,
    displayName: u.displayName,
    role: u.role,
    emailVerified: true,
    disabled: false,
    ...(u.storeId ? { storeId: u.storeId, storeSlug: u.storeSlug, storeStatus: u.storeStatus } : {}),
    publicProfile: { isPublic: true, showEmail: false, showPhone: false, showOrders: false, showWishlist: false, bio: "", location: "" },
    stats: { totalOrders: 0, auctionsWon: 0, itemsSold: 0, reviewsCount: 0 },
    metadata: { lastSignInTime: NOW, creationTime: NOW.toISOString(), loginCount: 0 },
    createdAt: NOW,
    updatedAt: NOW,
  };
  // Shared path. The local encryptPii derived `${f}Index`, so phoneNumber
  // produced `phoneNumberIndex` — a name nothing reads — and findByPhone()
  // missed every test user. The shared helper writes the mapped names.
  const encrypted = encryptUserForSeed(base);
  await db.collection("users").doc(u.uid).set(encrypted);
  console.log(`  Firestore users/${u.uid} written`);
}

async function main() {
  console.log(`Project: ${serviceAccount.project_id}`);
  for (const u of USERS) {
    console.log(`\nSeeding ${u.uid} (${u.role})...`);
    await upsertAuthUser(u);
    await upsertFirestoreUser(u);
  }
  console.log("\n✅ Done. Test credentials: email / TempPass123!");
  await app.delete();
}

main().catch((err) => { console.error("Failed:", err.message ?? err); process.exit(1); });
