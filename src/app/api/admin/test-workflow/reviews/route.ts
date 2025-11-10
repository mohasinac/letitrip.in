import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { count = 4, userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: "userId and productId are required" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: "count must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    const comments = [
      "Great product, exactly as described!",
      "Good quality, fast shipping.",
      "Decent product for the price.",
      "Very satisfied with this purchase.",
      "Excellent quality and service!",
      "Would recommend to others."
    ];

    const createdIds: string[] = [];

    // Create reviews
    for (let i = 0; i < count; i++) {
      const reviewId = `TEST_REVIEW_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;

      const reviewData = {
        id: reviewId,
        productId,
        userId,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        comment: comments[Math.floor(Math.random() * comments.length)],
        verifiedPurchase: Math.random() > 0.3,
        helpful: Math.floor(Math.random() * 20),
        status: "approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("reviews").doc(reviewId).set(reviewData);
      createdIds.push(reviewId);
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test reviews created successfully`
    });
  } catch (error: any) {
    console.error("Error creating test reviews:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test reviews" },
      { status: 500 }
    );
  }
}
