/**
 * Seller Dashboard API
 *
 * Get seller's dashboard statistics and overview.
 *
 * @route GET /api/seller/dashboard - Get dashboard data (requires seller/admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - Get seller dashboard stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    // Get seller's products count
    const productsQuery = query(
      collection(db, "products"),
      where("sellerId", "==", userId),
    );
    const productsSnapshot = await getDocs(productsQuery);
    const totalProducts = productsSnapshot.size;
    const activeProducts = productsSnapshot.docs.filter(
      (doc) => doc.data().status === "published",
    ).length;

    // Get seller's auctions count
    const auctionsQuery = query(
      collection(db, "auctions"),
      where("sellerId", "==", userId),
    );
    const auctionsSnapshot = await getDocs(auctionsQuery);
    const totalAuctions = auctionsSnapshot.size;
    const activeAuctions = auctionsSnapshot.docs.filter(
      (doc) => doc.data().status === "active",
    ).length;

    // Get seller's orders count
    const ordersQuery = query(
      collection(db, "orders"),
      where("items", "array-contains-any", [{ sellerId: userId }]),
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    const totalOrders = ordersSnapshot.size;

    // Calculate revenue
    let totalRevenue = 0;
    ordersSnapshot.docs.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.paymentStatus === "completed") {
        totalRevenue += orderData.total || 0;
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          products: {
            total: totalProducts,
            active: activeProducts,
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
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching seller dashboard:", error);

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
