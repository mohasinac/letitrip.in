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

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = getOptionalSessionCookie(request);
    const sessionId = request.cookies.get("__session_id")?.value;

    // Revoke session in Firestore
    if (sessionId) {
      try {
        await sessionRepository.revokeSession(sessionId, "user");
      } catch (error) {
        serverLogger.error(ERROR_MESSAGES.API.LOGOUT_REVOCATION_ERROR, {
          error,
        });
      }
    }

    // Optionally revoke refresh tokens for extra security
    if (sessionCookie) {
      try {
        const decodedClaims = await verifySessionCookie(sessionCookie);
        if (decodedClaims) {
          const auth = getAuth(getAdminApp());
          await auth.revokeRefreshTokens(decodedClaims.uid);
        }
      } catch (error) {
        // Ignore errors during token revocation
        serverLogger.error(ERROR_MESSAGES.API.LOGOUT_TOKEN_ERROR, { error });
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


