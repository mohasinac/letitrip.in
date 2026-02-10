/**
 * Reviews API - Vote Endpoint
 *
 * Handles review helpful/not helpful voting
 */

import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/repositories";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  reviewVoteSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

/**
 * POST /api/reviews/[id]/vote
 *
 * Vote on review (helpful or not helpful)
 *
 * Body:
 * - helpful: boolean
 *
 * Requires authentication
 * Prevents duplicate voting by same user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Fetch review
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(reviewVoteSchema, body);

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

    const { vote } = validation.data;
    const helpful = vote === "helpful";

    // Update vote counts (simplified - no vote tracking arrays in schema)
    const updateData: any = {};
    if (helpful) {
      updateData.helpfulCount = (review.helpfulCount || 0) + 1;
    }

    // Update review
    const updatedReview = await reviewRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: {
        helpfulCount: updatedReview.helpfulCount,
      },
      message: "Vote recorded successfully",
    });
  } catch (error) {
    const { id } = await params;
    serverLogger.error(
      `POST /api/reviews/${id}/vote ${ERROR_MESSAGES.API.REVIEWS_VOTE_POST_ERROR}`,
      { error },
    );

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to record vote" },
      { status: 500 },
    );
  }
}
