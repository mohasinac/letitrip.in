import { withProviders } from "@/providers.config";
/**
 * GET /api/user/offers
 *
 * Returns authenticated buyer's offers, newest first.
 */

import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { offerRepository } from "@mohasinac/appkit";
import { offerDocumentToOffer } from "@mohasinac/appkit/server";

export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const result = await offerRepository.findByBuyer(user!.uid);
    // Adapt: the repository returns live `Date` objects, which arrive at the
    // client as strings that no longer satisfy the type. `includeBuyerIdentity`
    // is on because these are the buyer's OWN offers.
    return successResponse({
      ...result,
      items: result.items.map((o) => offerDocumentToOffer(o, { includeBuyerIdentity: true })),
    });
  },
}));
