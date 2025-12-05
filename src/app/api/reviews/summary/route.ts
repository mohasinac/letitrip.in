/**
 * @fileoverview TypeScript Module
 * @module src/app/api/reviews/summary/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { withCache } from "@/app/api/middleware/cache";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reviews/summary - Get review statistics for a product
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  let productId: string | null = null;
  return withCache(
    request,
    async (req) => {
      try {
        const { searchParams } = new URL(req.url);
        productId = searchParams.get("productId");

        if (!productId) {
          return NextResponse.json(
            { success: false, error: "Product ID is required" },
            { status: 400 },
          );
        }

        // Get all reviews for the product
        const reviewsSnapshot = await Collections.reviews()
          .where("product_id", "==", productId)
          .where("is_approved", "==", true)
          .get();

        const reviews = reviewsSnapshot.docs.map((doc) => doc.data());

        // Calculate statistics
        const totalReviews = reviews.length;
        let totalRating = 0;
        const ratingCounts: { [key: number]: number } = {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        reviews.forEach((review: any) => {
          const rating = review.rating || 0;
          totalRating += rating;
          if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
          }
        });

        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        // Create rating distribution array
        const ratingDistribution = [
          { rating: 5, count: ratingCounts[5] },
          { rating: 4, count: ratingCounts[4] },
          { rating: 3, count: ratingCounts[3] },
          { rating: 2, count: ratingCounts[2] },
          { rating: 1, count: ratingCounts[1] },
        ];

        return NextResponse.json({
          /** Success */
          success: true,
          totalReviews,
          /** Average Rating */
          averageRating: parseFloat(averageRating.toFixed(2)),
          ratingDistribution,
        });
      } catch (error) {
        logError(error as Error, {
          /** Component */
          component: "API.reviews.summary.GET",
          /** Metadata */
          metadata: { productId },
        });
        return NextResponse.json(
          { success: false, error: "Failed to fetch review summary" },
          { status: 500 },
        );
      }
    },
    {
      ttl: 300, // 5 minutes
      /** Key */
      key: `reviews:summary:${new URL(request.url).searchParams.get(
        "productId",
      )}`,
    },
  );
}
