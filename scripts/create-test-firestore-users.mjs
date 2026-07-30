/**
 * One-time script: create minimal Firestore user documents for E2E test users.
 * These are needed because the seed route failed to create them (Auth creation error).
 * Run: node scripts/create-test-firestore-users.mjs
 */
import { readFileSync } from "fs";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const envLocal = readFileSync("d:/proj/letitrip.in/.env.local", "utf8");
const envVars = {};
for (const line of envLocal.split("\n")) {
  const m = line.match(/^([A-Z_]+)="([\s\S]*?)"$/);
  if (m) envVars[m[1]] = m[2].replace(/\\n/g, "\n");
}

const { FIREBASE_ADMIN_PROJECT_ID: projectId, FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail, FIREBASE_ADMIN_PRIVATE_KEY: privateKey } = envVars;
let app; try { app = getApp(); } catch { app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }); }
const db = getFirestore(app);

const now = new Date();

// Minimal user documents — no PII encryption needed since login route only reads role/metadata
const TEST_USERS = [
  {
    uid: "user-seto-kaiba",
    email: "kaiba@kaibalandmark.in",
    displayName: "Seto Kaiba",
    role: "seller",
    emailVerified: true,
    disabled: false,
    storeId: "store-kaiba-corp-cards",
    storeSlug: "store-kaiba-corp-cards",
    storeStatus: "approved",
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  {
    uid: "user-yugi-muto",
    email: "yugi@duelkingdom.in",
    displayName: "Yugi Muto",
    role: "user",
    emailVerified: true,
    disabled: false,
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  {
    uid: "user-ash-trainer",
    email: "ash@pokemonpalace.in",
    displayName: "Ash Ketchum",
    role: "seller",
    emailVerified: true,
    disabled: false,
    storeId: "store-pokemon-palace",
    storeSlug: "store-pokemon-palace",
    storeStatus: "approved",
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  {
    uid: "user-priya-sharma",
    email: "priya@cardgamehub.in",
    displayName: "Priya Sharma",
    role: "seller",
    emailVerified: true,
    disabled: false,
    storeId: "store-cardgame-hub",
    storeSlug: "store-cardgame-hub",
    storeStatus: "approved",
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  {
    uid: "user-rajesh-gupta",
    email: "rajesh@diecastdepot.in",
    displayName: "Rajesh Gupta",
    role: "seller",
    emailVerified: true,
    disabled: false,
    storeId: "store-diecast-depot",
    storeSlug: "store-diecast-depot",
    storeStatus: "approved",
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  {
    uid: "user-arjun-mehta",
    email: "arjun@beyarenaindia.in",
    displayName: "Arjun Mehta",
    role: "seller",
    emailVerified: true,
    disabled: false,
    storeId: "store-beyblade-arena",
    storeSlug: "store-beyblade-arena",
    storeStatus: "approved",
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  {
    uid: "user-kenji-tanaka",
    email: "kenji@tokyotoysindia.in",
    displayName: "Kenji Tanaka",
    role: "seller",
    emailVerified: true,
    disabled: false,
    storeId: "store-tokyo-toys-india",
    storeSlug: "store-tokyo-toys-india",
    storeStatus: "approved",
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  {
    uid: "user-maria-santos",
    email: "maria@vintagevault.in",
    displayName: "Maria Santos",
    role: "seller",
    emailVerified: true,
    disabled: false,
    storeId: "store-vintage-vault",
    storeSlug: "store-vintage-vault",
    storeStatus: "approved",
    metadata: { loginCount: 0, lastSignInTime: now },
  },
  { uid: "user-ravi-kumar",    email: "ravi@example.com",    displayName: "Ravi Kumar",    role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-ananya-patel",  email: "ananya@example.com",  displayName: "Ananya Patel",  role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-vikram-singh",  email: "vikram@example.com",  displayName: "Vikram Singh",  role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-deepika-rao",   email: "deepika@example.com", displayName: "Deepika Rao",   role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-amit-joshi",    email: "amit@example.com",    displayName: "Amit Joshi",    role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-sunita-verma",  email: "sunita@example.com",  displayName: "Sunita Verma",  role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-krishna-nair",  email: "krishna@example.com", displayName: "Krishna Nair",  role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-pooja-desai",   email: "pooja@example.com",   displayName: "Pooja Desai",   role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
  { uid: "user-mohit-agarwal", email: "mohit@example.com",   displayName: "Mohit Agarwal", role: "user", emailVerified: true, disabled: false, metadata: { loginCount: 0, lastSignInTime: now } },
];

async function main() {
  let written = 0, errors = 0;
  for (const user of TEST_USERS) {
    const { uid, ...data } = user;
    try {
      const docRef = db.collection("users").doc(uid);
      const existing = await docRef.get();
      if (existing.exists) {
        // Only update if the document is missing key fields
        const d = existing.data();
        if (!d?.metadata?.loginCount && d?.metadata?.loginCount !== 0) {
          await docRef.set({ ...data, updatedAt: now, createdAt: now }, { merge: true });
          console.log(`✓ Merged missing fields for: ${uid}`);
        } else {
          console.log(`  Skipped (already complete): ${uid}`);
        }
      } else {
        await docRef.set({ ...data, updatedAt: now, createdAt: now });
        console.log(`✓ Created: ${uid} (${user.email}, role=${user.role})`);
      }
      written++;
    } catch (e) {
      console.error(`✗ Error for ${uid}: ${e.message}`);
      errors++;
    }
  }
  console.log(`\nDone. Processed: ${written}, Errors: ${errors}`);
}

main().catch(console.error).finally(() => process.exit(0));
