/**
 * D56 — the public rate card: which slots are sold, which months are free.
 *
 * 🛑 Public and unauthenticated by design. "Self-serve" means a visitor can
 * see what is for sale before creating an account, and a rate card is not a
 * secret — `priceRsPerPeriod` is the asking price, printed on the page.
 *
 * 🛑 It returns AVAILABILITY, never the booking. Who booked a slot, what
 * they paid and what they submitted are all private; "November is taken" is
 * the only fact a prospective advertiser needs, and it is the only one that
 * leaves the server.
 */
import { withProviders } from "@/providers.config";

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { adSlotOffers } from "@mohasinac/appkit/server";

const __GET__g = withProviders(
  createRouteHandler({
    handler: async () => {
      const slots = await adSlotOffers();
      return successResponse({ slots });
    },
  }),
);
export const GET = __GET__g;
