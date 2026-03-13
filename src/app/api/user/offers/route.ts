/**
 * GET /api/user/offers
 *
 * Returns authenticated buyer's offers, newest first.
 */

import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { offerRepository } from "@/repositories";

export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    const result = await offerRepository.findByBuyer(user!.uid);
    return successResponse(result);
  },
});
