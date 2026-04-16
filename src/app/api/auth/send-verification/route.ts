import "@/providers.config";
/**
 * Send Verification Email API Route
 * POST /api/auth/send-verification
 *
 * Generates a Firebase email verification link and sends it via Resend.
 */

import { getAdminAuth } from "@mohasinac/appkit/providers/db-firebase";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { sendVerificationSchema } from "@mohasinac/appkit/validation";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { sendVerificationEmailWithLink } from "@mohasinac/appkit/features/contact";
import { createRouteHandler } from "@mohasinac/appkit/next";

export const POST = createRouteHandler<
  (typeof sendVerificationSchema)["_output"]
>({
  schema: sendVerificationSchema,
  handler: async ({ body }) => {
    const { email } = body!;

    const auth = getAdminAuth();
    const userRecord = await auth.getUserByEmail(email);

    if (userRecord.emailVerified) {
      return errorResponse(ERROR_MESSAGES.EMAIL.ALREADY_VERIFIED, 400);
    }

    const verificationLink = await auth.generateEmailVerificationLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
      handleCodeInApp: false,
    });

    serverLogger.info("Verification link generated");
    await sendVerificationEmailWithLink(email, verificationLink);

    return successResponse(undefined, SUCCESS_MESSAGES.EMAIL.VERIFICATION_SENT);
  },
});

