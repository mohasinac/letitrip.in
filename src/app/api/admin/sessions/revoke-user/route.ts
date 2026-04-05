import "@/providers.config";
/**
 * Admin Session Management — Revoke All Sessions For a User
 *
 * POST /api/admin/sessions/revoke-user
 *
 * Revokes all active sessions belonging to a specific user.
 * Requires admin or moderator role.
 */

import { sessionRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";
import { createRouteHandler } from "@mohasinac/next";

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
export const POST = createRouteHandler<(typeof revokeUserSchema)["_output"]>({
  auth: true,
  roles: ["admin", "moderator"],
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
});
