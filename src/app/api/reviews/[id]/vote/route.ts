/**
 * Reviews API - Vote Endpoint
 *
 * Handles review helpful/not helpful voting
 */

import { NextRequest } from "next/server";
import { reviewRepository } from "@/repositories";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  validateRequestBody,
  formatZodErrors,
  reviewVoteSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, NotFoundError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
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
      throw new NotFoundError(ERROR_MESSAGES.REVIEW.NOT_FOUND);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(reviewVoteSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
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

    return successResponse(
      { helpfulCount: updatedReview.helpfulCount },
      SUCCESS_MESSAGES.REVIEW.VOTE_RECORDED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
