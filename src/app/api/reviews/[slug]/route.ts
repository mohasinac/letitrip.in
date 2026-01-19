/**
 * Review Details API Route
 *
 * Handles fetching individual review details by slug.
 *
 * @route GET /api/reviews/[slug] - Get review details
 *
 * @example
 * ```tsx
 * // Get review
 * const response = await fetch('/api/reviews/review-123456-abc');
 * ```
 */

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/reviews/[slug]
 *
 * Get review details by slug.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    // Query review by slug
    const reviewQuery = query(
      collection(db, "reviews"),
      where("slug", "==", slug),
    );

    const querySnapshot = await getDocs(reviewQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const reviewDoc = querySnapshot.docs[0];
    const reviewData = {
      id: reviewDoc.id,
      ...reviewDoc.data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: reviewData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review", details: error.message },
      { status: 500 },
    );
  }
}
