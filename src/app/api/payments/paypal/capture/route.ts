/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payments/paypal/capture/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * PayPal Payment Capture API Route
 * POST /api/payments/paypal/capture
 *
 * Captures a PayPal payment after user approval.
 * Requires authenticated user.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * CapturePayPalPaymentRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for CapturePayPalPaymentRequest
 */
interface CapturePayPalPaymentRequest {
  /** Order Id */
  orderId: string;
}

/**
 * PayPalCaptureResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for PayPalCaptureResponse
 */
interface PayPalCaptureResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /** Purchase_units */
  purchase_units: Array<{
    /** Payments */
    payments: {
      /** Captures */
      captures: Array<{
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
      }>;
    };
  }>;
  /** Payer */
  payer: {
    /** Email_address */
    email_address: string;
    /** Payer_id */
    payer_id: string;
    /** Name */
    name: {
      /** Given_name */
      given_name: string;
      /** Surname */
      surname: string;
    };
  };
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
    const body: CapturePayPalPaymentRequest = await request.json();
    const { orderId } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required field: orderId" },
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

    // Get transaction to verify ownership
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

    // Capture PayPal order
    const captureResponse = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        /** Method */
        method: "POST",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
          /** Authorization */
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      throw new Error(errorData.message || "Failed to capture PayPal payment");
    }

    const captureData: PayPalCaptureResponse = await captureResponse.json();

    // Extract capture details
    const capture = captureData.purchase_units[0]?.payments?.captures?.[0];

    if (!capture) {
      throw new Error("No capture data found in PayPal response");
    }

    // Update transaction status
    await transactionDoc.ref.update({
      /** Payment Id */
      paymentId: capture.id,
      /** Status */
      status: "captured",
      /** Capture Status */
      captureStatus: capture.status,
      /** Captured Amount */
      capturedAmount: parseFloat(capture.amount.value),
      /** Captured At */
      capturedAt: new Date(capture.create_time),
      /** Payer Email */
      payerEmail: captureData.payer.email_address,
      /** Payer Id */
      payerId: captureData.payer.payer_id,
      /** Payer Name */
      payerName: `${captureData.payer.name.given_name} ${captureData.payer.name.surname}`,
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
          /** Payment Id */
          paymentId: capture.id,
          /** Payment Gateway */
          paymentGateway: "paypal",
          /** Paid At */
          paidAt: new Date(),
          /** Updated At */
          updatedAt: new Date(),
        });
      }
    }

    // Return formatted response
    return NextResponse.json(
      {
        /** Id */
        id: capture.id,
        /** Order Id */
        orderId: orderId,
        /** Amount */
        amount: parseFloat(capture.amount.value),
        /** Currency */
        currency: capture.amount.currency_code,
        /** Status */
        status: capture.status,
        /** Captured At */
        capturedAt: new Date(capture.create_time).toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "PayPalCaptureAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Payment capture failed",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to capture PayPal payment",
      },
      { status: 500 }
    );
  }
}
