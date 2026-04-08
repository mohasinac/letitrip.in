/**
 * Firebase Client SDK — app, auth, storage, realtime DB.
 *
 * Firestore is intentionally excluded — all DB access goes through
 * @mohasinac/db-firebase (Admin SDK) via repositories and API routes.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getDatabase, type Database } from "firebase/database";

// IMPORTANT: reference each key as a literal `process.env.NEXT_PUBLIC_*` expression
// so webpack's DefinePlugin inlines the values at build time. Passing `process.env`
// as a whole argument to a helper function bypasses the substitution step and results
// in `undefined` values in the browser bundle.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const canInitializeClientFirebase =
  typeof window !== "undefined" && Boolean(firebaseConfig.apiKey);

const app: FirebaseApp = canInitializeClientFirebase
  ? (getApps()[0] ?? initializeApp(firebaseConfig))
  : (null as unknown as FirebaseApp);

const auth: Auth = canInitializeClientFirebase
  ? getAuth(app)
  : (null as unknown as Auth);

const storage: FirebaseStorage = canInitializeClientFirebase
  ? getStorage(app)
  : (null as unknown as FirebaseStorage);

const realtimeDb: Database = canInitializeClientFirebase
  ? getDatabase(app)
  : (null as unknown as Database);

export { app, auth, storage, realtimeDb };
