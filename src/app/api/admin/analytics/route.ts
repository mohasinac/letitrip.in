/**
 * Admin Analytics API
 *
 * Provides platform-wide analytics for admin dashboard.
 * User growth, revenue, orders, products, auctions metrics.
 *
 * @route GET /api/admin/analytics - Get admin analytics
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/admin/analytics?period=30days');
 * ```
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - Get admin analytics
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

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

    // Get platform metrics
    const [usersCount, productsCount, auctionsCount, ordersCount] =
      await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "products")),
        getCountFromServer(collection(db, "auctions")),
        getCountFromServer(collection(db, "orders")),
      ]);

    // Get orders for period
    const ordersQuery = query(
      collection(db, "orders"),
      where("createdAt", ">=", startDate.toISOString()),
      orderBy("createdAt", "desc"),
    );
    const ordersSnapshot = await getDocs(ordersQuery);

    // Calculate revenue metrics
    let totalRevenue = 0;
    let platformFees = 0;
    const revenueByDate: Record<string, number> = {};
    const ordersByStatus: Record<string, number> = {};

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      const date = new Date(order.createdAt).toISOString().split("T")[0];

      totalRevenue += order.total || 0;
      platformFees += (order.total || 0) * 0.05; // 5% platform fee
      revenueByDate[date] = (revenueByDate[date] || 0) + (order.total || 0);

      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Get new users in period
    const newUsersQuery = query(
      collection(db, "users"),
      where("createdAt", ">=", startDate.toISOString()),
      orderBy("createdAt", "desc"),
    );
    const newUsersSnapshot = await getDocs(newUsersQuery);
    const usersByDate: Record<string, number> = {};

    newUsersSnapshot.forEach((doc) => {
      const user = doc.data();
      const date = new Date(user.createdAt).toISOString().split("T")[0];
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });

    // Get user roles breakdown
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersByRole: Record<string, number> = {};

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });

    // Get top sellers
    const topSellersQuery = query(
      collection(db, "orders"),
      where("createdAt", ">=", startDate.toISOString()),
      orderBy("sellerId"),
      limit(10),
    );
    const topSellersSnapshot = await getDocs(topSellersQuery);
    const sellerRevenue: Record<string, number> = {};

    topSellersSnapshot.forEach((doc) => {
      const order = doc.data();
      sellerRevenue[order.sellerId] =
        (sellerRevenue[order.sellerId] || 0) + (order.total || 0);
    });

    const topSellers = Object.entries(sellerRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sellerId, revenue]) => ({ sellerId, revenue }));

    // Get recent activities
    const recentOrdersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(10),
    );
    const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
    const recentOrders = recentOrdersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get pending approvals
    const [pendingProductsSnapshot, pendingAuctionsSnapshot] =
      await Promise.all([
        getDocs(
          query(
            collection(db, "products"),
            where("status", "==", "pending"),
            limit(5),
          ),
        ),
        getDocs(
          query(
            collection(db, "auctions"),
            where("status", "==", "pending"),
            limit(5),
          ),
        ),
      ]);

    const pendingProducts = pendingProductsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const pendingAuctions = pendingAuctionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          period,
          summary: {
            totalUsers: usersCount.data().count,
            totalProducts: productsCount.data().count,
            totalAuctions: auctionsCount.data().count,
            totalOrders: ordersCount.data().count,
            newUsers: newUsersSnapshot.size,
            totalRevenue,
            platformFees,
            pendingProducts: pendingProductsSnapshot.size,
            pendingAuctions: pendingAuctionsSnapshot.size,
          },
          charts: {
            revenueByDate,
            usersByDate,
            ordersByStatus,
            usersByRole,
          },
          topSellers,
          recentOrders,
          pendingApprovals: {
            products: pendingProducts,
            auctions: pendingAuctions,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching admin analytics:", error);

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
