import { withProviders } from "@/providers.config";
/**
 * Verify Phone Number API Route
 * POST /api/profile/verify-phone
 *
 * Called AFTER client-side Firebase confirmationResult.confirm(code).
 * Updates the phoneVerified flag in Firestore for the authenticated user.
 */

import { getAdminAuth } from "@mohasinac/appkit/providers/db-firebase/admin";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { verifyPhoneSchema } from "@mohasinac/appkit/validation/schemas";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const POST = withProviders(createRouteHandler<(typeof verifyPhoneSchema)["_output"]>({
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
}));
