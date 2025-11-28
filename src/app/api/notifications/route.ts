/**
 * Notifications API
 *
 * @status PLACEHOLDER - API pending implementation
 * @epic E016 - Notifications System
 *
 * This API will handle:
 * - GET: List user notifications
 * - POST: Create notification (admin only)
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement notifications list
  return NextResponse.json(
    {
      success: false,
      error: "Notifications API not yet implemented",
      message: "This feature is coming soon",
    },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  // TODO: Implement notification creation (admin only)
  return NextResponse.json(
    {
      success: false,
      error: "Notifications API not yet implemented",
      message: "This feature is coming soon",
    },
    { status: 501 }
  );
}
