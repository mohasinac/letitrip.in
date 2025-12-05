/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/parents/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/parents
 * Get all parent categories for a given category
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} _request - The _request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} _request - The _request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_request, {});
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Get the category
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

    const categoryDoc = categoriesSnapshot.docs[0];
    const categoryData: any = categoryDoc.data();
    const parentIds =
      categoryData.parent_ids ||
      (categoryData.parent_id ? [categoryData.parent_id] : []);

    if (parentIds.length === 0) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: [],
      });
    }

    // Fetch all parent categories
    const parents: any[] = [];
    for (const parentId of parentIds) {
      const parentDoc = await Collections.categories().doc(parentId).get();
      if (parentDoc.exists) {
        const parentData: any = parentDoc.data();
        parents.push({
          /** Id */
          id: parentDoc.id,
          ...parentData,
          /** Parent Ids */
          parentIds:
            parentData.parent_ids ||
            (parentData.parent_id ? [parentData.parent_id] : []),
          /** Children Ids */
          childrenIds: parentData.children_ids || [],
          /** Parent Id */
          parentId: parentData.parent_id,
          /** Featured */
          featured: parentData.is_featured,
          /** Show On Homepage */
          showOnHomepage: parentData.show_on_homepage,
          /** Is Active */
          isActive: parentData.is_active,
          /** Product Count */
          productCount: parentData.product_count || 0,
          /** Child Count */
          childCount: parentData.child_count || 0,
          /** Has Children */
          hasChildren: parentData.has_children || false,
          /** Sort Order */
          sortOrder: parentData.sort_order || 0,
          /** Meta Title */
          metaTitle: parentData.meta_title,
          /** Meta Description */
          metaDescription: parentData.meta_description,
          /** Commission Rate */
          commissionRate: parentData.commission_rate || 0,
          /** Created At */
          createdAt: parentData.created_at,
          /** Updated At */
          updatedAt: parentData.updated_at,
        });
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: parents,
    });
  } catch (error: any) {
    console.error("Category parents error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch category parents",
      },
      { status: 500 },
    );
  }
}
