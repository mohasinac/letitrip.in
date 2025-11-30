import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, buyers } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: "Products data required" }, { status: 400 });
    }

    if (!buyers || !Array.isArray(buyers) || buyers.length === 0) {
      return NextResponse.json({ success: false, error: "Buyers data required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    let totalReviews = 0;

    const REVIEW_TITLES = ["Great!", "Excellent!", "Amazing!", "Perfect!", "Love it!", "Fantastic!", "Superb!", "Outstanding!"];
    const REVIEW_COMMENTS = [
      "Fantastic product, highly recommended!",
      "Exactly as described, fast shipping!",
      "Great quality, will buy again!",
      "Perfect condition, very happy!",
      "Exceeded my expectations!",
      "Authentic and well packaged!",
      "Amazing seller, quick response!",
      "Best purchase I've made!",
    ];

    for (const productId of products) {
      const numReviews = 1 + Math.floor(Math.random() * 3);
      const ratings: number[] = [];

      for (let r = 0; r < numReviews; r++) {
        const reviewer = buyers[Math.floor(Math.random() * buyers.length)];
        const rating = 3 + Math.floor(Math.random() * 3);
        ratings.push(rating);

        const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc();
        await reviewRef.set({
          product_id: productId,
          user_id: reviewer.id,
          user_name: reviewer.name,
          rating,
          title: REVIEW_TITLES[r % REVIEW_TITLES.length],
          comment: REVIEW_COMMENTS[r % REVIEW_COMMENTS.length],
          is_verified: Math.random() > 0.2,
          helpful_count: Math.floor(Math.random() * 30),
          created_at: timestamp,
          updated_at: timestamp,
        });
        totalReviews++;
      }

      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      await db.collection(COLLECTIONS.PRODUCTS).doc(productId).update({
        review_count: numReviews,
        average_rating: Math.round(avgRating * 10) / 10,
      });
    }

    return NextResponse.json({
      success: true,
      step: "reviews",
      data: {
        count: totalReviews,
      },
    });
  } catch (error: unknown) {
    console.error("Demo reviews error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate reviews";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
