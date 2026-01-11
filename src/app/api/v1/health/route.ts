import { withApiVersion } from "@/app/api/v1/middleware";
import { NextResponse } from "next/server";

/**
 * GET /api/v1/health
 *
 * Health check endpoint for API v1
 */
export async function GET(request: Request) {
  return withApiVersion(async () => {
    return NextResponse.json({
      status: "healthy",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}
