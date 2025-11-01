import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { createRazorpayOrder } from "@/lib/payment/razorpay-utils";

/**
 * POST /api/payment/razorpay/create-order
 * Create a Razorpay order for checkout
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = "INR" } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Generate unique receipt
    const receipt = `order_${Date.now()}_${user.uid.substring(0, 8)}`;

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(amount, currency, receipt);

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
