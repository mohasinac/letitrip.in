/**
 * @fileoverview TypeScript Module
 * @module src/app/api/homepage/shops/featured/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
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
    const shopLimit = parseInt(searchParams.get("shopLimit") || "4", 10);
    const itemsPerShop = parseInt(searchParams.get("itemsPerShop") || "10", 10);

    const db = getFirestoreAdmin();

    // Get featured shops
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where("featured", "==", true)
      .orderBy("featured_order", "asc")
      .limit(shopLimit)
      .get();

    const shops = [];

    for (const doc of shopsSnapshot.docs) {
      const data = doc.data();

      // Get products for this shop
      const productsSnapshot = await db
        .collection(COLLECTIONS.PRODUCTS)
        .where("shop_id", "==", doc.id)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .get();

      // Filter in-stock products only
      const inStockProducts = productsSnapshot.docs
        .filter((doc) => {
          const product = doc.data();
          return product.stock > 0;
        })
        .slice(0, itemsPerShop);

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

      shops.push({
        /** Shop */
        shop: {
          /** Id */
          id: doc.id,
          /** Slug */
          slug: data.slug,
          /** Name */
          name: data.name,
          /** Description */
          description: data.description,
          /** Logo */
          logo: data.logo,
          /** Banner */
          banner: data.banner,
          /** Rating */
          rating: data.rating || 0,
          /** Review Count */
          reviewCount: data.review_count || 0,
        },
        items,
      });
    }

    return NextResponse.json({ data: shops });
  } catch (error) {
    console.error("Featured shops error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch featured shops" },
      { status: 500 },
    );
  }
}
