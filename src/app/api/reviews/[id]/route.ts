/**
 * Reviews API - Individual Review Routes
 *
 * Handles individual review operations
 */

import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
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
      throw new NotFoundError("Review not found");
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    const { id } = await params;
    serverLogger.error(
      `GET /api/reviews/${id} ${ERROR_MESSAGES.API.REVIEWS_ID_GET_ERROR}`,
      { error },
    );

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 },
    );
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
      throw new NotFoundError("Review not found");
    }

    // Check ownership or admin/moderator role
    const isOwner = review.userId === user.uid;
    const isModerator = ["moderator", "admin"].includes(user.role);

    if (!isOwner && !isModerator) {
      throw new AuthorizationError(
        "You do not have permission to update this review",
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(reviewUpdateSchema, body);

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

    // Update review
    const updatedReview = await reviewRepository.update(id, validation.data);

    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    const { id } = await params;
    serverLogger.error(
      `PATCH /api/reviews/${id} ${ERROR_MESSAGES.API.REVIEWS_ID_PATCH_ERROR}`,
      { error },
    );

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 },
    );
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
      throw new NotFoundError("Review not found");
    }

    // Check ownership or admin/moderator role
    const isOwner = review.userId === user.uid;
    const isModerator = ["moderator", "admin"].includes(user.role);

    if (!isOwner && !isModerator) {
      throw new AuthorizationError(
        "You do not have permission to delete this review",
      );
    }

    // Delete review (hard delete - reviews can be removed completely)
    await reviewRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    const { id } = await params;
    serverLogger.error(
      `DELETE /api/reviews/${id} ${ERROR_MESSAGES.API.REVIEWS_ID_DELETE_ERROR}`,
      { error },
    );

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 },
    );
  }
}
