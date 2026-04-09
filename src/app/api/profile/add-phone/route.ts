import "@/providers.config";
/**
 * Add Phone Number API Route
 * POST /api/profile/add-phone
 *
 * Validates a phone number and confirms it is available.
 * Actual SMS verification is handled client-side via Firebase signInWithPhoneNumber().
 */

import { getAdminAuth } from "@/lib/firebase/admin";
import { SUCCESS_MESSAGES } from "@/constants";
import { successResponse } from "@/lib/api-response";
import { addPhoneSchema } from "@/lib/validation/schemas";
import { ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next";

export const POST = createRouteHandler<(typeof addPhoneSchema)["_output"]>({
  auth: true,
  schema: addPhoneSchema,
  handler: async ({ user, body }) => {
    const { phoneNumber } = body!;
    const auth = getAdminAuth();

    // Check if phone number is already in use by another account
    try {
      const existingUser = await auth.getUserByPhoneNumber(phoneNumber);
      if (existingUser && existingUser.uid !== user!.uid) {
        throw new ValidationError(ERROR_MESSAGES.PHONE.ALREADY_IN_USE);
      }
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      // auth/user-not-found means phone is available — that's fine
      if (error.code !== "auth/user-not-found") {
        serverLogger.error("Phone availability check failed", { error });
        throw error;
      }
    }

    // Client should then call signInWithPhoneNumber() to send the SMS
    return successResponse(
      { verificationId: null },
      SUCCESS_MESSAGES.PHONE.VALIDATED,
    );
  },
});
