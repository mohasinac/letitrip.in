/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/dashboard/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { getCurrentUser } from "@/app/api/lib/session";

/**
 * GET /admin/dashboard
 * Get admin dashboard statistics
 *
 * Admin only endpoint
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
    const db = getFirestoreAdmin();

    // Verify admin role from session
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    // Get all users
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
    /**
 * Performs all users operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The allusers result
 *
 */
const allUsers = usersSnapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    const totalUsers/**
 * Performs total admins operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The totaladmins result
 *
 */
 = allUsers.length;
    const totalSellers = allUsers.f/**
 * Performs banned users operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The bannedusers result
 *
 */
ilter(
      (u: any) => u.role === "seller",
    ).length;
    const/**
 * Performs all shops operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The allshops result
 *
 */
 totalAdmins = allUsers.filter((u: any) => u.role === "admin").length;
    const activeUsers = allUsers.filter(
      (u: any) => u.statu/**
 * Performs verified shops operation
 *
 * @param {any} (s - The (s
 *
 * @returns {any} The verifiedshops result
 *
 */
s === "active",
    ).length;
    const bannedUsers = allUsers.filter(
      (u: any) => u.status === "banned",
    ).length;

    // Get all shops
    const shopsSnapshot = await db.collection(COLLECTIONS.SHOPS).get();
    const a/**
 * Performs all products operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The allproducts result
 *
 */
llShops = shopsSnapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));
    const totalShops = allShops.length;
/**
 * Performs out of stock products operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The outofstockproducts result
 *
 */
    const activeShops = allShops.filter(
      (s: any) => s.status === "active",
    ).length;
    c/**
 * Performs all orders operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The allorders result
 *
 */
onst verifiedShops = allShops.filter((s: any) => s.is_verified).length;

    // Get all categories
    const categoriesSnapshot = await db
    /**
 * Performs completed orders operation
 *
 * @param {any} (o - The (o
 *
 * @returns {any} The completedorders result
 *
 */
  .collection(COLLECTIONS.CATEGORIES)
      .get();
    const totalCategories = categoriesSnapshot.size;

    //**
 * Performs total revenue operation
 *
 * @param {number} (sum - The (sum
 * @param {any} order - The order
 *
 * @returns {any} The totalrevenue result
 *
 */
/ Get all products
    const productsSnapshot = await db.collection(COLLECTIONS.PRODUCTS).get();
    const allProducts = productsSnapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
  /**
 * Performs last30 days users operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The last30daysusers result
 *
 */
  }));
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(
      (p: any) => p.status === "active",
    ).length;
    const outOfStockProducts = allProduct/**
 * Performs last30 days products operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The last30daysproducts result
 *
 */
s.filter(
      (p: any) => p.stock_quantity !== undefined && p.stock_quantity === 0,
    ).length;

    // Get all orders
    const ordersSnapshot = await db.collection(COLLECTIONS.ORDERS).get();
    const allOrders = ordersSnapshot.docs.map((doc) => ({/**
 * Performs prev30 days users operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The prev30daysusers result
 *
 */

      /** Id */
      id: doc.id,
      ...doc.data(),
    }/**
 * Performs prev30 days shops operation
 *
 * @param {any} (s - The (s
 *
 * @returns {any} The prev30daysshops result
 *
 */
));
    const totalOrders = allOrders.length;
    const pendi/**
 * Performs prev30 days products operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The prev30daysproducts result
 *
 */
ngOrders = allOrders.filter(
      (o: any) => o.status === "/**
 * Performs prev30 days orders operation
 *
 * @param {any} (o - The (o
 *
 * @returns {any} The prev30daysorders result
 *
 */
pending",
    ).length;
    const completedOrders = allOrders.filter(
      (o: any) => o.status === "delivered",
    ).length;
    const cancelledOrders = allOrders.filter(
      (o: any) => o.status === "cancelled",
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
        /** Type */
        type: "user",
        /** Message */
        message: "New user registered",
        /** Timestamp */
        timestamp: new Date().toISOString(),
        /** Icon */
        icon: "Users",
      },
      {
        /** Type */
        type: "shop",
        /** Message */
        message: "New shop pending approval",
        /** Timestamp */
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        /** Icon */
        icon: "Store",
        /** Link */
        link: "/admin/shops",
      },
      {
        /** Type */
        type: "product",
        /** Message */
        message: `${last30DaysProducts} new products listed`,
        /** Timestamp */
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        /** Icon */
        icon: "Package",
      },
    ];

    const response = {
      /** Stats */
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
      /** Trends */
      trends: {
        /** Users */
        users: {
          /** Value */
          value: usersTrend,
          /** Is Positive */
          isPositive: parseFloat(usersTrend) >= 0,
        },
        /** Shops */
        shops: {
          /** Value */
          value: shopsTrend,
          /** Is Positive */
          isPositive: parseFloat(shopsTrend) >= 0,
        },
        /** Products */
        products: {
          /** Value */
          value: productsTrend,
          /** Is Positive */
          isPositive: parseFloat(productsTrend) >= 0,
        },
        /** Orders */
        orders: {
          /** Value */
          value: ordersTrend,
          /** Is Positive */
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
      { status: 500 },
    );
  }
}
