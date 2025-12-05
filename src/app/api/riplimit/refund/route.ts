/**
 * RipLimit Refund API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * POST /api/riplimit/refund - Request RipLimit refund
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getBalanceDetails } from "@/app/api/lib/riplimit/account";
import { COLLECTIONS } from "@/constants/database";
import {
  RIPLIMIT_MIN_REFUND,
  RipLimitRefundStatus,
  ripLimitToInr,
} from "@/types/backend/riplimit.types";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/riplimit/refund
 * Creates a refund request for available RipLimit
 *
 * Request body:
 * - amount: RipLimit amount to refund (min 1000)
 * - method: "original" or "bank"
 * - bankDetails: Required if method is "bank"
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
    const { amount, method, bankDetails } = body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount < RIPLIMIT_MIN_REFUND) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum refund is ${RIPLIMIT_MIN_REFUND} RipLimit (₹${ripLimitToInr(
            RIPLIMIT_MIN_REFUND,
          )})`,
        },
        { status: 400 },
      );
    }

    // Validate method
    if (!method || !["original", "bank"].includes(method)) {
      return NextResponse.json(
        { success: false, error: "Invalid refund method" },
        { status: 400 },
      );
    }

    // Validate bank details if method is bank
    if (method === "bank") {
      if (
        !bankDetails?.accountNumber ||
        !bankDetails?.ifscCode ||
        !bankDetails?.accountHolderName
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Bank details are required for bank transfer refund",
          },
          { status: 400 },
        );
      }
    }

    // Get user balance
    const balance = await getBalanceDetails(auth.user.uid);

    // Check if user has unpaid auctions
    if (balance.hasUnpaidAuctions) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot request refund while you have unpaid won auctions",
        },
        { status: 400 },
      );
    }

    // Check sufficient available balance
    if (balance.availableBalance < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient available balance. You have ${balance.availableBalance} RipLimit available.`,
        },
        { status: 400 },
      );
    }

    // Calculate refund amounts
    const inrAmount = ripLimitToInr(amount);

    // Check if this is the first refund this month (no fee) or additional (₹10 fee)
    const db = getFirestoreAdmin();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const existingRefundsQuery = await db
      .collection(COLLECTIONS.RIPLIMIT_REFUNDS)
      .where("userId", "==", auth.user.uid)
      .where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
      .where("status", "in", [
        RipLimitRefundStatus.REQUESTED,
        RipLimitRefundStatus.PROCESSING,
        RipLimitRefundStatus.COMPLETED,
      ])
      .get();

    const feeAmount = existingRefundsQuery.empty ? 0 : 10;
    const netAmount = Math.max(0, inrAmount - feeAmount);

    // Create refund request
    const refundRef = db.collection(COLLECTIONS.RIPLIMIT_REFUNDS).doc();
    await refundRef.set({
      userId: auth.user.uid,
      ripLimitAmount: amount,
      inrAmount,
      feeAmount,
      netAmount,
      status: RipLimitRefundStatus.REQUESTED,
      refundMethod: method,
      bankDetails: method === "bank" ? bankDetails : null,
      createdAt: Timestamp.now(),
    });

    // Deduct from available balance immediately
    const userId = auth.user.uid;
    const accountRef = db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId);
    await db.runTransaction(async (t) => {
      const accountDoc = await t.get(accountRef);
      if (!accountDoc.exists) {
        throw new Error("Account not found");
      }

      const currentBalance = accountDoc.data()?.availableBalance || 0;
      if (currentBalance < amount) {
        throw new Error("Insufficient balance");
      }

      t.update(accountRef, {
        availableBalance: currentBalance - amount,
        updatedAt: Timestamp.now(),
      });

      // Create transaction record
      const transactionRef = db
        .collection(COLLECTIONS.RIPLIMIT_TRANSACTIONS)
        .doc();
      t.set(transactionRef, {
        userId,
        type: "refund",
        amount: -amount,
        inrAmount,
        balanceAfter: currentBalance - amount,
        status: "pending",
        description: `Refund requested: ${amount} RipLimit`,
        metadata: { refundId: refundRef.id },
        createdAt: Timestamp.now(),
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        refundId: refundRef.id,
        ripLimitAmount: amount,
        inrAmount,
        feeAmount,
        netAmount,
        status: RipLimitRefundStatus.REQUESTED,
        message: `Refund request submitted. You will receive ₹${netAmount} within 5-7 business days.`,
      },
    });
  } catch (error) {
    console.error("Error creating refund request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create refund request" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/riplimit/refund
 * Get refund history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const db = getFirestoreAdmin();
    const refundsSnapshot = await db
      .collection(COLLECTIONS.RIPLIMIT_REFUNDS)
      .where("userId", "==", auth.user.uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const refunds = refundsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: refunds,
    });
  } catch (error) {
    console.error("Error getting refund history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get refund history" },
      { status: 500 },
    );
  }
}
