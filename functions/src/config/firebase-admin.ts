/**
 * Firebase Admin SDK Configuration
 *
 * Centralized configuration for Firebase Admin SDK
 * Used by all backend Firebase Functions
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firestore database instance
export const adminDb = admin.firestore();

// Export Firebase Storage instance
export const adminStorage = admin.storage();

// Export Firebase Auth instance
export const adminAuth = admin.auth();

// Export admin namespace for other uses
export { admin };
