import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

// GET /api/reviews/[id] - Get review details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;

    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Update review
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;
    const body = await req.json();

    // TODO: Get user_id from session
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if review exists and belongs to user
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const review = doc.data();
    if (review?.user_id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own reviews" },
        { status: 403 }
      );
    }

    // Allowed fields to update
    const allowedUpdates = ["rating", "title", "comment", "images"];
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
        { status: 400 }
      );
    }

    await db.collection(COLLECTIONS.REVIEWS).doc(id).update(updates);

    const updatedDoc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;

    // TODO: Get user_id from session
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if review exists and belongs to user
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const review = doc.data();
    if (review?.user_id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own reviews" },
        { status: 403 }
      );
    }

    await db.collection(COLLECTIONS.REVIEWS).doc(id).delete();

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
