/**
 * GET /api/seller/offers
 *
 * Returns authenticated seller's incoming offers.
 * Mutation (respond/counter/accept/decline) → respondToOfferAction (Server Action).
 */

import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { offerRepository } from "@/repositories";

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }) => {
    const result = await offerRepository.findBySeller(user!.uid);
    return successResponse(result);
  },
});
