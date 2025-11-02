import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/seller/orders/[id]/cancel
 * Cancel an order (Seller)
 * Rule: Sellers can only cancel within 3 days of payment
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

    // Check if order can be cancelled
    if (
      orderData?.status === "delivered" ||
      orderData?.status === "cancelled" ||
      orderData?.status === "refunded"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot cancel delivered, refunded, or already cancelled orders",
        },
        { status: 400 },
      );
    }

    // Check if payment was made and enforce 3-day rule (only for sellers, not admins)
    if (role === "seller" && orderData?.paidAt) {
      const paidAt = orderData.paidAt instanceof Timestamp
        ? orderData.paidAt.toDate()
        : new Date(orderData.paidAt);

      const now = new Date();
      const timeDiff = now.getTime() - paidAt.getTime();
      const daysSincePayment = timeDiff / (1000 * 60 * 60 * 24);

      if (daysSincePayment > 3) {
        return NextResponse.json(
          {
            success: false,
            error: "Cancellation window expired. Sellers can only cancel orders within 3 days of payment. Please contact admin for assistance.",
          },
          { status: 400 }
        );
      }
    }

    // Update order status to cancelled
    await orderRef.update({
      status: "cancelled",
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: role === "admin" ? "admin" : "seller",
      cancellationReason: reason || `Cancelled by ${role}`,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create alert for seller (if cancelled by admin)
    if (role === "admin" && orderData?.sellerId) {
      await adminDb.collection("alerts").add({
        sellerId: orderData.sellerId,
        orderId,
        orderNumber: orderData?.orderNumber,
        type: "order_cancelled",
        title: "Order Cancelled by Admin",
        message: `Order ${orderData?.orderNumber} has been cancelled by admin`,
        severity: "warning",
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Create alert for customer
    if (orderData?.userId) {
      await adminDb.collection("alerts").add({
        userId: orderData.userId,
        orderId,
        orderNumber: orderData?.orderNumber,
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Your order ${orderData?.orderNumber} has been cancelled`,
        severity: "warning",
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Get updated order
    const updatedOrderDoc = await orderRef.get();
    const updatedOrder = {
      id: updatedOrderDoc.id,
      ...updatedOrderDoc.data(),
      createdAt: updatedOrderDoc.data()?.createdAt?.toDate?.(),
      updatedAt: updatedOrderDoc.data()?.updatedAt?.toDate?.(),
      cancelledAt: updatedOrderDoc.data()?.cancelledAt?.toDate?.(),
      paidAt: updatedOrderDoc.data()?.paidAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cancel order",
      },
      { status: 500 },
    );
  }
}
