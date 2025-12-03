/**
 * Admin RipLimit Stats API
 * Epic: E028 - RipLimit Bidding Currency
 *
 * GET /api/admin/riplimit/stats - Get RipLimit system statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getAdminStats } from "@/app/api/lib/riplimit";

/**
 * GET /api/admin/riplimit/stats
 * Returns RipLimit system statistics (admin only)
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
      success: true,
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
