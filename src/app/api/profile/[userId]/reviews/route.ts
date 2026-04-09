/**
 * Public Profile Reviews API Route
 *
 * GET /api/profile/[userId]/reviews
 *
 * Returns aggregated approved reviews for a seller's products.
 * Fetches the seller's products and then reviews for each product.
 */

import { productRepository, reviewRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { maskPublicReview } from "@/lib/pii";

/**
 * GET /api/profile/[userId]/reviews
 *
 * Returns up to 10 most recent approved reviews across all seller's products.
 * No auth required — public endpoint.
 */
export const GET = createRouteHandler<never, { userId: string }>({
  handler: async ({ request, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { userId } = params!;

    const latestReviewsResult = await reviewRepository.listForSeller(userId, {
      filters: "status==approved",
      sorts: "-createdAt",
      page: "1",
      pageSize: "10",
    });

    if (latestReviewsResult.total === 0) {
      return successResponse({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const ratingCounts = await Promise.all(
      [1, 2, 3, 4, 5].map(async (rating) => {
        const result = await reviewRepository.listForSeller(userId, {
          filters: `status==approved,rating==${rating}`,
          page: "1",
          pageSize: "1",
        });
        return result.total;
      }),
    );

    const totalReviews = latestReviewsResult.total;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
      number,
      number
    >;
    let ratingSum = 0;

    [1, 2, 3, 4, 5].forEach((rating, index) => {
      ratingDistribution[rating] = ratingCounts[index];
      ratingSum += rating * ratingCounts[index];
    });

    const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

    const productIds = Array.from(
      new Set(latestReviewsResult.items.map((review) => review.productId)),
    );
    const products = await Promise.all(
      productIds.map((productId) => productRepository.findById(productId)),
    );
    const productMap = new Map(
      products.filter(Boolean).map((product) => [product!.id, product!]),
    );
    const reviewsWithProduct = latestReviewsResult.items.map((review) => ({
      ...maskPublicReview(review),
      productTitle:
        productMap.get(review.productId)?.title ?? review.productTitle,
      productMainImage: productMap.get(review.productId)?.mainImage || null,
    }));

    serverLogger.info("Fetched seller reviews", {
      userId,
      totalReviews,
      returned: reviewsWithProduct.length,
    });

    return successResponse({
      reviews: reviewsWithProduct,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution,
    });
  },
});
