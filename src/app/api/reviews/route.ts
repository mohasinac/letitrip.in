/**
 * @fileoverview TypeScript Module
 * @module src/app/api/reviews/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { reviewsSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for reviews
const reviewsConfig = {
  ...reviewsSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Product Id */
    productId: "product_id",
    /** Shop Id */
    shopId: "shop_id",
    /** User Id */
    userId: "user_id",
    /** Order Id */
    orderId: "order_id",
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Helpful Count */
    helpfulCount: "helpful_count",
    /** Verified Purchase */
    verifiedPurchase: "verified_purchase",
  } as Record<string, string>,
};

/**
 * Transform review document to API response format
 */
/**
 * Transforms review
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformreview result
 */

/**
 * Transforms review
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformreview result
 */

function transformReview(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases
    /** Product Id */
    productId: data.product_id,
    /** Shop Id */
    shopId: data.shop_id,
    /** User Id */
    userId: data.user_id,
    /** Order Id */
    orderId: data.order_id,
    /** Helpful Count */
    helpfulCount: data.helpful_count,
    /** Verified Purchase */
    verifiedPurchase: data.verified_purchase,
    /** Created At */
    createdAt: data.created_at,
    /** Updated At */
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
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);

    // Parse Sieve query
    const {
      /** Query */
      query: sieveQuery,
      errors,
      warnings,
    } = parseSieveQuery(searchParams, reviewsConfig);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Invalid query parameters",
          /** Details */
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
    /**
     * Performs offset operation
     *
     * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    /**
     * Performs offset operation
     *
     * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

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
    /**
 * Performs reviews operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The reviews result
 *
 */
const reviews = snapshot.docs.map((doc) =>
      transformReview(doc.id, doc.data())
    );

    // Calculate stats if filtering by product
    let stats = null;
    if (productId) {
      const allReviewsSnapshot = await db
        .collection(COLLECTIONS.REVIEWS)
 /**
 * Performs all reviews operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The allreviews result
 *
 */
       .where("product_id", "==", productId)
        .where("status", "==", "published")
        .get();

      const allReviews = allReviewsSnapshot.docs.map((doc) => doc.data());
      const totalReviews = allRevie/**
 * Performs rating distribution operation
 *
 * @param {any} (r - The (r
 *
 * @returns {any} The ratingdistribution result
 *
 */
ws.length;

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
          /** Average Rating */
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
        };
      }
    }

    // Build Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: reviews,
      pagination,
      stats,
      /** Meta */
      meta: {
        /** Applied Filters */
        appliedFilters: sieveQuery.filters,
        /** Applied Sorts */
        appliedSorts: sieveQuery.sorts,
        /** Warnings */
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    logError(error as Error, { component: "API.reviews.GET" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create review
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  let product_id: string | undefined;
  let user: any;
  try {
    const authResult = await requireAuth(req);
    if (authResult.error) return authResult.error;

    user = authResult.user;
    const db = getFirestoreAdmin();
    const body = await req.json();

    product_id = body.product_id;
    const { order_id, rating, title, comment, images } = body;

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
      /** Title */
      title: title || "",
      comment,
      /** Images */
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
        /** Success */
        success: true,
        /** Review */
        review: {
          /** Id */
          id: docRef.id,
          ...reviewData,
        },
        /** Message */
        message: "Review created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.reviews.POST",
      /** Metadata */
      metadata: { product_id, userId: user?.uid },
    });
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
