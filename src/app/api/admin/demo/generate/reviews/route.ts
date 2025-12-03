import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

// Review images for product photos uploaded by customers
const REVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1598808503491-fa80d3e5a0d9?w=400&h=400&fit=crop",
];

// Review videos
const REVIEW_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, buyers, scale = 10 } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: "Products data required" }, { status: 400 });
    }

    if (!buyers || !Array.isArray(buyers) || buyers.length === 0) {
      return NextResponse.json({ success: false, error: "Buyers data required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    let totalReviews = 0;

    const REVIEW_TITLES = ["Great!", "Excellent!", "Amazing!", "Perfect!", "Love it!", "Fantastic!", "Superb!", "Outstanding!", "Worth it!", "Highly Recommended!"];
    const REVIEW_COMMENTS = [
      "Fantastic product, highly recommended! Exactly what I was looking for.",
      "Exactly as described, fast shipping! The seller was very responsive.",
      "Great quality, will buy again! Authentic and well packaged.",
      "Perfect condition, very happy! Card is mint and worth every penny.",
      "Exceeded my expectations! Arrived faster than expected.",
      "Authentic and well packaged! Great addition to my collection.",
      "Amazing seller, quick response! Will definitely order again.",
      "Best purchase I've made! The quality is outstanding.",
      "Five stars all the way! This seller really knows their stuff.",
      "Absolutely love it! Great communication and fast delivery.",
    ];

    // Pre-fetch product data to get shop_id
    const productDocs = await Promise.all(
      products.map((productId: string) => 
        db.collection(COLLECTIONS.PRODUCTS).doc(productId).get()
      )
    );
    const productShopMap: Record<string, string> = {};
    for (const doc of productDocs) {
      if (doc.exists) {
        const data = doc.data();
        productShopMap[doc.id] = data?.shop_id || "";
      }
    }

    for (const productId of products) {
      const shopId = productShopMap[productId] || "";
      // Number of reviews scales with scale parameter (1-2 reviews per product at scale 10)
      const numReviews = Math.max(1, Math.min(Math.floor(scale / 10 * (1 + Math.floor(Math.random() * 1))), 2));
      const ratings: number[] = [];

      for (let r = 0; r < numReviews; r++) {
        const reviewer = buyers[Math.floor(Math.random() * buyers.length)];
        const rating = 3 + Math.floor(Math.random() * 3);
        ratings.push(rating);

        // 40% of reviews have images, 15% have videos
        const hasImages = Math.random() < 0.4;
        const hasVideo = Math.random() < 0.15;
        const numImages = hasImages ? 1 + Math.floor(Math.random() * 3) : 0;
        const reviewImages = hasImages 
          ? Array.from({ length: numImages }, (_, idx) => REVIEW_IMAGES[(totalReviews + idx) % REVIEW_IMAGES.length])
          : [];
        const reviewVideo = hasVideo ? REVIEW_VIDEOS[totalReviews % REVIEW_VIDEOS.length] : null;

        const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc();
        await reviewRef.set({
          product_id: productId,
          shop_id: shopId,
          user_id: reviewer.id,
          user_name: `${DEMO_PREFIX}${reviewer.name}`,
          user_avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop`,
          rating,
          title: REVIEW_TITLES[r % REVIEW_TITLES.length],
          comment: REVIEW_COMMENTS[r % REVIEW_COMMENTS.length],
          pros: ["Great quality", "Fast shipping", "Authentic product"].slice(0, 1 + Math.floor(Math.random() * 2)),
          cons: rating < 4 ? ["Packaging could be better"] : [],
          images: reviewImages,
          video: reviewVideo,
          status: "published",
          isApproved: true,
          verifiedPurchase: Math.random() > 0.2,
          is_verified: Math.random() > 0.2,
          is_featured: Math.random() > 0.9,
          helpful_count: Math.floor(Math.random() * 50),
          not_helpful_count: Math.floor(Math.random() * 5),
          seller_response: Math.random() > 0.7 ? {
            message: "Thank you for your review! We appreciate your feedback.",
            responded_at: timestamp,
          } : null,
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
