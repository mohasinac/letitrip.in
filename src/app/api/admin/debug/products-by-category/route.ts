/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/debug/products-by-category/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/admin/debug/products-by-category
 * Debug endpoint to check products in categories
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
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (categoryId) {
      // Check specific category
      const productsSnap = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("category_id", "==", categoryId)
        .get();

      const products = productsSnap.docs.map((doc) => ({
        /** Id */
        id: doc.id,
        /** Name */
        name: doc.data().name,
        /** Status */
        status: doc.data().status,
        is_deleted: doc.data().is_deleted,
        category_id: doc.data().category_id,
      }));

      const publishedCount = products.filter(
        (p) => p.status === "published" && p.is_deleted !== true,
      ).length;

      return NextResponse.json({
        /** Success */
        success: true,
        categoryId,
        /** Total Products */
        totalProducts: products.length,
        /** Published Products */
        publishedProducts: publishedCount,
        products,
      });
    }

    // Get all products grouped by category
    const productsSnap = await db.collection(COLLECTIONS.PRODUCTS).get();
    const products = productsSnap.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      /** Name */
      name: doc.data().name,
      /** Status */
      status: doc.data().status,
      is_deleted: doc.data().is_deleted,
      category_id: doc.data().category_id,
    }));

    const byCategory: Record<string, any> = {};
    products.forEach((product) => {
      const catId = product.category_id || "no_category";
      if (!byCategory[catId]) {
        byCategory[catId] = {
          /** Total */
          total: 0,
          /** Published */
          published: 0,
          /** Products */
          products: [],
        };
      }
      byCategory[catId].total++;
      if (product.status === "published" && product.is_deleted !== true) {
        byCategory[catId].published++;
      }
      byCategory[catId].products.push(product);
    });

    // Get categories
    const categoriesSnap = await db.collection(COLLECTIONS.CATEGORIES).get();
    const categories = categoriesSnap.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      /** Name */
      name: doc.data().name,
      product_count: doc.data().product_count,
      parent_ids: doc.data().parent_ids || [],
    }));

    return NextResponse.json({
      /** Success */
      success: true,
      /** Total Products */
      totalProducts: products.length,
      /** Total Categories */
      totalCategories: categories.length,
      /** Products By Category */
      productsByCategory: byCategory,
      categories,
      /** Summary */
      summary: {
        /** Total Products */
        totalProducts: products.length,
        /** Published Products */
        publishedProducts: products.filter(
          (p) => p.status === "published" && p.is_deleted !== true,
        ).length,
        /** Categories With Products */
        categoriesWithProducts: Object.keys(byCategory).length,
      },
    });
  } catch (error: any) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to fetch debug info",
        /** Details */
        details: error.message,
      },
      { status: 500 },
    );
  }
}
