/**
 * Admin Dashboard API
 *
 * Get platform-wide statistics for admin.
 *
 * @route GET /api/admin/dashboard - Get admin dashboard (requires admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - Get admin dashboard stats
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    // Get total users
    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsers = usersSnapshot.size;

    // Get total products
    const productsSnapshot = await getDocs(collection(db, "products"));
    const totalProducts = productsSnapshot.size;
    const publishedProducts = productsSnapshot.docs.filter(
      (doc) => doc.data().status === "published",
    ).length;
    const pendingProducts = productsSnapshot.docs.filter(
      (doc) => doc.data().status === "pending",
    ).length;

    // Get total auctions
    const auctionsSnapshot = await getDocs(collection(db, "auctions"));
    const totalAuctions = auctionsSnapshot.size;
    const activeAuctions = auctionsSnapshot.docs.filter(
      (doc) => doc.data().status === "active",
    ).length;

    // Get total orders
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const totalOrders = ordersSnapshot.size;

    // Calculate total revenue
    let totalRevenue = 0;
    ordersSnapshot.docs.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.paymentStatus === "completed") {
        totalRevenue += orderData.total || 0;
      }
    });

    // Get total shops
    const shopsSnapshot = await getDocs(collection(db, "shops"));
    const totalShops = shopsSnapshot.size;

    return NextResponse.json(
      {
        success: true,
        data: {
          users: {
            total: totalUsers,
          },
          products: {
            total: totalProducts,
            published: publishedProducts,
            pending: pendingProducts,
          },
          auctions: {
            total: totalAuctions,
            active: activeAuctions,
          },
          orders: {
            total: totalOrders,
          },
          revenue: {
            total: totalRevenue,
          },
          shops: {
            total: totalShops,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching admin dashboard:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch dashboard",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
