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
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";
    
    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied. Seller role required." },
        { status: 403 },
      );
    }

    // For admins, get all orders. For sellers, filter by their ID
    const sellerId = role === "admin" ? null : uid;

    const adminDb = getAdminDb();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query - admins see all orders, sellers see only their orders
    let query;
    if (sellerId) {
      query = adminDb
        .collection("orders")
        .where("sellerId", "==", sellerId);
    } else {
      // Admin - get all orders
      query = adminDb.collection("orders");
    }

    // Filter by status if provided
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    // Order by creation date (newest first)
    query = query.orderBy("createdAt", "desc").limit(limit);

    // Execute query
    const snapshot = await query.get();

    // Map documents to orders and convert timestamps
    let orders = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() 
          ? data.createdAt.toDate().toISOString() 
          : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.() 
          ? data.updatedAt.toDate().toISOString() 
          : data.updatedAt || new Date().toISOString(),
      };
    });

    // Apply search filter if provided (client-side for flexibility)
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(
        (order: any) =>
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.customerEmail?.toLowerCase().includes(searchLower),
      );
    }

    // Calculate stats
    let allOrdersSnapshot;
    if (sellerId) {
      allOrdersSnapshot = await adminDb
        .collection("orders")
        .where("sellerId", "==", sellerId)
        .get();
    } else {
      // Admin - get all orders
      allOrdersSnapshot = await adminDb.collection("orders").get();
    }

    const allOrders = allOrdersSnapshot.docs.map((doc: any) => doc.data());

    const stats = {
      total: allOrders.length,
      pendingApproval: allOrders.filter((o: any) => o.status === "pending_approval")
        .length,
      processing: allOrders.filter((o: any) => o.status === "processing")
        .length,
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
      { status: 500 },
    );
  }
}
