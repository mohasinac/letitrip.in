/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/children/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

/**
 * GET /api/categories/[slug]/children
 * Get all direct children categories for a given category
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
    const childrenIds = categoryData.children_ids || [];

    if (childrenIds.length === 0) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: [],
      });
    }

    // Fetch all children categories
    const children: any[] = [];
    for (const childId of childrenIds) {
      const childDoc = await Collections.categories().doc(childId).get();
      if (childDoc.exists) {
        const childData: any = childDoc.data();
        children.push({
          /** Id */
          id: childDoc.id,
          ...childData,
          /** Parent Ids */
          parentIds:
            childData.parent_ids ||
            (childData.parent_id ? [childData.parent_id] : []),
          /** Children Ids */
          childrenIds: childData.children_ids || [],
          /** Parent Id */
          parentId: childData.parent_id,
          /** Featured */
          featured: childData.is_featured,
          /** Show On Homepage */
          showOnHomepage: childData.show_on_homepage,
          /** Is Active */
          isActive: childData.is_active,
          /** Product Count */
          productCount: childData.product_count || 0,
          /** Child Count */
          childCount: childData.child_count || 0,
          /** Has Children */
          hasChildren: childData.has_children || false,
          /** Sort Order */
          sortOrder: childData.sort_order || 0,
          /** Meta Title */
          metaTitle: childData.meta_title,
          /** Meta Description */
          metaDescription: childData.meta_description,
          /** Commission Rate */
          commissionRate: childData.commission_rate || 0,
          /** Created At */
          createdAt: childData.created_at,
          /** Updated At */
          updatedAt: childData.updated_at,
        });
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: children,
    });
  } catch (error: any) {
    console.error("Category children error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch category children",
      },
      { status: 500 },
    );
  }
}
