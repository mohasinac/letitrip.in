import "@/providers.config";
/**
 * GET /api/user/offers
 *
 * Returns authenticated buyer's offers, newest first.
 */

import { successResponse } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/server";
import { offerRepository } from "@mohasinac/appkit/server";

export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const result = await offerRepository.findByBuyer(user!.uid);
    return successResponse(result);
  },
});

