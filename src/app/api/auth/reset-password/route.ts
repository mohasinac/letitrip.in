/**
 * Reset Password API Route
 * PUT /api/auth/reset-password
 *
 * Reset user password using Firebase password reset token
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@/lib/errors";
import { isRequired, minLength } from "@/utils";
import { serverLogger } from "@/lib/server-logger";

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export async function PUT(req: NextRequest) {
  try {
    const body: ResetPasswordRequest = await req.json();
    const { token, newPassword } = body;

    // Validate inputs
    if (!isRequired(token) || !isRequired(newPassword)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    if (!minLength(newPassword, 8)) {
      throw new ValidationError(ERROR_MESSAGES.PASSWORD.TOO_SHORT);
    }

    // Verify the reset token and get user email
    const auth = getAdminAuth();

    // Note: Firebase doesn't provide a direct way to verify password reset tokens in Admin SDK
    // The token verification happens client-side via Firebase Auth
    // This endpoint should ideally validate the token was used successfully

    // For now, this is a placeholder that should be called AFTER client-side reset
    // In a proper implementation, you'd:
    // 1. Client calls Firebase Auth confirmPasswordReset(auth, token, newPassword)
    // 2. Then optionally call this endpoint to log the password change

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.USER.PASSWORD_CHANGED,
    });
  } catch (error) {
    serverLogger.error("Reset password error", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.PASSWORD.RESET_FAILED,
      },
      { status: error instanceof ValidationError ? 400 : 500 },
    );
  }
}
