import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "../middleware";

async function healthCheckHandler(req: NextRequest) {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, healthCheckHandler, {
    cache: {
      ttl: 30000, // 30 seconds
    },
  });
}
