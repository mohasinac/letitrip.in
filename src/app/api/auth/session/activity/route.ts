/**
 * Session Activity API
 * POST /api/auth/session/activity - Update session last activity timestamp
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { ValidationError } from "@/lib/errors";
import { sessionRepository } from "@/repositories";
import { verifySessionCookie } from "@/lib/firebase/auth-server";

export async function POST(request: NextRequest) {
  try {
    // Get session cookie to verify user
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie) {
      throw new ValidationError("No session found");
    }

    // Verify the session
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      throw new ValidationError("Invalid session");
    }

    // Get session ID from request
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      throw new ValidationError("Session ID required");
    }

    // Update session activity
    await sessionRepository.updateActivity(sessionId);

    return NextResponse.json({
      success: true,
      message: "Activity updated",
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
