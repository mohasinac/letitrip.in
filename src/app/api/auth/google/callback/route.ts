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
import { getAdminAuth, getAdminRealtimeDb } from "@mohasinac/appkit";
import { createSessionCookie } from "@mohasinac/appkit";
import { sessionRepository, userRepository } from "@mohasinac/appkit";
import { parseUserAgent } from "@mohasinac/appkit";
import { SCHEMA_DEFAULTS } from "@/constants";
import { DEFAULT_USER_DATA } from "@mohasinac/appkit";
import { RTDB_PATHS } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";

import type { UserRole } from "@mohasinac/appkit";
import { RTDBPayloadStatus } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AuthEventSuccessPayload {
  status: "success";
  isNewUser: boolean;
  uid: string;
  role: string;
}

export type AuthEventOutcome =
  | AuthEventSuccessPayload
  | { status: "error"; error?: string };

/** Auth event cleanup is best-effort. `auth/user-not-found` is the normal
 * case (the synthetic auth user was never claimed); any other failure is
 * worth a warning so the cleanupRtdbEvents job can be cross-checked. */
function logAuthCleanupRejection(eventId: string, reason: unknown): void {
  const code = (reason as { code?: string } | null)?.code;
  if (code === "auth/user-not-found") return;
  serverLogger.warn("Synthetic auth user cleanup failed (non-fatal)", {
    eventId,
    err: reason,
  });
}

/** Write event outcome to RTDB and redirect popup to close page. */
async function writeOutcomeAndClose(
  eventId: string,
  outcome: AuthEventOutcome,
  origin: string,
): Promise<NextResponse> {
  try {
    const db = getAdminRealtimeDb();
    await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).update(outcome);
    // Self-delete after a short grace period so the client can read the outcome.
    // The scheduled cleanupRtdbEvents function handles nodes that survive longer.
    // Failures are logged but never thrown — both deletions are idempotent
    // (delete on a missing node is a no-op).
    setTimeout(() => {
      void Promise.allSettled([
        db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).remove(),
        getAdminAuth().deleteUser(`auth_event_${eventId}`),
      ]).then(([rtdbResult, authResult]) => {
        if (rtdbResult.status === "rejected") {
          serverLogger.warn(
            "Auth-event RTDB cleanup failed (non-fatal — cleanupRtdbEvents will retry)",
            { eventId, err: rtdbResult.reason },
          );
        }
        if (authResult.status === "rejected") {
          logAuthCleanupRejection(eventId, authResult.reason);
        }
      });
    }, 10_000);
  } catch (writeErr) {
    serverLogger.error("Failed to write auth event outcome to RTDB", {
      eventId,
      outcome,
      writeErr,
    });
  }

  const closeUrl = new URL(
    `/auth/close${outcome.status === RTDBPayloadStatus.ERROR ? `?error=${encodeURIComponent(outcome.error ?? "auth_failed")}` : ""}`,
    origin,
  );
  return NextResponse.redirect(closeUrl.toString());
}

/** Validate state param and RTDB event node. Returns eventId or redirects. */
async function validateStateAndEvent(
  state: string,
  origin: string,
): Promise<{ eventId: string } | NextResponse> {
  if (!UUID_REGEX.test(state)) {
    serverLogger.warn("Google callback: invalid state param");
    return NextResponse.redirect(new URL("/auth/close?error=invalid_state", origin));
  }
  const eventId = state;
  const db = getAdminRealtimeDb();
  try {
    const snap = await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).get();
    if (!snap.exists() || snap.val()?.status !== RTDBPayloadStatus.PENDING) {
      serverLogger.warn("Google callback: event not found or not pending", { eventId });
      return NextResponse.redirect(new URL("/auth/close?error=event_expired", origin));
    }
  } catch (rtdbReadErr) {
    serverLogger.warn(
      "Google callback: RTDB unavailable — skipping anti-replay check, proceeding with OAuth state validation only",
      { eventId, rtdbReadErr },
    );
  }
  return { eventId };
}

