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
import { getAdminApp } from "@mohasinac/appkit";
import { verifySessionCookie } from "@mohasinac/appkit";
import { sessionRepository } from "@mohasinac/appkit";
import { handleApiError } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { getOptionalSessionCookie } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit";

// rbac-public: authentication endpoint — applyRateLimit enforced by audit-auth-rate-limit
export async function POST(request: NextRequest) {
  try {
    const rl = await applyRateLimit(request, RateLimitPresets.AUTH);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }
    const sessionCookie = getOptionalSessionCookie(request);
    const sessionId = request.cookies.get("__session_id")?.value;

    // Verify session cookie first — needed for both revocation and token revocation
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
        serverLogger.error(ERROR_MESSAGES.API.LOGOUT_TOKEN_ERROR, { error });
      }
    }

    // Revoke session in Firestore using the actual user UID
    if (sessionId && decodedUid) {
      try {
        await sessionRepository.revokeSession(sessionId, decodedUid);
      } catch (error) {
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
    return handleApiError(error);
  }
}


