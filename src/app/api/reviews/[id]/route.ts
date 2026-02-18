/**
 * Reviews API - Individual Review Routes
 *
 * Handles individual review operations
 */

import { NextRequest } from "next/server";
import { reviewRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import {
  requireAuthFromRequest,
  requireRoleFromRequest,
} from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  reviewUpdateSchema,
} from "@/lib/validation/schemas";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/reviews/[id]
 *
 * Get review by ID
 *
 * Public access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Fetch review
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundError(ERROR_MESSAGES.REVIEW.NOT_FOUND);
    }

    return successResponse(review);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/reviews/[id]
 *
 * Update review
 *
 * Requires authentication and ownership (or moderator/admin role)
 */
export async function PATCH(
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

    // Check ownership or admin/moderator role
    const isOwner = review.userId === user.uid;
    const isModerator = ["moderator", "admin"].includes(user.role);

    if (!isOwner && !isModerator) {
      throw new AuthorizationError(ERROR_MESSAGES.REVIEW.UPDATE_NOT_ALLOWED);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(reviewUpdateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Update review
    const updatedReview = await reviewRepository.update(id, validation.data);

    return successResponse(updatedReview);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/reviews/[id]
 *
 * Delete review
 *
 * Requires authentication and ownership (or moderator/admin role)
 */
export async function DELETE(
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

    // Check ownership or admin/moderator role
    const isOwner = review.userId === user.uid;
    const isModerator = ["moderator", "admin"].includes(user.role);

    if (!isOwner && !isModerator) {
      throw new AuthorizationError(ERROR_MESSAGES.REVIEW.DELETE_NOT_ALLOWED);
    }

    // Delete review (hard delete - reviews can be removed completely)
    await reviewRepository.delete(id);

    return successResponse(undefined, SUCCESS_MESSAGES.REVIEW.DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
