import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import { getCurrentUser } from "@/app/api/lib/session";

// POST /api/reviews/[id]/helpful - Mark review as helpful
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { id } = await params;

    // Get user from session
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }
    const userId = user.id;

    // Check if review exists
    const doc = await db.collection(COLLECTIONS.REVIEWS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if user already marked as helpful (using subcollection)
    const helpfulDoc = await db
      .collection(COLLECTIONS.REVIEWS)
      .doc(id)
      .collection(SUBCOLLECTIONS.REVIEW_HELPFUL_VOTES)
      .doc(userId)
      .get();

    if (helpfulDoc.exists) {
      return NextResponse.json(
        { error: "You have already marked this review as helpful" },
        { status: 400 },
      );
    }

    // Add helpful vote
    await db
      .collection(COLLECTIONS.REVIEWS)
      .doc(id)
      .collection(SUBCOLLECTIONS.REVIEW_HELPFUL_VOTES)
      .doc(userId)
      .set({
        user_id: userId,
        created_at: new Date().toISOString(),
      });

    // Increment helpful count
    await db
      .collection(COLLECTIONS.REVIEWS)
      .doc(id)
      .update({
        helpful_count: (doc.data()?.helpful_count || 0) + 1,
      });

    return NextResponse.json({
      message: "Review marked as helpful",
      helpful_count: (doc.data()?.helpful_count || 0) + 1,
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return NextResponse.json(
      { error: "Failed to mark review as helpful" },
      { status: 500 },
    );
  }
}
