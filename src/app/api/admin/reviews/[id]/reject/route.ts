/**
 * Admin Review Rejection API Route
 *
 * POST /api/admin/reviews/[id]/reject - Reject review
 */

import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants/messages";

/**
 * POST /api/admin/reviews/[id]/reject
 * Reject a review with reason (admin/moderator only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    const { id } = await params;
    // Check if review exists
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);
    }

    // Get rejection reason from request body
    const body = await request.json();
    const { reason, moderatorNote } = body;

    if (!reason) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    // Reject review
    const updated = await reviewRepository.reject(
      id,
      user.uid,
      reason,
      moderatorNote,
    );

    return NextResponse.json({
      success: true,
      message: "Review rejected successfully",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
