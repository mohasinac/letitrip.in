/**
 * Change Password API Route
 * POST /api/user/change-password
 *
 * Allows authenticated users to change their password
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { errorResponse, successResponse } from "@/lib/api-response";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { getRequiredSessionCookie } from "@/lib/api/request-helpers";
import { isRequired, minLength } from "@/utils";
import { serverLogger } from "@/lib/server-logger";

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function POST(req: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = getRequiredSessionCookie(req);

    // Verify session
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Parse request body
    const body: ChangePasswordRequest = await req.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!isRequired(currentPassword) || !isRequired(newPassword)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    if (!minLength(newPassword, 8)) {
      throw new ValidationError(ERROR_MESSAGES.PASSWORD.TOO_SHORT);
    }

    if (currentPassword === newPassword) {
      throw new ValidationError(ERROR_MESSAGES.PASSWORD.SAME_AS_CURRENT);
    }

    // NOTE: Firebase Admin SDK cannot verify passwords
    // The client MUST verify the current password before calling this API
    // using Firebase Client SDK's reauthenticateWithCredential()

    // Update to new password
    await auth.updateUser(userId, {
      password: newPassword,
    });

    return successResponse(undefined, SUCCESS_MESSAGES.USER.PASSWORD_CHANGED);
  } catch (error) {
    serverLogger.error("Change password error", { error });
    return errorResponse(
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.PASSWORD.CHANGE_FAILED,
      error instanceof AuthenticationError
        ? 401
        : error instanceof ValidationError
          ? 400
          : 500,
    );
  }
}
