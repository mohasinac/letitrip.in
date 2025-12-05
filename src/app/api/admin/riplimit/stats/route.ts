/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/riplimit/stats/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Admin RipLimit Stats API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/admin/riplimit/stats - Get RipLimit system statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getAdminStats } from "@/app/api/lib/riplimit/admin";

/**
 * GET /api/admin/riplimit/stats
 * Returns RipLimit system statistics (admin only)
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
    // Authenticate and check admin role
    const auth = await getAuthFromRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check admin role (assuming role is stored in custom claims or user data)
    const isAdmin = auth.role === "admin";
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const stats = await getAdminStats();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: stats,
    });
  } catch (error) {
    console.error("Error getting RipLimit admin stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get statistics" },
      { status: 500 },
    );
  }
}
