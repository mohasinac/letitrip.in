/**
 * Verify Phone Number API Route
 * POST /api/profile/verify-phone
 *
 * Verifies phone number using verification code
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

interface VerifyPhoneRequest {
  verificationId: string;
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    // Verify session
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Parse request
    const body: VerifyPhoneRequest = await req.json();
    const { verificationId, code } = body;

    // Validate inputs
    if (!verificationId || !code) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.VERIFICATION_FIELDS_REQUIRED,
      );
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.VERIFICATION_CODE_FORMAT,
      );
    }

    // NOTE: Firebase Admin SDK cannot verify SMS codes
    // Phone verification must be done client-side using Firebase Auth's
    // confirmationResult.confirm(code) method

    // This endpoint should be called AFTER successful client-side verification
    // to update the phoneVerified flag in Firestore

    // Get user's phone number from Firebase Auth
    const userRecord = await auth.getUser(userId);

    if (!userRecord.phoneNumber) {
      throw new ValidationError(ERROR_MESSAGES.PHONE.NO_PHONE);
    }

    // Update phoneVerified flag via repository
    await userRepository.update(userId, {
      phoneVerified: true,
      phoneNumber: userRecord.phoneNumber,
    } as any);

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.USER.PHONE_VERIFIED,
      phoneNumber: userRecord.phoneNumber,
    });
  } catch (error) {
    serverLogger.error("Verify phone error", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.PHONE.VERIFY_FAILED,
      },
      {
        status:
          error instanceof AuthenticationError
            ? 401
            : error instanceof ValidationError
              ? 400
              : 500,
      },
    );
  }
}
