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
  reportClientError,
  setErrorTracker,
  type ErrorTrackerFn,
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

/**
 * Route every `trackError()` call to the client-error beacon.
 *
 * Without this, `getTracker()` falls back to a bare `console.error`, so the
 * digest that `ErrorView` and `GlobalError` both carefully capture off
 * `error.digest` died in the browser console. That is precisely why the
 * 2026-08-26 homepage RSC crash surfaced only as an opaque React #441 with no
 * server-side trace. One registration activates ErrorView, GlobalError, and
 * both ErrorBoundary components — including their `componentStack`, a
 * `serverErrors` schema field that previously had no producer at all.
 */
const errorTracker: ErrorTrackerFn = (error, category, severity, context) => {
  const digest = typeof context?.metadata?.digest === "string" ? context.metadata.digest : undefined;
  reportClientError({
    code: `CLIENT_${category.toUpperCase()}_${severity.toUpperCase()}`,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    componentStack:
      typeof context?.metadata?.componentStack === "string"
        ? context.metadata.componentStack
        : undefined,
    // The digest is the join key back to the onRequestError row written
    // server-side for the very same failure.
    requestId: digest,
  });
  // Keep the console line — it is what a developer sees first in devtools.
  console.error(`[${severity}][${category}]`, error, context);
};

setErrorTracker(errorTracker);

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
  async sendEmailVerification() {
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
  async reauthenticateOnly() {
    throw new Error("Firebase client config is missing. Password change is unavailable.");
  },
  async reauthenticateAndSendEmailUpdateVerification() {
    throw new Error("Firebase client config is missing. Email change is unavailable.");
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
  registerClientAuthProvider(new FirebaseClientAuthProvider(auth));
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