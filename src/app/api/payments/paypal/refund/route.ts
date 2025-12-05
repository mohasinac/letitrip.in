/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payments/paypal/refund/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * PayPal Payment Refund API Route
 * POST /api/payments/paypal/refund
 *
 * Initiates a full or partial refund for a PayPal payment.
 * Requires authenticated user.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * RefundPayPalPaymentRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for RefundPayPalPaymentRequest
 */
interface RefundPayPalPaymentRequest {
  /** Capture Id */
  captureId: string;
  /** Amount */
  amount?: number; // Optional for partial refunds
  /** Currency */
  currency?: string;
  /** Note */
  note?: string;
}

/**
 * PayPalRefundResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for PayPalRefundResponse
 */
interface PayPalRefundResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /** Amount */
  amount: {
    /** Currency_code */
    currency_code: string;
    /** Value */
    value: string;
  };
  /** Create_time */
  create_time: string;
  /** Update_time */
  update_time: string;
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
    const body: RefundPayPalPaymentRequest = await request.json();
    const { captureId, amount, currency, note } = body;

    // Validate required fields
    if (!captureId) {
      return NextResponse.json(
        { error: "Missing required field: captureId" },
        { status: 400 }
      );
    }

    // Get PayPal settings from Firestore
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
    const paypalConfig = settings?.paypal;

    if (!paypalConfig?.enabled) {
      return NextResponse.json(
        { error: "PayPal is not enabled" },
        { status: 400 }
      );
    }

    const mode = paypalConfig.mode || "sandbox";
    const clientId = paypalConfig[`${mode}ClientId`];
    const clientSecret = paypalConfig[`${mode}ClientSecret`];

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "PayPal credentials not configured" },
        { status: 500 }
      );
    }

    // Find transaction by paymentId to verify ownership
    const transactionsSnapshot = await db
      .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
      .where("paymentId", "==", captureId)
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

    // PayPal API base URL
    const baseUrl =
      mode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // Get PayPal access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      /** Method */
      method: "POST",
      /** Headers */
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        /** Authorization */
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      /** Body */
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Prepare refund request body
    const refundRequest: any = {};

    if (amount !== undefined && currency) {
      refundRequest.amount = {
        currency_code: currency.toUpperCase(),
        /** Value */
        value: amount.toFixed(2),
      };
    }

    if (note) {
      refundRequest.note_to_payer = note;
    }

    // Create refund
    const refundResponse = await fetch(
      `${baseUrl}/v2/payments/captures/${captureId}/refund`,
      {
        /** Method */
        method: "POST",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
          /** Authorization */
          Authorization: `Bearer ${accessToken}`,
        },
        /** Body */
        body: JSON.stringify(refundRequest),
      }
    );

    if (!refundResponse.ok) {
      const errorData = await refundResponse.json();
      throw new Error(errorData.message || "Failed to process PayPal refund");
    }

    const refund: PayPalRefundResponse = await refundResponse.json();

    // Store refund in Firestore
    await db
      .collection(COLLECTIONS.PAYMENT_REFUNDS)
      .doc(refund.id)
      .set({
        /** Refund Id */
        refundId: refund.id,
        /** Payment Id */
        paymentId: captureId,
        /** Transaction Id */
        transactionId: transactionDoc.id,
        /** Order Id */
        orderId: transactionData?.orderId || null,
        /** User Id */
        userId: transactionData?.userId || authResult.user.uid,
        /** Gateway */
        gateway: "paypal",
        /** Amount */
        amount: parseFloat(refund.amount.value),
        /** Currency */
        currency: refund.amount.currency_code,
        /** Status */
        status: refund.status,
        /** Note */
        note: note || null,
        /** Created At */
        createdAt: new Date(refund.create_time),
        /** Updated At */
        updatedAt: new Date(refund.update_time),
        /** Initiated By */
        initiatedBy: authResult.user.uid,
      });

    // Update transaction status
    await transactionDoc.ref.update({
      /** Refund Status */
      refundStatus: "refunded",
      /** Refund Amount */
      refundAmount: parseFloat(refund.amount.value),
      /** Refund Id */
      refundId: refund.id,
      /** Refunded At */
      refundedAt: new Date(),
      /** Updated At */
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
          /** Refund Status */
          refundStatus: "refunded",
          /** Refund Amount */
          refundAmount: parseFloat(refund.amount.value),
          /** Refund Id */
          refundId: refund.id,
          /** Refunded At */
          refundedAt: new Date(),
          /** Updated At */
          updatedAt: new Date(),
        });
      }
    }

    // Return formatted response
    return NextResponse.json(
      {
        /** Id */
        id: refund.id,
        /** Capture Id */
        captureId: captureId,
        /** Amount */
        amount: parseFloat(refund.amount.value),
        /** Currency */
        currency: refund.amount.currency_code,
        /** Status */
        status: refund.status,
        /** Created At */
        createdAt: new Date(refund.create_time).toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "PayPalRefundAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Payment refund failed",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to process PayPal refund",
      },
      { status: 500 }
    );
  }
}
