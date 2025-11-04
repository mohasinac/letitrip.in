/**
 * API Route: Health Check
 * GET /api/health - System health check endpoint (public access)
 * 
 * Returns system status, timestamp, service name, and version
 * Used for monitoring and load balancer health checks
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/health
 * Health check endpoint (public access, no authentication required)
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "beyblade-battle",
        version: "1.0.0",
        uptime: process.uptime ? Math.floor(process.uptime()) : null,
        environment: process.env.NODE_ENV || "development",
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    
    return NextResponse.json(
      {
        success: false,
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          service: "beyblade-battle",
          version: "1.0.0",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 503 }
    );
  }
}
