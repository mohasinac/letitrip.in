/**
 * Admin RipLimit User Management API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/admin/riplimit/users/[id] - Get user's RipLimit details
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getBalanceDetails } from "@/app/api/lib/riplimit/account";
import { getTransactionHistory } from "@/app/api/lib/riplimit/transactions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/riplimit/users/[id]
 * Returns detailed RipLimit info for a specific user (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const balance = await getBalanceDetails(userId);
    const { transactions } = await getTransactionHistory(userId, { limit: 50 });

    return NextResponse.json({
      success: true,
      data: {
        ...balance,
        recentTransactions: transactions,
      },
    });
  } catch (error) {
    console.error("Error getting user RipLimit details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get user details" },
      { status: 500 },
    );
  }
}
