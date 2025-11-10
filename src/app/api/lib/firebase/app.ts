/**
 * Firebase Client-Side Configuration
 * 
 * IMPORTANT: Only used for Firebase Realtime Database (auction bidding)
 * ALL other Firebase operations (Auth, Firestore, Storage) are handled server-side
 * 
 * Why Realtime Database on client?
 * - Real-time auction bid updates require persistent WebSocket connections
 * - Server-side WebSockets not available on Vercel FREE tier
 * - Firebase Realtime DB is FREE and provides real-time sync
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAnalytics, Analytics } from "firebase/analytics";

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
  
  // Realtime Database for auction bidding
  database = getDatabase(app);
  
  // Analytics for error logging and metrics
  analytics = getAnalytics(app);
}

export { app, database, analytics };
