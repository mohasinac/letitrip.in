/**
 * Razorpay Payment Capture API Route
 * POST /api/payments/razorpay/capture
 *
 * Captures an authorized Razorpay payment.
 * Requires authenticated user.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface CapturePaymentRequest {
  paymentId: string;
  amount: number;
  currency: string;
}

interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  created_at: number;
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
    const body: CapturePaymentRequest = await request.json();
    const { paymentId, amount, currency = "INR" } = body;

    // Validate required fields
    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing required field: paymentId" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount - Must be greater than 0" },
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
    const keyId = razorpayConfig[`${mode}KeyId`];
    const keySecret = razorpayConfig[`${mode}KeySecret`];

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    // Import Razorpay SDK dynamically
    const Razorpay = (await import("razorpay" as any)) as any;
    const razorpay = new Razorpay.default({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Capture the payment
    const capturedPayment: RazorpayPaymentResponse =
      await razorpay.payments.capture(
        paymentId,
        Math.round(amount * 100), // Convert to paise
        currency.toUpperCase()
      );

    // Find transaction by paymentId
    const transactionsSnapshot = await db
      .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
      .where("paymentId", "==", paymentId)
      .limit(1)
      .get();

    let transactionId: string | null = null;

    if (!transactionsSnapshot.empty) {
      const transactionDoc = transactionsSnapshot.docs[0];
      transactionId = transactionDoc.id;

      // Verify user owns this transaction
      const transactionData = transactionDoc.data();
      if (transactionData?.userId !== authResult.user.uid) {
        return NextResponse.json(
          { error: "Unauthorized - Transaction does not belong to user" },
          { status: 403 }
        );
      }

      // Update transaction status
      await transactionDoc.ref.update({
        status: "captured",
        capturedAmount: amount,
        capturedAt: new Date(capturedPayment.created_at * 1000),
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
            paymentStatus: "captured",
            capturedAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    // Return formatted response
    return NextResponse.json(
      {
        id: capturedPayment.id,
        amount: amount,
        currency: currency.toUpperCase(),
        status: capturedPayment.status,
        captured: capturedPayment.captured,
        capturedAt: new Date(capturedPayment.created_at * 1000).toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "RazorpayCaptureAPI",
      method: "POST",
      context: "Payment capture failed",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to capture payment",
      },
      { status: 500 }
    );
  }
}
