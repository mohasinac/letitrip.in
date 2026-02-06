/**
 * User Sessions API - My Sessions
 * GET /api/user/sessions - Get my active sessions
 * DELETE /api/user/sessions/[id] - Revoke my session
 *
 * Allows users to view and manage their own sessions.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { requireAuth } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";

/**
 * Get current user's sessions
 */
export async function GET() {
  try {
    // Require authentication (returns DecodedIdToken with uid)
    const user = await requireAuth();

    // Get all user's sessions
    const sessions = await sessionRepository.findAllByUser(user.uid, 20);

    // Count active sessions
    const activeCount = await sessionRepository.countActiveByUser(user.uid);

    return NextResponse.json({
      success: true,
      sessions,
      activeCount,
      total: sessions.length,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
