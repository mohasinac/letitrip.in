/**
 * Razorpay Payment Refund API Route
 * POST /api/payments/razorpay/refund
 *
 * Initiates a full or partial refund for a Razorpay payment.
 * Requires authenticated user.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface RefundPaymentRequest {
  paymentId: string;
  amount?: number; // Optional for partial refunds
  notes?: Record<string, string>;
  receipt?: string;
}

interface RazorpayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  acquirer_data: {
    arn: string | null;
  };
  created_at: number;
  batch_id: string | null;
  status: string;
  speed_processed: string;
  speed_requested: string;
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
    const body: RefundPaymentRequest = await request.json();
    const { paymentId, amount, notes, receipt } = body;

    // Validate required fields
    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing required field: paymentId" },
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

    // Find transaction by paymentId to verify ownership
    const transactionsSnapshot = await db
      .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
      .where("paymentId", "==", paymentId)
      .limit(1)
      .get();

    if (transactionsSnapshot.empty) {
      return NextResponse.json(
        { error: "Payment transaction not found" },
        { status: 404 }
      );
    }

    const transactionDoc = transactionsSnapshot.docs[0];
    const transactionData = transactionDoc.data();

    // Verify user owns this transaction (or is admin)
    if (
      transactionData?.userId !== authResult.user.uid &&
      authResult.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Transaction does not belong to user" },
        { status: 403 }
      );
    }

    // Import Razorpay SDK dynamically
    const Razorpay = (await import("razorpay" as any)) as any;
    const razorpay = new Razorpay.default({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Prepare refund options
    const refundOptions: any = {
      notes: {
        userId: authResult.user.uid,
        userName: authResult.user.name,
        ...notes,
      },
    };

    // Add amount if partial refund
    if (amount !== undefined) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    // Add receipt if provided
    if (receipt) {
      refundOptions.receipt = receipt;
    }

    // Create refund
    const refund: RazorpayRefundResponse = await razorpay.payments.refund(
      paymentId,
      refundOptions
    );

    // Store refund in Firestore
    await db
      .collection(COLLECTIONS.PAYMENT_REFUNDS)
      .doc(refund.id)
      .set({
        refundId: refund.id,
        paymentId,
        transactionId: transactionDoc.id,
        orderId: transactionData?.orderId || null,
        userId: transactionData?.userId || authResult.user.uid,
        gateway: "razorpay",
        amount: refund.amount / 100, // Convert from paise to rupees
        currency: refund.currency,
        status: refund.status,
        receipt: refund.receipt,
        notes: refund.notes,
        createdAt: new Date(refund.created_at * 1000),
        updatedAt: new Date(),
        initiatedBy: authResult.user.uid,
      });

    // Update transaction status
    await transactionDoc.ref.update({
      refundStatus: "refunded",
      refundAmount: refund.amount / 100,
      refundId: refund.id,
      refundedAt: new Date(),
      updatedAt: new Date(),
    });

    // If this is linked to an order, update order refund status
    if (transactionData?.orderId) {
      const orderRef = db
        .collection(COLLECTIONS.ORDERS)
        .doc(transactionData.orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        await orderRef.update({
          refundStatus: "refunded",
          refundAmount: refund.amount / 100,
          refundId: refund.id,
          refundedAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Return formatted response
    return NextResponse.json(
      {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000).toISOString(),
        notes: refund.notes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "RazorpayRefundAPI",
      method: "POST",
      context: "Payment refund failed",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to process refund",
      },
      { status: 500 }
    );
  }
}
