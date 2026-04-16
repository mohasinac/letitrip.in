import "@/providers.config";
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

import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@mohasinac/appkit/providers/db-firebase";
import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";
import { z } from "zod";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { sendPasswordResetEmailWithLink } from "@mohasinac/appkit/features/contact";
import { createRouteHandler } from "@mohasinac/appkit/next";

const forgotPasswordSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
});

export const POST = createRouteHandler<
  (typeof forgotPasswordSchema)["_output"]
>({
  schema: forgotPasswordSchema,
  handler: async ({ request, body }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.PASSWORD_RESET);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const auth = getAuth(getAdminApp());
    try {
      const resetLink = await auth.generatePasswordResetLink(body!.email);
      serverLogger.info("Password reset link generated", { resetLink });
      await sendPasswordResetEmailWithLink(body!.email, resetLink);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        serverLogger.info("Password reset requested for non-existent user", {
          email: body!.email,
        });
      } else {
        throw error;
      }
    }
    return successResponse(
      undefined,
      SUCCESS_MESSAGES.PASSWORD.RESET_EMAIL_SENT,
    );
  },
});

