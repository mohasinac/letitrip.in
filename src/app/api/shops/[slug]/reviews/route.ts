/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/[slug]/reviews/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextResponse } from "next/server";

/**
 * GET /api/shops/[slug]/reviews
 * Fetch reviews for a specific shop
 */
/**
 * Performs g e t operation
 *
 * @param {Request} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {Request} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

export async function GET(
  /** Request */
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // First, get the shop by slug
    const shopsSnapshot = await Collections.shops()
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (shopsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    }

    const shopDoc = shopsSnapshot.docs[0];
    const shopId = shopDoc.id;

    // Build reviews query
    let query = Collections.reviews()
      .where("shopId", "==", shopId)
      .orderBy("createdAt", "desc") as any;

    // Apply pagination
    /**
     * Performs offset operation
     *
     * @param {any} page - 1) * limit;
    if (offset > 0 - The page - 1) * limit;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    /**
     * Performs offset operation
     *
     * @param {any} page - 1) * limit;
    if (offset > 0 - The page - 1) * limit;
    if (offset > 0
     *
     * @returns {any} The offset result
     */

    const offset = (page - 1) * limit;
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      const lastDoc = offsetSnapshot.docs.at(-1);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limit);

    // Execute query
    const reviewsSnapshot = await query.get();

    const reviews = reviewsSnapshot.docs.map((doc: any) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count
    const totalSnapshot = await Collections.reviews()
      .where("shopId", "==", shopId)
      .count()
      .get();

    const total = totalSnapshot.data().count;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      /** Success */
      success: true,
      reviews,
      /** Pagination */
      pagination: {
        page,
        limit,
        total,
        totalPages,
        /** Has Next */
        hasNext: page < totalPages,
        /** Has Prev */
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.reviews",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch shop reviews",
      },
      { status: 500 },
    );
  }
}
