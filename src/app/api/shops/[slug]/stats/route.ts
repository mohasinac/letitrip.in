/**
 * @fileoverview TypeScript Module
 * @module src/app/api/shops/[slug]/stats/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { safeToISOString } from "@/lib/date-utils";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/session";

// GET /api/shops/[slug]/stats - seller/admin analytics
/**
 * Function: G E T
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
    const { slug } = await params;
    const user = await getCurrentUser(request);
    if (!user?.email)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const role = user.role;

    const shopSnap = await Collections.shops()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (shopSnap.empty)
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 },
      );
    const shopDoc = shopSnap.docs[0];
    const shop: any = { id: shopDoc.id, ...shopDoc.data() };

    if (role === "seller") {
      const owns = await userOwnsShop(shop.id, user.id);
      if (!owns)
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
    }

    // Products count (exclude deleted products)
    const productsSnap = await Collections.products()
      .where("shop_id", "==", shop.id)
      .get();
    /**
 * Performs all products operation
 *
 * @param {any} (d - The (d
 *
 * @returns {any} The allproducts result
 *
 */
const allProducts = productsSnap.docs.map((d) => ({
      /** Id */
      id:/**
 * Performs products operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The products result
 *
 */
 d.id,
      ...d.data(),
    }));
    // Filter out deleted products (is_deleted !== true to include undefined)
    const products = allProducts.filter((p: any)/**
 * Performs orders operation
 *
 * @param {any} (d - The (d
 *
 * @returns {any} The orders result
 *
 */
 => p.is_deleted !== true);
    const productCount = products.length;

    // Orders and revenue (delivered / confirmed)
    const ordersSnap = await Collections.orders()
      .where("shop_id", "==", shop.id)
      .get();
    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const orderCount = orders.length;
    const revenue = orders
      .filte/**
 * Performs avg rating operation
 *
 * @param {any} (s - The (s
 * @param {any} d - The d
 *
 * @returns {any} The avgrating result
 *
 */
r((o: any) =>
        ["delivered", "confirmed", "processing", "shipped"].includes(o.status),
      )
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    // Reviews
    const /**
 * Performs low stock operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The lowstock result
 *
 */
reviewsSnap = await Collections.reviews()
      .where("shop_id", "==", shop.id)
      .get();
    const reviewCount = reviewsSnap.size;
    const avgRating = reviewCount
      ? reviewsSnap.docs.reduce((s, d) => s + (d.data().rating || 0), 0) /
        reviewCount
      : 0;

    // Returns
    const returnsSnap = await Collections.returns()
      .where("shop_id", "==", shop.id)
      .get();
    const returnsCount = returnsSnap.size;

    // Low stock products
    const lowStock = products.filter(
      (p: any) =>
        (p.stock_quantity ?? p.stockCount ?? 0) <=
        (p.low_stock_threshold ?? p.lowStockThreshold ?? 5),
    );

    // Daily sales last 14 days
    const startDate = new Date(Date.now() - 13 * 86400000);
    const startIso = safeToISOString(startDate) ?? new Date().toISOString();
    const recentOrdersSnap = await Collections.orders()
   /**
 * Performs daily sales operation
 *
 * @param {object} { length - The { length
 *
 * @returns {any} The dailysales result
 *
 */
   .where("shop_id", "==", shop.id)
      .where("created_at", ">=", startIso)
      .get();
    const dailyMap: Record<string, number> = {};
    for (const d of recentOrdersSnap.docs) {
      const o: any = d.data();
      /**
       * Performs day operation
       *
       * @returns {any} The day result
       */

      /**
       * Performs day operation
       *
       * @returns {any} The day result
       */

      const day = (o.created_at || "").slice(0, 10);
      if (!day) continue;
      if (!dailyMap[day]) dailyMap[day] = 0;
      dailyMap[day] += o.amount || 0;
    }
    const dailySales = Array.from({ length: 14 }).map((_, i) => {
      const dt = new Date(Date.now() - (13 - i) * 86400000);
      const key = safeToISOString(dt)?.slice(0, 10) ?? "";
      return { date: key, revenue: dailyMap[key] || 0 };
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Shop */
        shop: { id: shop.id, name: shop.name, slug: shop.slug },
        /** Metrics */
        metrics: {
          productCount,
          orderCount,
          revenue,
          reviewCount,
          /** Avg Rating */
          avgRating: Number(avgRating.toFixed(2)),
          returnsCount,
          /** Low Stock Count */
          lowStockCount: lowStock.length,
        },
        /** Low Stock */
        lowStock: lowStock.slice(0, 10).map((p) => ({
          /** Id */
          id: p.id,
          /** Name */
          name: p.name,
          /** Stock */
          stock: p.stock_quantity ?? p.stockCount ?? 0,
        })),
        dailySales,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.shops.stats",
      /** Metadata */
      metadata: { slug: await params.then((p) => p.slug) },
    });
    return NextResponse.json(
      { success: false, error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
