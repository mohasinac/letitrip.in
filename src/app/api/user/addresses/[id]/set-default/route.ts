/**
 * Set Default Address API
 *
 * POST /api/user/addresses/[id]/set-default
 *
 * Sets the given address as the user's default shipping address.
 */

import { addressRepository } from "@/repositories";
import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";

export const POST = createRouteHandler<never, { id: string }>({
  auth: true,
  handler: async ({ user, params, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;

    const address = await addressRepository.setDefault(user!.uid, id);

    serverLogger.info("Default address set via API", {
      userId: user!.uid,
      addressId: id,
    });
    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.DEFAULT_SET);
  },
});
