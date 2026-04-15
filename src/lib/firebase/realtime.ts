/**
 * Firebase Realtime Database — Authenticated Instance
 *
 * A separate Firebase app instance used exclusively for Realtime DB
 * subscriptions that require per-user custom token authentication.
 *
 * This is used for:
 *   - Chat message subscriptions (/chat/{chatId}/messages)
 *   - User notification subscriptions (/notifications/{uid})
 *
 * The main `realtimeDb` from `@/lib/firebase/config` is used for public
 * paths (e.g. /auction-bids/{productId}) that do NOT require auth.
 *
 * IMPORTANT: This file is CLIENT-SIDE ONLY.
 * The custom token is obtained from POST /api/realtime/token and used with
 * `signInWithCustomToken(getAuth(realtimeApp), customToken)` before subscribing.
 *
 * @see database.rules.json — Realtime DB security rules
 * @see src/app/api/realtime/token/route.ts — Issues the custom token
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const REALTIME_APP_NAME = "letitrip-realtime";
const canInitializeRealtimeClient =
  typeof window !== "undefined" && Boolean(firebaseClientConfig.databaseURL);

/**
 * Dedicated Firebase app instance for authenticated Realtime DB subscriptions.
 * Uses the same project config as the main app but runs under its own Auth context.
 */
export const realtimeApp: FirebaseApp = canInitializeRealtimeClient
  ? (getApps().find((a) => a.name === REALTIME_APP_NAME) ??
      initializeApp(firebaseClientConfig, REALTIME_APP_NAME))
  : (null as unknown as FirebaseApp);

/**
 * Realtime Database instance bound to the authenticated app.
 * Use this (NOT `realtimeDb` from `@/lib/firebase/config`) for chat subscriptions.
 */
export const chatRealtimeDb: Database = canInitializeRealtimeClient
  ? getDatabase(realtimeApp)
  : (null as unknown as Database);

/**
 * Public Realtime Database instance (default Firebase app).
 * Use this for unauthenticated public paths (e.g. /auction-bids/{productId}).
 * Prefer importing from here instead of @/lib/firebase/config in client code.
 */
export { realtimeDb } from "./config";

