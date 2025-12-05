/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/visualization/[sessionId]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { toDateInputValue, getTodayDateInputValue } from "@/lib/date-utils";
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

    // Fetch orders
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
      id: doc.id,
      ...doc.data(),
    }));

    // Revenue over time (daily)
    const revenueByDate = orders.reduce((acc: any, order: any) => {
      const date = order.createdAt?.toDate
        ? toDateInputValue(order.createdAt.toDate())
        : getTodayDat/**
 * Performs revenue time series operation
 *
 * @param {any} revenueByDate - The revenuebydate
 *
 * @returns {any} The revenuetimeseries result
 *
 */
eInputValue();

      acc[date] = (acc[date] || 0) + (order.total || 0);
      return acc;
    }, {});

    const revenueTimeSeries = Object.entries(revenueByDate).map(
      ([date, revenue]) => ({
        dat/**
 * Performs products operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The products result
 *
 */
e,
        /** Revenue */
        revenue: Math.round(revenue as number),
      }),
    );

    // Category distribution
    const productsSnap /**
 * Performs categories map operation
 *
 * @param {any} categoriesSnap.docs.map((doc - The categoriessnap.docs.map((doc
 *
 * @returns {any} The categoriesmap result
 *
 */
= await db
      .collection(COLLECTIONS.PRODUCTS)
      .where("demoSession", "==", sessionId)
      .get();

    const products = productsSnap.docs.map((doc) => ({
      /** Id */
/**
 * Performs category data operation
 *
 * @param {any} categoryDistribution - The categorydistribution
 *
 * @returns {any} The categorydata result
 *
 */
      id: doc.id,
      ...doc.data(),
    }));

    const categoriesSnap = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("demoSession", "==", sessionId)
      .get();

    const categoriesMap = n/**
 * Performs status data operation
 *
 * @param {any} statusDistribution - The statusdistribution
 *
 * @returns {any} The statusdata result
 *
 */
ew Map(
      categoriesSnap.docs.map((doc) => [doc.id, doc.data().name]),
    );

    const categoryDistribution = products.reduce((acc: any, product: any) => {
      const categoryName = categoriesMap.get(product.categoryId) || "Unknown"/**
 * Performs payment data operation
 *
 * @param {any} paymentDistribution - The paymentdistribution
 *
 * @returns {any} The paymentdata result
 *
 */
;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryDistribution).map(
      ([name, count]) => ({
        name,
        count,
      }),
    );

    // Order status pie chart
    const statusDistribution = orders.reduce((acc: any, order: any) => {
      const status = order.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusDistribution).map(
      ([status, count]) => ({
        status,
        count,
      }),
    );

    // Payment method distribution
    const paymentDistribution = orders.reduce((acc: any, order: any) => {
      const method = order.paymentMethod || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const paymentData = Object.entries(paymentDistribution).map(
      ([method, count]) => ({
        method,
        count,
      }),
    );

    return NextResponse.json({
      revenueTimeSeries,
      /** Category Distribution */
      categoryDistribution: categoryData,
      /** Order Status Distribution */
      orderStatusDistribution: statusData,
      /** Payment Method Distribution */
      paymentMethodDistribution: paymentData,
    });
  } catch (error: any) {
    console.error("Visualization fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
