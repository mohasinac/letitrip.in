/**
 * OTP bypass for the checkout consent gate.
 *
 * Reads Firebase Admin SA creds from env and writes a verified consentOtp doc
 * directly to Firestore at the same path the /api/checkout route checks:
 *     users/{uid}/consentOtps/{addressId}
 *     { verified: true, expiresAt: <now + 15min>, verifiedVia: "test-bypass" }
 *
 * This is a TEST-RUNNER capability — no prod code changes. The SA creds live
 * in .env.local / CI secrets, never on the public Internet.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

let _db = null;

function initAdmin() {
  if (_db) return _db;
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(
      /\\n/g,
      "\n",
    );
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing FIREBASE_ADMIN_* env. Cannot perform OTP bypass.",
      );
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  _db = getFirestore();
  return _db;
}

/** Write a verified consentOtp doc good for 15 minutes. */
export async function seedConsentOtp(uid, addressId) {
  const db = initAdmin();
  const ref = db
    .collection("users")
    .doc(uid)
    .collection("consentOtps")
    .doc(addressId);
  const expiresAt = Timestamp.fromMillis(Date.now() + 15 * 60 * 1000);
  await ref.set(
    {
      verified: true,
      expiresAt,
      verifiedVia: "test-bypass",
      bypassedAt: Timestamp.now(),
    },
    { merge: true },
  );
  return { uid, addressId, expiresAt: expiresAt.toMillis() };
}

/** Cleanup a consentOtp doc after a test. */
export async function clearConsentOtp(uid, addressId) {
  const db = initAdmin();
  await db
    .collection("users")
    .doc(uid)
    .collection("consentOtps")
    .doc(addressId)
    .delete()
    .catch(() => {});
}

/** Generic doc deletion helper for cleanup phases. */
export async function adminDelete(path) {
  const db = initAdmin();
  await db.doc(path).delete().catch(() => {});
}

export function getAdminDb() {
  return initAdmin();
}
