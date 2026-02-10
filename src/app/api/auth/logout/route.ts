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
import { getAdminApp } from "@/lib/firebase/admin";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value;
    const sessionId = request.cookies.get("__session_id")?.value;

    // Revoke session in Firestore
    if (sessionId) {
      try {
        await sessionRepository.revokeSession(sessionId, "user");
      } catch (error) {
        serverLogger.error("Session revocation error", { error });
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
        serverLogger.error("Token revocation error", { error });
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
