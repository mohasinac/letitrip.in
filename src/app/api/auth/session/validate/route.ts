/**
 * Session Validation API
 * GET /api/auth/session/validate - Validate current session
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";
import { userRepository } from "@/repositories";

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get("__session")?.value;
    const sessionId = request.cookies.get("__session_id")?.value;

    if (!sessionCookie || !sessionId) {
      return NextResponse.json({
        valid: false,
        reason: "No session found",
      });
    }

    // Verify the session cookie with Firebase Admin
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) {
      return NextResponse.json({
        valid: false,
        reason: "Invalid session cookie",
      });
    }

    // Check if session exists and is active in Firestore
    const session = await sessionRepository.findActiveSession(sessionId);
    if (!session) {
      return NextResponse.json({
        valid: false,
        reason: "Session revoked or expired",
      });
    }

    // Get user data
    const user = await userRepository.findById(decodedToken.uid);
    if (!user || user.disabled) {
      return NextResponse.json({
        valid: false,
        reason: "User not found or disabled",
      });
    }

    // Update session activity
    await sessionRepository.updateActivity(sessionId);

    return NextResponse.json({
      valid: true,
      sessionId,
      userId: decodedToken.uid,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
