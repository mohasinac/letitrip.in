/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";

/**
 * GET /api/categories/[slug]
 * Get category details
 * - Public: Active categories only
 * - Admin: All categories including inactive
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

/**
 * Retrieves 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await getUserFromRequest(request);
    const { slug } = await params;

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await Collections.categories().doc(slug).get();
    if (!doc.exists) {
      const snapshot = await Collections.categories()
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 },
        );
      }
      doc = snapshot.docs[0];
    }
    const data: any = doc.data();

    // Public users can only see active categories
    if ((!user || user.role !== "admin") && !data.is_active) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: doc.id,
        ...data,
        // Add camelCase aliases with multi-parent support
        /** Parent Ids */
        parentIds: data.parent_ids || (data.parent_id ? [data.parent_id] : []),
        /** Children Ids */
        childrenIds: data.children_ids || [],
        parentId: data.parent_id, // Backward compatibility
        /** Featured */
        featured: data.is_featured,
        /** Show On Homepage */
        showOnHomepage: data.show_on_homepage,
        /** Is Active */
        isActive: data.is_active,
        /** Product Count */
        productCount: data.product_count || 0,
        /** In Stock Count */
        inStockCount: data.in_stock_count || 0,
        /** Out Of Stock Count */
        outOfStockCount: data.out_of_stock_count || 0,
        /** Live Auction Count */
        liveAuctionCount: data.live_auction_count || 0,
        /** Ended Auction Count */
        endedAuctionCount: data.ended_auction_count || 0,
        /** Child Count */
        childCount: data.child_count || 0,
        /** Has Children */
        hasChildren: data.has_children || false,
        /** Sort Order */
        sortOrder: data.sort_order || 0,
        /** Meta Title */
        metaTitle: data.meta_title,
        /** Meta Description */
        metaDescription: data.meta_description,
        /** Commission Rate */
        commissionRate: data.commission_rate || 0,
        /** Created At */
        createdAt: data.created_at,
        /** Updated At */
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/categories/[slug]
 * Update category (admin only)
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ /**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The patch result
 *
 * @example
 * PATCH(request, {});
 */
params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Request */
  request, {});
 */

