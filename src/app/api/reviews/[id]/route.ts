import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Individual Review Operations with RBAC
 * GET: Retrieve review (public if approved, owner/admin all)
 * PATCH: Update review (owner/admin only)
 * DELETE: Delete review (owner/admin only)
 */

// GET /api/reviews/[id] - Get review details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const user = await getUserFromRequest(req);
    const { id } = await params;

    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const review: any = doc.data();

    // Access control: public can only see published reviews
    if (!user || user.role !== "admin") {
      if (review.status !== "published") {
        // Owner can see their own unpublished reviews
        if (!user || review.user_id !== user.uid) {
          return NextResponse.json(
            { success: false, error: "Review not found" },
            { status: 404 },
          );
        }
      }
    }
    // Admin can see all reviews

    return NextResponse.json({
      success: true,
      review: {
        id: doc.id,
        ...review,
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 },
    );
  }
}

// PATCH /api/reviews/[id] - Update review
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();
    const { id } = await params;
    const body = await req.json();

    // Check if review exists
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const review = doc.data();
    const isOwner = review?.user_id === user.uid;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own reviews" },
        { status: 403 },
      );
    }

    // Allowed fields to update
    const allowedUpdates = isAdmin
      ? ["rating", "title", "comment", "images", "status", "is_flagged"]
      : ["rating", "title", "comment", "images"];

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Validate rating if provided
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    await db.collection(COLLECTIONS.REVIEWS).doc(id).update(updates);

    const updatedDoc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();

    return NextResponse.json({
      success: true,
      review: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 },
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();
    const { id } = await params;

    // Check if review exists
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const review = doc.data();
    const isOwner = review?.user_id === user.uid;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own reviews" },
        { status: 403 },
      );
    }

    await db.collection(COLLECTIONS.REVIEWS).doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 },
    );
  }
}
