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

    // Pagination params
    const startAfter = searchParams.get("startAfter");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Filter params
    const productId = searchParams.get("product_id");
    const shopId = searchParams.get("shop_id");
    const userId = searchParams.get("user_id");
    const status = searchParams.get("status");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const verified = searchParams.get("verified");

    // Sort params
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.REVIEWS);

    // Role-based filtering
    if (!user || user.role !== "admin") {
      // Public users only see published reviews
      query = query.where("status", "==", "published");
    } else if (status) {
      // Admin can filter by status
      query = query.where("status", "==", status);
    }

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
    if (verified === "true") {
      query = query.where("verified_purchase", "==", true);
    }

    // Rating range filters (only if sorting by rating)
    const validSortFields = ["created_at", "rating", "helpful_count"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";

    if (sortField === "rating") {
      if (minRating) {
        const minRatingNum = parseInt(minRating);
        if (!isNaN(minRatingNum) && minRatingNum >= 1 && minRatingNum <= 5) {
          query = query.where("rating", ">=", minRatingNum);
        }
      }
      if (maxRating) {
        const maxRatingNum = parseInt(maxRating);
        if (!isNaN(maxRatingNum) && maxRatingNum >= 1 && maxRatingNum <= 5) {
          query = query.where("rating", "<=", maxRatingNum);
        }
      }
    }

    // Add sorting
    query = query.orderBy(sortField, sortOrder);

    // Apply cursor pagination
    if (startAfter) {
      const startDoc = await db
        .collection(COLLECTIONS.REVIEWS)
        .doc(startAfter)
        .get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch limit + 1 to check if there's a next page
    query = query.limit(limit + 1);
    const snapshot = await query.get();
    const docs = snapshot.docs;

    // Check if there's a next page
    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    // Transform data
    const reviews = resultDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get next cursor
    const nextCursor =
      hasNextPage && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

    // Calculate stats if filtering by product
    let stats = null;
    if (productId) {
      const allReviewsSnapshot = await db
        .collection(COLLECTIONS.REVIEWS)
        .where("product_id", "==", productId)
        .where("status", "==", "published")
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
      data: reviews,
      count: reviews.length,
      stats,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
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
