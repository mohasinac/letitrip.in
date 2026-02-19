/**
 * Admin Session Management — Revoke Single Session
 *
 * DELETE /api/admin/sessions/[id]
 *
 * Allows admins and moderators to revoke any session by ID.
 */

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";

/**
 * DELETE /api/admin/sessions/[id]
 *
 * Revokes the session with the given ID.
 * Requires admin or moderator role.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireRole(["admin", "moderator"]);
    const { id: sessionId } = await params;

    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      return errorResponse(ERROR_MESSAGES.SESSION.NOT_FOUND, 404);
    }

    await sessionRepository.revokeSession(sessionId, admin.uid);

    serverLogger.info("Session revoked by admin", {
      adminId: admin.uid,
      sessionId,
      targetUserId: session.userId,
    });

    return successResponse(
      { sessionId },
      SUCCESS_MESSAGES.ADMIN.SESSION_REVOKED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
