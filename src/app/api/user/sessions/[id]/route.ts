/**
 * User Session Management API - Revoke My Session
 * DELETE /api/user/sessions/[id]
 *
 * Allows users to revoke their own sessions (e.g., logout from other devices).
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthorizationError } from "@/lib/errors";
import { requireAuth } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Require authentication (returns DecodedIdToken with uid)
    const user = await requireAuth();

    const { id: sessionId } = await params;

    // Get session to verify ownership
    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.SESSION.NOT_FOUND },
        { status: 404 },
      );
    }

    // Verify user owns this session
    if (session.userId !== user.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.SESSION.CANNOT_REVOKE_OTHERS);
    }

    // Revoke the session
    await sessionRepository.revokeSession(sessionId, user.uid);

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.ADMIN.SESSION_REVOKED,
      sessionId,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
