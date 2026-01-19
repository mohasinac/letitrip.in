/**
 * Firebase Configuration
 *
 * Centralized Firebase setup for authentication, Firestore, and storage.
 * Initializes Firebase app and exports commonly used services.
 *
 * @example
 * ```tsx
 * import { auth, db, storage } from '@/lib/firebase';
 *
 * // Use auth
 * const user = auth.currentUser;
 *
 * // Use Firestore
 * const productsRef = collection(db, 'products');
 *
 * // Use Storage
 * const storageRef = ref(storage, 'images/product.jpg');
 * ```
 */

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration from environment variables
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize Firebase
 * Uses singleton pattern - only initializes once
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Firebase Authentication
 *
 * @example
 * ```tsx
 * import { auth } from '@/lib/firebase';
 * import { signInWithEmailAndPassword } from 'firebase/auth';
 *
 * await signInWithEmailAndPassword(auth, email, password);
 * ```
 */
export const auth = getAuth(app);

/**
 * Firestore Database
 *
 * @example
 * ```tsx
 * import { db } from '@/lib/firebase';
 * import { collection, getDocs } from 'firebase/firestore';
 *
 * const querySnapshot = await getDocs(collection(db, 'products'));
 * ```
 */
export const db = getFirestore(app);

/**
 * Firebase Storage
 *
 * @example
 * ```tsx
 * import { storage } from '@/lib/firebase';
 * import { ref, uploadBytes } from 'firebase/storage';
 *
 * const storageRef = ref(storage, 'images/file.jpg');
 * await uploadBytes(storageRef, file);
 * ```
 */
export const storage = getStorage(app);

/**
 * Firebase app instance
 */
export { app };

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

/**
 * Get Firebase configuration status for debugging
 */
export const getFirebaseConfigStatus = () => {
  if (process.env.NODE_ENV === "development") {
    return {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
      storageBucket: !!firebaseConfig.storageBucket,
      messagingSenderId: !!firebaseConfig.messagingSenderId,
      appId: !!firebaseConfig.appId,
      measurementId: !!firebaseConfig.measurementId,
    };
  }
  return null;
};
