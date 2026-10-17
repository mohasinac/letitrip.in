import { withProviders } from "@/providers.config";
import { z } from "zod";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository, reviewRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/*
 * A seller's review of a buyer. `rating` was `number | string` with a
 * `Number(body.rating)` coercion afterwards, which is the one case where the
 * coercion was deliberate (an HTML form sends "5"), so `z.coerce.number()`
 * keeps that behaviour while rejecting `"abc"` — which `Number()` turned into
 * `NaN` and the `Number.isFinite` guard then reported as a bad rating rather
 * than as a bad type.
 *
 * The 1–5 bound moves into the schema because it is the rating's domain, not
 * this handler's opinion.
 */
const reviewBuyerSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
  title: z.string().trim().max(200).optional(),
});

export const POST = withProviders(createApiHandler<(typeof reviewBuyerSchema)["_output"]>({
  roles: [...ROLES_STORE_WRITE],
  schema: reviewBuyerSchema,
  handler: async ({ body, user, params }) => {
    const orderId = (params as { id: string }).id;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const order = await orderRepository.findById(orderId);
    if (!order || order.storeId !== store.id) {
      return ApiErrors.forbidden("Order not found or does not belong to your store");
    }
    if (order.status === "pending" || order.status === "processing") {
      return ApiErrors.badRequest("Cannot review a buyer on a pending order — wait until the order is fulfilled");
    }

    const existingReviews = await reviewRepository.findByUserAsRole(user!.uid, "seller");
    const alreadyReviewed = existingReviews.some(
      (r) => (r as any).orderId === orderId,
    );
    if (alreadyReviewed) {
      return ApiErrors.badRequest("You have already reviewed this buyer for this order");
    }

    const { rating } = body!;
    const comment = body!.comment ?? "";
    const title = body!.title || `Seller review for order ${orderId}`;

    const review = await reviewRepository.create({
      productId: orderId,
      productTitle: `Order ${orderId}`,
      storeId: store.id,
      storeName: store.storeName,
      userId: user!.uid,
      userName: store.storeName ?? "Seller",
      rating,
      title: title || `Order review`,
      comment,
      status: "approved",
      verified: true,
      revieweeId: order.userId,
      reviewerRole: "seller",
      orderId,
    } as any);

    return successResponse({ review }, "Buyer review submitted", 201);
  },
}));
