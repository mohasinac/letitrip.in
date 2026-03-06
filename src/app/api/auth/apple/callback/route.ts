/**
 * POST /api/auth/apple/callback
 *
 * Step 3 of the Apple Sign In popup flow.
 * Apple uses response_mode=form_post, so this MUST be a POST handler.
 * Apple submits a form to this URL with content-type application/x-www-form-urlencoded.
 *
 * Form fields:
 *   code        — Authorization code
 *   id_token    — Apple-signed JWT (contains sub, email, email_verified)
 *   state       — eventId from /api/auth/apple/start
 *   user        — JSON string with { name: { firstName, lastName } } — ONLY on first sign-in
 *   error       — Set by Apple if the user denied consent
 *
 * Required env vars (server-only):
 *   APPLE_CLIENT_ID   — Service ID (e.g. in.letitrip.app.web)
 *   APPLE_TEAM_ID     — 10-char team ID from Apple Developer account
 *   APPLE_KEY_ID      — Key ID of the Sign in with Apple private key
 *   APPLE_PRIVATE_KEY — Contents of the .p8 private key (newlines as \n)
 *
 * Flow mirrors Google callback: verify identity → find/create user → session cookie → RTDB signal.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import * as jose from "jose";
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
import { ERROR_MESSAGES } from "@/constants";
import type { UserRole } from "@/types/auth";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Write event outcome to RTDB (best-effort). */
async function writeOutcome(
  eventId: string,
  outcome: { status: "success" | "error"; error?: string },
): Promise<void> {
  try {
    const db = getAdminRealtimeDb();
    await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).update(outcome);
    setTimeout(async () => {
      try {
        await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).remove();
      } catch {
        // Cleanup function handles stragglers
      }
    }, 10_000);
  } catch (err) {
    serverLogger.error("Failed to write Apple auth event outcome", {
      eventId,
      outcome,
      err,
    });
  }
}

/**
 * Build an Apple client_secret JWT required for token exchange.
 * Apple uses ES256 (ECDSA P-256) with the .p8 private key.
 */
async function buildAppleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID!;
  const clientId = process.env.APPLE_CLIENT_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  // .p8 file contents stored in env — newlines encoded as literal \n
  const privateKeyPem = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const privateKey = await jose.importPKCS8(privateKeyPem, "ES256");

  return new jose.SignJWT({
    iss: teamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 180, // 3-minute lifetime — only used for one exchange
    aud: "https://appleid.apple.com",
    sub: clientId,
  })
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .sign(privateKey);
}

/**
 * Verify Apple's id_token and return the payload.
 * Apple publishes its public keys at https://appleid.apple.com/auth/keys (JWKS).
 */
