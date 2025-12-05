/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/homepage/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/categories/homepage
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * const result = GET();
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

export async function GET() {
  try {
    // Use composite index: is_featured + sort_order (consolidated from show_on_homepage)
    const snap = await Collections.categories()
      .where("is_featured", "==", true)
      .orderBy("sort_order", "asc")
      .limit(100)
      .get();

    /**
 * Performs data operation
 *
 * @param {any} (d - The (d
 *
 * @returns {any} The data result
 *
 */
const data = snap.docs.map((d) => {
      const catData: any = d.data();
      return {
        /** Id */
        id: d.id,
        ...catData,
        // Add camelCase aliases
        /** Parent Id */
        parentId: catData.parent_id,
        /** Featured */
        featured: catData.is_featured,
        /** Show On Homepage */
        showOnHomepage: catData.show_on_homepage,
        /** Is Active */
        isActive: catData.is_active,
        /** Product Count */
        productCount: catData.product_count || 0,
        /** Child Count */
        childCount: catData.child_count || 0,
        /** Has Children */
        hasChildren: catData.has_children || false,
        /** Sort Order */
        sortOrder: catData.sort_order || 0,
        /** Meta Title */
        metaTitle: catData.meta_title,
        /** Meta Description */
        metaDescription: catData.meta_description,
        /** Commission Rate */
        commissionRate: catData.commission_rate || 0,
        /** Created At */
        createdAt: catData.created_at,
        /** Updated At */
        updatedAt: catData.updated_at,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Homepage categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load homepage categories" },
      { status: 500 },
    );
  }
}
