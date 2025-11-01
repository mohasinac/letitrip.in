import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/admin/orders
 * List all orders from all sellers with filtering and pagination
 * Reuses seller orders logic but without seller filter
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sellerId = searchParams.get("sellerId");
    const search = searchParams.get("search");
    const paymentMethod = searchParams.get("paymentMethod");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query - fetch from orders collection
    let firestoreQuery: any = adminDb.collection("orders");

    // Apply filters
    if (status && status !== "all") {
      firestoreQuery = firestoreQuery.where("status", "==", status);
    }
    if (sellerId && sellerId !== "all") {
      firestoreQuery = firestoreQuery.where("sellerId", "==", sellerId);
    }
    if (paymentMethod && paymentMethod !== "all") {
      firestoreQuery = firestoreQuery.where("paymentMethod", "==", paymentMethod);
    }

    // Order by creation date (newest first) and apply pagination
    firestoreQuery = firestoreQuery.orderBy("createdAt", "desc").limit(limit * page);

    // Execute query
    const snapshot = await firestoreQuery.get();

    // Map documents to orders
    let orders = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    // Apply search filter (client-side for flexibility)
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(
        (order: any) =>
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.customerEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Implement pagination on filtered results
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        page,
        limit,
        total: orders.length,
        totalPages: Math.ceil(orders.length / limit),
      },
    });
  } catch (error: any) {
    console.error("Error listing admin orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list orders" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders (bulk status update)
 * Update status for multiple orders
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No order IDs provided" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const batch = adminDb.batch();

    // Update each order
    ids.forEach((id: string) => {
      const docRef = adminDb.collection("orders").doc(id);
      batch.update(docRef, {
        status,
        updatedAt: new Date(),
      });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${ids.length} order(s) updated successfully`,
      updatedCount: ids.length,
    });
  } catch (error: any) {
    console.error("Error bulk updating orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update orders" },
      { status: 500 }
    );
  }
}
