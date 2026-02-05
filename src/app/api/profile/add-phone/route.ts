/**
 * API Route: Add Phone Number
 * POST /api/profile/add-phone
 */

import {
  createApiHandler,
  successResponse,
  errorResponse,
} from "@/lib/api/api-handler";
import { addPhoneSchema } from "@/lib/api/validation-schemas";
import { userRepository } from "@/repositories";

export const POST = createApiHandler({
  auth: true,
  rateLimit: { limit: 10, window: 60 * 60 },
  schema: addPhoneSchema,
  handler: async ({ body, user }) => {
    const { phoneNumber } = body!;

    const existingUser = await userRepository.findByPhone(phoneNumber);
    if (existingUser && existingUser.uid !== user.uid) {
      return errorResponse(
        "Phone number already in use by another account",
        409,
      );
    }

    return successResponse(
      { phoneNumber },
      "Phone number validated. Proceed with OTP verification.",
    );
  },
});
