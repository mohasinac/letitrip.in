import * as admin from "firebase-admin";

// Initialise once — Firebase Functions runtime already has Application Default
// Credentials (ADC) set, so no explicit credential config is needed.
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// RTDB is lazily initialized — admin.database() requires FIREBASE_DATABASE_URL
// which is only available inside the Firebase Functions runtime, not when the
// Firebase CLI loads this module locally to introspect exports.
let _rtdb: admin.database.Database | null = null;
export function getRtdb(): admin.database.Database {
  if (!_rtdb) {
    _rtdb = admin.database();
  }
  return _rtdb;
}

// Convenience — used in every job to run batched writes
export function newBatch() {
  return db.batch();
}
