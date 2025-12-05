/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/hierarchy/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/hierarchy
 * Get full category hierarchy path (breadcrumb)
 */
/**
 * Performs g e t operation
 *
 * @param {Request} _ - The _
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_, {});
 */

/**
 * Performs g e t operation
 *
 * @param {Request} _ - The _
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_, {});
 */

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Try to get category by ID first (if slug looks like an ID)
    let category: any = null;
    let categoryDoc: any = null;

    // Check if it's a document ID (longer alphanumeric string)
    if (slug && slug.length > 15 && !slug.includes("-")) {
      try {
        const docSnapshot = await Collections.categories().doc(slug).get();
        if (docSnapshot.exists) {
          categoryDoc = docSnapshot;
          category = { id: docSnapshot.id, ...docSnapshot.data() };
        }
      } catch (e) {
        // Not a valid ID, try slug
      }
    }

    // If not found by ID, try by slug
    if (!category) {
      const categoriesSnapshot = await Collections.categories()
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (categoriesSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 },
        );
      }

      categoryDoc = categoriesSnapshot.docs[0];
      category = { id: categoryDoc.id, ...categoryDoc.data() };
    }

    // Build hierarchy by traversing up the parent chain
    const hierarchy = [category];
    let currentParentId = category.parentId;

    while (currentParentId) {
      const parentSnapshot = await Collections.categories()
        .doc(currentParentId)
        .get();

      if (!parentSnapshot.exists) break;

      const parent: any = { id: parentSnapshot.id, ...parentSnapshot.data() };
      hierarchy.unshift(parent); // Add to beginning
      currentParentId = parent.parentId;
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: hierarchy,
    });
  } catch (error: any) {
    console.error("Category hierarchy error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch category hierarchy",
      },
      { status: 500 },
    );
  }
}
