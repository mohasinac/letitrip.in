/**
 * Firebase Client Configuration
 * Used for client-side Firebase operations
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM",
  authDomain: "justforview1.firebaseapp.com",
  projectId: "justforview1",
  storageBucket: "justforview1.firebasestorage.app",
  messagingSenderId: "995821948299",
  appId: "1:995821948299:web:38d1decb11eca69c7d738e",
  measurementId: "G-4BLN02DGVX"
};

// Initialize Firebase (prevent multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set auth persistence to LOCAL (survives page reloads and browser tabs)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Error setting auth persistence:", error);
  });
}

// Initialize Analytics (only on client-side)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
