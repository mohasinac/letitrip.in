import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/seller/orders
 * List all orders for the authenticated seller
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";
    const sellerId = uid;

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied. Seller role required." },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    let query = adminDb.collection("seller_orders").where("sellerId", "==", sellerId);

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    // Order by creation date (newest first)
    query = query.orderBy("createdAt", "desc").limit(limit);

    // Execute query
    const snapshot = await query.get();

    // Map documents to orders
    let orders = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filter if provided (client-side for flexibility)
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(
        (order: any) =>
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.customerEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    const allOrdersSnapshot = await adminDb
      .collection("seller_orders")
      .where("sellerId", "==", sellerId)
      .get();

    const allOrders = allOrdersSnapshot.docs.map((doc: any) => doc.data());

    const stats = {
      total: allOrders.length,
      pendingApproval: allOrders.filter((o: any) => o.status === "pending").length,
      processing: allOrders.filter((o: any) => o.status === "processing").length,
      shipped: allOrders.filter((o: any) => o.status === "shipped").length,
      delivered: allOrders.filter((o: any) => o.status === "delivered").length,
      cancelled: allOrders.filter((o: any) => o.status === "cancelled").length,
      totalRevenue: allOrders
        .filter((o: any) => o.status === "delivered")
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: orders,
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching seller orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
