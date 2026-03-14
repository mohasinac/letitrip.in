/**
 * Send Verification Email API Route
 * POST /api/auth/send-verification
 *
 * Generates a Firebase email verification link and sends it via Resend.
 */

import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendVerificationSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { sendVerificationEmailWithLink } from "@/lib/email";
import { createApiHandler } from "@/lib/api/api-handler";

export const POST = createApiHandler<
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
