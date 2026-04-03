/**
 * Admin Session Management — Revoke Single Session
 *
 * DELETE /api/admin/sessions/[id]
 *
 * Allows admins and moderators to revoke any session by ID.
 */

import { sessionRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/next";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

/**
 * DELETE /api/admin/sessions/[id] — Revoke a session (admin/moderator)
 */
export const DELETE = createRouteHandler<never, IdParams>({
  roles: ["admin", "moderator"],
  handler: async ({ request, user, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id: sessionId } = params!;

    const session = await sessionRepository.findById(sessionId);
    if (!session) {
      return errorResponse(ERROR_MESSAGES.SESSION.NOT_FOUND, 404);
    }

    await sessionRepository.revokeSession(sessionId, user!.uid);

    serverLogger.info("Session revoked by admin", {
      adminId: user!.uid,
      sessionId,
      targetUserId: session.userId,
    });

    return successResponse(
      { sessionId },
      SUCCESS_MESSAGES.ADMIN.SESSION_REVOKED,
    );
  },
});
