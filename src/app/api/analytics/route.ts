/**
 * @fileoverview TypeScript Module
 * @module src/app/api/analytics/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../lib/session";
import { Collections } from "../lib/firebase/collections";
import { safeToISOString } from "@/lib/date-utils";

/**
 * GET /api/analytics
 * Query params:
 * - shop_id: Filter by shop (required for sellers, optional for admins)
 * - start_date: ISO date string
 * - end_date: ISO date string
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
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const role = user.role;
    if (!(role === "seller" || role === "admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shop_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Sellers must provide shop_id
    if (role === "seller" && !shopId) {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: "shop_id is required",
        },
        { status: 400 },
      );
    }

    // Date range
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Build analytics data
    const analytics = {
      /** Revenue */
      revenue: { total: 0, average: 0, trend: 0 },
      /** Orders */
      orders: { total: 0, pending: 0, completed: 0, cancelled: 0 },
      /** Products */
      products: { total: 0, active: 0, outOfStock: 0 },
      /** Customers */
      customers: { total: 0, new: 0, returning: 0 },
      /** Conversion Rate */
      conversionRate: 0,
      /** Average Order Value */
      averageOrderValue: 0,
      /** Sales Over Time */
      salesOverTime: [] as any[],
      /** Top Products */
      topProducts: [] as any[],
      /** Revenue By Category */
      revenueByCategory: [] as any[],
    };

    // Fetch orders
    let ordersQuery: FirebaseFirestore.Query = Collections.orders()
      .where(
        "created_at",
        ">=",
        safeToISOString(start) ?? new Date().toISOString(),
      )
      .where(
        "created_at",
        "<=",
        safeToISOString(end) ?? new Date().toISOString(),
      );

    if (shopId) {
      // Filter by shop - need to query orderItems for shop_id
      const orderItemsSnapshot = await Collections.orderItems()
        .where("shop_id", "==", shopId)
        .get();

      /**
 * Performs order ids operation
 *
 * @param {any} orderItemsSnapshot.docs.map((doc - The orderitemssnapshot.docs.map((doc
 *
 * @returns {any} The orderids result
 *
 */
const orderIds = [
        ...new Set(
          orderItemsSnapshot.docs.map((doc: any) => doc.data().order_id),
        ),
      ];

      if (orderIds.length > 0) {
        // Firestore 'in' query has a limit of 10 items, so we need to batch
        const batches = [];
        for (let i = 0; i < orderIds.length; i += 10) {
          const batch = orderIds.slice(i, i + 10);
          const batchSnapshot = await Collections.orders()
            .where("__name__", "in", batch)
            .where(
              "created_at",
              ">=",
              safeToISOString(start) ?? new Date().toISOString(),
            )
            .where(
              "created_at",
         /**
 * Performs orders operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The orders result
 *
 */
     "<=",
              safeToISOString(end) ?? new Date().toISOString(),
            )
            .get();
          batches.push(...batchSnapshot.docs);
        }

        const orders = batches.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Calculate revenue
        analytics.revenue.total = orders.reduce((sum: number, order: any) => {
          return sum + (order.total || 0);
        }, 0);

        analytics.orders.total = orders.length;
        analytics.orders.pending = orders.filter(
          (o: any) => o.status === "pending" || o.status === "confirmed",
        ).length;
        analytics.orders.completed = orders.filter(
          (o: any) => o.status === "delivered",
        ).length;
        analytics.orders.cancelled = orders.filter(
          (o: any) => o.status === "c/**
 * Performs customer ids operation
 *
 * @param {any} orders.map((o - The orders.map((o
 *
 * @returns {any} The customerids result
 *
 */
ancelled",
        ).length;

        analytics.revenue.average =
          analytics.orders.total > 0
            ? analytics.revenue.total / analytics.orders.total
            : 0;
        analytics.averageOrderValue = analytics.revenue.average;

        // Get unique customers
        const customerIds = [...new Set(orders.map((o: any) => o.customer_id))];
        analytics.customers.total = customerIds.length;

        // Sales over time (group by day)
        const salesByDay = new Map<string, number>();
        orders.forEach((order: any) => {
          const isoDate = safeToISOString(new Date(order.created_at));
          const date = isoDate ? isoDate.split("T")[0] : "";
          if (date) {
            salesByDay.set/**
 * Performs orders operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The orders result
 *
 */
(
              date,
              (salesByDay.get(date) || 0) + (order.total || 0),
            );
          }
        });

        analytics.salesOverTime = Array.from(salesByDay.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    } else {
      // Admin view - all shops
      const ordersSnapshot = await ordersQuery.limit(1000).get();
      const orders = ordersSnapshot.docs.map((doc) => ({
        /** Id */
        id: doc.id,
        ...doc.data(),
      }));

      analytics.revenue.total = orders.reduce((sum: number, order: any) => {
        return sum + (order.total || 0);
      }, 0);

      analytics.orders.total = orders.length;
      analytics.orders.pending/**
 * Performs customer ids operation
 *
 * @param {any} orders.map((o - The orders.map((o
 *
 * @returns {any} The customerids result
 *
 */
 = orders.filter(
        (o: any) => o.status === "pending" || o.status === "confirmed",
      ).length;
      analytics.orders.completed = orders.filter(
        (o: any) => o.status === "delivered",
      ).length;
      analytics.orders.cancelled = orders.filter(
        (o: any) => o.status === "cancelled",
      ).length;

      analytics.revenue.average =
        analytics.orders.total > 0
          ? analytics.revenue.total / analytics.orders.total
          : 0;
      analytics.averageOrderValue = analytics.revenue.average;

      const customerIds = [...new Set(orders.map((o: any) => o.customer_id))];
      analytics.customers.total = customerIds.length;

      // Sales over time
      const salesByDay = new Map<st/**
 * Performs products operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The products result
 *
 */
ring, number>();
      orders.forEach((order: any) => {
        const isoDate = safeToISOString(new Date(order.created_at));
        const date = isoDate ? isoDate.split("T")[0] : "";
        if (date) {
          salesByDay.set(
            date,
            (salesByDay.get(date) || 0) + (order.total || 0),
          );
        }
      });

      analytics.salesOverTime = Array.from(salesByDay.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Fetch products
    if (shopId) {
      const productsSnapshot = await Collections.products()
        .where("shop_id", "==", shopId)
        .get();

      const products = productsSnapshot.docs.map((doc) => ({
        /** Id */
        id: doc.id,
        ...doc.data(),
      }));

      analytics.products.total = products.length;
      analytics.products.active = products.filter(
        (p: any) => p.status === "published",
      ).length;
      analytics.products.outOfStock = products.filter(
        (p: any) => (p.stock_count || 0) === 0,
      ).length;

      // Top products by sales
      const productSales = new Map<
        string,
        { name: string; revenue: number; quantity: number }
      >();

      const orderItemsSnapshot = await Collections.orderItems()
        .where("shop_id", "==", shopId)
        .limit(1000)
        .get();

      orde/**
 * Performs products operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The products result
 *
 */
rItemsSnapshot.docs.forEach((doc: any) => {
        const item: any = doc.data();
        const existing = productSales.get(item.product_id) || {
          /** Name */
          name: item.product_name || "Unknown",
          /** Revenue */
          revenue: 0,
          /** Quantity */
          quantity: 0,
        };
        existing.revenue += (item.price || 0) * (item.quantity || 0);
        existing.quantity += item.quantity || 0;
        productSales.set(item.product_id, existing);
      });

      analytics.topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } else {
      // Admin view
      const productsSnapshot = await Collections.products().limit(1000).get();
      const products = productsSnapshot.docs.map((doc) => ({
        /** Id */
        id: doc.id,
        ...doc.data(),
      }));

      analytics.products.total = products.length;
      analytics.products.active = products.filter(
        (p: any) => p.status === "published",
      ).length;
      analytics.products.outOfStock = products.filter(
        (p: any) => (p.stock_count || 0) === 0,
      ).length;
    }

    // Calculate conversion rate (simplified)
    // In real scenario, you'd track page views
    analytics.conversionRate =
      analytics.customers.total > 0
        ? (analytics.orders.completed / analytics.customers.total) * 100
        : 0;

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to fetch analytics",
      },
      { status: 500 },
    );
  }
}
