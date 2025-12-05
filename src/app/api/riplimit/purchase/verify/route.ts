/**
 * @fileoverview TypeScript Module
 * @module src/app/api/riplimit/purchase/verify/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * RipLimit Purchase Verification API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * POST /api/riplimit/purchase/verify - Verify and complete RipLimit purchase
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { creditBalance } from "@/app/api/lib/riplimit/transactions";
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
          /** Success */
          success: false,
          /** Error */
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
      /** Id */
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
        /** Status */
        status: RipLimitPurchaseStatus.FAILED,
        /** Updated At */
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
        /** Inr Amount */
        inrAmount: purchase.inrAmount,
      }
    );

    // Update purchase record
    await purchaseDoc.ref.update({
      /** Status */
      status: RipLimitPurchaseStatus.COMPLETED,
      razorpayPaymentId,
      razorpaySignature,
      /** Transaction Id */
      transactionId: transaction.id,
      /** Completed At */
      completedAt: Timestamp.now(),
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Rip Limit Amount */
        ripLimitAmount: purchase.ripLimitAmount,
        /** Transaction Id */
        transactionId: transaction.id,
        /** Message */
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
