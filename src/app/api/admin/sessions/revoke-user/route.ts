import { withProviders } from "@/providers.config";
/**
 * Admin Session Management â€” Revoke All Sessions For a User
 *
 * POST /api/admin/sessions/revoke-user
 *
 * Revokes all active sessions belonging to a specific user.
 * Requires admin or moderator role.
 */

import { sessionRepository } from "@mohasinac/appkit/features/auth/repository/session.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";

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
export const POST = withProviders(createRouteHandler<(typeof revokeUserSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  schema: revokeUserSchema,
  handler: async ({ user, body }) => {
    const { userId } = body!;
    const revokedCount = await sessionRepository.revokeAllUserSessions(
      userId,
      user!.uid,
    );
    serverLogger.info("All user sessions revoked by admin", {
      adminId: user!.uid,
      targetUserId: userId,
      revokedCount,
    });
    return successResponse(
      { userId, revokedCount },
      SUCCESS_MESSAGES.ADMIN.SESSIONS_REVOKED,
    );
  },
}));
