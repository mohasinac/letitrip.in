import { withProviders } from "@/providers.config";
import {
  createApiHandler,
  successResponse,
  ApiErrors,
  orderRepository,
  storeRepository,
  reviewRepository,
  parseJsonBody,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

export const POST = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ request, user, params }) => {
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

    const body = await parseJsonBody(request) as { rating?: number | string; comment?: string; title?: string };
    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return ApiErrors.badRequest("rating must be a number between 1 and 5");
    }
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : `Seller review for order ${orderId}`;

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
