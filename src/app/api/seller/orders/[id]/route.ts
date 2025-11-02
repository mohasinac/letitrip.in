import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/seller/orders/[id]
 * Get a specific order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await params in Next.js 15+
    const { id: orderId } = await params;
    
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
    const sellerId = uid;

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied. Seller role required." },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();

    // Get order document
    const orderDoc = await adminDb
      .collection("orders")
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const orderData = orderDoc.data();

    // Verify order belongs to this seller (unless admin)
    if (role !== "admin" && orderData?.sellerId !== sellerId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Convert Firestore Timestamps to ISO strings for JSON serialization
    const sanitizedOrder = {
      id: orderDoc.id,
      ...orderData,
      createdAt: orderData?.createdAt?.toDate?.() 
        ? orderData.createdAt.toDate().toISOString() 
        : orderData?.createdAt || new Date().toISOString(),
      updatedAt: orderData?.updatedAt?.toDate?.() 
        ? orderData.updatedAt.toDate().toISOString() 
        : orderData?.updatedAt || new Date().toISOString(),
      approvedAt: orderData?.approvedAt?.toDate?.() 
        ? orderData.approvedAt.toDate().toISOString() 
        : orderData?.approvedAt,
      shippedAt: orderData?.shippedAt?.toDate?.() 
        ? orderData.shippedAt.toDate().toISOString() 
        : orderData?.shippedAt,
      deliveredAt: orderData?.deliveredAt?.toDate?.() 
        ? orderData.deliveredAt.toDate().toISOString() 
        : orderData?.deliveredAt,
      cancelledAt: orderData?.cancelledAt?.toDate?.() 
        ? orderData.cancelledAt.toDate().toISOString() 
        : orderData?.cancelledAt,
      paidAt: orderData?.paidAt?.toDate?.() 
        ? orderData.paidAt.toDate().toISOString() 
        : orderData?.paidAt,
      refundedAt: orderData?.refundedAt?.toDate?.() 
        ? orderData.refundedAt.toDate().toISOString() 
        : orderData?.refundedAt,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedOrder,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch order",
      },
      { status: 500 },
    );
  }
}
