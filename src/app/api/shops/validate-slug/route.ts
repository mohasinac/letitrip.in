/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/validate-slug/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Validate Shop Slug Uniqueness
 * GET /api/shops/validate-slug?slug=awesome-shop&exclude_id=xxx
 *
 * Slugs are globally unique across all shops
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
  try {
    const { searchParams } = new URL(request.url);
    slug = searchParams.get("slug");
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

    // Check if slug exists
    const query = Collections.shops().where("slug", "==", slug);
    const snapshot = await query.get();

    // If editing, exclude current shop
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
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.validateSlug",
      /** Metadata */
      metadata: { slug },
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
