/**
 * @fileoverview TypeScript Module
 * @module src/app/api/coupons/validate-code/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { resolveShopSlug } from "@/app/api/lib/utils/shop-slug-resolver";

/**
 * Validate Coupon Code Uniqueness
 * GET /api/coupons/validate-code?code=SAVE20&shop_slug=awesome-shop&exclude_id=xxx
 *
 * Codes are unique per shop (same code allowed in different shops)
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
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const shopSlug = searchParams.get("shop_slug");
    const excludeId = searchParams.get("exclude_id"); // For edit mode

    if (!code) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "Code parameter is required",
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

    // Normalize code (uppercase, no spaces)
    const normalizedCode = code.trim().toUpperCase();

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

    // Check if code exists in this shop
    const query = Collections.coupons()
      .where("code", "==", normalizedCode)
      .where("shop_id", "==", shopId);

    const snapshot = await query.get();

    // If editing, exclude current coupon
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
      /** Code */
      code: normalizedCode,
      shop_slug: shopSlug,
      shop_id: shopId,
    });
  } catch (error) {
    console.error("Error validating coupon code:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to validate code",
      },
      { status: 500 },
    );
  }
}
