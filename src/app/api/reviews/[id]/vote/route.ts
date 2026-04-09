/**
 * Reviews API - Vote Endpoint
 *
 * Handles review helpful/not helpful voting
 */

import { reviewRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { reviewVoteSchema } from "@/lib/validation/schemas";
import { NotFoundError } from "@/lib/errors";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";

/**
 * POST /api/reviews/[id]/vote
 *
 * Vote on a review (helpful / not helpful).
 * Requires authentication. Rate-limited to prevent vote stuffing.
 */
export const POST = createRouteHandler<
  (typeof reviewVoteSchema)["_output"],
  { id: string }
>({
  auth: true,
  schema: reviewVoteSchema,
  handler: async ({ request, user: _user, body, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;

    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError(ERROR_MESSAGES.REVIEW.NOT_FOUND);
    }

    const helpful = body!.vote === "helpful";
    const updateData: Record<string, number> = {};
    if (helpful) {
      updateData.helpfulCount = (review.helpfulCount || 0) + 1;
    }

    const updatedReview = await reviewRepository.update(id, updateData);

    return successResponse(
      { helpfulCount: updatedReview.helpfulCount },
      SUCCESS_MESSAGES.REVIEW.VOTE_RECORDED,
    );
  },
});
