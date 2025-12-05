/**
 * @fileoverview TypeScript Module
 * @module src/app/api/riplimit/balance/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * RipLimit Balance API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/riplimit/balance - Get user's RipLimit balance
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getBalanceDetails } from "@/app/api/lib/riplimit/account";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/riplimit/balance
 * Returns the user's RipLimit balance including available, blocked, and per-auction details
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
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

    const balance = await getBalanceDetails(auth.user.uid);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: balance,
    });
  } catch (error) {
    console.error("Error getting RipLimit balance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get balance" },
      { status: 500 },
    );
  }
}
