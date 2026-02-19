/**
 * Admin Session Management — Revoke All Sessions For a User
 *
 * POST /api/admin/sessions/revoke-user
 *
 * Revokes all active sessions belonging to a specific user.
 * Requires admin or moderator role.
 */

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/firebase/auth-server";
import { sessionRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";

const revokeUserSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

/**
 * POST /api/admin/sessions/revoke-user
 *
 * Body: { userId: string }
 *
 * Revokes all active sessions for the given user and returns the count.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(["admin", "moderator"]);

    const body = await request.json();
    const validation = revokeUserSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400);
    }

    const { userId } = validation.data;

    const revokedCount = await sessionRepository.revokeAllUserSessions(
      userId,
      admin.uid,
    );

    serverLogger.info("All user sessions revoked by admin", {
      adminId: admin.uid,
      targetUserId: userId,
      revokedCount,
    });

    return successResponse(
      { userId, revokedCount },
      SUCCESS_MESSAGES.ADMIN.SESSIONS_REVOKED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
