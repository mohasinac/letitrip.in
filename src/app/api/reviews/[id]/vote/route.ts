/**
 * Reviews API - Vote Endpoint
 *
 * Handles review helpful/not helpful voting
 */

import { reviewRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { reviewVoteSchema } from "@/lib/validation/schemas";
import { NotFoundError } from "@/lib/errors";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

/**
 * POST /api/reviews/[id]/vote
 *
 * Vote on a review (helpful / not helpful).
 * Requires authentication. Rate-limited to prevent vote stuffing.
 */
export const POST = createApiHandler<
  (typeof reviewVoteSchema)["_output"],
  { id: string }
>({
  auth: true,
  rateLimit: RateLimitPresets.STRICT,
  schema: reviewVoteSchema,
  handler: async ({ user: _user, body, params }) => {
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
