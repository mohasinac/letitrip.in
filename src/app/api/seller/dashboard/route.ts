/**
 * @fileoverview TypeScript Module
 * @module src/app/api/seller/dashboard/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { safeToISOString } from "@/lib/date-utils";
import { shortId } from "@/lib/id-helpers";
import {
  requireRole,
  getShopIdFromRequest,
  handleAuthError,
} from "@/app/api/lib/auth-helpers";

/**
 * Calculate average response time from order creation to first status update
 */
/**
 * Calculates average response time
 *
 * @param {any[]} orders - The orders
 *
 * @returns {string} The calculateaverageresponsetime result
 */

/**
 * Calculates average response time
 *
 * @param {any[]} orders - The orders
 *
 * @returns {string} The calculateaverageresponsetime result
 */

function calculateAverageResponseTime(orders: any[]): string {
  if (orders.length === 0) return "N/A";

  // Filter orders that have been updated after creation
  /**
 * Performs processed orders operation
 *
 * @param {any} (order - The (order
 *
 * @returns {any} The processedorders result
 *
 */
const processedOrders = orders.filter((order: any) => {
    const created = new Date(order.created_at).getTime();
    const updated = new Date(order.updated_at).getTime();
    return updated > created &&/**
 * Performs total hours operation
 *
 * @param {number} (sum - The (sum
 * @param {any} order - The order
 *
 * @returns {any} The totalhours result
 *
 */
 order.status !== "pending";
  });

  if (processedOrders.length === 0) return "N/A";

  // Calculate average time difference in hours
  const totalHours = processedOrders.reduce((sum: number, order: any) => {
    const created = new Date(order.created_at).getTime();
    const updated = new Date(order.updated_at).getTime();
    /**
     * Performs hours operation
     *
     * @returns {any} The hours result
     */

    /**
     * Performs hours operation
     *
     * @returns {any} The hours result
     */

    const hours = (updated - created) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  const avgHours = totalHours / processedOrders.length;

  // Format the response time
  if (avgHours < 1) {
    return "< 1 hour";
  } else if (avgHours < 24) {
    return `${Math.round(avgHours)} hours`;
  } else {
    const days = Math.round(avgHours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
}

/**
 * Get count of reviews from last 7 days
 */
/**
 * Retrieves new reviews count
 *
 * @param {FirebaseFirestore.Firestore} db - The db
 * @param {string} shopId - shop identifier
 *
 * @returns {Promise<any>} Promise resolving to newreviewscount result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Retrieves new reviews count
 *
 * @returns {Promise<any>} Promise resolving to newreviewscount result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function getNewReviewsCount(
  /** Db */
  db: FirebaseFirestore.Firestore,
  /** Shop Id */
  shopId: string,
): Promise<number> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reviewsSnapshot = await db
      .collection(COLLECTIONS.REVIEWS)
      .where("shop_id", "==", shopId)
      .where("created_at", ">=", sevenDaysAgo)
      .get();

    return reviewsSnapshot.size;
  } catch (error) {
    console.error("Error fetching new reviews:", error);
    return 0;
  }
}

/**
 * GET /api/seller/dashboard
 * Get seller dashboard statistics
 *
 * Query params:
 * - shop_id (optional - will use user's primary shop if not provided)
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, ["seller", "admin"]);
    const shopId = await getShopIdFromRequest(req, user);

    if (!shopId) {
      return NextResponse.json(
        { error: "No shop found. Please create a shop first." },
        { status: 404 },
      );
    }

    const db = getFirestoreAdmin();

    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    // Get shops stats (only for the specified shop)
    const shopDoc = await db.collection(COLLECTIONS.SHOPS).doc(shopId).get();
    const shopData: any = shopDoc.exists
      ? { id: shopDoc.id, ...shopDoc.data() }
      : null;
/**
 * Performs all products operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The allproducts result
 *
 */

    if (!shopData) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Count products
    const productsQuery = db
      .collection(COLLECTIONS.PRODUCTS)
      .where("shop_id", "==", shopId);
    const productsSnapshot = await productsQuery.get();
    const/**
 * Performs all orders operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The allorders result
 *
 */
 allProducts = productsSnapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));
    const activeProducts = allProducts.filter(
      (p: any) => p.status === "active",
    ).length;

    //**
 * Performs last month orders operation
 *
 * @param {any} (order - The (order
 *
 * @returns {any} The lastmonthorders result
 *
 */
/ Count orders and calculate revenue
    const ordersQuery = db
      .collection(COLLECTI/**
 * Performs current month revenue operation
 *
 * @param {number} (sum - The (sum
 * @param {any} order - The order
 *
 * @returns {any} The currentmonthrevenue result
 *
 */
ONS.ORDERS)
      .where("shop_id", "==", shopId);
    const ordersSnapshot = await ordersQuery.get();
    const allOrders = ordersSnapshot.docs.map((doc) => ({
      /** Id */
      id/**
 * Performs pending orders operation
 *
 * @param {any} (o - The (o
 *
 * @returns {any} The pendingorders result
 *
 */
: doc.id,
      ...doc.data(),
    }));

    // Current month orders
    const currentMonthOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.created/**
 * Performs date b operation
 *
 * @param {any} b.created_at - The b.created_at
 *
 * @returns {any} The dateb result
 *
 */
_at);
      return orderDate >= firstDayOfMonth;
    });

    // Last month orders
    const lastMonthOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= firstDayOfLastMonth && orderDate < firstDayOfMonth;
    });

    // Calculate revenues
    const currentMonthRevenue = currentMonthOrders.reduce(
      (sum: number, order: any) => {
        return sum + (order.total_amount || 0);
      },
      0,
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum: number, order: any) => {
        return sum + (order.total_amount || 0);
      },
      0,
    );

    // Order counts by status
    const pendingOrders = allOr/**
 * Performs order items operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The orderitems result
 *
 */
