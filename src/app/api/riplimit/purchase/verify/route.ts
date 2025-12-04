/**
 * RipLimit Purchase Verification API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * POST /api/riplimit/purchase/verify - Verify and complete RipLimit purchase
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { creditBalance } from "@/app/api/lib/riplimit";
import { COLLECTIONS } from "@/constants/database";
import {
  RipLimitPurchaseBE,
  RipLimitPurchaseStatus,
  RipLimitTransactionType,
} from "@/types/backend/riplimit.types";
import crypto from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/riplimit/purchase/verify
 * Verifies Razorpay payment signature and credits RipLimit to user account
 *
 * Request body:
 * - razorpayOrderId: Razorpay order ID
 * - razorpayPaymentId: Razorpay payment ID
 * - razorpaySignature: Razorpay signature for verification
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification fields",
        },
        { status: 400 }
      );
    }

    // Find the purchase record
    const db = getFirestoreAdmin();
    const purchasesQuery = await db
      .collection(COLLECTIONS.RIPLIMIT_PURCHASES)
      .where("razorpayOrderId", "==", razorpayOrderId)
      .where("userId", "==", auth.user.uid)
      .limit(1)
      .get();

    if (purchasesQuery.empty) {
      return NextResponse.json(
        { success: false, error: "Purchase order not found" },
        { status: 404 }
      );
    }

    const purchaseDoc = purchasesQuery.docs[0];
    const purchase = {
      id: purchaseDoc.id,
      ...purchaseDoc.data(),
    } as RipLimitPurchaseBE;

    // Check if already completed
    if (purchase.status === RipLimitPurchaseStatus.COMPLETED) {
      return NextResponse.json(
        { success: false, error: "Purchase already completed" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      // Mark purchase as failed
      await purchaseDoc.ref.update({
        status: RipLimitPurchaseStatus.FAILED,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Credit RipLimit to user account
    const transaction = await creditBalance(
      auth.user.uid,
      purchase.ripLimitAmount,
      RipLimitTransactionType.PURCHASE,
      `Purchased ${purchase.ripLimitAmount} RipLimit`,
      {
        razorpayOrderId,
        razorpayPaymentId,
        inrAmount: purchase.inrAmount,
      }
    );

    // Update purchase record
    await purchaseDoc.ref.update({
      status: RipLimitPurchaseStatus.COMPLETED,
      razorpayPaymentId,
      razorpaySignature,
      transactionId: transaction.id,
      completedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: {
        ripLimitAmount: purchase.ripLimitAmount,
        transactionId: transaction.id,
        message: `Successfully purchased ${purchase.ripLimitAmount} RipLimit`,
      },
    });
  } catch (error) {
    console.error("Error verifying RipLimit purchase:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify purchase" },
      { status: 500 }
    );
  }
}
