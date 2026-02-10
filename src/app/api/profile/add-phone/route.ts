/**
 * Add Phone Number API Route
 * POST /api/profile/add-phone
 *
 * Initiates phone number verification process
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES } from "@/constants";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { isValidPhone } from "@/utils";
import { serverLogger } from "@/lib/server-logger";

interface AddPhoneRequest {
  phoneNumber: string;
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
    const body: AddPhoneRequest = await req.json();
    const { phoneNumber } = body;

    // Validate phone number
    if (!isValidPhone(phoneNumber)) {
      throw new ValidationError("Invalid phone number format");
    }

    // Check if phone number is already in use
    try {
      const existingUser = await auth.getUserByPhoneNumber(phoneNumber);
      if (existingUser && existingUser.uid !== userId) {
        throw new ValidationError("Phone number is already in use");
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
    return NextResponse.json({
      success: true,
      message:
        "Phone number validated. Use Firebase Auth to send verification code.",
      verificationId: null, // Client-side Firebase Auth will generate this
    });
  } catch (error) {
    serverLogger.error("Add phone error", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to add phone number",
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
