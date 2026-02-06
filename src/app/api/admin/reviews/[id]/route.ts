/**
 * Admin Single Review API Route
 *
 * GET /api/admin/reviews/[id] - Get review details
 * PATCH /api/admin/reviews/[id] - Update review
 * DELETE /api/admin/reviews/[id] - Delete review
 */

import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants/messages";
import type { ReviewStatus } from "@/db/schema/reviews";

/**
 * GET /api/admin/reviews/[id]
 * Get review details (admin/moderator only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    const { id } = await params;
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/reviews/[id]
 * Update review (admin/moderator only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    const { id } = await params;
    const body = await request.json();
    const { status, moderatorNote, ...otherData } = body;

    // Validate status if provided
    if (status && !["pending", "approved", "rejected"].includes(status)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
    }

    // Check if review exists
    const existing = await reviewRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);
    }

    // Update review
    const updated = await reviewRepository.update(id, {
      ...(status && { status: status as ReviewStatus }),
      ...(moderatorNote && { moderatorNote, moderatorId: user.uid }),
      ...otherData,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete review (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin"]); // Only admin can delete

    const { id } = await params;
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);
    }

    await reviewRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
