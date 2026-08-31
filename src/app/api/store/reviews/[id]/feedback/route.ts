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
import { sendNotification } from "@mohasinac/appkit/server";

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

    /*
     * 🛑 Three defects in the line this replaces, all hidden by one `as any`.
     *
     *   `type: "store_feedback"` is not a member of NOTIFICATION_TYPE_VALUES —
     *     it filtered as nothing and could never be allow-listed for a channel;
     *   `body` / `entityId` / `entityType` are not fields on
     *     NotificationDocument — the real names are `message` / `relatedId` /
     *     `relatedType`, so the bell showed a title and no body;
     *   a direct repository write skips `actionUrl` resolution and the whole
     *     email/WhatsApp fan-out.
     *
     * `review_replied` is the real type for a seller responding to a review.
     */
    await sendNotification({
      userId: review.userId,
      type: "review_replied",
      title: `Feedback from ${store.storeName}`,
      message,
      relatedId: reviewId,
      relatedType: "review",
      priority: "normal",
    });

    return successResponse({ message: "Feedback sent to buyer" });
  },
}));