export async function PATCH(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const { slug } = await params;

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await Collections.categories().doc(slug).get();
    if (!doc.exists) {
      const snapshot = await Collections.categories()
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 },
        );
      }
      doc = snapshot.docs[0];
    }
    const data = await request.json();
    const oldData: any = doc.data();

    if (data.slug && data.slug !== slug) {
      const exists = await Collections.categories()
        .where("slug", "==", data.slug)
        .limit(1)
        .get();
      if (!exists.empty) {
        return NextResponse.json(
          { success: false, error: "Slug already in use" },
          { status: 400 },
        );
      }
    }

    const now = new Date().toISOString();
    const update: any = { ...data, updated_at: now };
    delete update.id;
    delete update.created_at;

    // Handle multi-parent update
    if (data.parent_ids !== undefined) {
      const newParentIds = Array.isArray(data.parent_ids)
        ? data.parent_ids
        : [];
      const oldParentIds =
        oldData.parent_ids || (oldData.parent_id ? [oldData.parent_id] : []);

      // Remove from old parents
      /**
 * Performs removed parents operation
 *
 * @param {string} (id - The (id
 *
 * @returns {any} The removedparents result
 *
 */
const removedParents = oldParentIds.filter(
        (id: string) => !newParentIds.includes(id),
      );
      for (const parentId of removedParents) {
        const parentRef = Collections.categories().doc(parentId);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
          const parentData: any = parentDoc.data();
          /**
           * Performs children ids operation
           *
           * @param {string} parentData.children_ids || []).filter(
            (id - The parent data.children_ids || []).filter(
            (id
           *
           * @returns {string} The childrenids result
           */

          /**
           * Performs children ids operation
           *
           * @param {string} parentData.children_ids || []).filter(
            (id - The parent data.child/**
 * Performs children ids operation
 *
 * @param {any} parentData.children_ids||[] - The parentdata.children_ids||[]
 *
 * @returns {any} The childrenids result
 *
 */
ren_ids || []).filter(
            (id
           *
           * @returns {string} The childrenids result
           */

          const childrenIds = (parentData.children_ids || []).filter(
            (id: string) => id/**
 * Performs added parents operation
 *
 * @param {string} (id - The (id
 *
 * @returns {any} The addedparents result
 *
 */
 !== doc.id,
          );
          await parentRef.update({
            children_ids: childrenIds,
            child_count: childrenIds.length,
            has_children: childrenIds.length > 0,
            updated_at: now,
          });
        }
      }

      // Add to new parents
      const addedParents = newParentIds.filter(
        (id: string) => !oldParentIds.includes(id),
      );
      for (const parentId of addedParents) {
        const parentRef = Collections.categories().doc(parentId);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
          const parentData: any = parentDoc.data();
          const childrenIds = parentData.children_ids || [];
          if (!childrenIds.includes(doc.id)) {
            childrenIds.push(doc.id);
            await parentRef.update({
              children_ids: childrenIds,
              child_count: childrenIds.length,
              has_children: true,
              updated_at: now,
            });
          }
        }
      }

      update.parent_ids = newParentIds;
      update.parent_id = newParentIds[0] || null; // Backward compatibility
    }

    await Collections.categories().doc(doc.id).update(update);
    const updated = await Collections.categories().doc(doc.id).get();
    const updatedData: any = updated.data();
    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Id */
        id: updated.id,
        ...updatedData,
        // Add camelCase aliases with multi-parent support
        /** Parent Ids */
        parentIds:
          updatedData.parent_ids ||
          (updatedData.parent_id ? [updatedData.parent_id] : []),
        /** Children Ids */
        childrenIds: updatedData.children_ids || [],
        parentId: updatedData.parent_id, // Backward compatibility
        /** Featured */
        featured: updatedData.is_featured,
        /** Show On Homepage */
        showOnHomepage: updatedData.show_on_homepage,
        /** Is Active */
        isActive: updatedData.is_active,
        /** Product Count */
        productCount: updatedData.product_count || 0,
        /** Child Count */
        childCount: updatedData.child_count || 0,
        /** Has Children */
        hasChildren: updatedData.has_children || false,
        /** Sort Order */
        sortOrder: updatedData.sort_order || 0,
        /** Meta Title */
        metaTitle: updatedData.meta_title,
        /** Meta Description */
        metaDescription: updatedData.meta_description,
        /** Commission Rate */
        commissionRate: updatedData.commission_rate || 0,
        /** Created At */
        createdAt: updatedData.created_at,
        /** Updated At */
        updatedAt: updatedData.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/categories/[slug]
 * Delete category (admin only)
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result/**
 * Deletes 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The delete result
 *
 * @example
 * DELETE(request, {});
 */

 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

export async function DELETE(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const { slug } = await params;

    // Try direct doc access first (slug as ID), fallback to query for backward compatibility
    let doc = await Collections.categories().doc(slug).get();
    if (!doc.exists) {
      const snapshot = await Collections.categories()
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snapshot.empty) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 },
        );
      }
      doc = snapshot.docs[0];
    }
    const docData: any = doc.data();

    // Prevent deletion if category has children
    const childrenIds = docData.children_ids || [];
    if (childrenIds.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete category with children" },
        { status: 400 },
      );
    }

    // Remove from all parent categories
    const parentIds =
      docData.parent_ids || (docData.parent_id ? [docData.parent_id] : []);
    const now = new Date().toISOString();

    for (const parentId of parentIds) {
      const parentRef = Collections.categories().doc(parentId);
      const parentDoc = await parentRef.get();
      if (parentDoc.exists) {
        const parentData: any = parentDoc.data();
        /**
         * Updates existing updated children ids
         *
         * @param {string} parentData.children_ids || []).filter(
          (id - The parent data./**
 * Updates d children ids
 *
 * @param {any} parentData.children_ids||[] - The parentdata.children_ids||[]
 *
 * @returns {any} The updatedchildrenids result
 *
 */
children_ids || []).filter(
          (id
         *
         * @returns {string} The updatedchildrenids result
         */

        /**
         * Updates existing updated children ids
         *
         * @param {string} parentData.children_ids || []).filter(
          (id - The parent data.children_ids || []).filter(
          (id
         *
         * @returns {string} The updatedchildrenids result
         */

        const updatedChildrenIds = (parentData.children_ids || []).filter(
          (id: string) => id !== doc.id,
        );
        await parentRef.update({
          children_ids: updatedChildrenIds,
          child_count: updatedChildrenIds.length,
          has_children: updatedChildrenIds.length > 0,
          updated_at: now,
        });
      }
    }

    await Collections.categories().doc(doc.id).delete();
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
