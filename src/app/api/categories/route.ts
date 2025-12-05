/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { categoriesSieveConfig } from "@/app/api/lib/sieve/config";
import { createPaginationMeta } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import { withCache } from "@/app/api/middleware/cache";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { ValidationError } from "@/lib/api-errors";
import { NextRequest, NextResponse } from "next/server";

// Extended Sieve config with field mappings for categories
const categoriesConfig = {
  ...categoriesSieveConfig,
  /** Field Mappings */
  fieldMappings: {
    /** Parent Id */
    parentId: "parent_id",
    /** Parent Ids */
    parentIds: "parent_ids",
    /** Sort Order */
    sortOrder: "sort_order",
    order: "sort_order", // Map 'order' from config to 'sort_order' in DB
    /** Created At */
    createdAt: "created_at",
    /** Updated At */
    updatedAt: "updated_at",
    /** Product Count */
    productCount: "product_count",
    /** Featured */
    featured: "is_featured",
    /** Show On Homepage */
    showOnHomepage: "show_on_homepage",
    /** Is Active */
    isActive: "is_active",
  } as Record<string, string>,
};

/**
 * Transform category document to API response format
 */
/**
 * Transforms category
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformcategory result
 */

/**
 * Transforms category
 *
 * @param {string} id - Unique identifier
 * @param {any} data - Data object containing information
 *
 * @returns {string} The transformcategory result
 */

function transformCategory(id: string, data: any) {
  return {
    id,
    ...data,
    // Add camelCase aliases for frontend compatibility
    /** Parent Ids */
    parentIds: data.parent_ids || (data.parent_id ? [data.parent_id] : []),
    /** Children Ids */
    childrenIds: data.children_ids || [],
    /** Parent Id */
    parentId: data.parent_id,
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
  };
}

/**
 * GET /api/categories
 * List categories with Sieve pagination
 * Query Format: ?page=1&pageSize=50&sorts=sortOrder&filters=featured==true
 *
 * Role-based filtering:
 * - Public: Active categories only
 * - Admin: All categories including inactive
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
    async (req: NextRequest) => {
      try {
        const user = await getUserFromRequest(req);
        const { searchParams } = new URL(req.url);

        // Parse Sieve query
        const {
          /** Query */
          query: sieveQuery,
          errors,
          warnings,
        } = parseSieveQuery(searchParams, categoriesConfig);

        if (errors.length > 0) {
          return NextResponse.json(
            {
              /** Success */
              success: false,
              /** Error */
              error: "Invalid query parameters",
              /** Details */
              details: errors,
            },
            { status: 400 }
          );
        }

        // Legacy filter params (backward compatibility)
        const featured = searchParams.get("featured");
        const showOnHomepage = searchParams.get("showOnHomepage");
        const parentId = searchParams.get("parentId");

        let query: FirebaseFirestore.Query = Collections.categories();

        // Public users only see active categories
        if (!user || user.role !== "admin") {
          query = query.where("is_active", "==", true);
        }

        // Apply legacy filters (backward compatibility)
        if (featured !== null) {
          query = query.where("is_featured", "==", featured === "true");
        }
        if (showOnHomepage !== null) {
          query = query.where(
            "show_on_homepage",
            "==",
            showOnHomepage === "true"
          );
        }
        if (parentId !== null) {
          query = query.where(
            "parent_id",
            "==",
            parentId === "null" ? null : parentId
          );
        }

        // Apply Sieve filters
        for (const filter of sieveQuery.filters) {
          const dbField =
            categoriesConfig.fieldMappings[filter.field] || filter.field;
          if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
            query = query.where(
              dbField,
              filter.operator as FirebaseFirestore.WhereFilterOp,
              filter.value
            );
          }
        }

        // Apply sorting
        if (sieveQuery.sorts.length > 0) {
          for (const sort of sieveQuery.sorts) {
            const dbField =
              categoriesConfig.fieldMappings[sort.field] || sort.field;
            query = query.orderBy(dbField, sort.direction);
          }
        } else {
          // Default sort by sort_order
          query = query.orderBy("sort_order", "asc");
        }

        // Get total count
        const countSnapshot = await query.count().get();
        const totalCount = countSnapshot.data().count;

        // Apply pagination
        /**
         * Performs offset operation
         *
         * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
        if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
        if (offset > 0
         *
         * @returns {any} The offset result
         */

        /**
         * Performs offset operation
         *
         * @param {any} sieveQuery.page - 1) * sieveQuery.pageSize;
        if (offset > 0 - The sieve query.page - 1) * sieve query.page size;
        if (offset > 0
         *
         * @returns {any} The offset result
         */

        const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
        if (offset > 0) {
          const skipSnapshot = await query.limit(offset).get();
          if (skipSnapshot.docs.length > 0) {
            const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
            query = query.startAfter(lastDoc);
          }
        }
        query = query.limit(sieveQuery.pageSize);

        // Execute query
        const snapshot = await query.get();
        const categories = snapshot.docs.map((doc) =>
          transformCategory(doc.id, doc.data())
        );

        // Build Sieve pagination meta
        const pagination = createPaginationMeta(totalCount, sieveQuery);

        return NextResponse.json({
          /** Success */
          success: true,
          /** Data */
          data: categories,
          /** Count */
          count: categories.length,
          pagination,
          /** Meta */
          meta: {
            /** Applied Filters */
            appliedFilters: sieveQuery.filters,
            /** Applied Sorts */
            appliedSorts: sieveQuery.sorts,
            /** Warnings */
            warnings: warnings.length > 0 ? warnings : undefined,
          },
        });
      } catch (error) {
        console.error("Error listing categories:", error);
        return NextResponse.json(
          { success: false, error: "Failed to list categories" },
          { status: 500 }
        );
      }
    },
    { ttl: 300 }
  );
}

