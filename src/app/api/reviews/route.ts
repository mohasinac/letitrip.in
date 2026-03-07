/**
 * Reviews API Routes
 *
 * Handles product review creation and listing.
 * GET uses a two-phase approach:
 *  1. reviewRepository.findByProduct()  — full product reviews for aggregate stats
 *  2. reviewRepository.listForProduct() — Firestore-native Sieve page (offset+limit)
 *
 * TODO (Future):
 * - Review voting (helpful/not helpful)
 * - Spam detection with ML/AI
 * - Review response from sellers
 * - Review analytics
 */

import {
  reviewRepository,
  orderRepository,
  productRepository,
} from "@/repositories";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  getBooleanParam,
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { RateLimitPresets } from "@/lib/security/rate-limit";
import { reviewCreateSchema } from "@/lib/validation/schemas";
import { serverLogger } from "@/lib/server-logger";
import { sendNewReviewNotificationEmail } from "@/lib/email";
import { SCHEMA_DEFAULTS } from "@/db/schema";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * GET /api/reviews
 *
 * Get reviews with filtering
 *
 * Query Parameters:
 * - productId: string (required)
 * - filters: string (Sieve filters)
 * - sorts: string (Sieve sorts)
 * - page: number (default: 1)
 * - pageSize: number (default: 10, max: 50)
 *
 * Ã¢Å“â€¦ Fetches reviews via reviewRepository.findByProduct(productId)
 * Ã¢Å“â€¦ productId required parameter (returns 400 if missing)
 * Ã¢Å“â€¦ Pagination via Sieve (page/pageSize params, max 50)
 * Ã¢Å“â€¦ Returns ratingDistribution (1-5 stars count) and averageRating in meta
 * Ã¢Å“â€¦ Cache-Control headers set (2 min public)
 * Ã¢Å“â€¦ Featured reviews shortcut (featured=true param, no productId required)
 */
export const GET = createApiHandler({
  rateLimit: RateLimitPresets.API,
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const productId = getStringParam(searchParams, "productId");
    const featured = getBooleanParam(searchParams, "featured") === true;
    const latest = getBooleanParam(searchParams, "latest") === true;
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 10, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    // Handle featured reviews query (no productId required)
    if (featured) {
      const featuredReviews = await reviewRepository.findFeatured(pageSize);
      const response = successResponse(featuredReviews, undefined, 200, {
        page: 1,
        limit: pageSize,
        total: featuredReviews.length,
        totalPages: 1,
        hasMore: false,
      });
      response.headers.set(
        "Cache-Control",
        "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
      );
      return response;
    }

    // Handle latest/all approved reviews (no productId required)
    // Supports sorts, filters (merged with status==approved), and higher pageSize
    if (latest) {
      const latestPageSize = getNumberParam(searchParams, "pageSize", 24, {
        min: 1,
        max: 200,
      });
      const baseFilter = "status==approved";
      const combinedFilters = filters ? `${baseFilter},${filters}` : baseFilter;
      const sieveResult = await reviewRepository.listAll({
        filters: combinedFilters,
        sorts,
        page,
        pageSize: latestPageSize,
      });
      const latestResponse = successResponse(
        sieveResult.items,
        undefined,
        200,
        {
          page: sieveResult.page,
          limit: sieveResult.pageSize,
          total: sieveResult.total,
          totalPages: sieveResult.totalPages,
          hasMore: sieveResult.hasMore,
        },
      );
      latestResponse.headers.set(
        "Cache-Control",
        "public, max-age=120, s-maxage=300, stale-while-revalidate=60",
      );
      return latestResponse;
    }

    // Require productId parameter for product-specific reviews
    if (!productId) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.PRODUCT_ID_REQUIRED, 400);
    }

    // Fetch all reviews for rating stats (aggregate calculations use all docs)
    const allReviews = await reviewRepository.findByProduct(productId);

    // Calculate rating distribution (1-5 stars)
    const ratingDistribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    let totalRating = 0;
    let approvedCount = 0;

    allReviews.forEach((review) => {
      if (review.status === "approved") {
        ratingDistribution[review.rating]++;
        totalRating += review.rating;
        approvedCount++;
      }
    });

    const averageRating = approvedCount > 0 ? totalRating / approvedCount : 0;

    // Firestore-native paginated list scoped to this product
    const sieveResult = await reviewRepository.listForProduct(productId, {
      filters: filters || "status==approved",
      sorts,
      page,
      pageSize,
    });

    const response = successResponse(sieveResult.items, undefined, 200, {
      page: sieveResult.page,
      limit: sieveResult.pageSize,
      total: sieveResult.total,
      totalPages: sieveResult.totalPages,
      hasMore: sieveResult.hasMore,
      ratingDistribution,
      averageRating: Math.round(averageRating * 10) / 10,
    });
    response.headers.set(
      "Cache-Control",
      "public, max-age=120, s-maxage=300, stale-while-revalidate=60",
    );
    return response;
  },
});

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
 * Ã¢Å“â€¦ Requires authentication via requireAuthFromRequest
 * Ã¢Å“â€¦ Validates body with reviewCreateSchema (Zod, includes rating 1-5 validation)
 * Ã¢Å"â€¦ Verifies user purchased the product via orderRepository.hasUserPurchased (returns 403 if not)
 * Ã¢Å"â€¦ Prevents duplicate reviews (checks existing reviews for same userId+productId)
 * Ã¢Å"â€¦ Sets verified=true on confirmed purchases — status defaults to 'pending' for moderation
 * Ã¢Å"â€¦ Returns created review with 201 status
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
