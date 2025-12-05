/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payments/razorpay/capture/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * CapturePaymentRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for CapturePaymentRequest
 */
interface CapturePaymentRequest {
  /** Payment Id */
  paymentId: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
}

/**
 * RazorpayPaymentResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for RazorpayPaymentResponse
 */
interface RazorpayPaymentResponse {
  /** Id */
  id: string;
  /** Entity */
  entity: string;
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Status */
  status: string;
  order_id: string;
  invoice_id: string | null;
  /** International */
  international: boolean;
  /** Method */
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  /** Captured */
  captured: boolean;
  /** Description */
  description: string;
  card_id: string | null;
  /** Bank */
  bank: string | null;
  /** Wallet */
  wallet: string | null;
  /** Vpa */
  vpa: string | null;
  /** Email */
  email: string;
  /** Contact */
  contact: string;
  /** Notes */
  notes: Record<string, string>;
  /** Fee */
  fee: number;
  /** Tax */
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  created_at: number;
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

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
    /**
     * Performs razorpay operation
     *
     * @returns {any} The razorpay result
     */

    /**
     * Performs razorpay operation
     *
     * @returns {any} The razorpay result
     */

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
        /** Status */
        status: "captured",
        /** Captured Amount */
        capturedAmount: amount,
        /** Captured At */
        capturedAt: new Date(capturedPayment.created_at * 1000),
        /** Updated At */
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
            /** Payment Status */
            paymentStatus: "captured",
            /** Captured At */
            capturedAt: new Date(),
            /** Updated At */
            updatedAt: new Date(),
          });
        }
      }
    }

    // Return formatted response
    return NextResponse.json(
      {
        /** Id */
        id: capturedPayment.id,
        /** Amount */
        amount: amount,
        /** Currency */
        currency: currency.toUpperCase(),
        /** Status */
        status: capturedPayment.status,
        /** Captured */
        captured: capturedPayment.captured,
        /** Captured At */
        capturedAt: new Date(capturedPayment.created_at * 1000).toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "RazorpayCaptureAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Payment capture failed",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to capture payment",
      },
      { status: 500 }
    );
  }
}
