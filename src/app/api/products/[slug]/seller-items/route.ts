/**
 * @fileoverview TypeScript Module
 * @module src/app/api/products/[slug]/seller-items/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products/[slug]/seller-items - other products from same shop
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
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
 * @param {NextRequest} /** Request */
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
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  let slug: string | undefined;
  try {
    const awaitedParams = await params;
    slug = awaitedParams.slug;
    const limit = parseInt(
      new URL(request.url).searchParams.get("limit") || "10",
      10,
    );

    const prodSnap = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (prodSnap.empty)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    const prod: any = { id: prodSnap.docs[0].id, ...prodSnap.docs[0].data() };

    const q = await Collections.products()
      .where("shop_id", "==", prod.shop_id)
      .limit(limit + 1)
      .get();
    const data = q.docs
      .map((d) => ({ id: d.id, ...d.data() }) as any)
      .filter((p) => p.slug !== slug)
      .slice(0, limit);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.products.slug.sellerItems.GET",
      /** Metadata */
      metadata: { slug },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load seller items" },
      { status: 500 },
    );
  }
}
