/**
 * Admin Review Approval API Route
 *
 * POST /api/admin/reviews/[id]/approve - Approve review
 */

import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants/messages";

/**
 * POST /api/admin/reviews/[id]/approve
 * Approve a review (admin/moderator only)
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

    // Get optional moderator note from request body
    const body = await request.json().catch(() => ({}));
    const { moderatorNote } = body;

    // Approve review
    const updated = await reviewRepository.approve(id, user.uid, moderatorNote);

    return NextResponse.json({
      success: true,
      message: "Review approved successfully",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
