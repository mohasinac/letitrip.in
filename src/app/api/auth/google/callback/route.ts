/**
 * GET /api/auth/google/callback
 *
 * Step 3 of the Google OAuth popup flow — Google redirects here after consent.
 *
 * Query params:
 *   code   — Authorization code from Google
 *   state  — eventId set in /api/auth/google/start
 *   error  — Set by Google if the user denied consent
 *
 * Flow:
 *   1. Validate state (eventId) format and RTDB existence
 *   2. If Google returned an error (user cancelled), write { status:'error' } to RTDB
 *   3. Exchange authorization code for Google tokens (server-side, secret stays on server)
 *   4. Verify Google ID token → extract uid/email/name/photo
 *   5. Find or create Firebase Auth user linked to this Google account
 *   6. Exchange Firebase custom token → Firebase ID token → __session cookie
 *   7. Create session record in Firestore
 *   8. Write { status:'success' } to RTDB (main window hook fires)
 *   9. Delete the RTDB event node (best-effort — cleanup function handles stragglers)
 *  10. Redirect popup to /auth/close (window.close())
 *
 * Security:
 *   - No secrets cross the client.  Code exchange happens server-side.
 *   - Google ID token is verified by google-auth-library, not trusted blindly.
 *   - Firebase session cookie is HttpOnly + Secure + SameSite=Strict.
 *   - RTDB node is deleted after use (one-shot signal).
 */

