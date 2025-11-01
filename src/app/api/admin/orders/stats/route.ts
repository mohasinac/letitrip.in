import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/orders/stats
 * Get order statistics for admin dashboard
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
    const role = decodedToken.role || "user";

    // Only admins can access
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const adminDb = getAdminDb();

    // Fetch all orders from seller_orders collection
    const ordersSnapshot = await adminDb.collection("seller_orders").get();

    const allOrders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get unique seller count
    const uniqueSellers = new Set(allOrders.map((o: any) => o.sellerId));

    // Calculate statistics
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter((o: any) => o.status === "pending" || o.status === "pending_approval").length,
      processing: allOrders.filter((o: any) => o.status === "processing").length,
      shipped: allOrders.filter((o: any) => o.status === "shipped").length,
      delivered: allOrders.filter((o: any) => o.status === "delivered").length,
      cancelled: allOrders.filter((o: any) => o.status === "cancelled").length,
      totalRevenue: allOrders
        .filter((o: any) => o.status === "delivered")
        .reduce((sum, o: any) => sum + (o.total || 0), 0),
      totalSellers: uniqueSellers.size,
      codOrders: allOrders.filter((o: any) => o.paymentMethod === "cod").length,
      prepaidOrders: allOrders.filter((o: any) => o.paymentMethod === "prepaid" || o.paymentMethod === "online").length,
      avgOrderValue: allOrders.length > 0
        ? allOrders.reduce((sum, o: any) => sum + (o.total || 0), 0) / allOrders.length
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order stats" },
      { status: 500 }
    );
  }
}
