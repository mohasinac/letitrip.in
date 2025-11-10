import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /admin/dashboard
 * Get admin dashboard statistics
 *
 * Admin only endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();

    // TODO: Verify admin role from session
    // For now, we'll allow all requests

    // Get all users
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
    const allUsers = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalUsers = allUsers.length;
    const totalSellers = allUsers.filter(
      (u: any) => u.role === "seller"
    ).length;
    const totalAdmins = allUsers.filter((u: any) => u.role === "admin").length;
    const activeUsers = allUsers.filter(
      (u: any) => u.status === "active"
    ).length;
    const bannedUsers = allUsers.filter(
      (u: any) => u.status === "banned"
    ).length;

    // Get all shops
    const shopsSnapshot = await db.collection(COLLECTIONS.SHOPS).get();
    const allShops = shopsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const totalShops = allShops.length;
    const activeShops = allShops.filter(
      (s: any) => s.status === "active"
    ).length;
    const verifiedShops = allShops.filter((s: any) => s.is_verified).length;

    // Get all categories
    const categoriesSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .get();
    const totalCategories = categoriesSnapshot.size;

    // Get all products
    const productsSnapshot = await db.collection(COLLECTIONS.PRODUCTS).get();
    const allProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(
      (p: any) => p.status === "active"
    ).length;
    const outOfStockProducts = allProducts.filter(
      (p: any) => p.stock_quantity !== undefined && p.stock_quantity === 0
    ).length;

    // Get all orders
    const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS).get();
    const allOrders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(
      (o: any) => o.status === "pending"
    ).length;
    const completedOrders = allOrders.filter(
      (o: any) => o.status === "delivered"
    ).length;
    const cancelledOrders = allOrders.filter(
      (o: any) => o.status === "cancelled"
    ).length;

    // Calculate total revenue
    const totalRevenue = allOrders.reduce((sum: number, order: any) => {
      return sum + (order.total_amount || 0);
    }, 0);

    // Get date ranges for trends
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Calculate 30-day trends
    const last30DaysUsers = allUsers.filter((u: any) => {
      const createdAt = new Date(u.created_at);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const last30DaysShops = allShops.filter((s: any) => {
      const createdAt = new Date(s.created_at);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const last30DaysProducts = allProducts.filter((p: any) => {
      const createdAt = new Date(p.created_at);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const last30DaysOrders = allOrders.filter((o: any) => {
      const createdAt = new Date(o.created_at);
      return createdAt >= thirtyDaysAgo;
    }).length;

    // Calculate previous 30-day periods for comparison
    const prev30DaysUsers = allUsers.filter((u: any) => {
      const createdAt = new Date(u.created_at);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    const prev30DaysShops = allShops.filter((s: any) => {
      const createdAt = new Date(s.created_at);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    const prev30DaysProducts = allProducts.filter((p: any) => {
      const createdAt = new Date(p.created_at);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    const prev30DaysOrders = allOrders.filter((o: any) => {
      const createdAt = new Date(o.created_at);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    // Calculate percentage changes
    const usersTrend =
      prev30DaysUsers > 0
        ? (
            ((last30DaysUsers - prev30DaysUsers) / prev30DaysUsers) *
            100
          ).toFixed(1)
        : "+100.0";

    const shopsTrend =
      prev30DaysShops > 0
        ? (
            ((last30DaysShops - prev30DaysShops) / prev30DaysShops) *
            100
          ).toFixed(1)
        : "+100.0";

    const productsTrend =
      prev30DaysProducts > 0
        ? (
            ((last30DaysProducts - prev30DaysProducts) / prev30DaysProducts) *
            100
          ).toFixed(1)
        : "+100.0";

    const ordersTrend =
      prev30DaysOrders > 0
        ? (
            ((last30DaysOrders - prev30DaysOrders) / prev30DaysOrders) *
            100
          ).toFixed(1)
        : "+100.0";

    // Get recent activities (simulated - in production, use an activities collection)
    const recentActivities = [
      {
        type: "user",
        message: "New user registered",
        timestamp: new Date().toISOString(),
        icon: "Users",
      },
      {
        type: "shop",
        message: "New shop pending approval",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        icon: "Store",
        link: "/admin/shops",
      },
      {
        type: "product",
        message: `${last30DaysProducts} new products listed`,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        icon: "Package",
      },
    ];

    const response = {
      stats: {
        totalUsers,
        totalSellers,
        totalAdmins,
        totalShops,
        activeShops,
        verifiedShops,
        totalCategories,
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        activeUsers,
        bannedUsers,
      },
      trends: {
        users: {
          value: usersTrend,
          isPositive: parseFloat(usersTrend) >= 0,
        },
        shops: {
          value: shopsTrend,
          isPositive: parseFloat(shopsTrend) >= 0,
        },
        products: {
          value: productsTrend,
          isPositive: parseFloat(productsTrend) >= 0,
        },
        orders: {
          value: ordersTrend,
          isPositive: parseFloat(ordersTrend) >= 0,
        },
      },
      recentActivities,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
