import * as admin from "firebase-admin";

// Initialise once — Firebase Functions runtime already has Application Default
// Credentials (ADC) set, so no explicit credential config is needed.
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
export const rtdb = admin.database();
export const storage = admin.storage();

// Convenience — used in every job to run batched writes
export function newBatch() {
  return db.batch();
}
