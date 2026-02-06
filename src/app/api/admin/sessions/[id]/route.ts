/**
 * Admin Session Management API - Revoke Session
 * DELETE /api/admin/sessions/[id]
 *
 * Admin-only endpoint to revoke a specific session.
 * Requires admin role.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { requireRole } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Require admin role (returns DecodedIdToken with uid)
    const admin = await requireRole("admin");

    const { id: sessionId } = await params;

    // Revoke the session
    await sessionRepository.revokeSession(sessionId, `admin:${admin.uid}`);

    return NextResponse.json({
      success: true,
      message: "Session revoked successfully",
      sessionId,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

/**
 * Get session details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Require admin role
    await requireRole("admin");

    const { id: sessionId } = await params;

    // Get session
    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
