/**
 * Reviews API Routes
 *
 * GET  /api/reviews — delegated to @mohasinac/feat-reviews
 *   Supports: ?featured=true (flat array), ?latest=true (paginated),
 *             ?productId=<id> (paginated + averageRating + ratingDistribution)
 *
 * POST /api/reviews — local: auth, purchase verification, email notification
 */

import {
  reviewRepository,
  orderRepository,
  productRepository,
} from "@/repositories";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { RateLimitPresets } from "@/lib/security/rate-limit";
import { reviewCreateSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { sendNewReviewNotificationEmail } from "@/lib/email";
import { SCHEMA_DEFAULTS } from "@/db/schema";
import { createApiHandler } from "@/lib/api/api-handler";

// GET delegated to package — supports featured, latest, and product-specific modes
export { GET } from "@mohasinac/feat-reviews";

/**
 * POST /api/reviews
 *
 * Create new review
 *
 * Body:
 * - productId: string (required)
 * - rating: number (required, 1-5)
 * - title: string (required)
 * - comment: string (required)
 * - images: string[] (optional, max 10)
 * - video: object (optional)
 *
 * ✅ Requires authentication via requireAuthFromRequest
 * ✅ Validates body with reviewCreateSchema (Zod, includes rating 1-5 validation)
 * ✅ Verifies user purchased the product via orderRepository.hasUserPurchased (returns 403 if not)
 * ✅ Prevents duplicate reviews (checks existing reviews for same userId+productId)
 * ✅ Sets verified=true on confirmed purchases — status defaults to 'pending' for moderation
 * ✅ Returns created review with 201 status
 * TODO (Future): Send notification to product seller and admins on new review — ✅ Done
 */
export const POST = createApiHandler<(typeof reviewCreateSchema)["_output"]>({
  auth: true,
  schema: reviewCreateSchema,
  handler: async ({ user, body }) => {
    const existingReviews = await reviewRepository.findByProduct(
      body!.productId,
    );
    const userReview = existingReviews.find((r) => r.userId === user!.uid);

    if (userReview) {
      return errorResponse(ERROR_MESSAGES.REVIEW.ALREADY_REVIEWED, 400);
    }

    const hasPurchased = await orderRepository.hasUserPurchased(
      user!.uid,
      body!.productId,
    );
    if (!hasPurchased) {
      return errorResponse(ERROR_MESSAGES.REVIEW.PURCHASE_REQUIRED, 403);
    }

    const review = await reviewRepository.create({
      ...body!,
      userId: user!.uid,
      userName: user!.displayName || "Anonymous",
      userAvatar: user!.photoURL || undefined,
      verified: true,
      status: "pending" as any,
    } as any);

    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || SCHEMA_DEFAULTS.ADMIN_EMAIL;
    productRepository
      .findById(body!.productId)
      .then((product) => {
        if (!product) return;
        return sendNewReviewNotificationEmail({
          sellerEmail: product.sellerEmail || adminEmail,
          adminEmail,
          reviewerName: user!.displayName || "Anonymous",
          productTitle: product.title,
          productId: (product as any).id ?? body!.productId,
          rating: body!.rating,
          comment: body!.comment,
        });
      })
      .catch((err) =>
        serverLogger.error(ERROR_MESSAGES.API.REVIEW_NOTIFICATION_ERROR, {
          err,
        }),
      );

    return successResponse(
      review,
      SUCCESS_MESSAGES.REVIEW.SUBMITTED_PENDING_MODERATION,
      201,
    );
  },
});
