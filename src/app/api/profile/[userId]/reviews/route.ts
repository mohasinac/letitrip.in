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
import { createRouteHandler } from "@mohasinac/next";

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

    const sellerProducts = await productRepository.findBySeller(userId);
    const publishedProducts = sellerProducts.filter(
      (p) => p.status === "published",
    );

    if (publishedProducts.length === 0) {
      return successResponse({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const productSlice = publishedProducts.slice(0, 20);
    const reviewArrays = await Promise.all(
      productSlice.map((p) => reviewRepository.findApprovedByProduct(p.id)),
    );

    const allReviews = reviewArrays
      .flat()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    const allReviewsForStats = reviewArrays.flat();
    const totalReviews = allReviewsForStats.length;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
      number,
      number
    >;
    let ratingSum = 0;

    for (const review of allReviewsForStats) {
      ratingSum += review.rating;
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    }

    const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

    const productMap = new Map(publishedProducts.map((p) => [p.id, p]));
    const reviewsWithProduct = allReviews.map((review) => ({
      ...review,
      productTitle:
        productMap.get(review.productId)?.title || review.productTitle,
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
