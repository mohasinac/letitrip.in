import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/orders/[id]/cancel
 * Cancel an order (Customer)
 * Rule: Customers can only cancel within 1 day of payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

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
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    // Verify order belongs to this user
    if (orderData?.userId !== uid) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
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
        { status: 400 }
      );
    }

    // Check if payment was made and enforce 1-day rule
    if (orderData?.paidAt) {
      const paidAt = orderData.paidAt instanceof Timestamp
        ? orderData.paidAt.toDate()
        : new Date(orderData.paidAt);

      const now = new Date();
      const timeDiff = now.getTime() - paidAt.getTime();
      const daysSincePayment = timeDiff / (1000 * 60 * 60 * 24);

      if (daysSincePayment > 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Cancellation window expired. You can only cancel orders within 1 day of payment. Please contact support for assistance.",
          },
          { status: 400 }
        );
      }
    }

    // Update order status to cancelled
    await orderRef.update({
      status: "cancelled",
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: "customer",
      cancellationReason: reason || "Cancelled by customer",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create notification for seller
    if (orderData?.sellerId) {
      await adminDb.collection("alerts").add({
        sellerId: orderData.sellerId,
        orderId,
        orderNumber: orderData?.orderNumber,
        type: "order_cancelled",
        title: "Order Cancelled by Customer",
        message: `Order ${orderData?.orderNumber} has been cancelled by the customer`,
        severity: "warning",
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Create notification for customer
    await adminDb.collection("alerts").add({
      userId: uid,
      orderId,
      orderNumber: orderData?.orderNumber,
      type: "order_cancelled",
      title: "Order Cancelled",
      message: `Your order ${orderData?.orderNumber} has been cancelled successfully`,
      severity: "info",
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cancel order",
      },
      { status: 500 }
    );
  }
}
