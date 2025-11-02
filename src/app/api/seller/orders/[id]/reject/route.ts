import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/seller/orders/[id]/reject
 * Reject a pending order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const sellerId = uid;
    
    // Await params in Next.js 15
    const { id: orderId } = await params;

    // Validate orderId
    if (!orderId || typeof orderId !== "string" || orderId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 },
      );
    }

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied. Seller role required." },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Rejection reason is required" },
        { status: 400 },
      );
    }

    // Get order document
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

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

    // Check if order is in pending_approval status
    if (orderData?.status !== "pending_approval") {
      return NextResponse.json(
        {
          success: false,
          error: "Only pending_approval orders can be rejected",
        },
        { status: 400 },
      );
    }

    // Update order status to rejected
    await orderRef.update({
      status: "rejected",
      rejectedAt: FieldValue.serverTimestamp(),
      rejectionReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create alert for seller
    await adminDb.collection("alerts").add({
      sellerId,
      orderId,
      orderNumber: orderData?.orderNumber,
      type: "order_rejected",
      title: "Order Rejected",
      message: `Order ${orderData?.orderNumber} has been rejected`,
      severity: "error",
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Get updated order
    const updatedOrderDoc = await orderRef.get();
    const updatedOrder = {
      id: updatedOrderDoc.id,
      ...updatedOrderDoc.data(),
      createdAt: updatedOrderDoc.data()?.createdAt?.toDate?.(),
      updatedAt: updatedOrderDoc.data()?.updatedAt?.toDate?.(),
      rejectedAt: updatedOrderDoc.data()?.rejectedAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      message: "Order rejected successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error rejecting order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reject order",
      },
      { status: 500 },
    );
  }
}
