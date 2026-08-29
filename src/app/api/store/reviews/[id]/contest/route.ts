import { withProviders } from "@/providers.config";
import {
  createApiHandler,
  successResponse,
  ApiErrors,
  storeRepository,
  reviewRepository,
  parseJsonBody,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const POST = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user, params }) => {
    const reviewId = (params as { id: string }).id;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const review = await reviewRepository.findById(reviewId);
    if (!review || review.storeId !== store.id) {
      return ApiErrors.notFound("Review not found or does not belong to your store");
    }

    const body = await parseJsonBody(request) as { reason?: unknown };
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!reason) return ApiErrors.badRequest("reason is required");

    await reviewRepository.update(reviewId, {
      moderatorNote: `Contested by store: ${reason}`,
      updatedAt: new Date(),
    } as any);

    return successResponse({ message: "Contest submitted for moderator review" });
  },
}));
