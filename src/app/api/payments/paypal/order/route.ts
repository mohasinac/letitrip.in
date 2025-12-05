/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payments/paypal/order/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * CreatePayPalOrderRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for CreatePayPalOrderRequest
 */
interface CreatePayPalOrderRequest {
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Order Id */
  orderId?: string;
  /** Return Url */
  returnUrl: string;
  /** Cancel Url */
  cancelUrl: string;
  /** Description */
  description?: string;
}

/**
 * PayPalOrderResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for PayPalOrderResponse
 */
interface PayPalOrderResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /** Links */
  links: Array<{
    /** Href */
    href: string;
    /** Rel */
    rel: string;
    /** Method */
    method: string;
  }>;
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

    // Create PayPal order
    const orderRequest = {
      /** Intent */
      intent: "CAPTURE",
      purchase_units: [
        {
          /** Amount */
          amount: {
            currency_code: currency.toUpperCase(),
            /** Value */
            value: amount.toFixed(2),
          },
          /** Description */
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
      /** Method */
      method: "POST",
      /** Headers */
      headers: {
        "Content-Type": "application/json",
        /** Authorization */
        Authorization: `Bearer ${accessToken}`,
      },
      /** Body */
      body: JSON.stringify(orderRequest),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.message || "Failed to create PayPal order");
    }

    const paypalOrder: PayPalOrderResponse = await orderResponse.json();

    // Get approval URL
    /**
 * Performs approval url operation
 *
 * @param {any} (link - The (link
 *
 * @returns {any} The approvalurl result
 *
 */
const approvalUrl = paypalOrder.links.find(
      (link) => link.rel === "approve"
    )?.href;

    // Store order in Firestore for tracking
    await db
      .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
      .doc(paypalOrder.id)
      .set({
        /** Gateway */
        gateway: "paypal",
        /** Gateway Order Id */
        gatewayOrderId: paypalOrder.id,
        /** User Id */
        userId: authResult.user.uid,
        /** Order Id */
        orderId: orderId || null,
        /** Amount */
        amount: amount,
        /** Currency */
        currency: currency.toUpperCase(),
        /** Status */
        status: "created",
        approvalUrl,
        returnUrl,
        cancelUrl,
        /** Created At */
        createdAt: new Date(),
        /** Updated At */
        updatedAt: new Date(),
      });

    // Return formatted response
    return NextResponse.json(
      {
        /** Id */
        id: paypalOrder.id,
        /** Status */
        status: paypalOrder.status,
        approvalUrl,
        /** Amount */
        amount: amount,
        /** Currency */
        currency: currency.toUpperCase(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "PayPalOrderAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Order creation failed",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to create PayPal order",
      },
      { status: 500 }
    );
  }
}
