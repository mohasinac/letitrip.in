/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/analytics/[sessionId]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {Request} _request - The _request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {Request} _request - The _request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_request, {});
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Fetch orders with full data
    const ordersSnap = await db
      .collection(COLLECTIONS.ORDERS)
      .where("demoSession", "==", sessionId)
      .get();

    /**
 * Performs orders operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The orders result
 *
 */
const orders = ordersSnap.docs.map((doc) => ({
      /** Id */
      id: d/**
 * Performs total revenue operation
 *
 * @param {number} (sum - The (sum
 * @param {any} order - The order
 *
 * @returns {any} The totalrevenue result
 *
 */
oc.id,
      ...doc.data(),
    }));

    // Calculate analytics
   /**
 * Performs payment method breakdown operation
 *
 * @param {any} (acc - The (acc
 * @param {any} order - The order
 *
 * @returns {any} The paymentmethodbreakdown result
 *
 */
 const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + (order.total || 0),
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment method breakdown
    const paymentMethodBreakdown = orders.reduce((acc: any, order: any) => {
      const method = order.paymentMethod || "unknown";
      acc[method] = (acc[/**
 * Performs auctions operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The auctions result
 *
 */
method] || 0) + 1;
      return acc;
    }, {});/**
 * Performs active auctions operation
 *
 * @param {any} (a - The (a
 *
 * @returns {any} The activeauctions result
 *
 */


    // Order status breakdown
    const orderStatusBreakdown = orders.reduce((acc: any, order: any) => {
      const status = order.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Fetch auctions data
    const auctionsSnap = await db
      .collection(/**
 * Performs buyers operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The buyers result
 *
 */
COLLECTIONS.AUCTIONS)
      .where("demoSession", "==", session/**
 * Performs buyer orders operation
 *
 * @param {any} (o - The (o
 *
 * @returns {any} The buyerorders result
 *
 */
Id)
      .get();

    const auctions = auctionsSnap.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    const totalAuctions = auctions.length;
    const activeAuctions = auctions.filter(
      (a: any) => a.status === "active",
    ).length;
    const totalBidsAcrossAuctions = auctions.reduce(
      (sum: number, auction: any) => sum + (auc/**
 * Performs product order count operation
 *
 * @returns {any} The productordercount result
 *
 */
tion.totalBids || 0),
      0,
    );

    // User activity (buyers)
    const usersSnap = await db
      .collection(COLLECTIONS.USERS)
      .where("demoSession", "==", sessionId)
      .w/**
 * Performs top products operation
 *
 * @param {any} productOrderCount.entries( - The productordercount.entries(
 *
 * @returns {any} The topproducts result
 *
 */
here("role", "==", "user")
      .get();

    const buyers = usersSnap.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    const buyerActivity = buyers.map((buyer: any) => {
      const buyerOrders = orders.filter((o: any) => o.buyerId === buyer.id);
      const buyerSpent = buyerOrders.reduce(
        (sum: number, o: any) => sum + (o.total || 0),
        0,
      );

      return {
        /** Buyer Id */
        buyerId: buyer.id,
        /** Buyer Name */
        buyerName: buyer.name,
        /** Total Orders */
        totalOrders: buyerOrders.length,
        /** Total Spent */
        totalSpent: buyerSpent,
      };
    });

    // Top products by order count
    const productOrderCount = new Map<string, number>();
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const count = productOrderCount.get(item.productId) || 0;
        productOrderCount.set(item.productId, count + item.quantity);
      });
    });

    const topProducts = Array.from(productOrderCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

    return NextResponse.json({
      /** Orders */
      orders: {
        /** Total */
        total: totalOrders,
        /** Total Revenue */
        totalRevenue: Math.round(totalRevenue),
        /** Average Order Value */
        averageOrderValue: Math.round(averageOrderValue),
        /** By Status */
        byStatus: orderStatusBreakdown,
        /** By Payment Method */
        byPaymentMethod: paymentMethodBreakdown,
      },
      /** Auctions */
      auctions: {
        /** Total */
        total: totalAuctions,
        /** Active */
        active: activeAuctions,
        /** Total Bids */
        totalBids: totalBidsAcrossAuctions,
        /** Average Bids Per Auction */
        averageBidsPerAuction:
          totalAuctions > 0
            ? Math.round(totalBidsAcrossAuctions / totalAuctions)
            : 0,
      },
      /** Buyers */
      buyers: {
        /** Total */
        total: buyers.length,
        /** Activity */
        activity: buyerActivity,
      },
      /** Products */
      products: {
        /** Top Selling */
        topSelling: topProducts,
      },
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
