/**
 * User Session Management API - Revoke My Session
 * DELETE /api/user/sessions/[id]
 *
 * Allows users to revoke their own sessions (e.g., logout from other devices).
 */

import { AuthorizationError, NotFoundError } from "@/lib/errors";
import { sessionRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { successResponse } from "@/lib/api-response";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

export const DELETE = createApiHandler<never, { id: string }>({
  auth: true,
  rateLimit: RateLimitPresets.STRICT,
  handler: async ({ user, params }) => {
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
