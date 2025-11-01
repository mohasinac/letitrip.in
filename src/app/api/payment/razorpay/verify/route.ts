import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { verifyRazorpaySignature, fetchRazorpayPayment } from "@/lib/payment/razorpay-utils";
import { getAdminDb } from "@/lib/database/admin";

const ORDERS_COLLECTION = "orders";

/**
 * POST /api/payment/razorpay/verify
 * Verify Razorpay payment signature and update order status
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // Our internal order ID
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchRazorpayPayment(razorpay_payment_id);

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

      // Update order with payment details
      await orderRef.update({
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        transactionId: paymentDetails.id,
        status: "pending_approval", // Move to next stage
        paidAt: new Date().toISOString(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId,
      status: paymentDetails.status,
      amount: paymentDetails.amount,
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
