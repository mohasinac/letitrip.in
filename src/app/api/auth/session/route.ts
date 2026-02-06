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
} from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { ValidationError } from "@/lib/errors";
import { UI_LABELS } from "@/constants";
import { sessionRepository } from "@/repositories";
import { parseUserAgent } from "@/db/schema/sessions";

/**
 * Create session cookie with session tracking
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      throw new ValidationError(UI_LABELS.AUTH.ID_TOKEN_REQUIRED);
    }

    // Verify the ID token and get user info
    const decodedToken = await verifyIdToken(idToken);
    if (!decodedToken) {
      throw new ValidationError("Invalid ID token");
    }

    // Create session cookie (5 days expiry)
    const sessionCookie = await createSessionCookie(idToken);

    // Parse device info from user agent
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const deviceInfo = parseUserAgent(userAgent);

    // Get IP address (anonymized - last octet removed for privacy)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "Unknown";
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
    const sessionCookie = request.cookies.get("__session")?.value;

    // Revoke session in Firestore if we have the ID
    if (sessionId && sessionCookie) {
      try {
        const decodedToken = await verifySessionCookie(sessionCookie);
        if (decodedToken) {
          await sessionRepository.revokeSession(sessionId, decodedToken.uid);
        }
      } catch (e) {
        // Session may be expired, still clear cookies
        console.debug("Session already expired, clearing cookies");
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
