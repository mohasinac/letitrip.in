/**
 * Firebase Admin SDK Configuration
 *
 * Server-side Firebase Admin for secure operations.
 * Used for user management, custom claims, and server-side verification.
 *
 * Supports two initialization methods:
 * 1. Environment variables (recommended for production)
 * 2. Service account JSON file (easier for development)
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import {
  getStorage as getFirebaseStorage,
  Storage,
} from "firebase-admin/storage";
import { getDatabase, Database } from "firebase-admin/database";
import * as path from "path";
import * as fs from "fs";
import { AppError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

let _adminApp: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;
let _adminStorage: Storage | null = null;
let _adminRealtimeDb: Database | null = null;

/**
 * Get Firebase Admin App instance (lazy initialization)
 */
export function getAdminApp(): App {
  if (!_adminApp) {
    if (!getApps().length) {
      try {
        // Method 1: Try service account JSON file (for development)
        const serviceAccountPath = path.join(
          process.cwd(),
          "firebase-admin-key.json",
        );
        if (fs.existsSync(serviceAccountPath)) {
          serverLogger.info(
            "🔑 Initializing Firebase Admin with service account JSON file",
          );
          const serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountPath, "utf8"),
          );
          const devDbUrl =
            process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
            `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;
          _adminApp = initializeApp({
            credential: cert(serviceAccountPath),
            databaseURL: devDbUrl,
          });

          // Initialize Firestore with settings BEFORE any other operations
          _adminDb = getFirestore(_adminApp);
          _adminDb.settings({
            ignoreUndefinedProperties: true,
          });
        }
        // Method 2: Use environment variables (for production)
        else if (
          process.env.FIREBASE_ADMIN_PROJECT_ID &&
          process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
          process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ) {
          serverLogger.info(
            "🔑 Initializing Firebase Admin with environment variables",
          );
          const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
          const prodDbUrl =
            process.env.FIREBASE_ADMIN_DATABASE_URL ??
            process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
            `https://${projectId}-default-rtdb.firebaseio.com`;
          _adminApp = initializeApp({
            credential: cert({
              projectId,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
                /\\n/g,
                "\n",
              ),
            }),
            databaseURL: prodDbUrl,
          });

          // Initialize Firestore with settings BEFORE any other operations
          _adminDb = getFirestore(_adminApp);
          _adminDb.settings({
            ignoreUndefinedProperties: true,
          });
        } else {
          throw new AppError(
            500,
            "Firebase Admin credentials not found. Please either:\n" +
              "1. Add firebase-admin-key.json to project root (development), OR\n" +
              "2. Set FIREBASE_ADMIN_* environment variables (production)\n" +
              "See FIREBASE_KEY_SETUP.md for instructions.",
            "FIREBASE_ADMIN_INIT_ERROR",
          );
        }
      } catch (error) {
        serverLogger.error(
          "❌ Failed to initialize Firebase Admin SDK:",
          error,
        );
        throw error;
      }
    } else {
      _adminApp = getApps()[0];
    }
  }
  return _adminApp;
}

/**
 * Get Firebase Admin Auth instance (lazy initialization)
 */
export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

/**
 * Get Firebase Admin Firestore instance (lazy initialization)
 *
 * Admin SDK automatically bypasses security rules when properly authenticated.
 */
export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}

/**
 * Get Firebase Admin Storage instance (lazy initialization)
 */
export function getStorage(): Storage {
  if (!_adminStorage) {
    _adminStorage = getFirebaseStorage(getAdminApp());
  }
  return _adminStorage;
}

/**
 * Get Firebase Admin Realtime Database instance (lazy initialization)
 *
 * Used for real-time features like live bid streaming.
 */
export function getAdminRealtimeDb(): Database {
  if (!_adminRealtimeDb) {
    _adminRealtimeDb = getDatabase(getAdminApp());
  }
  return _adminRealtimeDb;
}
