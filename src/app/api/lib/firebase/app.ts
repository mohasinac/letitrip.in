/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/firebase/app
 * @description This file contains functionality related to app
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Firebase Client-Side Configuration
 *
 * 🔒 SECURITY POLICY: Minimal Client-Side Firebase
 * ================================================
 *
 * ALLOWED on Client:
 * ✅ Realtime Database - Real-time auction bidding only
 * ✅ Analytics - Error tracking and metrics
 *
 * FORBIDDEN on Client (Server-side only):
 * ❌ Firestore - ALL database operations via API routes
 * ❌ Storage - ALL file uploads via API routes
 * ❌ Auth - ALL authentication via API routes
 *
 * WHY?
 * - Security: Firestore/Storage rules can be bypassed
 * - Cost: Client SDKs are larger (~150KB vs ~10KB for Realtime DB)
 * - Control: Server-side validation prevents abuse
 * - Vercel FREE: No WebSocket support for Socket.IO (use Realtime DB)
 *
 * IMPORTANT: ESLint rules enforce this policy
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAnalytics, Analytics } from "firebase/analytics";

// Minimal config - only what's needed for Realtime DB and Analytics
const firebaseConfig = {
  /** Api Key */
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  /** Auth Domain */
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  /** Project Id */
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  /** Storage Bucket */
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  /** Messaging Sender Id */
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  /** App Id */
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  /** Database U R L */
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

let app: FirebaseApp;
let database: Database;
let analytics: Analytics | null = null;

// Only initialize on client-side
if (typeof window !== "undefined" && getApps().length === 0) {
  app = initializeApp(firebaseConfig);

  // Realtime Database for auction bidding (WebSocket alternative)
  database = getDatabase(app);

  // Analytics for error logging and performance metrics
  analytics = getAnalytics(app);
}

// NOTE: Do NOT export Firestore or Storage from this file
// Use server-side firebase-admin instead (see src/app/api/lib/firebase/admin.ts)
export { app, database, analytics };
