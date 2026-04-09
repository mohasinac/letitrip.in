import "@/providers.config";
/**
 * GET /api/user/offers
 *
 * Returns authenticated buyer's offers, newest first.
 */

import { successResponse } from "@/lib/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { offerRepository } from "@/repositories";

export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const result = await offerRepository.findByBuyer(user!.uid);
    return successResponse(result);
  },
});
