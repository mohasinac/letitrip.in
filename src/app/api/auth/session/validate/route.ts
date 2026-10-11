import { normalizeError } from "@mohasinac/appkit/errors/normalize";
/**
 * Session Validation API
 * GET /api/auth/session/validate - Validate current session
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@mohasinac/appkit/errors/error-handler";
import { verifySessionCookie } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { sessionRepository } from "@mohasinac/appkit/features/auth/repository/session.repository";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { getOptionalSessionCookie } from "@mohasinac/appkit/next/request-helpers";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
    if (!rl.success) {
      return NextResponse.json({ valid: false, reason: "Too many requests" }, { status: 429 });
    }
    // Get session cookie
    const sessionCookie = getOptionalSessionCookie(request);
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
    void normalizeError(error);
    return handleApiError(error);
  }
}

