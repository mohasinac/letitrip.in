import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where, orderBy, limit as firestoreLimit } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all"; // all, pending, confirmed, processing, shipped, delivered, cancelled
    const offset = (page - 1) * limit;

    const userId = user.userId;

    // Fetch user orders from Firestore
    let ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    if (status !== "all") {
      ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    }

    const ordersSnapshot = await getDocs(ordersQuery);
    const allOrders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || doc.data().deliveredAt,
      estimatedDelivery: doc.data().estimatedDelivery?.toDate?.()?.toISOString() || doc.data().estimatedDelivery
    })) as any[];

    // Apply pagination
    const paginatedOrders = allOrders.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(allOrders.length / limit),
          totalOrders: allOrders.length,
          hasMore: offset + limit < allOrders.length
        },
        summary: {
          totalOrders: allOrders.length,
          totalSpent: allOrders.reduce((sum, order) => sum + (order.total || 0), 0),
          pendingOrders: allOrders.filter(order => order.status === "pending").length,
          processingOrders: allOrders.filter(order => order.status === "processing").length,
          shippedOrders: allOrders.filter(order => order.status === "shipped").length,
          deliveredOrders: allOrders.filter(order => order.status === "delivered").length
        }
      }
    });

  } catch (error) {
    console.error("Get user orders error:", error);
    return NextResponse.json(
      { error: "Failed to get user orders" },
      { status: 500 }
    );
  }
}
