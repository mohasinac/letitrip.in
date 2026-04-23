"use client";

import {
  FirebaseClientAuthProvider,
  FirebaseClientRealtimeProvider,
  type AdapterAuthUser,
  type IClientAuthProvider,
  type IClientRealtimeProvider,
  type IClientSessionAdapter,
  registerClientAuthProvider,
  registerClientRealtimeProvider,
  registerClientSessionAdapter,
  type RealtimeSnapshot,
  type Unsubscribe,
} from "@mohasinac/appkit/client";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey);

function toAdapterUser(user: User): AdapterAuthUser {
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    getIdToken: (forceRefresh?: boolean) => user.getIdToken(forceRefresh),
  };
}

const fallbackRealtimeProvider: IClientRealtimeProvider = {
  async signInWithToken() {
    throw new Error("Firebase client config is missing. Realtime auth is unavailable.");
  },
  async signOut() {
    return;
  },
  subscribe(
    _path: string,
    _onData: (snapshot: RealtimeSnapshot) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    onError?.(
      new Error("Firebase client config is missing. Realtime subscriptions are unavailable."),
    );
    return () => {};
  },
};

const fallbackAuthProvider: IClientAuthProvider = {
  async signInWithEmailAndPassword() {
    throw new Error("Firebase client config is missing. Email/password auth is unavailable.");
  },
  async applyActionCode() {
    throw new Error("Firebase client config is missing. Email verification is unavailable.");
  },
  async sendPasswordResetEmail() {
    throw new Error("Firebase client config is missing. Password reset is unavailable.");
  },
  async confirmPasswordReset() {
    throw new Error("Firebase client config is missing. Password reset is unavailable.");
  },
  async reauthenticateAndChangePassword() {
    throw new Error("Firebase client config is missing. Password change is unavailable.");
  },
  async reloadCurrentUser() {
    return;
  },
};

const fallbackSessionAdapter: IClientSessionAdapter = {
  onAuthStateChanged(callback) {
    callback(null);
    return () => {};
  },
  getCurrentUser() {
    return null;
  },
  async signOut() {
    return;
  },
};

if (hasFirebaseConfig && auth) {
  registerClientAuthProvider(new FirebaseClientAuthProvider());
  registerClientRealtimeProvider(
    new FirebaseClientRealtimeProvider({
      firebaseConfig,
      appName: "letitrip-realtime",
    }),
  );

  registerClientSessionAdapter({
    onAuthStateChanged(callback) {
      return onAuthStateChanged(auth, (user) => callback(user ? toAdapterUser(user) : null));
    },
    getCurrentUser() {
      const user = auth.currentUser;
      return user ? toAdapterUser(user) : null;
    },
    async signOut() {
      await auth.signOut();
    },
  });
} else {
  registerClientAuthProvider(fallbackAuthProvider);
  registerClientRealtimeProvider(fallbackRealtimeProvider);
  registerClientSessionAdapter(fallbackSessionAdapter);
}

export default function ClientProviderBootstrap() {
  return null;
}