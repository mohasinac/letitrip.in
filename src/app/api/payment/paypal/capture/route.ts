import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { capturePayPalPayment } from "@/lib/payment/paypal-utils";
import { getAdminDb } from "@/lib/database/admin";

const ORDERS_COLLECTION = "orders";

/**
 * POST /api/payment/paypal/capture
 * Capture PayPal payment and update order status
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paypalOrderId, orderId } = body;

    // Validate required fields
    if (!paypalOrderId) {
      return NextResponse.json(
        { error: "Missing PayPal order ID" },
        { status: 400 }
      );
    }

    // Capture the payment
    const captureData = await capturePayPalPayment(paypalOrderId);

    // Check if capture was successful
    if (captureData.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "Payment capture failed",
          status: captureData.status,
        },
        { status: 400 }
      );
    }

    // Update order in database if orderId is provided
    if (orderId) {
      const db = getAdminDb();
      const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Verify order ownership
      if (orderDoc.data()?.userId !== user.uid) {
        return NextResponse.json(
          { error: "Unauthorized to update this order" },
          { status: 403 }
        );
      }

      // Extract capture ID from response
      const captureId =
        captureData.purchase_units[0]?.payments?.captures[0]?.id;

      // Update order with payment details
      await orderRef.update({
        paymentStatus: "paid",
        paymentId: captureId,
        paypalOrderId: paypalOrderId,
        transactionId: captureId,
        status: "pending_approval", // Move to next stage
        paidAt: new Date().toISOString(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      captured: true,
      paypalOrderId,
      orderId,
      status: captureData.status,
      captureId: captureData.purchase_units[0]?.payments?.captures[0]?.id,
    });
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    return NextResponse.json(
      {
        error: "Failed to capture payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
