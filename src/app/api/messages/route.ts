/**
 * Messages API
 *
 * @status PLACEHOLDER - API pending implementation
 * @epic E023 - Messaging System
 *
 * This API will handle:
 * - GET: Get user messages/conversations
 * - POST: Send a new message
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement message retrieval
  return NextResponse.json(
    {
      success: false,
      error: "Messages API not yet implemented",
      message: "This feature is coming soon",
    },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  // TODO: Implement message sending
  return NextResponse.json(
    {
      success: false,
      error: "Messages API not yet implemented",
      message: "This feature is coming soon",
    },
    { status: 501 }
  );
}
