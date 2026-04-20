/**
 * Session Management API
 * POST /api/auth/session - Create session cookie from Firebase ID token
 * DELETE /api/auth/session - Clear session cookie (logout)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createSessionCookie,
  verifyIdToken,
  verifySessionCookie,
} from "@mohasinac/appkit";
import { handleApiError } from "@mohasinac/appkit";
import { ValidationError } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { getOptionalSessionCookie } from "@mohasinac/appkit";
import { sessionRepository, userRepository } from "@mohasinac/appkit";
import { parseUserAgent } from "@mohasinac/appkit";
import { SCHEMA_DEFAULTS } from "@/constants/field-names";
import { serverLogger } from "@mohasinac/appkit";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@mohasinac/appkit";

/**
 * Create session cookie with session tracking
 * Also ensures user profile exists in Firestore (for OAuth users)
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      throw new ValidationError("ID token required");
    }

    // Verify the ID token and get user info
    const decodedToken = await verifyIdToken(idToken);
    if (!decodedToken) {
      throw new ValidationError(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Ensure user profile exists in Firestore (important for OAuth users)
    // This will create a profile if one doesn't exist
    const auth = getAuth(getAdminApp());

    // Check if user profile exists
    const userProfile = await userRepository.findById(decodedToken.uid);

    if (!userProfile) {
      // Create profile for OAuth user (or any user without a profile)
      const authUser = await auth.getUser(decodedToken.uid);
      const role =
        authUser.email === SCHEMA_DEFAULTS.ADMIN_EMAIL
          ? "admin"
          : SCHEMA_DEFAULTS.USER_ROLE;

      await userRepository.createWithId(decodedToken.uid, {
        uid: decodedToken.uid,
        email: authUser.email,
        displayName:
          authUser.displayName ||
          authUser.email?.split("@")[0] ||
          SCHEMA_DEFAULTS.DEFAULT_DISPLAY_NAME,
        photoURL: authUser.photoURL || null,
        emailVerified: authUser.emailVerified,
        role,
      });

      // Sync role to Firebase custom claims so JWT carries correct role on next token refresh
      await auth.setCustomUserClaims(decodedToken.uid, { role });
    } else {
      // Sync existing Firestore role to custom claims (no-op if already correct)
      const currentRole = userProfile.role ?? SCHEMA_DEFAULTS.USER_ROLE;
      await auth.setCustomUserClaims(decodedToken.uid, { role: currentRole });
    }

    // Create session cookie (5 days expiry)
    const sessionCookie = await createSessionCookie(idToken);

    // Parse device info from user agent
    const userAgent =
      request.headers.get("user-agent") || SCHEMA_DEFAULTS.UNKNOWN_USER_AGENT;
    const deviceInfo = parseUserAgent(userAgent);

    // Get IP address (anonymized - last octet removed for privacy)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      SCHEMA_DEFAULTS.UNKNOWN_USER_AGENT;
    const anonymizedIp = ip.split(".").slice(0, 3).join(".") + ".xxx";

    // Store session in Firestore and get the generated session ID
    const session = await sessionRepository.createSession(decodedToken.uid, {
      deviceInfo: {
        ...deviceInfo,
        ip: anonymizedIp,
      },
      // Location data can be added later via IP geolocation service
    });

    // Set the cookie with Firebase session
    const response = NextResponse.json({
      success: true,
      sessionId: session.id, // Return session ID to client for reference
    });

    response.cookies.set("__session", sessionCookie, {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection (changed from 'lax' to 'strict')
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });

    // Store session ID in a separate cookie for client-side tracking
    response.cookies.set("__session_id", session.id, {
      httpOnly: false, // Allow client to read for activity tracking
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

/**
 * Clear session cookie and revoke session (logout)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get("__session_id")?.value;
    const sessionCookie = getOptionalSessionCookie(request);

    // Revoke session in Firestore if we have the ID
    if (sessionId && sessionCookie) {
      try {
        const decodedToken = await verifySessionCookie(sessionCookie);
        if (decodedToken) {
          await sessionRepository.revokeSession(sessionId, decodedToken.uid);
        }
      } catch (e) {
        // Session may be expired, still clear cookies
        serverLogger.debug("Session already expired, clearing cookies");
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear both cookies
    response.cookies.delete("__session");
    response.cookies.delete("__session_id");

    return response;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}


