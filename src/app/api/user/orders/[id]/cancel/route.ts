import "@/providers.config";
/**
 * GET /api/user/offers
 *
 * Returns authenticated buyer's offers, newest first.
 */

import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { offerRepository } from "@mohasinac/appkit";

export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const result = await offerRepository.findByBuyer(user!.uid);
    return successResponse(result);
  },
});
