/**
 * User Session Management API - Revoke My Session
 * DELETE /api/user/sessions/[id]
 *
 * Allows users to revoke their own sessions (e.g., logout from other devices).
 */

import { AuthorizationError, NotFoundError } from "@mohasinac/appkit/errors";
import { sessionRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";

export const DELETE = createRouteHandler<never, { id: string }>({
  auth: true,
  handler: async ({ user, params, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id: sessionId } = params!;

    const session = await sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError(ERROR_MESSAGES.SESSION.NOT_FOUND);

    if (session.userId !== user!.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.SESSION.CANNOT_REVOKE_OTHERS);
    }

    await sessionRepository.revokeSession(sessionId, user!.uid);
    return successResponse(
      { sessionId },
      SUCCESS_MESSAGES.ADMIN.SESSION_REVOKED,
    );
  },
});
