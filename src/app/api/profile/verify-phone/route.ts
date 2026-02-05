/**
 * API Route: Verify Phone Number
 * POST /api/profile/verify-phone
 */

import { createApiHandler, successResponse } from "@/lib/api/api-handler";
import { verifyPhoneSchema } from "@/lib/api/validation-schemas";
import { userRepository } from "@/repositories";

export const POST = createApiHandler({
  auth: true,
  schema: verifyPhoneSchema,
  handler: async ({ body, user }) => {
    await userRepository.update(user.uid, {
      phoneVerified: true,
      updatedAt: new Date(),
    });

    return successResponse(
      { phoneVerified: true },
      "Phone number verified successfully",
    );
  },
});
