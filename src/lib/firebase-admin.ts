/**
 * Firebase Admin SDK Configuration
 *
 * Server-side Firebase configuration for authentication and Firestore operations.
 * Only used in API routes and server components.
 *
 * @example
 * ```tsx
 * import { adminAuth, adminDb } from '@/lib/firebase-admin';
 *
 * // Verify ID token
 * const decodedToken = await adminAuth.verifyIdToken(token);
 *
 * // Access Firestore
 * const doc = await adminDb.collection('users').doc(userId).get();
 * ```
 */

import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

/**
 * Initialize Firebase Admin SDK
 * Uses singleton pattern - only initializes once
 */
if (!getApps().length) {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    throw new Error(
      "Firebase Admin credentials missing. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local",
    );
  }
}

/**
 * Firebase Admin Auth
 * For verifying tokens and managing users server-side
 */
export const adminAuth = admin.auth();

/**
 * Firebase Admin Firestore
 * For server-side database operations
 */
export const adminDb = admin.firestore();

/**
 * Verify Firebase ID token and return decoded token
 *
 * @param idToken - Firebase ID token from client
 * @returns Decoded token with user information
 * @throws Error if token is invalid
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid authentication token");
  }
}

/**
 * Get user by UID
 *
 * @param uid - User ID
 * @returns User record from Firebase Auth
 */
export async function getUserByUid(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("User not found");
  }
}

/**
 * Set custom user claims (for roles)
 *
 * @param uid - User ID
 * @param claims - Custom claims object
 */
export async function setCustomUserClaims(
  uid: string,
  claims: Record<string, any>,
) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw new Error("Failed to set user claims");
  }
}
