/**
 * @fileoverview TypeScript Module
 * @module src/app/api/categories/[slug]/products/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { getCategoryIdsForQuery } from "@/lib/category-hierarchy";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { toFEProductCards } from "@/types/transforms/product.transforms";
import type { ProductListItemBE } from "@/types/backend/product.types";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/categories/[slug]/products
 * Fetch products in a category (includes all subcategories hierarchically)
 */
/**
 * Performs g e t operation
 *
 * @param {Request} request - The request
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
 * @param {Request} /** Request */
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
 * @param {Request} request - The request
 * @param {{ params: Promise<{ slug: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const db = getFirestoreAdmin();

    // Get the category by slug
    const categorySnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (categorySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const categoryDoc = categorySnapshot.docs[0];
    const category = { id: categoryDoc.id, ...categoryDoc.data() };

    // ALWAYS get all descendant categories (children, grandchildren, etc.)
    // This ensures that products in ANY subcategory are shown
    const categoryIds = await getCategoryIdsForQuery(category.id);

    // Fetch products from all categories in batches (Firestore 'in' limit = 10)
    const batchSize = 10;
    let allProducts: ProductListItemBE[] = [];

    console.log(
      `Fetching products for category ${slug} (${categoryIds.length} categories including descendants)`,
    );

    for (let i = 0; i < categoryIds.length; i += batchSize) {
      const batch = categoryIds.slice(i, i + batchSize);

      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("category_id", "in", batch)
        .where("status", "==", "published")
        .get();

      /**
 * Performs batch products operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The batchproducts result
 *
 */
const batchProducts = productsSnapshot.docs.map((doc) => ({
        /** Id */
        id: doc.id,
        ...doc.data(),
      })) as ProductListItemBE[];

      allProducts.push(...batchProducts);
    }

    // Apply sorting field mapping
    const sortField =
      sortBy === "price"
        ? "price"
        : sortBy === "rating"
          ? "average_rating"
          : sortBy === "sales"
            ? "sales_count"
            : sortBy === "views"
              ? "view_count"
              : "created_at";

    // Apply client-side sorting (since we fetched from multiple batches)
    allProducts.sort((a, b) => {
      /**
       * Performs a val operation
       *
       * @param {any} [a as any)[sortField] || 0;
      const bVal] - The a as any)[sort field] || 0;
      const b val
       *
       * @returns {any} The aval result
       */

      /**
       * Performs a val operation
       *
       * @returns {any} The aval result
       */

      const aVal = (a as any)[sortField] || 0;
      /**
       * Performs b val operation
       *
       * @param {any} [b as any)[sortField] || 0;

      if (sortOrder] - The b as any)[sort field] || 0;

      if (sort order
       *
       * @returns {any} The bval result
       */

      /**
       * Performs b val operation
       *
       * @param {any} [b as any)[sortField] || 0;

      if (sortOrder] - The b as any)[sort field] || 0;

      if (sort order
       *
       * @returns {any} The bval result
       */

      const bVal = (b as any)[sortField] || 0;

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    // Apply client-side pagination
    const total = allProducts.length;
    const totalPages = Math.ceil(total / limit);
    /**
     * Performs offset operation
     *
     * @returns {any} The offset result
     */

    /**
     * Performs offset operation
     *
     * @returns {any} The offset result
     */

    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    // Transform to FE types for response
    const productsForResponse = toFEProductCards(paginatedProducts);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: productsForResponse,
      total,
      page,
      limit,
      totalPages,
      /** Has More */
      hasMore: page < totalPages,
      /** Pagination */
      pagination: {
        page,
        limit,
        total,
        totalPages,
        /** Has Next */
        hasNext: page < totalPages,
        /** Has Prev */
        hasPrev: page > 1,
      },
      /** Meta */
      meta: {
        /** Category Id */
        categoryId: category.id,
        /** Category Slug */
        categorySlug: slug,
        descendantCategoryCount: categoryIds.length - 1, // Exclude self
        /** Total Categories Searched */
        totalCategoriesSearched: categoryIds.length,
      },
    });
  } catch (error: any) {
    console.error("Category products error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch category products",
      },
      { status: 500 },
    );
  }
}
