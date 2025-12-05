/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/[slug]/products/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextResponse } from "next/server";

/**
 * GET /api/shops/[slug]/products
 * Fetch products for a specific shop
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

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

    // Build products query
    let query = Collections.products()
      .where("shopId", "==", shopId)
      .where("status", "==", "published") as any;

    // Apply sorting
    const sortField =
      sortBy === "price"
        ? "price"
        : sortBy === "rating"
          ? "averageRating"
          : sortBy === "sales"
            ? "soldCount"
            : "createdAt";

    query = query.orderBy(sortField, sortOrder as "asc" | "desc");

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
    const productsSnapshot = await query.get();

    const products = productsSnapshot.docs.map((doc: any) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count (simplified - in production use Firestore aggregation)
    const totalSnapshot = await Collections.products()
      .where("shopId", "==", shopId)
      .where("status", "==", "published")
      .count()
      .get();

    const total = totalSnapshot.data().count;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      /** Success */
      success: true,
      products,
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
      component: "API.shops.products",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch shop products",
      },
      { status: 500 },
    );
  }
}
