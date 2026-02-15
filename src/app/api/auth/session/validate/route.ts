/**
 * Session Validation API
 * GET /api/auth/session/validate - Validate current session
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { sessionRepository, userRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get("__session")?.value;
    const sessionId = request.cookies.get("__session_id")?.value;

    if (!sessionCookie || !sessionId) {
      return NextResponse.json({
        valid: false,
        reason: ERROR_MESSAGES.SESSION.NOT_FOUND,
      });
    }

    // Verify the session cookie with Firebase Admin
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      return NextResponse.json({
        valid: false,
        reason: ERROR_MESSAGES.SESSION.INVALID_COOKIE,
      });
    }

    // Check if session exists and is active in Firestore
    const session = await sessionRepository.findActiveSession(sessionId);
    if (!session) {
      return NextResponse.json({
        valid: false,
        reason: ERROR_MESSAGES.SESSION.REVOKED_OR_EXPIRED,
      });
    }

    // Get user data
    const user = await userRepository.findById(decodedToken.uid);
    if (!user || user.disabled) {
      return NextResponse.json({
        valid: false,
        reason: ERROR_MESSAGES.SESSION.USER_NOT_FOUND_OR_DISABLED,
      });
    }

    // Update session activity
    await sessionRepository.updateActivity(sessionId);

    return NextResponse.json({
      valid: true,
      sessionId,
      userId: decodedToken.uid,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
