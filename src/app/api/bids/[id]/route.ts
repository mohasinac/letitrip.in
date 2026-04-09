/**
 * Bids API — Single Resource
 *
 * GET /api/bids/[id] — Get a single bid by ID (public)
 */

import { bidRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError } from "@/lib/errors";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";

/**
 * GET /api/bids/[id]
 *
 * Returns a single bid document by its ID.
 */
export const GET = createRouteHandler<never, { id: string }>({
  handler: async ({ request, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const bid = await bidRepository.findById(id);
    if (!bid) throw new NotFoundError(ERROR_MESSAGES.BID.NOT_FOUND);
    return successResponse(bid);
  },
});
