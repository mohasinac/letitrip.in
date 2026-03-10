/**
 * Set Default Address API
 *
 * POST /api/user/addresses/[id]/set-default
 *
 * Sets the given address as the user's default shipping address.
 */

import { addressRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

export const POST = createApiHandler<never, { id: string }>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { id } = params!;

    const address = await addressRepository.setDefault(user!.uid, id);

    serverLogger.info("Default address set via API", {
      userId: user!.uid,
      addressId: id,
    });
    return successResponse(address, SUCCESS_MESSAGES.ADDRESS.DEFAULT_SET);
  },
});
