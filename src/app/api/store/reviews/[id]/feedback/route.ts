import { withProviders } from "@/providers.config";
import {
  createApiHandler,
  successResponse,
  ApiErrors,
  storeRepository,
  reviewRepository,
  notificationRepository,
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

    const body = await parseJsonBody(request) as { message?: string };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return ApiErrors.badRequest("message is required");

    await notificationRepository.create({
      userId: review.userId,
      type: "store_feedback",
      title: `Feedback from ${store.storeName}`,
      body: message,
      isRead: false,
      entityId: reviewId,
      entityType: "review",
      createdAt: new Date(),
    } as any);

    return successResponse({ message: "Feedback sent to buyer" });
  },
}));