/** Exchange auth code for a verified Google ID-token payload. */
async function exchangeGoogleCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  eventId: string,
  origin: string,
) {
  const oauthClient = new OAuth2Client(clientId, clientSecret, redirectUri);
  try {
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);
    const ticket = await oauthClient.verifyIdToken({ idToken: tokens.id_token!, audience: clientId });
    return { ticket };
  } catch (exchangeErr) {
    serverLogger.error("Google token exchange/verification failed", { eventId, exchangeErr });
    return {
      redirect: await writeOutcomeAndClose(
        eventId,
        { status: RTDBPayloadStatus.ERROR, error: ERROR_MESSAGES.AUTH.OAUTH_CODE_EXCHANGE_FAILED },
        origin,
      ),
    };
  }
}

/** Find or create Firebase Auth user for the Google account. */
async function resolveFirebaseUser(
  email: string,
  name: string | undefined,
  picture: string | undefined,
  email_verified: boolean | undefined,
): Promise<{ firebaseUid: string; isNewUser: boolean }> {
  const adminAuth = getAdminAuth();
  try {
    const existingUser = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(existingUser.uid, {
      displayName: existingUser.displayName || name,
      photoURL: existingUser.photoURL || picture,
      emailVerified: existingUser.emailVerified || !!email_verified,
    });
    return { firebaseUid: existingUser.uid, isNewUser: false };
  } catch (lookupErr: any) {
    if (lookupErr.code !== "auth/user-not-found") throw lookupErr;
    const newUser = await adminAuth.createUser({
      email,
      displayName: name ?? email.split("@")[0],
      photoURL: picture ?? undefined,
      emailVerified: !!email_verified,
      disabled: false,
    });
    return { firebaseUid: newUser.uid, isNewUser: true };
  }
}

/** Ensure Firestore profile exists; returns the resolved role. */
async function ensureFirestoreProfile(
  firebaseUid: string,
  email: string,
  name: string | undefined,
  picture: string | undefined,
  email_verified: boolean | undefined,
  isNewUser: boolean,
): Promise<{ userRole: UserRole; isNewUser: boolean }> {
  let userRole: UserRole = SCHEMA_DEFAULTS.USER_ROLE;
  const existingProfile = await userRepository.findById(firebaseUid);
  if (!existingProfile) {
    userRole = email === SCHEMA_DEFAULTS.ADMIN_EMAIL ? "admin" : SCHEMA_DEFAULTS.USER_ROLE;
    await userRepository.createWithId(firebaseUid, {
      ...DEFAULT_USER_DATA,
      uid: firebaseUid,
      email,
      displayName: name ?? email.split("@")[0] ?? SCHEMA_DEFAULTS.DEFAULT_DISPLAY_NAME,
      photoURL: picture ?? null,
      emailVerified: !!email_verified,
      role: userRole,
    });
    return { userRole, isNewUser: true };
  }
  return { userRole: (existingProfile.role as UserRole) ?? SCHEMA_DEFAULTS.USER_ROLE, isNewUser };
}

/** Exchange custom token for Firebase ID token via Identity Toolkit. */
async function exchangeCustomToken(
  adminAuth: ReturnType<typeof getAdminAuth>,
  firebaseUid: string,
  userRole: UserRole,
  apiKey: string,
  eventId: string,
  origin: string,
): Promise<{ idToken: string } | { redirect: NextResponse }> {
  const customToken = await adminAuth.createCustomToken(firebaseUid, { role: userRole });
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
    return {
      redirect: await writeOutcomeAndClose(
        eventId,
        { status: RTDBPayloadStatus.ERROR, error: ERROR_MESSAGES.AUTH.TOKEN_EXCHANGE_FAILED },
        origin,
      ),
    };
  }
  return { idToken: signInData.idToken };
}

