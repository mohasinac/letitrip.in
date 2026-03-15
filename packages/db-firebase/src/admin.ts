/**
 * Firebase Admin SDK singletons.
 *
 * Supports two init methods (checked in order):
 *   1. `firebase-admin-key.json` in process.cwd() — development
 *   2. FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY env vars — production
 *
 * All getters are lazy — the SDK is not touched until first use.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  getStorage as getFirebaseStorage,
  type Storage,
} from "firebase-admin/storage";
import { getDatabase, type Database } from "firebase-admin/database";
import * as path from "path";
import * as fs from "fs";

let _app: App | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: Storage | null = null;
let _rtdb: Database | null = null;

// ─── App ──────────────────────────────────────────────────────────────────────

export function getAdminApp(): App {
  if (_app) return _app;

  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }

  const keyPath = path.join(process.cwd(), "firebase-admin-key.json");

  try {
    if (fs.existsSync(keyPath)) {
      const sa = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      const dbUrl =
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
        `https://${sa.project_id}-default-rtdb.firebaseio.com`;

      _app = initializeApp({ credential: cert(keyPath), databaseURL: dbUrl });
    } else if (
      process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ) {
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
      const dbUrl =
        process.env.FIREBASE_ADMIN_DATABASE_URL ??
        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ??
        `https://${projectId}-default-rtdb.firebaseio.com`;

      _app = initializeApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
            /\\n/g,
            "\n",
          ),
        }),
        databaseURL: dbUrl,
      });
    } else {
      throw new Error(
        "@mohasinac/db-firebase: Firebase Admin credentials not found.\n" +
          "Add firebase-admin-key.json to project root, or set " +
          "FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, " +
          "FIREBASE_ADMIN_PRIVATE_KEY environment variables.",
      );
    }
  } catch (err) {
    console.error(
      "[@mohasinac/db-firebase] Failed to initialise Admin SDK:",
      err,
    );
    throw err;
  }

  return _app;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(getAdminApp());
  return _auth;
}

// ─── Firestore ────────────────────────────────────────────────────────────────

export function getAdminDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getAdminApp());
    _db.settings({ ignoreUndefinedProperties: true });
  }
  return _db;
}

// ─── Cloud Storage ────────────────────────────────────────────────────────────

export function getAdminStorage(): Storage {
  if (!_storage) _storage = getFirebaseStorage(getAdminApp());
  return _storage;
}

// ─── Realtime DB ──────────────────────────────────────────────────────────────

export function getAdminRealtimeDb(): Database {
  if (!_rtdb) _rtdb = getDatabase(getAdminApp());
  return _rtdb;
}

/** Reset all singletons — useful in tests. */
export function _resetAdminSingletons(): void {
  _app = null;
  _auth = null;
  _db = null;
  _storage = null;
  _rtdb = null;
}
