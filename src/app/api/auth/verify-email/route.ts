/**
 * Verify Email API Route
 * GET /api/auth/verify-email?token=xxxxx
 *
 * Verifies email using Firebase verification token
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@/lib/errors";
import { getSearchParams } from "@/lib/api/request-helpers";
import { serverLogger } from "@/lib/server-logger";

export async function GET(req: NextRequest) {
  try {
    const searchParams = getSearchParams(req);
    const token = searchParams.get("token");

    if (!token) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.TOKEN_REQUIRED);
    }

    const auth = getAdminAuth();

    // Note: Firebase Admin SDK cannot directly verify email verification tokens
    // Email verification is handled client-side by Firebase Auth
    // This endpoint can be used to check verification status after client-side verification

    // In Firebase, email verification flow is:
    // 1. User clicks link in email → Firebase handles verification automatically
    // 2. Client-side calls applyActionCode(auth, code) to apply the verification
    // 3. Then can call this endpoint to confirm/log the verification

    // For now, this is a placeholder that returns success
    // In production, you'd want to:
    // 1. Parse the token to get user info
    // 2. Verify the token with Firebase
    // 3. Mark email as verified in database if needed

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.EMAIL.VERIFIED,
    });
  } catch (error) {
    serverLogger.error("Verify email error", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.EMAIL.VERIFICATION_FAILED,
      },
      { status: error instanceof ValidationError ? 400 : 500 },
    );
  }
}
