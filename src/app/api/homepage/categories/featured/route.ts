/**
 * @fileoverview TypeScript Module
 * @module src/app/api/homepage/categories/featured/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

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
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryLimit = parseInt(
      searchParams.get("categoryLimit") || "6",
      10,
    );
    const itemsPerCategory = parseInt(
      searchParams.get("itemsPerCategory") || "10",
      10,
    );

    const db = getFirestoreAdmin();

    // Get featured categories
    const categoriesSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("isActive", "==", true)
      .where("featured", "==", true)
      .orderBy("featured_order", "asc")
      .limit(categoryLimit)
      .get();

    const categories = [];

    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data();

      // Get products for this category
      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("category_id", "==", doc.id)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .get();

      // Filter in-stock products only
      /**
 * Performs in stock products operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The instockproducts result
 *
 */
const inStockProducts = productsSnapshot.docs
        .filter((doc) => {
/**
 * Performs items operation
 *
 * @param {any} (productDoc - The (productdoc
 *
 * @returns {any} The items result
 *
 */
          const product = doc.data();
          return product.stock > 0;
        })
        .slice(0, itemsPerCategory);

      const items = inStockProducts.map((productDoc) => {
        const product = productDoc.data();
        return {
          /** Id */
          id: productDoc.id,
          /** Slug */
          slug: product.slug,
          /** Name */
          name: product.name,
          /** Description */
          description: product.description,
          /** Price */
          price: product.price,
          /** Images */
          images: product.images || [],
          /** Rating */
          rating: product.rating || 0,
          /** Review Count */
          reviewCount: product.review_count || 0,
          /** In Stock */
          inStock: true,
          /** Shop Id */
          shopId: product.shop_id,
          /** Shop Name */
          shopName: product.shop_name,
        };
      });

      categories.push({
        /** Category */
        category: {
          /** Id */
          id: doc.id,
          /** Slug */
          slug: data.slug,
          /** Name */
          name: data.name,
          /** Description */
          description: data.description,
          /** Image */
          image: data.image,
          /** Icon */
          icon: data.icon,
        },
        items,
      });
    }

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Featured categories error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch featured categories" },
      { status: 500 },
    );
  }
}
