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

interface CapturePayPalPaymentRequest {
  orderId: string;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        create_time: string;
      }>;
    };
  }>;
  payer: {
    email_address: string;
    payer_id: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
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
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      paymentId: capture.id,
      status: "captured",
      captureStatus: capture.status,
      capturedAmount: parseFloat(capture.amount.value),
      capturedAt: new Date(capture.create_time),
      payerEmail: captureData.payer.email_address,
      payerId: captureData.payer.payer_id,
      payerName: `${captureData.payer.name.given_name} ${captureData.payer.name.surname}`,
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
          paymentId: capture.id,
          paymentGateway: "paypal",
          paidAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Return formatted response
    return NextResponse.json(
      {
        id: capture.id,
        orderId: orderId,
        amount: parseFloat(capture.amount.value),
        currency: capture.amount.currency_code,
        status: capture.status,
        capturedAt: new Date(capture.create_time).toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "PayPalCaptureAPI",
      method: "POST",
      context: "Payment capture failed",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to capture PayPal payment",
      },
      { status: 500 }
    );
  }
}
