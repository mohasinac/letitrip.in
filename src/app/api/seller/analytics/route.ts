/**
 * Seller Analytics API
 *
 * Provides analytics data for seller dashboard.
 * Sales metrics, product performance, revenue trends.
 *
 * @route GET /api/seller/analytics - Get seller analytics
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/seller/analytics?period=30days');
 * ```
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - Get seller analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30days";

    // Calculate date range
    const now = new Date();
    const daysAgo =
      period === "7days"
        ? 7
        : period === "30days"
        ? 30
        : period === "90days"
        ? 90
        : 365;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get seller's orders
    const ordersQuery = query(
      collection(db, "orders"),
      where("sellerId", "==", userId),
      where("createdAt", ">=", startDate.toISOString()),
      orderBy("createdAt", "desc"),
    );
    const ordersSnapshot = await getDocs(ordersQuery);

    // Calculate metrics
    let totalRevenue = 0;
    let totalOrders = ordersSnapshot.size;
    let completedOrders = 0;
    let cancelledOrders = 0;
    const revenueByDate: Record<string, number> = {};
    const ordersByStatus: Record<string, number> = {};

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      const date = new Date(order.createdAt).toISOString().split("T")[0];

      // Revenue
      totalRevenue += order.total || 0;
      revenueByDate[date] = (revenueByDate[date] || 0) + (order.total || 0);

      // Status counts
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;

      if (order.status === "delivered") completedOrders++;
      if (order.status === "cancelled") cancelledOrders++;
    });

    // Get product performance
    const productsQuery = query(
      collection(db, "products"),
      where("sellerId", "==", userId),
      where("status", "==", "active"),
    );
    const productsSnapshot = await getDocs(productsQuery);

    let totalProducts = productsSnapshot.size;
    let totalViews = 0;
    let lowStockProducts = 0;

    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      totalViews += product.views || 0;
      if (product.stock < 10) lowStockProducts++;
    });

    // Get top selling products
    const topProductsQuery = query(
      collection(db, "orderItems"),
      where("sellerId", "==", userId),
      orderBy("quantity", "desc"),
      limit(5),
    );
    const topProductsSnapshot = await getDocs(topProductsQuery);
    const topProducts = topProductsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get recent reviews
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("sellerId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const recentReviews = reviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate average rating
    let totalRating = 0;
    let ratingCount = 0;
    reviewsSnapshot.forEach((doc) => {
      const review = doc.data();
      totalRating += review.rating || 0;
      ratingCount++;
    });
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          period,
          summary: {
            totalRevenue,
            totalOrders,
            completedOrders,
            cancelledOrders,
            totalProducts,
            totalViews,
            lowStockProducts,
            averageRating: averageRating.toFixed(1),
            ratingCount,
          },
          charts: {
            revenueByDate,
            ordersByStatus,
          },
          topProducts,
          recentReviews,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching seller analytics:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
