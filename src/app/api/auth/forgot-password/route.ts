/**
 * API Route: Password Reset Request (Backend-Only)
 * POST /api/auth/forgot-password
 *
 * Secure password reset flow:
 * 1. Validate email
 * 2. Generate password reset link with Firebase Admin
 * 3. Send email (via email service)
 * 4. Return success (don't reveal if user exists)
 *
 * Security: Password reset links generated server-side only
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase/admin";
import { handleApiError } from "@/lib/errors";
import { ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      throw new ValidationError(firstError.message);
    }

    const { email } = validation.data;

    // Get Firebase Admin instance
    const auth = getAuth(getAdminApp());

    // Generate password reset link
    // Always return success even if user doesn't exist (security best practice)
    try {
      const resetLink = await auth.generatePasswordResetLink(email);

      // TODO: Send email via your email service (Resend, SendGrid, etc.)
      // For now, log the link
      console.log("Password reset link:", resetLink);

      // In production, use your email service:
      // await sendEmail({
      //   to: email,
      //   subject: 'Reset your password',
      //   html: `Click here to reset your password: ${resetLink}`
      // });
    } catch (error: any) {
      // Don't reveal if user exists or not
      if (error.code === "auth/user-not-found") {
        // Still return success
        console.log("Password reset requested for non-existent user:", email);
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD.RESET_EMAIL_SENT,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
