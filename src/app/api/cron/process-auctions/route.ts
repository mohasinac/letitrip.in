import { NextRequest, NextResponse } from "next/server";
import { processEndedAuctions } from "@/app/api/lib/utils/auction-scheduler";

/**
 * Vercel Cron Job: Process Ended Auctions
 *
 * This endpoint is called by Vercel Cron every minute to process auctions.
 *
 * Vercel Cron Configuration (in vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-auctions",
 *     "schedule": "* * * * *"  // Every minute
 *   }]
 * }
 *
 * Security: Vercel automatically adds the `x-vercel-cron` header
 * to authenticate cron requests.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Maximum 60 seconds for cron job

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate Vercel Cron request
    const authHeader = request.headers.get("authorization");
    const cronHeader = request.headers.get("x-vercel-cron");

    // In production, verify the request is from Vercel
    if (process.env.NODE_ENV === "production") {
      if (!cronHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error("[Cron] Unauthorized cron request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("[Cron] Processing ended auctions...");
    const startTime = Date.now();

    // Process ended auctions
    await processEndedAuctions();

    const duration = Date.now() - startTime;
    console.log(`[Cron] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Auction processing complete",
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Error processing auctions:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process auctions",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Support POST for manual triggers (with auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication for manual triggers
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Manual trigger - Processing auctions...");
    await processEndedAuctions();

    return NextResponse.json({
      success: true,
      message: "Manual auction processing complete",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Error in manual trigger:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
