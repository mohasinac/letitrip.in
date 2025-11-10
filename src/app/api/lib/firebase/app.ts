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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
