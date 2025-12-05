/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payments/razorpay/verify/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * VerifyPaymentRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for VerifyPaymentRequest
 */
interface VerifyPaymentRequest {
  /** Order Id */
  orderId: string;
  /** Payment Id */
  paymentId: string;
  /** Signature */
  signature: string;
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
          /** Status */
          status: "verification_failed",
          /** Verification Attempts */
          verificationAttempts:
            (
              await db
                .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
                .doc(orderId)
                .get()
            ).data()?.verificationAttempts || 0 + 1,
          /** Last Verification Attempt */
          lastVerificationAttempt: new Date(),
          /** Updated At */
          updatedAt: new Date(),
        });

      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
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
      /** Status */
      status: "verified",
      /** Verified At */
      verifiedAt: new Date(),
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
          paymentStatus: "paid",
          paymentId,
          /** Payment Gateway */
          paymentGateway: "razorpay",
          /** Paid At */
          paidAt: new Date(),
          /** Updated At */
          updatedAt: new Date(),
        });
      }
    }

    // Return success response
    return NextResponse.json(
      {
        /** Success */
        success: true,
        orderId,
        paymentId,
        /** Amount */
        amount: transactionData?.amount || 0,
        /** Currency */
        currency: transactionData?.currency || "INR",
        /** Status */
        status: "verified",
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "RazorpayVerifyAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Payment verification failed",
    });

    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}
