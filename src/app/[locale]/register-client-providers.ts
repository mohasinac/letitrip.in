"use client";

import { useEffect } from "react";
import {
  FirebaseClientAuthProvider,
  FirebaseClientRealtimeProvider,
} from "@mohasinac/appkit/client";
import {
  registerClientAuthProvider,
  registerClientRealtimeProvider,
  registerClientSessionAdapter,
} from "@mohasinac/appkit/client";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { AdapterAuthUser } from "@mohasinac/appkit/client";

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

let registered = false;

export default function ClientProviderBootstrap() {
  useEffect(() => {
    // Only register once per page load
    if (registered || !hasFirebaseConfig || !auth) return;
    registered = true;

    registerClientAuthProvider(new FirebaseClientAuthProvider());
    registerClientRealtimeProvider(
      new FirebaseClientRealtimeProvider({
        firebaseConfig,
        appName: "letitrip-realtime",
      }),
    );

    registerClientSessionAdapter({
      onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, (user) =>
          callback(user ? toAdapterUser(user) : null),
        );
      },
      getCurrentUser() {
        const user = auth.currentUser;
        return user ? toAdapterUser(user) : null;
      },
      async signOut() {
        await auth.signOut();
      },
    });
  }, []);

  return null;
}
