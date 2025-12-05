/**
 * PayPal Order Creation API Route
 * POST /api/payments/paypal/order
 *
 * Creates a new PayPal order for payment processing.
 * Requires authenticated user.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface CreatePayPalOrderRequest {
  amount: number;
  currency: string;
  orderId?: string;
  returnUrl: string;
  cancelUrl: string;
  description?: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
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
    const body: CreatePayPalOrderRequest = await request.json();
    const {
      amount,
      currency = "USD",
      orderId,
      returnUrl,
      cancelUrl,
      description,
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount - Must be greater than 0" },
        { status: 400 }
      );
    }

    if (!returnUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing required fields: returnUrl, cancelUrl" },
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

    // Create PayPal order
    const orderRequest = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
          },
          description: description || `Order for ${authResult.user.email}`,
          custom_id: orderId || undefined,
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: "JustForView.in",
        user_action: "PAY_NOW",
      },
    };

    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderRequest),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.message || "Failed to create PayPal order");
    }

    const paypalOrder: PayPalOrderResponse = await orderResponse.json();

    // Get approval URL
    const approvalUrl = paypalOrder.links.find(
      (link) => link.rel === "approve"
    )?.href;

    // Store order in Firestore for tracking
    await db
      .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
      .doc(paypalOrder.id)
      .set({
        gateway: "paypal",
        gatewayOrderId: paypalOrder.id,
        userId: authResult.user.uid,
        orderId: orderId || null,
        amount: amount,
        currency: currency.toUpperCase(),
        status: "created",
        approvalUrl,
        returnUrl,
        cancelUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    // Return formatted response
    return NextResponse.json(
      {
        id: paypalOrder.id,
        status: paypalOrder.status,
        approvalUrl,
        amount: amount,
        currency: currency.toUpperCase(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "PayPalOrderAPI",
      method: "POST",
      context: "Order creation failed",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to create PayPal order",
      },
      { status: 500 }
    );
  }
}
