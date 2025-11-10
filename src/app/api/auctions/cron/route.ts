import { NextRequest, NextResponse } from "next/server";
import { manualProcessAuctions } from "@/app/api/lib/utils/auction-scheduler";
import { getCurrentUser } from "../../lib/session";

/**
 * POST /api/auctions/cron
 * Manually trigger auction end processing
 * Admin only - for testing and manual triggers
 */
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const user = await getCurrentUser(request);

    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    // Trigger processing
    await manualProcessAuctions();

    return NextResponse.json({
      success: true,
      message: "Auction processing triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error triggering auction processing:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to trigger auction processing",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auctions/cron
 * Get scheduler status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user?.email || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      status: "running",
      schedule: "Every minute (* * * * *)",
      message: "Auction scheduler is active",
    });
  } catch (error) {
    console.error("Error getting scheduler status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get scheduler status",
      },
      { status: 500 },
    );
  }
}
