/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/tree/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { withCache } from "@/app/api/middleware/cache";

// GET /api/categories/tree - Full category tree (public)
/**
 * Function: G E T
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
  return withCache(
    request,
    async () => {
      try {
        const snapshot = await Collections.categories().limit(1000).get();
        /**
 * Performs nodes operation
 *
 * @param {any} (d - The (d
 *
 * @returns {any} The nodes result
 *
 */
const nodes = snapshot.docs.map((d) => {
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
            createdAt: catData.created_at/**
 * Performs by id operation
 *
 * @param {any} (n - The (n
 *
 * @returns {any} The byid result
 *
 */
,
            /** Updated At */
            updatedAt: catData.updated_at,
          };
        });
        const byId: Record<string, any> = {};
        nodes.forEach((n) => {
          byId[n.id] = { ...n, children: [] };
        });
        const roots: any[] = [];
        nodes.forEach((n) => {
          if (n.parent_id) {
            const parent = byId[n.parent_id];
            if (parent) parent.children.push(byId[n.id]);
            else roots.push(byId[n.id]);
          } else {
            roots.push(byId[n.id]);
          }
        });
        return NextResponse.json({ success: true, data: roots });
      } catch (error) {
        console.error("Error building category tree:", error);
        return NextResponse.json(
          { success: false, error: "Failed to load category tree" },
          { status: 500 },
        );
      }
    },
    { ttl: 600 },
  ); // 10 minutes - tree doesn't change often
}
