import "@/providers.config";
/**
 * Verify Phone Number API Route
 * POST /api/profile/verify-phone
 *
 * Called AFTER client-side Firebase confirmationResult.confirm(code).
 * Updates the phoneVerified flag in Firestore for the authenticated user.
 */

import { getAdminAuth } from "@mohasinac/appkit/providers/db-firebase";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
import { successResponse } from "@mohasinac/appkit/next";
import { verifyPhoneSchema } from "@mohasinac/appkit/validation";
import { ValidationError } from "@mohasinac/appkit/errors";
import { userRepository } from "@mohasinac/appkit/repositories";
import { createRouteHandler } from "@mohasinac/appkit/next";

export const POST = createRouteHandler<(typeof verifyPhoneSchema)["_output"]>({
  auth: true,
  schema: verifyPhoneSchema,
  handler: async ({ user }) => {
    const auth = getAdminAuth();
    const userRecord = await auth.getUser(user!.uid);

    if (!userRecord.phoneNumber) {
      throw new ValidationError(ERROR_MESSAGES.PHONE.NO_PHONE);
    }

    // verificationId + code validated by schema; actual verification is client-side.
    // Mark phone as verified in Firestore.
    await userRepository.update(user!.uid, {
      phoneVerified: true,
      phoneNumber: userRecord.phoneNumber,
    } as any);

    return successResponse(
      { phoneNumber: userRecord.phoneNumber },
      SUCCESS_MESSAGES.USER.PHONE_VERIFIED,
    );
  },
});

