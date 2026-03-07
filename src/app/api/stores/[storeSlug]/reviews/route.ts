import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
import {
  storeRepository,
  productRepository,
  reviewRepository,
} from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/stores/[storeSlug]/reviews
 * Returns aggregated approved reviews for all published products in a store.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storeSlug: string }> },
) {
  try {
    const { storeSlug } = await context.params;

    if (!storeSlug) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.FAILED);
    }

    const storeDoc = await storeRepository.findBySlug(storeSlug);
    if (!storeDoc || storeDoc.status !== "active" || !storeDoc.isPublic) {
      throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    // Fetch all products for this store's owner
    const allProducts = await productRepository.findBySeller(storeDoc.ownerId);
    const publishedProducts = allProducts
      .filter((p) => p.status === "published")
      .slice(0, 20); // cap to avoid excessive reads

    // Fetch approved reviews for each product in parallel
    const reviewArrays = await Promise.all(
      publishedProducts.map((p) =>
        reviewRepository.findApprovedByProduct(p.id),
      ),
    );

    // Flatten and sort by createdAt desc
    const allReviews = reviewArrays
      .flat()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    // Compute aggregates
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let ratingSum = 0;
    let totalReviews = 0;

    for (const reviews of reviewArrays) {
      for (const review of reviews) {
        totalReviews++;
        ratingSum += review.rating;
        ratingDistribution[review.rating] =
          (ratingDistribution[review.rating] ?? 0) + 1;
      }
    }

    const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

    // Attach product info to each review for display
    const productMap = new Map(publishedProducts.map((p) => [p.id, p]));
    const reviewsWithProduct = allReviews.map((review) => ({
      ...review,
      productTitle:
        productMap.get(review.productId)?.title ?? review.productTitle,
      productMainImage: productMap.get(review.productId)?.mainImage ?? null,
    }));

    serverLogger.info("Fetched store reviews", {
      storeSlug,
      totalReviews,
      returned: reviewsWithProduct.length,
    });

    return successResponse({
      reviews: reviewsWithProduct,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