async function verifyAppleIdToken(
  idToken: string,
  clientId: string,
): Promise<jose.JWTPayload> {
  const JWKS = jose.createRemoteJWKSet(
    new URL("https://appleid.apple.com/auth/keys"),
  );
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: "https://appleid.apple.com",
    audience: clientId,
  });
  return payload;
}

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    // Apple sends form data, not JSON
    const formData = await request.formData();
    const state = formData.get("state")?.toString() ?? "";
    const code = formData.get("code")?.toString();
    const idToken = formData.get("id_token")?.toString();
    const userJson = formData.get("user")?.toString(); // only present on first sign-in
    const appleError = formData.get("error")?.toString();

    // Validate state format
    if (!UUID_REGEX.test(state)) {
      serverLogger.warn("Apple callback: invalid state param");
      return NextResponse.redirect(
        new URL("/auth/close?error=invalid_state", origin),
      );
    }

    const eventId = state;

    // Verify event node
    const db = getAdminRealtimeDb();
    const snap = await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).get();
    if (!snap.exists() || snap.val()?.status !== "pending") {
      serverLogger.warn("Apple callback: event not found or not pending", {
        eventId,
      });
      return NextResponse.redirect(
        new URL("/auth/close?error=event_expired", origin),
      );
    }

    // User cancelled
    if (appleError || !code || !idToken) {
      serverLogger.info("Apple callback: user cancelled or missing params", {
        eventId,
        appleError,
      });
      await writeOutcome(eventId, {
        status: "error",
        error: ERROR_MESSAGES.AUTH.SIGN_IN_CANCELLED,
      });
      return NextResponse.redirect(new URL("/auth/close", origin));
    }

    const clientId = process.env.APPLE_CLIENT_ID;
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    const privateKey = process.env.APPLE_PRIVATE_KEY;

    if (!clientId || !teamId || !keyId || !privateKey) {
      serverLogger.error("Apple OAuth env vars not fully configured");
      await writeOutcome(eventId, {
        status: "error",
        error: "Authentication service is not configured.",
      });
      return NextResponse.redirect(new URL("/auth/close", origin));
    }

    // Step 1: Verify Apple id_token to get authoritative user identity
    let applePayload: jose.JWTPayload;
    try {
      applePayload = await verifyAppleIdToken(idToken, clientId);
    } catch (verifyErr) {
      serverLogger.error("Apple id_token verification failed", {
        eventId,
        verifyErr,
      });
      await writeOutcome(eventId, {
        status: "error",
        error: ERROR_MESSAGES.AUTH.APPLE_TOKEN_INVALID,
      });
      return NextResponse.redirect(new URL("/auth/close", origin));
    }

    const appleUserId = applePayload.sub as string;
    const email = applePayload.email as string | undefined;
    const emailVerified =
      applePayload.email_verified === true ||
      applePayload.email_verified === "true";

    // Attempt to parse name from first-sign-in JSON (Apple only sends it once)
    let displayName: string | undefined;
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson) as {
          name?: { firstName?: string; lastName?: string };
        };
        const { firstName = "", lastName = "" } = parsedUser.name ?? {};
        displayName =
          [firstName, lastName].filter(Boolean).join(" ") || undefined;
      } catch {
        // malformed user JSON — treat as absent
      }
    }

    if (!email) {
      serverLogger.error(
        "Apple id_token missing email — private relay not set up",
        { eventId },
      );
      await writeOutcome(eventId, {
        status: "error",
        error: ERROR_MESSAGES.AUTH.OAUTH_USER_INFO_FAILED,
      });
      return NextResponse.redirect(new URL("/auth/close", origin));
    }

    // Step 2: Find or create Firebase Auth user
    const adminAuth = getAdminAuth();
    let firebaseUid: string;
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      firebaseUid = existingUser.uid;
      if (displayName && !existingUser.displayName) {
        await adminAuth.updateUser(firebaseUid, { displayName });
      }
    } catch (lookupErr: any) {
      if (lookupErr.code !== "auth/user-not-found") throw lookupErr;
      const newUser = await adminAuth.createUser({
        email,
        displayName: displayName ?? email.split("@")[0],
        emailVerified,
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
          displayName ??
          email.split("@")[0] ??
          SCHEMA_DEFAULTS.DEFAULT_DISPLAY_NAME,
        photoURL: null,
        emailVerified,
        role,
      });
    }

    // Step 4: custom token → Firebase ID token → session cookie
    const apiKey =
      process.env.FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      await writeOutcome(eventId, {
        status: "error",
        error: "Authentication service configuration error.",
      });
      return NextResponse.redirect(new URL("/auth/close", origin));
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
      await writeOutcome(eventId, {
        status: "error",
        error: ERROR_MESSAGES.AUTH.TOKEN_EXCHANGE_FAILED,
      });
      return NextResponse.redirect(new URL("/auth/close", origin));
    }

    const sessionCookie = await createSessionCookie(signInData.idToken);

    // Step 5: Create session record in Firestore
    const session = await sessionRepository.createSession(firebaseUid, {
      deviceInfo: parseUserAgent(
        request.headers.get("user-agent") ?? SCHEMA_DEFAULTS.UNKNOWN_USER_AGENT,
      ),
    });

    // Step 6: Signal success via RTDB and close popup
    await writeOutcome(eventId, { status: "success" });

    const response = NextResponse.redirect(new URL("/auth/close", origin));
    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });
    response.cookies.set("__session_id", session.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 5,
      path: "/",
    });

    serverLogger.info("Apple Sign In session created", {
      uid: firebaseUid,
      eventId,
    });
    return response;
  } catch (error) {
    serverLogger.error("POST /api/auth/apple/callback unexpected error", {
      error,
    });
    const state = (await request.formData().catch(() => null))
      ?.get("state")
      ?.toString();
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
        // ignore
      }
    }
    return NextResponse.redirect(
      new URL("/auth/close?error=unexpected", origin),
    );
  }
}