ders.filter(
      (o: any) => o.status === "pending",
    ).length;
    const totalOrders = allOrders.length;

    // Get recent orders (last 5)
    const recentOrders = allOrders
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((order: any) => ({
        /** Id */
        id: order.id,
        /** Order Number */
        orderNumber: order.order_number || `ORD-${shortId(order.id)}`,
        /** Customer */
        customer: order.customer_name || "Unknown",
        /** Amount */
        amount: order.total_amount || 0,
        /** Status */
        status: order.status || "pending",
        /** Date */
        date: safeToISOString(order.created_at) || new Date().toISOString(),
      }));

    // Get top products by revenue (need to aggregate order items)
    const orderItemsQuery = db
      .collection(COLLECTIONS.ORDER_ITEMS)
      .where("shop_id", "==", shopId);
    const orderItemsSnapshot = await orderItemsQuery.get(/**
 * Performs top products operation
 *
 * @param {any} productStats.entries( - The productstats.entries(
 *
 * @returns {any} The topproducts result
 *
 */
);
    const orderItems = orderItemsSnapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    // Aggregate by product
    const productStats = new Map<
      string,
      { name: string; sales: number; revenue: number; views: number }
    >();

    for (const item of orderItems) {
      const itemData = item as any;
      const productId = itemData.product_id;
      const existing = productStats.get(productId);

      if (existing) {
        existing.sales += itemData.quantity || 1;
        existing.revenue += (itemData.price || 0) * (itemData.quantity || 1);
      } else {
        // Get product name
        const productDoc = await db
          .collection(COLLECTIONS.PRODUCTS)
          .doc(productId)
          .get();
        const productData = productDoc.data();

        productStats.set(productId, {
          /** Name */
          name: productData?.name || "Unknown Product",
          /** Sales */
          sales: itemData.quantity || 1,
          /** Revenue */
          revenue: (itemData.price || 0) * (itemData.quantity || 1),
          /** Views */
          views: productData?.views || 0,
        });
      }
    }

    // Convert to array and sort by revenue
    const topProducts = Array.from(productStats.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Build response
    const response = {
      /** Stats */
      stats: {
        /** Shops */
        shops: {
          /** Total */
          total: 1,
          /** Active */
          active: shopData.status === "active" ? 1 : 0,
        },
        /** Products */
        products: {
          /** Total */
          total: allProducts.length,
          /** Active */
          active: activeProducts,
        },
        /** Orders */
        orders: {
          /** Pending */
          pending: pendingOrders,
          /** Total */
          total: totalOrders,
        },
        /** Revenue */
        revenue: {
          /** This Month */
          thisMonth: currentMonthRevenue,
          /** Last Month */
          lastMonth: lastMonthRevenue,
        },
      },
      recentOrders,
      topProducts,
      /** Shop Performance */
      shopPerformance: {
        /** Average Rating */
        averageRating: shopData.rating || 0,
        /** Total Ratings */
        totalRatings: shopData.total_ratings || 0,
        /** Order Fulfillment */
        orderFulfillment:
          totalOrders > 0
            ? Math.round(
                (allOrders.filter((o: any) => o.status === "delivered").length /
                  totalOrders) *
                  100,
              )
            : 0,
        /** Response Time */
        responseTime: calculateAverageResponseTime(allOrders),
      },
      /** Alerts */
      alerts: {
        /** Low Stock */
        lowStock: allProducts.filter(
          (p: any) => p.stock_quantity !== undefined && p.stock_quantity < 5,
        ).length,
        /** Pending Shipment */
        pendingShipment: allOrders.filter((o: any) => o.status === "confirmed")
          .length,
        /** New Reviews */
        newReviews: await getNewReviewsCount(db, shopId),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleAuthError(error);
  }
}
