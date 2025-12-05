/**
 * @fileoverview Configuration
 * @module src/app/api/lib/firebase/config
 * @description This file contains functionality related to config
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
/**
 * Performs initialize firebase admin operation
 *
 * @returns {any} The initializefirebaseadmin result
 */

/**
 * Performs initialize firebase admin operation
 *
 * @returns {any} The initializefirebaseadmin result
 */

const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // Get environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    // Validate required environment variables
    if (!projectId) {
      throw new Error(
        "FIREBASE_PROJECT_ID is not set in environment variables",
      );
    }
    if (!clientEmail) {
      throw new Error(
        "FIREBASE_CLIENT_EMAIL is not set in environment variables",
      );
    }
    if (!privateKey) {
      throw new Error(
        "FIREBASE_PRIVATE_KEY is not set in environment variables",
      );
    }

    initializeApp({
      /** Credential */
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
};

initializeFirebaseAdmin();

export const adminAuth = getAuth();
export const adminDb = getFirestore();
