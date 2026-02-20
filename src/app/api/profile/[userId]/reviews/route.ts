/**
 * Public Profile Reviews API Route
 *
 * GET /api/profile/[userId]/reviews
 *
 * Returns aggregated approved reviews for a seller's products.
 * Fetches the seller's products and then reviews for each product.
 */

import { NextRequest, NextResponse } from "next/server";
import { productRepository, reviewRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, UI_LABELS } from "@/constants";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/profile/[userId]/reviews
 *
 * Returns up to 10 most recent approved reviews across all seller's products.
 * No auth required — public endpoint.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    // Rate limiting — public read endpoint
    const rateLimitResult = await applyRateLimit(
      _request,
      RateLimitPresets.API,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED },
        { status: 429 },
      );
    }

    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD },
        { status: 400 },
      );
    }

    // Fetch seller's products
    const sellerProducts = await productRepository.findBySeller(userId);
    const publishedProducts = sellerProducts.filter(
      (p) => p.status === "published",
    );

    if (publishedProducts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    // Fetch approved reviews for each product in parallel (limit to 20 products)
    const productSlice = publishedProducts.slice(0, 20);
    const reviewArrays = await Promise.all(
      productSlice.map((p) => reviewRepository.findApprovedByProduct(p.id)),
    );

    // Flatten and sort by createdAt desc
    const allReviews = reviewArrays
      .flat()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10); // Return 10 most recent

    // Calculate aggregates across ALL reviews (not just the slice)
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

    // Attach product info to each review for display
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

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviewsWithProduct,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
