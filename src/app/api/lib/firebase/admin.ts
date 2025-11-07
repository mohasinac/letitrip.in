/**
 * Firebase Admin SDK Configuration
 * Server-side only - never import this in client components
 * Location: /src/app/api/lib/firebase/admin.ts
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App;
let db: Firestore;
let auth: Auth;
let storage: Storage;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKeyRaw) {
      console.warn('⚠ Firebase Admin missing required env vars. Skipping init.');
      throw new Error('Firebase Admin not configured');
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });

    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log('🔥 Using Firestore emulator:', process.env.FIRESTORE_EMULATOR_HOST);
    }

    db.settings({ ignoreUndefinedProperties: true });

    console.log('✅ Firebase Admin SDK initialized');
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  }

  return { app, db, auth, storage };
}

/**
 * Get Firestore instance
 * Initializes Firebase Admin if not already initialized
 */
export function getFirestoreAdmin(): Firestore {
  if (!db) {
    const { db: firestore } = initializeFirebaseAdmin();
    return firestore;
  }
  return db;
}

/**
 * Get Auth instance
 * Initializes Firebase Admin if not already initialized
 */
export function getAuthAdmin(): Auth {
  if (!auth) {
    const { auth: adminAuth } = initializeFirebaseAdmin();
    return adminAuth;
  }
  return auth;
}

/**
 * Get Storage instance
 * Initializes Firebase Admin if not already initialized
 */
export function getStorageAdmin(): Storage {
  if (!storage) {
    const { storage: adminStorage } = initializeFirebaseAdmin();
    return adminStorage;
  }
  return storage;
}

/**
 * Verify Firebase Admin is properly configured
 */
export function verifyFirebaseAdmin(): boolean {
  try {
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_STORAGE_BUCKET',
    ];

    const missing = requiredEnvVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.error('❌ Missing Firebase Admin environment variables:', missing);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error verifying Firebase Admin configuration:', error);
    return false;
  }
}
