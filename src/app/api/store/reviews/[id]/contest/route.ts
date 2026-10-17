import { withProviders } from "@/providers.config";
import { z } from "zod";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { reviewRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/*
 * The seller's stated reason for contesting a review. `.min(10)` because this
 * is read by a human moderator deciding whether to remove a buyer's review —
 * "wrong" is not a case, and the previous `typeof === "string" ? trim() : ""`
 * accepted a single character.
 */
const contestSchema = z.object({
  reason: z.string().trim().min(10, "Give the moderator at least a sentence").max(1000),
});

export const POST = withProviders(createApiHandler<(typeof contestSchema)["_output"]>({
  roles: [...ROLES_STORE_WRITE],
  schema: contestSchema,
  handler: async ({ body, user, params }) => {
    const reviewId = (params as { id: string }).id;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const review = await reviewRepository.findById(reviewId);
    if (!review || review.storeId !== store.id) {
      return ApiErrors.notFound("Review not found or does not belong to your store");
    }

    await reviewRepository.update(reviewId, {
      moderatorNote: `Contested by store: ${body!.reason}`,
      updatedAt: new Date(),
    } as any);

    return successResponse({ message: "Contest submitted for moderator review" });
  },
}));
