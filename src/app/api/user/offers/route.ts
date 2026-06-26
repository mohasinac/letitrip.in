import { withProviders } from "@/providers.config";
/**
 * GET /api/user/offers
 *
 * Returns authenticated buyer's offers, newest first.
 */

import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { offerRepository } from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const result = await offerRepository.findByBuyer(user!.uid);
    return successResponse(result);
  },
}));
