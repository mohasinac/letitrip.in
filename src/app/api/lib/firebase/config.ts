import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // Get environment variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    );

    // Validate required environment variables
    if (!projectId) {
      throw new Error(
        "FIREBASE_ADMIN_PROJECT_ID is not set in environment variables",
      );
    }
    if (!clientEmail) {
      throw new Error(
        "FIREBASE_ADMIN_CLIENT_EMAIL is not set in environment variables",
      );
    }
    if (!privateKey) {
      throw new Error(
        "FIREBASE_ADMIN_PRIVATE_KEY is not set in environment variables",
      );
    }

    initializeApp({
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
