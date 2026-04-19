import "@/providers.config";
/**
 * Verify Phone Number API Route
 * POST /api/profile/verify-phone
 *
 * Called AFTER client-side Firebase confirmationResult.confirm(code).
 * Updates the phoneVerified flag in Firestore for the authenticated user.
 */

import { getAdminAuth } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { verifyPhoneSchema } from "@mohasinac/appkit/server";
import { ValidationError } from "@mohasinac/appkit/server";
import { userRepository } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/server";

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
