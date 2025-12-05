/**
 * Razorpay Payment Verification API Route
 * POST /api/payments/razorpay/verify
 *
 * Verifies Razorpay payment signature to ensure payment authenticity.
 * Requires authenticated user.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthFromRequest(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: VerifyPaymentRequest = await request.json();
    const { orderId, paymentId, signature } = body;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, paymentId, signature" },
        { status: 400 }
      );
    }

    // Get Razorpay settings from Firestore
    const db = getFirestoreAdmin();
    const settingsDoc = await db
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .get();

    if (!settingsDoc.exists) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const settings = settingsDoc.data();
    const razorpayConfig = settings?.razorpay;

    if (!razorpayConfig?.enabled) {
      return NextResponse.json(
        { error: "Razorpay is not enabled" },
        { status: 400 }
      );
    }

    const mode = razorpayConfig.mode || "test";
    const keySecret = razorpayConfig[`${mode}KeySecret`];

    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    // Import crypto for signature verification
    const crypto = await import("crypto");

    // Create expected signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Verify signature
    const isValid = expectedSignature === signature;

    if (!isValid) {
      // Log failed verification attempt
      await db
        .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
        .doc(orderId)
        .update({
          status: "verification_failed",
          verificationAttempts:
            (
              await db
                .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
                .doc(orderId)
                .get()
            ).data()?.verificationAttempts || 0 + 1,
          lastVerificationAttempt: new Date(),
          updatedAt: new Date(),
        });

      return NextResponse.json(
        {
          success: false,
          error: "Payment signature verification failed",
        },
        { status: 400 }
      );
    }

    // Get payment transaction details
    const transactionDoc = await db
      .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
      .doc(orderId)
      .get();

    if (!transactionDoc.exists) {
      return NextResponse.json(
        { error: "Payment transaction not found" },
        { status: 404 }
      );
    }

    const transactionData = transactionDoc.data();

    // Verify user owns this transaction
    if (transactionData?.userId !== authResult.user.uid) {
      return NextResponse.json(
        { error: "Unauthorized - Transaction does not belong to user" },
        { status: 403 }
      );
    }

    // Update transaction status
    await db.collection(COLLECTIONS.PAYMENT_TRANSACTIONS).doc(orderId).update({
      paymentId,
      signature,
      status: "verified",
      verifiedAt: new Date(),
      updatedAt: new Date(),
    });

    // If this is linked to an order, update order status
    if (transactionData?.orderId) {
      const orderRef = db
        .collection(COLLECTIONS.ORDERS)
        .doc(transactionData.orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        await orderRef.update({
          paymentStatus: "paid",
          paymentId,
          paymentGateway: "razorpay",
          paidAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        orderId,
        paymentId,
        amount: transactionData?.amount || 0,
        currency: transactionData?.currency || "INR",
        status: "verified",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "RazorpayVerifyAPI",
      method: "POST",
      context: "Payment verification failed",
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}
