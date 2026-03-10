/**
 * Bids API — Single Resource
 *
 * GET /api/bids/[id] — Get a single bid by ID (public)
 */

import { bidRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError } from "@/lib/errors";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

/**
 * GET /api/bids/[id]
 *
 * Returns a single bid document by its ID.
 */
export const GET = createApiHandler<never, { id: string }>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const bid = await bidRepository.findById(id);
    if (!bid) throw new NotFoundError(ERROR_MESSAGES.BID.NOT_FOUND);
    return successResponse(bid);
  },
});