/**
 * POST /api/categories
 * Create a new category (admin only)
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const roleResult = await requireRole(request, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const body = await request.json();
    const { name, slug } = body;

    // Validation
    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!slug || slug.trim().length < 2) {
      errors.slug = "Slug must be at least 2 characters";
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    // Slug uniqueness (global)
    // Check if slug already exists as document ID
    const existingDoc = await Collections.categories().doc(slug).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Category slug already exists" },
        { status: 400 }
      );
    }

    // Fallback check for legacy data
    const existing = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "Category slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Handle multi-parent support
    let parentIds: string[] = [];
    if (body.parent_ids && Array.isArray(body.parent_ids)) {
      parentIds = body.parent_ids.filter((id: string) => id);
    } else if (body.parent_id) {
      // Backward compatibility
      parentIds = [body.parent_id];
    }

    const categoryData = {
      name,
      slug,
      /** Description */
      description: body.description || "",
      parent_ids: parentIds,
      parent_id: parentIds[0] || null, // Backward compatibility
      children_ids: [],
      has_children: false,
      child_count: 0,
      is_featured: !!body.is_featured,
      show_on_homepage: !!body.show_on_homepage,
      is_active: body.is_active !== false,
      meta_title: body.meta_title || "",
      meta_description: body.meta_description || "",
      sort_order: body.sort_order || 0,
      commission_rate: body.commission_rate || 0,
      created_at: now,
      updated_at: now,
    };

    // Use slug as document ID for SEO
    await Collections.categories().doc(slug).set(categoryData);
    const docRef = { id: slug };

    // Update parent categories to include this as a child
    if (parentIds.length > 0) {
      const batch = Collections.categories().firestore.batch();
      for (const parentId of parentIds) {
        const parentRef = Collections.categories().doc(parentId);
        const parentDoc = await parentRef.get();
        if (parentDoc.exists) {
          const parentData: any = parentDoc.data();
          const childrenIds = parentData.children_ids || [];
          if (!childrenIds.includes(docRef.id)) {
            childrenIds.push(docRef.id);
            batch.update(parentRef, {
              children_ids: childrenIds,
              has_children: true,
              child_count: childrenIds.length,
              updated_at: now,
            });
          }
        }
      }
      await batch.commit();
    }

    const created = await Collections.categories().doc(slug).get();
    const createdData: any = created.data();
    return NextResponse.json(
      {
        /** Success */
        success: true,
        /** Data */
        data: {
          /** Id */
          id: slug,
          ...createdData,
          // Add camelCase aliases for multi-parent support
          /** Parent Ids */
          parentIds: createdData.parent_ids || [],
          /** Children Ids */
          childrenIds: createdData.children_ids || [],
          parentId: createdData.parent_id, // Backward compatibility
          /** Featured */
          featured: createdData.is_featured,
          /** Show On Homepage */
          showOnHomepage: createdData.show_on_homepage,
          /** Is Active */
          isActive: createdData.is_active,
          /** Product Count */
          productCount: createdData.product_count || 0,
          /** Child Count */
          childCount: createdData.child_count || 0,
          /** Has Children */
          hasChildren: createdData.has_children || false,
          /** Sort Order */
          sortOrder: createdData.sort_order || 0,
          /** Meta Title */
          metaTitle: createdData.meta_title,
          /** Meta Description */
          metaDescription: createdData.meta_description,
          /** Commission Rate */
          commissionRate: createdData.commission_rate || 0,
          /** Created At */
          createdAt: createdData.created_at,
          /** Updated At */
          updatedAt: createdData.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
