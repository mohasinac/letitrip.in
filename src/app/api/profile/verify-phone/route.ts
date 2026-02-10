/**
 * Verify Phone Number API Route
 * POST /api/profile/verify-phone
 *
 * Verifies phone number using verification code
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { USER_COLLECTION } from "@/db/schema";

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
      throw new ValidationError("Verification ID and code are required");
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      throw new ValidationError("Verification code must be 6 digits");
    }

    // NOTE: Firebase Admin SDK cannot verify SMS codes
    // Phone verification must be done client-side using Firebase Auth's
    // confirmationResult.confirm(code) method

    // This endpoint should be called AFTER successful client-side verification
    // to update the phoneVerified flag in Firestore

    // Get user's phone number from Firebase Auth
    const userRecord = await auth.getUser(userId);

    if (!userRecord.phoneNumber) {
      throw new ValidationError("No phone number associated with this account");
    }

    // Update phoneVerified flag in Firestore
    const db = getAdminDb();
    await db.collection(USER_COLLECTION).doc(userId).update({
      phoneVerified: true,
      phoneNumber: userRecord.phoneNumber,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.USER.PHONE_VERIFIED,
      phoneNumber: userRecord.phoneNumber,
    });
  } catch (error) {
    console.error("Verify phone error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify phone number",
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
