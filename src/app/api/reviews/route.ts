/**
 * Reviews API Routes
 *
 * Handles product review creation and listing
 *
 * TODO - Phase 2 Refactoring:
 * - Implement pagination and filtering
 * - Add review moderation workflow
 * - Implement review voting (helpful/not helpful)
 * - Add spam detection with ML/AI
 * - Implement review verification (purchased product)
 * - Add review response from sellers
 * - Calculate product rating aggregates
 * - Implement review analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/repositories";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  reviewCreateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/reviews
 *
 * Get reviews with filtering
 *
 * Query Parameters:
 * - productId: string (required)
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 50)
 * - status: string (optional: pending, approved, rejected)
 * - rating: number (optional: 1-5)
 * - verified: boolean (optional)
 * - sortBy: string (optional: date, rating, helpful)
 *
 * TODO: Implement review querying
 * TODO: Filter by product ID (required)
 * TODO: Add pagination
 * TODO: Return rating distribution (1-5 stars count)
 * TODO: Add cache headers
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const featured = searchParams.get("featured") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const status = searchParams.get("status");
    const rating = searchParams.get("rating")
      ? parseInt(searchParams.get("rating")!)
      : undefined;
    const verified = searchParams.get("verified") === "true";
    const sortBy = searchParams.get("sortBy") || "date";

    // Handle featured reviews query (no productId required)
    if (featured && status === "approved") {
      const featuredReviews = await reviewRepository.findFeatured(limit);
      return NextResponse.json(
        {
          success: true,
          data: featuredReviews,
          meta: {
            page: 1,
            limit,
            total: featuredReviews.length,
            totalPages: 1,
            hasMore: false,
          },
        },
        {
          headers: {
            "Cache-Control":
              "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
          },
        },
      );
    }

    // Require productId parameter for product-specific reviews
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 },
      );
    }

    // Fetch all reviews for the product (for stats calculation)
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

    // Filter reviews based on criteria
    let filteredReviews = allReviews.filter((review) => {
      // Only show approved reviews by default (unless user is admin/moderator)
      if (!status && review.status !== "approved") return false;
      if (status && review.status !== status) return false;
      if (rating && review.rating !== rating) return false;
      if (verified && !review.verified) return false;
      return true;
    });

    // Sort reviews
    filteredReviews.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "helpful")
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      // Default: sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Paginate results
    const total = filteredReviews.length;
    const startIndex = (page - 1) * limit;
    const paginatedReviews = filteredReviews.slice(
      startIndex,
      startIndex + limit,
    );

    return NextResponse.json(
      {
        success: true,
        data: paginatedReviews,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: startIndex + limit < total,
          ratingDistribution,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=120, s-maxage=300, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.REVIEWS_GET_ERROR, { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

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
 * TODO: Implement review creation
 * TODO: Require authentication
 * TODO: Verify user purchased the product
 * TODO: Prevent duplicate reviews (one per product per user)
 * TODO: Validate rating (1-5)
 * TODO: Default status to 'pending' for moderation
 * TODO: Send notification to product seller and admins
 * TODO: Return created review
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(reviewCreateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
      );
    }

    // Check if user already reviewed this product
    const existingReviews = await reviewRepository.findByProduct(
      validation.data.productId,
    );
    const userReview = existingReviews.find((r) => r.userId === user.uid);

    if (userReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this product" },
        { status: 400 },
      );
    }

    // TODO (Future): Verify user purchased the product
    // const hasPurchased = await orderRepository.hasUserPurchased(
    //   user.uid,
    //   validation.data.productId
    // );
    const verified = false; // For now, set to false (implement purchase verification later)

    // Create review with moderation status
    const review = await reviewRepository.create({
      ...validation.data,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || undefined,
      verified,
      status: "pending" as any, // Requires moderation before appearing publicly
    } as any);

    return NextResponse.json(
      {
        success: true,
        data: review,
        message:
          "Review submitted successfully. It will be visible after moderation.",
      },
      { status: 201 },
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.REVIEWS_POST_ERROR, { error });

    // Handle authentication errors
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    );
  }
}
