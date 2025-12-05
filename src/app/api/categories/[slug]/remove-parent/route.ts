/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/remove-parent/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";

/**
 * POST /api/categories/[slug]/remove-parent
 * Remove a parent from a category (supports multi-parent hierarchy)
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Request */
  request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The post result
 *
 * @example
 * POST(request, {});
 */
export async function POST(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { parentId } = body;

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: "Parent ID is required" },
        { status: 400 },
      );
    }

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
    const currentParentIds =
      categoryData.parent_ids ||
      (categoryData.parent_id ? [categoryData.parent_id] : []);

    // Check if parent exists
    if (!currentParentIds.includes(parentId)) {
      return NextResponse.json(
        { success: false, error: "Parent not found in category" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // Remove parent from category
    /**
 * Performs new parent ids operation
 *
 * @param {string} (id - The (id
 *
 * @returns {any} The newparentids result
 *
 */
const newParentIds = currentParentIds.filter(
      (id: string) => id !== parentId,
    );
    await Collections.categories()
      .doc(categoryDoc.id)
      .update({
        parent_ids: newParentIds,
        parent_id: newParentIds[0] || null, // Keep first parent for backward compatibility
        updated_at: now,
      });

    // Update parent's children list
    const parentDoc = await Collections.categories().doc(parentId).get();
    if (parentDoc.exists) {
      const parentData: any = parentDoc.data();
      /**
       * Performs parent children ids operation
       *
       * @param {string} parentData.children_ids || []).filter(
        (id - The parent data.children_ids || []).filter(
        (id
       *
       * @returns {string} The parentchildrenids result
       */

      /**
       * Performs parent children ids operation
       *
       * @param {string} parentData.children_ids || []).filter(
        (id - The paren/**
 * Performs parent children ids operation
 *
 * @param {any} parentData.children_ids||[] - The parentdata.children_ids||[]
 *
 * @returns {any} The parentchildrenids result
 *
 */
t data.children_ids || []).filter(
        (id
       *
       * @returns {string} The parentchildrenids result
       */

      const parentChildrenIds = (parentData.children_ids || []).filter(
        (id: string) => id !== categoryDoc.id,
      );
      await Collections.categories()
        .doc(parentId)
        .update({
          children_ids: parentChildrenIds,
          child_count: parentChildrenIds.length,
          has_children: parentChildrenIds.length > 0,
          updated_at: now,
        });
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Parent removed successfully",
    });
  } catch (error: any) {
    console.error("Remove parent error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to remove parent",
      },
      { status: 500 },
    );
  }
}
