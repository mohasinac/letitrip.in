/**
 * @fileoverview TypeScript Module
 * @module src/app/api/homepage/reviews/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

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

    /**
 * Performs reviews operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The reviews result
 *
 */
const reviews = reviewsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        /** Id */
        id: doc.id,
        /** Product Id */
        productId: data.product_id,
        /** User Id */
        userId: data.user_id,
        /** User Name */
        userName: data.user_name,
        /** User Avatar */
        userAvatar: data.user_avatar,
        /** Rating */
        rating: data.rating,
        /** Title */
        title: data.title,
        /** Comment */
        comment: data.comment,
        /** Images */
        images: data.images || [],
        /** Verified Purchase */
        verifiedPurchase: data.verifiedPurchase || data.is_verified || false,
        /** Created At */
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
