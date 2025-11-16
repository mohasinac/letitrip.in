import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Unified Reviews API with RBAC
 * GET: List reviews (public: approved only, admin: all)
 * POST: Create review (authenticated users only)
 */

// GET /api/reviews - List reviews (filtered by product/shop/user)
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("product_id");
    const shopId = searchParams.get("shop_id");
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db
      .collection(COLLECTIONS.REVIEWS)
      .orderBy("created_at", "desc");

    // Role-based filtering
    if (!user || user.role !== "admin") {
      // Public users only see approved reviews
      query = query.where("status", "==", "published");
    }
    // Admin sees all reviews

    // Apply filters
    if (productId) {
      query = query.where("product_id", "==", productId);
    }
    if (shopId) {
      query = query.where("shop_id", "==", shopId);
    }
    if (userId) {
      query = query.where("user_id", "==", userId);
    }

    // Pagination
    query = query.limit(limit).offset(offset);

    const snapshot = await query.get();
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate stats if filtering by product
    let stats = null;
    if (productId) {
      const allReviewsSnapshot = await db
        .collection(COLLECTIONS.REVIEWS)
        .where("product_id", "==", productId)
        .get();

      const allReviews = allReviewsSnapshot.docs.map((doc) => doc.data());
      const totalReviews = allReviews.length;

      if (totalReviews > 0) {
        const totalRating = allReviews.reduce(
          (sum: number, r: any) => sum + r.rating,
          0
        );
        const averageRating = totalRating / totalReviews;

        const ratingDistribution = {
          5: allReviews.filter((r: any) => r.rating === 5).length,
          4: allReviews.filter((r: any) => r.rating === 4).length,
          3: allReviews.filter((r: any) => r.rating === 3).length,
          2: allReviews.filter((r: any) => r.rating === 2).length,
          1: allReviews.filter((r: any) => r.rating === 1).length,
        };

        stats = {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
        };
      }
    }

    return NextResponse.json({
      success: true,
      reviews,
      stats,
      pagination: {
        limit,
        offset,
        total: reviews.length,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create review
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const db = getFirestoreAdmin();
    const body = await req.json();

    const { product_id, order_id, rating, title, comment, images } = body;

    // Validate required fields
    if (!product_id || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, rating, comment" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await db
      .collection(COLLECTIONS.REVIEWS)
      .where("product_id", "==", product_id)
      .where("user_id", "==", user.uid)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Get product details for shop_id
    const productDoc = await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(product_id)
      .get();
    if (!productDoc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productDoc.data();

    // Create review
    const reviewData = {
      user_id: user.uid,
      product_id,
      shop_id: product?.shop_id,
      order_id: order_id || null,
      rating,
      title: title || "",
      comment,
      images: images || [],
      verified_purchase: !!order_id,
      helpful_count: 0,
      status: "published", // or "pending" for moderation
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTIONS.REVIEWS).add(reviewData);

    return NextResponse.json(
      {
        success: true,
        review: {
          id: docRef.id,
          ...reviewData,
        },
        message: "Review created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
