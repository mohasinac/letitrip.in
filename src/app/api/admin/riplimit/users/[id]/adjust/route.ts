/**
 * Admin RipLimit Balance Adjustment API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * POST /api/admin/riplimit/users/[id]/adjust - Adjust user's balance
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { adminAdjustBalance } from "@/app/api/lib/riplimit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/riplimit/users/[id]/adjust
 * Adjust user's RipLimit balance (admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    // Authenticate and check admin role
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const isAdmin = auth.role === "admin";
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { amount, reason, transactionType } = body;

    // Validate required fields
    if (typeof amount !== "number" || amount === 0) {
      return NextResponse.json(
        { success: false, error: "Valid non-zero amount is required" },
        { status: 400 },
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Reason is required (minimum 5 characters)",
        },
        { status: 400 },
      );
    }

    // Determine type based on amount sign if not provided
    // adminAdjustBalance takes: userId, amount, reason, adminId
    const adjustmentAmount =
      transactionType === "admin_debit" || amount < 0
        ? -Math.abs(amount)
        : Math.abs(amount);

    const result = await adminAdjustBalance(
      userId,
      adjustmentAmount,
      reason.trim(),
      auth.user.uid,
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error adjusting user balance:", error);
    const message =
      error instanceof Error ? error.message : "Failed to adjust balance";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