import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { getAdminAuth, getAdminRealtimeDb } from "@/lib/firebase/admin";
import { createSessionCookie } from "@/lib/firebase/auth-server";
import { sessionRepository, userRepository } from "@/repositories";
import {
  parseUserAgent,
  SCHEMA_DEFAULTS,
  DEFAULT_USER_DATA,
} from "@/db/schema";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { UserRole } from "@/types/auth";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Write event outcome to RTDB and redirect popup to close page. */
async function writeOutcomeAndClose(
  eventId: string,
  outcome: { status: "success" | "error"; error?: string },
  origin: string,
): Promise<NextResponse> {
  try {
    const db = getAdminRealtimeDb();
    await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).update(outcome);
    // Best-effort self-delete after a short grace period so the client can read the outcome.
    // Cleanup function handles nodes that survive longer.
    setTimeout(async () => {
      try {
        await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).remove();
      } catch {
        // Non-fatal — cleanup function will handle it
      }
    }, 10_000);
  } catch (writeErr) {
    serverLogger.error("Failed to write auth event outcome to RTDB", {
      eventId,
      outcome,
      writeErr,
    });
  }

  const closeUrl = new URL(
    `/auth/close${outcome.status === "error" ? `?error=${encodeURIComponent(outcome.error ?? "auth_failed")}` : ""}`,
    origin,
  );
  return NextResponse.redirect(closeUrl.toString());
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const { searchParams } = request.nextUrl;
    const state = searchParams.get("state") ?? "";
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    // Validate state format — always perform this check first
    if (!UUID_REGEX.test(state)) {
      serverLogger.warn("Google callback: invalid state param");
      return NextResponse.redirect(
        new URL("/auth/close?error=invalid_state", origin),
      );
    }

    const eventId = state;

    // Verify the event node still exists + is pending (replays are rejected)
    const db = getAdminRealtimeDb();
    const snap = await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).get();
    if (!snap.exists() || snap.val()?.status !== "pending") {
      serverLogger.warn("Google callback: event not found or not pending", {
        eventId,
      });
      return NextResponse.redirect(
        new URL("/auth/close?error=event_expired", origin),
      );
    }

    // User cancelled or Google returned an error
    if (oauthError || !code) {
      serverLogger.info("Google callback: user cancelled or OAuth error", {
        eventId,
        oauthError,
      });
      return writeOutcomeAndClose(
        eventId,
        { status: "error", error: ERROR_MESSAGES.AUTH.SIGN_IN_CANCELLED },
        origin,
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      serverLogger.error("Google OAuth env vars not configured");
      return writeOutcomeAndClose(
        eventId,
        { status: "error", error: "Authentication service is not configured." },
        origin,
      );
    }

    // Step 1: Exchange authorization code for Google tokens (server-side)
    const oauthClient = new OAuth2Client(clientId, clientSecret, redirectUri);
    let ticket;
    try {
      const { tokens } = await oauthClient.getToken(code);
      oauthClient.setCredentials(tokens);
      // Verify the ID token — this is the authoritative identity proof
      ticket = await oauthClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: clientId,
      });
    } catch (exchangeErr) {
      serverLogger.error("Google token exchange/verification failed", {
        eventId,
        exchangeErr,
      });
      return writeOutcomeAndClose(
        eventId,
        {
          status: "error",
          error: ERROR_MESSAGES.AUTH.OAUTH_CODE_EXCHANGE_FAILED,
        },
        origin,
      );
    }

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return writeOutcomeAndClose(
        eventId,
        { status: "error", error: ERROR_MESSAGES.AUTH.OAUTH_USER_INFO_FAILED },
        origin,
      );
    }

    const { sub: googleUid, email, name, picture, email_verified } = payload;

    // Step 2: Find or create the Firebase Auth user
    const adminAuth = getAdminAuth();
    let firebaseUid: string;
    try {
      // Try to find by Google provider UID first
      const existingUser = await adminAuth.getUserByEmail(email);
      firebaseUid = existingUser.uid;

      // Sync profile fields from Google if they've changed (photo, display name)
      await adminAuth.updateUser(firebaseUid, {
        displayName: existingUser.displayName || name,
        photoURL: existingUser.photoURL || picture,
        emailVerified: existingUser.emailVerified || !!email_verified,
      });
    } catch (lookupErr: any) {
      if (lookupErr.code !== "auth/user-not-found") {
        throw lookupErr;
      }
      // New user — create Firebase Auth account
      const newUser = await adminAuth.createUser({
        email,
        displayName: name ?? email.split("@")[0],
        photoURL: picture ?? undefined,
        emailVerified: !!email_verified,
        disabled: false,
      });
      firebaseUid = newUser.uid;
    }

    // Step 3: Ensure Firestore profile exists
    const existingProfile = await userRepository.findById(firebaseUid);
    if (!existingProfile) {
      const role: UserRole =
        email === SCHEMA_DEFAULTS.ADMIN_EMAIL
          ? "admin"
          : SCHEMA_DEFAULTS.USER_ROLE;
      await userRepository.createWithId(firebaseUid, {
        ...DEFAULT_USER_DATA,
        uid: firebaseUid,
        email,
        displayName:
          name ?? email.split("@")[0] ?? SCHEMA_DEFAULTS.DEFAULT_DISPLAY_NAME,
        photoURL: picture ?? null,
        emailVerified: !!email_verified,
        role,
      });
    }

    // Step 4: custom token → Firebase ID token → session cookie
    // (createSessionCookie requires a Firebase ID token, not a custom token)
    const apiKey =
      process.env.FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return writeOutcomeAndClose(
        eventId,
        {
          status: "error",
          error: "Authentication service configuration error.",
        },
        origin,
      );
    }
    const customToken = await adminAuth.createCustomToken(firebaseUid);
    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      },
    );
    const signInData = await signInRes.json();
    if (!signInData.idToken) {
      return writeOutcomeAndClose(
        eventId,
        { status: "error", error: ERROR_MESSAGES.AUTH.TOKEN_EXCHANGE_FAILED },
        origin,
      );
    }

    const sessionCookie = await createSessionCookie(signInData.idToken);

    // Step 5: Create session record in Firestore
    const session = await sessionRepository.createSession(firebaseUid, {
      deviceInfo: parseUserAgent(
        request.headers.get("user-agent") ?? SCHEMA_DEFAULTS.UNKNOWN_USER_AGENT,
      ),
    });

    // Step 6: Signal success to the main window via RTDB
    await writeOutcomeAndClose(eventId, { status: "success" }, origin);

    // Build the close-page redirect response and attach the session cookies
    const closeUrl = `${origin}/auth/close`;
    const response = NextResponse.redirect(closeUrl);

    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });
    response.cookies.set("__session_id", session.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });

    serverLogger.info("Google OAuth session created", {
      uid: firebaseUid,
      eventId,
    });
    return response;
  } catch (error) {
    serverLogger.error("GET /api/auth/google/callback unexpected error", {
      error,
    });
    // Attempt a best-effort RTDB error signal — state may not have been validated yet
    const state = request.nextUrl.searchParams.get("state");
    if (state && UUID_REGEX.test(state)) {
      try {
        const db = getAdminRealtimeDb();
        await db
          .ref(`${RTDB_PATHS.AUTH_EVENTS}/${state}`)
          .update({
            status: "error",
            error: ERROR_MESSAGES.AUTH.SIGN_IN_FAILED,
          });
      } catch {
        // ignore secondary failure
      }
    }
    return NextResponse.redirect(
      new URL("/auth/close?error=unexpected", origin),
    );
  }
}
