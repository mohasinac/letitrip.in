/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payments/razorpay/order/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Razorpay Order Creation API Route
 * POST /api/payments/razorpay/order
 *
 * Creates a new Razorpay order for payment processing.
 * Requires authenticated user.
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * CreateOrderRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for CreateOrderRequest
 */
interface CreateOrderRequest {
  /** Amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Order Id */
  orderId?: string;
  /** Notes */
  notes?: Record<string, string>;
  /** Receipt */
  receipt?: string;
}

/**
 * RazorpayOrderResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for RazorpayOrderResponse
 */
interface RazorpayOrderResponse {
  /** Id */
  id: string;
  /** Entity */
  entity: string;
  /** Amount */
  amount: number;
  /** Amount_paid */
  amount_paid: number;
  /** Amount_due */
  amount_due: number;
  /** Currency */
  currency: string;
  /** Receipt */
  receipt: string;
  /** Status */
  status: string;
  /** Attempts */
  attempts: number;
  /** Notes */
  notes: Record<string, string>;
  /** Created_at */
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
    const body: CreateOrderRequest = await request.json();
    const { amount, currency = "INR", orderId, notes, receipt } = body;

    // Validate required fields
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

    // Create order options
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      /** Currency */
      currency: currency.toUpperCase(),
      /** Receipt */
      receipt: receipt || `receipt_${Date.now()}`,
      /** Notes */
      notes: {
        /** User Id */
        userId: authResult.user.uid,
        /** User Email */
        userEmail: authResult.user.email,
        ...(orderId && { orderId }),
        ...notes,
      },
    };

    // Create Razorpay order
    const razorpayOrder: RazorpayOrderResponse = await razorpay.orders.create(
      orderOptions
    );

    // Store order in Firestore for tracking
    await db
      .collection(COLLECTIONS.PAYMENT_TRANSACTIONS)
      .doc(razorpayOrder.id)
      .set({
        /** Gateway */
        gateway: "razorpay",
        /** Gateway Order Id */
        gatewayOrderId: razorpayOrder.id,
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
        /** Receipt */
        receipt: razorpayOrder.receipt,
        /** Notes */
        notes: orderOptions.notes,
        /** Created At */
        createdAt: new Date(razorpayOrder.created_at * 1000),
        /** Updated At */
        updatedAt: new Date(),
      });

    // Return formatted response
    return NextResponse.json(
      {
        /** Id */
        id: razorpayOrder.id,
        /** Amount */
        amount: amount,
        /** Currency */
        currency: currency.toUpperCase(),
        /** Receipt */
        receipt: razorpayOrder.receipt,
        /** Status */
        status: razorpayOrder.status,
        /** Created At */
        createdAt: new Date(razorpayOrder.created_at * 1000).toISOString(),
        /** Notes */
        notes: orderOptions.notes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      /** Component */
      component: "RazorpayOrderAPI",
      /** Method */
      method: "POST",
      /** Context */
      context: "Order creation failed",
    });

    return NextResponse.json(
      {
        /** Error */
        error: error.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
