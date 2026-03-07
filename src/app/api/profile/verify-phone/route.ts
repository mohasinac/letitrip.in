/**
 * Verify Phone Number API Route
 * POST /api/profile/verify-phone
 *
 * Called AFTER client-side Firebase confirmationResult.confirm(code).
 * Updates the phoneVerified flag in Firestore for the authenticated user.
 */

import { getAdminAuth } from "@/lib/firebase/admin";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { successResponse } from "@/lib/api-response";
import { verifyPhoneSchema } from "@/lib/validation/schemas";
import { ValidationError } from "@/lib/errors";
import { userRepository } from "@/repositories";
import { createApiHandler } from "@/lib/api/api-handler";

export const POST = createApiHandler<(typeof verifyPhoneSchema)["_output"]>({
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
