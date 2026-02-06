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
import { adminApp } from "@/lib/firebase/admin";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { SUCCESS_MESSAGES } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value;

    // Optionally revoke refresh tokens for extra security
    if (sessionCookie) {
      try {
        const decodedClaims = await verifySessionCookie(sessionCookie);
        if (decodedClaims) {
          const auth = getAuth(adminApp);
          await auth.revokeRefreshTokens(decodedClaims.uid);
        }
      } catch (error) {
        // Ignore errors during token revocation
        console.error("Token revocation error:", error);
      }
    }

    // Clear session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.AUTH.LOGOUT_SUCCESS,
      },
      { status: 200 },
    );

    response.cookies.delete("__session");

    return response;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
