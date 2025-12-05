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

interface CreateOrderRequest {
  amount: number;
  currency: string;
  orderId?: string;
  notes?: Record<string, string>;
  receipt?: string;
}

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
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
    const Razorpay = (await import("razorpay" as any)) as any;
    const razorpay = new Razorpay.default({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create order options
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId: authResult.user.uid,
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
        gateway: "razorpay",
        gatewayOrderId: razorpayOrder.id,
        userId: authResult.user.uid,
        orderId: orderId || null,
        amount: amount,
        currency: currency.toUpperCase(),
        status: "created",
        receipt: razorpayOrder.receipt,
        notes: orderOptions.notes,
        createdAt: new Date(razorpayOrder.created_at * 1000),
        updatedAt: new Date(),
      });

    // Return formatted response
    return NextResponse.json(
      {
        id: razorpayOrder.id,
        amount: amount,
        currency: currency.toUpperCase(),
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        createdAt: new Date(razorpayOrder.created_at * 1000).toISOString(),
        notes: orderOptions.notes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, {
      component: "RazorpayOrderAPI",
      method: "POST",
      context: "Order creation failed",
    });

    return NextResponse.json(
      {
        error: error.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
