/**
 * Review Details API Route
 *
 * Handles individual review operations with authentication.
 *
 * @route GET /api/reviews/[slug] - Get review details
 * @route PUT /api/reviews/[slug] - Update review (requires auth, ownership)
 * @route DELETE /api/reviews/[slug] - Delete review (requires auth, ownership)
 *
 * @example
 * ```tsx
 * // Get review
 * const response = await fetch('/api/reviews/review-123456-abc');
 *
 * // Update review
 * const response = await fetch('/api/reviews/review-123456-abc', {
 *   method: 'PUT',
 *   body: JSON.stringify({ rating: 5, title: 'Updated', comment: 'Better now' })
 * });
 *
 * // Delete review
 * const response = await fetch('/api/reviews/review-123456-abc', {
 *   method: 'DELETE'
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  collection,
  deleteDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
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

/**
 * PUT /api/reviews/[slug]
 *
 * Update a review (owner only).
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { slug } = await params;

    const body = await request.json();
    const { rating, title, comment, images, pros, cons } = body;

    // Validate required fields
    if (!rating || !title || !comment) {
      return NextResponse.json(
        { error: "Rating, title, and comment are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

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
    const reviewData = reviewDoc.data();

    // Verify ownership
    if (reviewData.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update review
    const updateData: any = {
      rating,
      title,
      comment,
      updatedAt: serverTimestamp(),
    };

    if (images !== undefined) updateData.images = images;
    if (pros !== undefined) updateData.pros = pros;
    if (cons !== undefined) updateData.cons = cons;

    await updateDoc(reviewDoc.ref, updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Review updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating review:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update review", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/reviews/[slug]
 *
 * Delete a review (owner only).
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
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
    const reviewData = reviewDoc.data();

    // Verify ownership
    if (reviewData.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete review
    await deleteDoc(reviewDoc.ref);

    // Update product/auction review count
    if (reviewData.productSlug) {
      const productQuery = query(
        collection(db, "products"),
        where("slug", "==", reviewData.productSlug),
      );
      const productSnapshot = await getDocs(productQuery);
      if (!productSnapshot.empty) {
        const productDoc = productSnapshot.docs[0];
        await updateDoc(productDoc.ref, {
          reviewCount: increment(-1),
        });
      }
    } else if (reviewData.auctionSlug) {
      const auctionQuery = query(
        collection(db, "auctions"),
        where("slug", "==", reviewData.auctionSlug),
      );
      const auctionSnapshot = await getDocs(auctionQuery);
      if (!auctionSnapshot.empty) {
        const auctionDoc = auctionSnapshot.docs[0];
        await updateDoc(auctionDoc.ref, {
          reviewCount: increment(-1),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting review:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete review", details: error.message },
      { status: 500 },
    );
  }
}
