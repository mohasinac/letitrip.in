/**
 * Add Phone Number API Route
 * POST /api/profile/add-phone
 *
 * Initiates phone number verification process
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { errorResponse, successResponse } from "@/lib/api-response";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { getRequiredSessionCookie } from "@/lib/api/request-helpers";
import { isValidPhone } from "@/utils";
import { serverLogger } from "@/lib/server-logger";

interface AddPhoneRequest {
  phoneNumber: string;
}

export async function POST(req: NextRequest) {
  try {
    // Verify session
    const sessionCookie = getRequiredSessionCookie(req);

    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Parse request
    const body: AddPhoneRequest = await req.json();
    const { phoneNumber } = body;

    // Validate phone number
    if (!isValidPhone(phoneNumber)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_PHONE);
    }

    // Check if phone number is already in use
    try {
      const existingUser = await auth.getUserByPhoneNumber(phoneNumber);
      if (existingUser && existingUser.uid !== userId) {
        throw new ValidationError(ERROR_MESSAGES.PHONE.ALREADY_IN_USE);
      }
    } catch (error: any) {
      // If error is "user not found", that's OK - phone is available
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // NOTE: Firebase Admin SDK cannot send SMS verification
    // Phone verification must be done client-side using Firebase Auth
    // This endpoint validates the phone number and returns a success response
    // Client should then use signInWithPhoneNumber() to send verification code

    // For now, return success and let client handle verification
    // In production, you might use a third-party SMS service
    return successResponse(
      { verificationId: null },
      SUCCESS_MESSAGES.PHONE.VALIDATED,
    );
  } catch (error) {
    serverLogger.error("Add phone error", { error });
    return errorResponse(
      error instanceof Error ? error.message : ERROR_MESSAGES.PHONE.ADD_FAILED,
      error instanceof AuthenticationError
        ? 401
        : error instanceof ValidationError
          ? 400
          : 500,
    );
  }
}
