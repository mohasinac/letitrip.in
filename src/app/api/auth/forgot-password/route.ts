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
import { handleApiError } from "@/lib/errors/error-handler";
import { ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, UI_LABELS } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { z } from "zod";
import { serverLogger } from "@/lib/server-logger";
import { sendPasswordResetEmailWithLink } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — prevent password reset abuse
    const rateLimitResult = await applyRateLimit(
      request,
      RateLimitPresets.PASSWORD_RESET,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED },
        { status: 429 },
      );
    }

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

      // Send password reset email via Resend
      serverLogger.info("Password reset link generated", { resetLink });
      await sendPasswordResetEmailWithLink(email, resetLink);
    } catch (error: any) {
      // Don't reveal if user exists or not
      if (error.code === "auth/user-not-found") {
        // Still return success
        serverLogger.info("Password reset requested for non-existent user", {
          email,
        });
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
