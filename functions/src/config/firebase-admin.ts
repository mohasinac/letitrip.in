import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { getDatabase } from "firebase-admin/database";
import type { Database } from "firebase-admin/database";

// Initialise once — Firebase Functions runtime has Application Default
// Credentials (ADC), so no explicit credential config is needed.
if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

// RTDB is lazily initialized — only available in Functions runtime, not
// when the Firebase CLI loads this module locally to introspect exports.
let _rtdb: Database | null = null;
export function getRtdb(): Database {
  if (!_rtdb) {
    _rtdb = getDatabase();
  }
  return _rtdb;
}

export function newBatch() {
  return db.batch();
}
