import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  createPaginationMeta,
  parseSieveQuery,
  reviewsSieveConfig,
} from "@/app/api/lib/sieve";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for reviews
const reviewsConfig = {
  ...reviewsSieveConfig,
  fieldMappings: {
    productId: "product_id",
    shopId: "shop_id",
    userId: "user_id",
    orderId: "order_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
    helpfulCount: "helpful_count",
    verifiedPurchase: "verified_purchase",
  } as Record<string, string>,
};

/**
 * Transform review document to API response format
 */
function transformReview(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases
    productId: data.product_id,
    shopId: data.shop_id,
    userId: data.user_id,
    orderId: data.order_id,
    helpfulCount: data.helpful_count,
    verifiedPurchase: data.verified_purchase,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/reviews
 * List reviews with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-rating&filters=productId==xxx
 *
 * Role-based filtering:
 * - Public: Published reviews only
 * - Admin: All reviews
 */
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);

    // Parse Sieve query
    const {
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, reviewsConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Legacy filter params (backward compatibility)
    const productId =
      searchParams.get("product_id") || searchParams.get("productId");
    const shopId = searchParams.get("shop_id") || searchParams.get("shopId");
    const userId = searchParams.get("user_id") || searchParams.get("userId");
    const status = searchParams.get("status");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const verified = searchParams.get("verified");

    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.REVIEWS);

    // Role-based filtering
    if (!user || user.role !== "admin") {
      query = query.where("status", "==", "published");
    } else if (status) {
      query = query.where("status", "==", status);
    }

    // Apply legacy filters (backward compatibility)
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

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = reviewsConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(
          dbField,
          filter.operator as FirebaseFirestore.WhereFilterOp,
          filter.value
        );
      }
    }

    // Rating range (legacy support)
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

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = reviewsConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      // Default sort
      query = query.orderBy("created_at", "desc");
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0) {
      const skipSnapshot = await query.limit(offset).get();
      const lastDoc = skipSnapshot.docs.at(-1);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const reviews = snapshot.docs.map((doc) =>
      transformReview(doc.id, doc.data())
    );

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

    // Build Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination,
      stats,
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
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
