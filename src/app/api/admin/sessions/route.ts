/**
 * Admin Sessions API - List Active Sessions
 * GET /api/admin/sessions
 *
 * Admin-only endpoint to view all active user sessions.
 * Requires admin role.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { requireRole } from "@/lib/firebase/auth-server";
import { sessionRepository, userRepository } from "@/repositories";

export async function GET(request: NextRequest) {
  try {
    // Require admin role (returns DecodedIdToken with uid)
    const adminUser = await requireRole("admin");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const userIdParam = searchParams.get("userId");

    const limit = limitParam ? parseInt(limitParam) : 100;

    // Get sessions
    let sessions;
    if (userIdParam) {
      // Get sessions for specific user
      sessions = await sessionRepository.findAllByUser(userIdParam, limit);
    } else {
      // Get all active sessions
      sessions = await sessionRepository.getAllActiveSessions(limit);
    }

    // Enrich sessions with user data
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const user = await userRepository.findById(session.userId);
        return {
          ...session,
          user: user
            ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
              }
            : null,
        };
      }),
    );

    // Get statistics
    const stats = await sessionRepository.getStats();

    return NextResponse.json({
      success: true,
      sessions: enrichedSessions,
      stats,
      count: enrichedSessions.length,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
