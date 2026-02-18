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
import { applySieveToArray } from "@/helpers";
import { getSearchParams } from "@/lib/api/request-helpers";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
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
 * - filters: string (Sieve filters)
 * - sorts: string (Sieve sorts)
 * - page: number (default: 1)
 * - pageSize: number (default: 10, max: 50)
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
    const searchParams = getSearchParams(request);
    const productId = searchParams.get("productId");
    const featured = searchParams.get("featured") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "10", 10),
      50,
    );
    const filters = searchParams.get("filters") || undefined;
    const sorts = searchParams.get("sorts") || "-createdAt";

    // Handle featured reviews query (no productId required)
    if (featured) {
      const featuredReviews = await reviewRepository.findFeatured(pageSize);
      return NextResponse.json(
        {
          success: true,
          data: featuredReviews,
          meta: {
            page: 1,
            limit: pageSize,
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
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.PRODUCT_ID_REQUIRED,
        },
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

    const sieveResult = await applySieveToArray({
      items: allReviews,
      model: {
        filters: filters || "status==approved",
        sorts,
        page,
        pageSize,
      },
      fields: {
        status: { canFilter: true, canSort: false },
        rating: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => Number(value),
        },
        verified: {
          canFilter: true,
          canSort: false,
          parseValue: (value: string) => value === "true",
        },
        helpfulCount: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => Number(value),
        },
        createdAt: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => new Date(value),
        },
      },
      options: {
        defaultPageSize: 10,
        maxPageSize: 50,
        throwExceptions: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: sieveResult.items,
        meta: {
          page: sieveResult.page,
          limit: sieveResult.pageSize,
          total: sieveResult.total,
          totalPages: sieveResult.totalPages,
          hasMore: sieveResult.hasMore,
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
      { success: false, error: ERROR_MESSAGES.REVIEW.FETCH_FAILED },
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
          error: ERROR_MESSAGES.VALIDATION.FAILED,
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
        { success: false, error: ERROR_MESSAGES.REVIEW.ALREADY_REVIEWED },
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
        message: SUCCESS_MESSAGES.REVIEW.SUBMITTED_PENDING_MODERATION,
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
      { success: false, error: ERROR_MESSAGES.REVIEW.SUBMIT_FAILED },
      { status: 500 },
    );
  }
}
