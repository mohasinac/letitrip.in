/**
 * RipLimit Purchase API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * POST /api/riplimit/purchase - Initiate RipLimit purchase
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import {
  inrToRipLimit,
  RIPLIMIT_MIN_PURCHASE,
  RipLimitPurchaseStatus,
} from "@/types/backend/riplimit.types";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * POST /api/riplimit/purchase
 * Creates a Razorpay order for purchasing RipLimit
 *
 * Request body:
 * - amount: INR amount to purchase (min ₹10)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount < 10) {
      return NextResponse.json(
        { success: false, error: "Minimum purchase amount is ₹10" },
        { status: 400 },
      );
    }

    const ripLimitAmount = inrToRipLimit(amount);

    if (ripLimitAmount < RIPLIMIT_MIN_PURCHASE) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase is ${RIPLIMIT_MIN_PURCHASE} RipLimit (₹10)`,
        },
        { status: 400 },
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `riplimit_${Date.now()}`,
      notes: {
        userId: auth.user.uid,
        ripLimitAmount: ripLimitAmount.toString(),
        type: "riplimit_purchase",
      },
    });

    // Create purchase record in Firestore
    const db = getFirestoreAdmin();
    const purchaseRef = db.collection(COLLECTIONS.RIPLIMIT_PURCHASES).doc();

    await purchaseRef.set({
      userId: auth.user.uid,
      ripLimitAmount,
      inrAmount: amount,
      razorpayOrderId: razorpayOrder.id,
      status: RipLimitPurchaseStatus.PENDING,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: {
        purchaseId: purchaseRef.id,
        razorpayOrderId: razorpayOrder.id,
        ripLimitAmount,
        inrAmount: amount,
        razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Error creating RipLimit purchase:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create purchase order" },
      { status: 500 },
    );
  }
}
