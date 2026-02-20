/**
 * Reviews API Routes
 *
 * Handles product review creation and listing
 *
 * TODO (Future) - Phase 2:
 * - Implement pagination and filtering
 * - Add review moderation workflow
 * - Implement review voting (helpful/not helpful)
 * - Add spam detection with ML/AI
 * - Implement review verification (purchased product)
 * - Add review response from sellers
 * - Calculate product rating aggregates
 * - Implement review analytics
 */

import { NextRequest } from "next/server";
import { reviewRepository } from "@/repositories";
import { applySieveToArray } from "@/helpers";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  getBooleanParam,
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, UI_LABELS } from "@/constants";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import {
  validateRequestBody,
  formatZodErrors,
  reviewCreateSchema,
} from "@/lib/validation/schemas";
import { handleApiError } from "@/lib/errors/error-handler";
import { serverLogger } from "@/lib/server-logger";
import { NextResponse } from "next/server";

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
export async function GET(request: NextRequest) {
  try {
    // Rate limiting — public read endpoint
    const rateLimitResult = await applyRateLimit(request, RateLimitPresets.API);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED },
        { status: 429 },
      );
    }

    // Parse query parameters
    const searchParams = getSearchParams(request);
    const productId = getStringParam(searchParams, "productId");
    const featured = getBooleanParam(searchParams, "featured") === true;
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
      const response = NextResponse.json(
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
        { status: 200 },
      );
      response.headers.set(
        "Cache-Control",
        "public, max-age=300, s-maxage=600, stale-while-revalidate=120",
      );
      return response;
    }

    // Require productId parameter for product-specific reviews
    if (!productId) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.PRODUCT_ID_REQUIRED, 400);
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

    const response = NextResponse.json(
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
          averageRating: Math.round(averageRating * 10) / 10,
        },
      },
      { status: 200 },
    );
    response.headers.set(
      "Cache-Control",
      "public, max-age=120, s-maxage=300, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.REVIEWS_GET_ERROR, { error });
    return handleApiError(error);
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
 * Ã¢Å“â€¦ Requires authentication via requireAuthFromRequest
 * Ã¢Å“â€¦ Validates body with reviewCreateSchema (Zod, includes rating 1-5 validation)
 * Ã¢Å“â€¦ Prevents duplicate reviews (checks existing reviews for same userId+productId)
 * Ã¢Å“â€¦ Status defaults to 'pending' for moderation
 * Ã¢Å“â€¦ Returns created review with 201 status
 * TODO (Future): Verify user purchased the product (requires order lookup)
 * TODO (Future): Send notification to product seller and admins on new review
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(reviewCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Check if user already reviewed this product
    const existingReviews = await reviewRepository.findByProduct(
      validation.data.productId,
    );
    const userReview = existingReviews.find((r) => r.userId === user.uid);

    if (userReview) {
      return errorResponse(ERROR_MESSAGES.REVIEW.ALREADY_REVIEWED, 400);
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

    return successResponse(
      review,
      SUCCESS_MESSAGES.REVIEW.SUBMITTED_PENDING_MODERATION,
      201,
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.REVIEWS_POST_ERROR, { error });
    return handleApiError(error);
  }
}
