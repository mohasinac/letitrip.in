/**
 * Send Verification Email API Route
 * POST /api/auth/send-verification
 *
 * Resends email verification to user
 */

import { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { isValidEmail } from "@/utils";
import { serverLogger } from "@/lib/server-logger";
import { sendVerificationEmailWithLink } from "@/lib/email";

interface SendVerificationRequest {
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendVerificationRequest = await req.json();
    const { email } = body;

    // Validate email
    if (!isValidEmail(email)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
    }

    const auth = getAdminAuth();

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    if (userRecord.emailVerified) {
      return errorResponse(ERROR_MESSAGES.EMAIL.ALREADY_VERIFIED, 400);
    }

    // Generate email verification link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
      handleCodeInApp: false,
    };

    const verificationLink = await auth.generateEmailVerificationLink(
      email,
      actionCodeSettings,
    );

    // Note: Firebase Admin SDK generates the link but doesn't send the email
    // You need to implement email sending via:
    // 1. Firebase Auth (client-side) - sendEmailVerification()
    // 2. Or custom email service (Resend, SendGrid, etc.)

    // For now, return the link (in production, send via email service)
    serverLogger.info("Verification link generated", { verificationLink });

    // Send verification email via Resend
    await sendVerificationEmailWithLink(email, verificationLink);

    return successResponse(undefined, SUCCESS_MESSAGES.EMAIL.VERIFICATION_SENT);
  } catch (error) {
    serverLogger.error("Send verification error", { error });
    return errorResponse(
      error instanceof Error ? error.message : ERROR_MESSAGES.EMAIL.SEND_FAILED,
      error instanceof ValidationError ? 400 : 500,
    );
  }
}
