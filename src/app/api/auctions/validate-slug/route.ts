/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/validate-slug/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * Validate Auction Slug Uniqueness
 * GET /api/auctions/validate-slug?slug=rare-vintage-watch&exclude_id=xxx
 *
 * Slugs are globally unique across all auctions
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
    const slug = searchParams.get("slug");
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
    const query = Collections.auctions().where("slug", "==", slug);
    const snapshot = await query.get();

    // If editing, exclude current auction
    const exists = snapshot.docs.some((doc) => doc.id !== excludeId);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Available */
      available: !exists,
      slug,
    });
  } catch (error) {
    console.error("Error validating auction slug:", error);
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
