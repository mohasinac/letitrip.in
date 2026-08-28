"use client";

import {
  FirebaseClientAuthProvider,
  FirebaseClientRealtimeProvider,
  registerClientAuthProvider,
  registerClientRealtimeProvider,
  registerClientSessionAdapter,
  reportClientError,
  setErrorTracker,
  type AdapterAuthUser,
  type ErrorTrackerFn,
} from "@mohasinac/appkit/client";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  auth,
  firebaseConfig,
  canInitializeRealtimeDb,
} from "./firebase/config";
import { clientWarn } from "./client-logger";

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

/**
 * Route every `trackError()` call to the client-error beacon.
 *
 * Without this, `getTracker()` falls back to a bare `console.error`, so the
 * digest that `ErrorView` and `GlobalError` both carefully capture off
 * `error.digest` dies in the browser console. One registration activates
 * `ErrorView`, `GlobalError`, `ErrorBoundary` and `HomepageSectionBoundary` —
 * including their `componentStack`, a `serverErrors` schema field that
 * otherwise has no producer at all.
 *
 * 🛑 This lived in `src/app/[locale]/ClientProviderBootstrap.tsx` until
 * 2026-08-28, and NOTHING IMPORTED THAT FILE — a refactor moved the mount to
 * `ClientProviderInitializer` -> this module and left the registration behind.
 * `tsc` cannot see an orphaned module, so CLAUDE.md Root Cause #78 silently
 * regressed and every boundary lost its digest again. It lives here, beside the
 * other registrations in the function the layout actually calls, and
 * `audit-observability-registration.mjs` now fails if it becomes unreachable.
 */
const errorTracker: ErrorTrackerFn = (error, category, severity, context) => {
  const digest =
    typeof context?.metadata?.digest === "string"
      ? context.metadata.digest
      : undefined;
  reportClientError({
    code: `CLIENT_${category.toUpperCase()}_${severity.toUpperCase()}`,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    componentStack:
      typeof context?.metadata?.componentStack === "string"
        ? context.metadata.componentStack
        : undefined,
    // The join key back to the onRequestError row written server-side for the
    // very same failure.
    requestId: digest,
  });
  console.error(`[${severity}][${category}]`, error, context);
};

export function initializeClientProviders() {
  // Registered BEFORE the Firebase guard below. Error tracking has no Firebase
  // dependency, and an install with missing client config is exactly when you
  // most need boundary errors reported rather than dropped.
  setErrorTracker(errorTracker);

  if (!hasFirebaseConfig || !auth) {
    clientWarn("providers", "Firebase config missing, client providers not initialized");
    return;
  }

  // Register Firebase providers with appkit's registry
  registerClientAuthProvider(new FirebaseClientAuthProvider(auth));

  // 🛑 Gated on `databaseURL`, not `apiKey`.
  //
  // `FirebaseClientRealtimeProvider`'s constructor calls `getDatabase()`
  // EAGERLY, which throws `FIREBASE FATAL ERROR: Can't determine Firebase
  // Database URL` when only the database URL is missing. Thrown from here it is
  // synchronous and uncaught, so it also takes down the session-adapter
  // registration below it — a missing optional env var silently breaking auth.
  //
  // `config.ts` grew this exact guard; this file rebuilt the config literal
  // independently and never got it. The literal is now imported from there, so
  // the two cannot diverge again.
  if (canInitializeRealtimeDb) {
    registerClientRealtimeProvider(
      new FirebaseClientRealtimeProvider({
        firebaseConfig,
        appName: "letitrip-realtime",
      }),
    );
  } else {
    clientWarn(
      "providers",
      "NEXT_PUBLIC_FIREBASE_DATABASE_URL missing — realtime provider not registered; live updates are disabled",
    );
  }

  registerClientSessionAdapter({
    onAuthStateChanged(callback: (user: AdapterAuthUser | null) => void) {
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
}
