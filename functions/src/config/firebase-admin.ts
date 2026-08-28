import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Initialise once — Firebase Functions runtime has Application Default
// Credentials (ADC), so no explicit credential config is needed.
if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

// No RTDB accessor here, deliberately. `getRtdb()` used to live at this spot
// with ZERO consumers — a third, unused Admin RTDB handle alongside
// appkit's `getAdminRealtimeDb()` and firebase-reset.mjs's own. Every piece of
// RTDB work the Functions runtime actually performs (onJobCreated,
// onOrderStatusChange, cleanupRtdbEvents) runs through appkit's accessor.
// If a Function ever needs RTDB directly, import that one rather than
// reintroducing a second initialiser with its own lifecycle.

export function newBatch() {
  return db.batch();
}
