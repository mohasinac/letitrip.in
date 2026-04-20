import "@/providers.config";
/**
 * Verify Email API Route
 * GET /api/auth/verify-email?token=xxxxx
 *
 * Acknowledges email verification. Firebase handles the actual verification
 * client-side; this endpoint confirms/logs the outcome.
 */

import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { getSearchParams, getStringParam } from "@mohasinac/appkit";
import { ValidationError } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";

export const GET = createRouteHandler({
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const token = getStringParam(searchParams, "token");

    if (!token) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.TOKEN_REQUIRED);
    }

    // Firebase email verification is handled client-side via applyActionCode().
    // This endpoint is called post-verification to confirm success.
    return successResponse(undefined, SUCCESS_MESSAGES.EMAIL.VERIFIED);
  },
});

