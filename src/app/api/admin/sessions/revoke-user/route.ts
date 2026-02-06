/**
 * Admin Session Management API - Revoke All User Sessions
 * POST /api/admin/sessions/revoke-user
 *
 * Admin-only endpoint to revoke all sessions for a specific user.
 * Useful for security incidents or forced logouts.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ValidationError } from "@/lib/errors";
import { requireRole } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";

export async function POST(request: NextRequest) {
  try {
    // Require admin role (returns DecodedIdToken with uid)
    const admin = await requireRole("admin");

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Revoke all user sessions
    const revokedCount = await sessionRepository.revokeAllUserSessions(
      userId,
      `admin:${admin.uid}`,
    );

    return NextResponse.json({
      success: true,
      message: `Revoked ${revokedCount} session(s) for user`,
      userId,
      revokedCount,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
