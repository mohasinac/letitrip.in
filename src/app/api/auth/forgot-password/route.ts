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
import { getAdminApp } from "@/lib/firebase/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { z } from "zod";
import { serverLogger } from "@/lib/server-logger";
import { sendPasswordResetEmailWithLink } from "@/lib/email";
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
