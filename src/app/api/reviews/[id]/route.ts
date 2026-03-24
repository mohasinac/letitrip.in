/**
 * Reviews API - Individual Review Routes
 *
 * Handles individual review operations
 * GET delegated to @mohasinac/feat-reviews; PATCH + DELETE stay local.
 */

export { reviewItemGET as GET } from "@mohasinac/feat-reviews";

import { reviewRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { reviewUpdateSchema } from "@/lib/validation/schemas";
import { AuthorizationError, NotFoundError } from "@/lib/errors";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

/**
 * PATCH /api/reviews/[id] — Requires auth + ownership or moderator/admin
 */
export const PATCH = createApiHandler<
  (typeof reviewUpdateSchema)["_output"],
  IdParams
>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  schema: reviewUpdateSchema,
  handler: async ({ user, body, params }) => {
    const { id } = params!;

    const review = await reviewRepository.findById(id);
    if (!review) throw new NotFoundError(ERROR_MESSAGES.REVIEW.NOT_FOUND);

    const isOwner = review.userId === user!.uid;
    const isModerator = ["moderator", "admin"].includes(user!.role);
    if (!isOwner && !isModerator) {
      throw new AuthorizationError(ERROR_MESSAGES.REVIEW.UPDATE_NOT_ALLOWED);
    }

    const updatedReview = await reviewRepository.update(id, body!);
    return successResponse(updatedReview);
  },
});

/**
 * DELETE /api/reviews/[id] — Requires auth + ownership or moderator/admin
 */
export const DELETE = createApiHandler<never, IdParams>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { id } = params!;

    const review = await reviewRepository.findById(id);
    if (!review) throw new NotFoundError(ERROR_MESSAGES.REVIEW.NOT_FOUND);

    const isOwner = review.userId === user!.uid;
    const isModerator = ["moderator", "admin"].includes(user!.role);
    if (!isOwner && !isModerator) {
      throw new AuthorizationError(ERROR_MESSAGES.REVIEW.DELETE_NOT_ALLOWED);
    }

    await reviewRepository.delete(id);
    return successResponse(undefined, SUCCESS_MESSAGES.REVIEW.DELETED);
  },
});
