/**
 * @fileoverview TypeScript Module
 * @module src/app/api/products/validate-slug/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { resolveShopSlug } from "@/app/api/lib/utils/shop-slug-resolver";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Validate Product Slug Uniqueness
 * GET /api/products/validate-slug?slug=awesome-laptop&shop_slug=awesome-shop&exclude_id=xxx
 *
 * Slugs are unique per shop (same slug allowed in different shops)
 * Accepts shop_slug parameter and resolves to shop_id internally
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
  let slug: string | null = null;
  let shopSlug: string | null = null;
  try {
    const { searchParams } = new URL(request.url);
    slug = searchParams.get("slug");
    shopSlug = searchParams.get("shop_slug");
    const excludeId = searchParams.get("exclude_id"); // For edit mode

    if (!slug) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Slug parameter is required",
        },
        { status: 400 },
      );
    }

    if (!shopSlug) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Shop slug parameter is required",
        },
        { status: 400 },
      );
    }

    // Resolve shop slug to shop ID
    const shopId = await resolveShopSlug(shopSlug);

    if (!shopId) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Shop not found",
        },
        { status: 404 },
      );
    }

    // Check if slug exists in this shop
    const query = Collections.products()
      .where("slug", "==", slug)
      .where("shop_id", "==", shopId);

    const snapshot = await query.get();

    // If editing, exclude current product
    /**
 * Performs exists operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The exists result
 *
 */
const exists = snapshot.docs.some((doc) => doc.id !== excludeId);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Available */
      available: !exists,
      slug,
      shop_slug: shopSlug,
      shop_id: shopId,
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.products.validateSlug.GET",
      /** Metadata */
      metadata: { slug, shopSlug },
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to validate slug",
      },
      { status: 500 },
    );
  }
}
