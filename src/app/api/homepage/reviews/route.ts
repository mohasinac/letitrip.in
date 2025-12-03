import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minRating = parseInt(searchParams.get("minRating") || "4", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const db = getFirestoreAdmin();

    // Get recent high-rated reviews
    const reviewsSnapshot = await db
      .collection(COLLECTIONS.REVIEWS)
      .where("isApproved", "==", true)
      .where("rating", ">=", minRating)
      .orderBy("rating", "desc")
      .orderBy("created_at", "desc")
      .limit(limit)
      .get();

    const reviews = reviewsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: data.product_id,
        userId: data.user_id,
        userName: data.user_name,
        userAvatar: data.user_avatar,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        images: data.images || [],
        verifiedPurchase: data.verifiedPurchase || data.is_verified || false,
        createdAt: data.created_at,
      };
    });

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error("Recent reviews error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch recent reviews" },
      { status: 500 },
    );
  }
}
