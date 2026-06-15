import { withProviders } from "@/providers.config";
/**
 * GET /api/user/offers
 *
 * Returns authenticated buyer's offers, newest first.
 */

import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { offerRepository } from "@mohasinac/appkit";

// audit-route-schema-ok: pending-bespoke-schema
// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const result = await offerRepository.findByBuyer(user!.uid);
    return successResponse(result);
  },
}));

