import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/seller/orders/[id]/approve
 * Approve a pending order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
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
    const orderId = params.id;

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied. Seller role required." },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();

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

    // Check if order is in pending status
    if (orderData?.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Only pending orders can be approved",
        },
        { status: 400 },
      );
    }

    // Update order status to approved and then processing
    await orderRef.update({
      status: "processing",
      approvedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create alert for seller
    await adminDb.collection("alerts").add({
      sellerId,
      orderId,
      orderNumber: orderData?.orderNumber,
      type: "order_approved",
      title: "Order Approved",
      message: `Order ${orderData?.orderNumber} has been approved and moved to processing`,
      severity: "success",
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Order approved successfully",
    });
  } catch (error: any) {
    console.error("Error approving order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to approve order",
      },
      { status: 500 },
    );
  }
}
