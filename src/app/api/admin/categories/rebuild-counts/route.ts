/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/categories/rebuild-counts/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { rebuildAllCategoryCounts } from "@/lib/category-hierarchy";

/**
 * POST /api/admin/categories/rebuild-counts
 * Rebuild all category product counts (admin only)
 * Useful for fixing count discrepancies
 */
/**
 * Performs p o s t operation
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * const result = POST();
 */
/**
 * Performs p o s t operation
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST();
 */

/**
 * Performs p o s t operation
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST();
 */

export async function POST() {
  try {
    console.log("Starting category counts rebuild...");
    const result = await rebuildAllCategoryCounts();

    if (result.errors.length > 0) {
      console.error("Errors during rebuild:", result.errors);
      return NextResponse.json({
        /** Success */
        success: true,
        /** Message */
        message: `Rebuilt ${result.updated} categories with ${result.errors.length} errors`,
        /** Updated */
        updated: result.updated,
        /** Errors */
        errors: result.errors,
        /** Details */
        details: result.details,
      });
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: `Successfully rebuilt counts for ${result.updated} categories`,
      /** Updated */
      updated: result.updated,
      /** Details */
      details: result.details,
    });
  } catch (error: any) {
    console.error("Error rebuilding category counts:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to rebuild category counts",
        /** Details */
        details: error.message,
      },
      { status: 500 },
    );
  }
}
