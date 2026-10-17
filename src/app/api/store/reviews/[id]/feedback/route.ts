import { withProviders } from "@/providers.config";
import { z } from "zod";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { reviewRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { sendNotification } from "@mohasinac/appkit/server";

/*
 * The seller's reply to a buyer's review. It is delivered verbatim as a
 * notification body and an email, so the bound is not cosmetic: an unbounded
 * string here is an unbounded email payload against the Resend budget.
 */
const feedbackSchema = z.object({
  message: z.string().trim().min(1, "message is required").max(2000),
});

export const POST = withProviders(createApiHandler<(typeof feedbackSchema)["_output"]>({
  roles: [...ROLES_STORE_WRITE],
  schema: feedbackSchema,
  handler: async ({ body, user, params }) => {
    const reviewId = (params as { id: string }).id;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const review = await reviewRepository.findById(reviewId);
    if (!review || review.storeId !== store.id) {
      return ApiErrors.notFound("Review not found or does not belong to your store");
    }


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
      message: body!.message,
      relatedId: reviewId,
      relatedType: "review",
      priority: "normal",
    });

    return successResponse({ message: "Feedback sent to buyer" });
  },
}));
