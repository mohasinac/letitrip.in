/**
 * RipLimit Balance API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/riplimit/balance - Get user's RipLimit balance
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getBalanceDetails } from "@/app/api/lib/riplimit";

/**
 * GET /api/riplimit/balance
 * Returns the user's RipLimit balance including available, blocked, and per-auction details
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const balance = await getBalanceDetails(auth.user.uid);

    return NextResponse.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error getting RipLimit balance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get balance" },
      { status: 500 }
    );
  }
}
