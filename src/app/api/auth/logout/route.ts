import { normalizeError } from "@mohasinac/appkit/errors/normalize";
/**
 * API Route: Logout (Backend-Only)
 * POST /api/auth/logout
 *
 * Secure logout flow:
 * 1. Clear session cookie
 * 2. Optionally revoke refresh tokens (for extra security)
 *
 * Security: Session invalidation happens server-side
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@mohasinac/appkit/providers/db-firebase/admin";
import { verifySessionCookie } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { sessionRepository } from "@mohasinac/appkit/features/auth/repository/session.repository";
import { handleApiError } from "@mohasinac/appkit/errors/error-handler";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { getOptionalSessionCookie } from "@mohasinac/appkit/next/request-helpers";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }
    const sessionCookie = getOptionalSessionCookie(request);
    const sessionId = request.cookies.get("__session_id")?.value;

    // Verify session cookie first â€” needed for both revocation and token revocation
    let decodedUid: string | null = null;
    if (sessionCookie) {
      try {
        const decodedClaims = await verifySessionCookie(sessionCookie);
        if (decodedClaims) {
          decodedUid = decodedClaims.uid;
          const auth = getAuth(getAdminApp());
          await auth.revokeRefreshTokens(decodedClaims.uid);
        }
      } catch (error) {
        void normalizeError(error);
        serverLogger.error(ERROR_MESSAGES.API.LOGOUT_TOKEN_ERROR, { error });
      }
    }

    // Revoke session in Firestore using the actual user UID
    if (sessionId && decodedUid) {
      try {
        await sessionRepository.revokeSession(sessionId, decodedUid);
      } catch (error) {
        void normalizeError(error);
        serverLogger.error(ERROR_MESSAGES.API.LOGOUT_REVOCATION_ERROR, {
          error,
        });
      }
    }

    // Clear session cookies
    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.AUTH.LOGOUT_SUCCESS,
      },
      { status: 200 },
    );

    response.cookies.delete("__session");
    response.cookies.delete("__session_id");

    return response;
  } catch (error: unknown) {
    void normalizeError(error);
    return handleApiError(error);
  }
}