/** Build the final close-page response with session cookies set. */
function buildSessionResponse(
  origin: string,
  sessionCookie: string,
  sessionId: string,
  firebaseUid: string,
  userRole: UserRole,
  isNewUser: boolean,
): NextResponse {
  const closeParams = new URLSearchParams({
    uid: firebaseUid,
    role: userRole,
    isNew: isNewUser ? "1" : "0",
  });
  const closeUrl = `${origin}/auth/close?${closeParams.toString()}`;
  const response = NextResponse.redirect(closeUrl);
  response.cookies.set("__session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 5,
    path: "/",
  });
  response.cookies.set("__session_id", sessionId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 5,
    path: "/",
  });
  return response;
}

// rbac-public: authentication endpoint — applyRateLimit enforced by audit-auth-rate-limit
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const rl = await applyRateLimit(request, RateLimitPresets.OAUTH);
    if (!rl.success) {
      return NextResponse.redirect(new URL(`/auth/close?error=rate_limited`, origin));
    }
    const { searchParams } = request.nextUrl;
    const state = searchParams.get("state") ?? "";
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    const stateResult = await validateStateAndEvent(state, origin);
    if (stateResult instanceof NextResponse) return stateResult;
    const { eventId } = stateResult;

    if (oauthError || !code) {
      serverLogger.info("Google callback: user cancelled or OAuth error", { eventId, oauthError });
      return writeOutcomeAndClose(
        eventId,
        { status: RTDBPayloadStatus.ERROR, error: ERROR_MESSAGES.AUTH.SIGN_IN_CANCELLED },
        origin,
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      serverLogger.error("Google OAuth env vars not configured");
      return writeOutcomeAndClose(
        eventId,
        { status: RTDBPayloadStatus.ERROR, error: "Authentication service is not configured." },
        origin,
      );
    }

    const exchangeResult = await exchangeGoogleCode(code, clientId, clientSecret, redirectUri, eventId, origin);
    if ("redirect" in exchangeResult) return exchangeResult.redirect;
    const googlePayload = exchangeResult.ticket.getPayload();
    if (!googlePayload?.email) {
      return writeOutcomeAndClose(
        eventId,
        { status: RTDBPayloadStatus.ERROR, error: ERROR_MESSAGES.AUTH.OAUTH_USER_INFO_FAILED },
        origin,
      );
    }

    const { email, name, picture, email_verified } = googlePayload;

    const { firebaseUid, isNewUser: newFromAuth } = await resolveFirebaseUser(email, name, picture, email_verified);
    const { userRole, isNewUser } = await ensureFirestoreProfile(
      firebaseUid, email, name, picture, email_verified, newFromAuth,
    );

    const apiKey = process.env.FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return writeOutcomeAndClose(
        eventId,
        { status: RTDBPayloadStatus.ERROR, error: "Authentication service configuration error." },
        origin,
      );
    }

    const adminAuth = getAdminAuth();
    const tokenResult = await exchangeCustomToken(adminAuth, firebaseUid, userRole, apiKey, eventId, origin);
    if ("redirect" in tokenResult) return tokenResult.redirect;

    const sessionCookie = await createSessionCookie(tokenResult.idToken);
    const session = await sessionRepository.createSession(firebaseUid, {
      deviceInfo: parseUserAgent(
        request.headers.get("user-agent") ?? SCHEMA_DEFAULTS.UNKNOWN_USER_AGENT,
      ),
    });

    await writeOutcomeAndClose(
      eventId,
      { status: RTDBPayloadStatus.SUCCESS, isNewUser, uid: firebaseUid, role: userRole },
      origin,
    );

    serverLogger.info("Google OAuth session created", { uid: firebaseUid, eventId });
    return buildSessionResponse(origin, sessionCookie, session.id, firebaseUid, userRole, isNewUser);
  } catch (error) {
    serverLogger.error("GET /api/auth/google/callback unexpected error", { error });
    const state = request.nextUrl.searchParams.get("state");
    if (state && UUID_REGEX.test(state)) {
      try {
        const db = getAdminRealtimeDb();
        await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${state}`).update({
          status: RTDBPayloadStatus.ERROR,
          error: ERROR_MESSAGES.AUTH.SIGN_IN_FAILED,
        });
      } catch {
        // ignore secondary failure
      }
    }
    return NextResponse.redirect(new URL("/auth/close?error=unexpected", origin));
  }
}


