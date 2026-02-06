/**
 * Admin Reviews API Route
 *
 * GET /api/admin/reviews - List all reviews
 */

import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import type { ReviewStatus } from "@/db/schema/reviews";

/**
 * GET /api/admin/reviews
 * List all reviews with optional filtering (admin/moderator only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and role
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ReviewStatus | null;
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");

    // Fetch reviews based on filters
    let reviews;
    if (status) {
      reviews = await reviewRepository.findByStatus(status);
    } else if (productId) {
      reviews = await reviewRepository.findByProduct(productId);
    } else if (userId) {
      reviews = await reviewRepository.findByUser(userId);
    } else {
      reviews = await reviewRepository.findAll();
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
