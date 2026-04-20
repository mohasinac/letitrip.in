import "@/providers.config";
/**
 * User Sessions API - My Sessions
 * GET /api/user/sessions - Get my active sessions
 * DELETE /api/user/sessions/[id] - Revoke my session
 *
 * Allows users to view and manage their own sessions.
 */

import { sessionRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";

/**
 * Get current user's sessions
 */
export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const sessions = await sessionRepository.findAllByUser(user!.uid, 20);
    const activeCount = await sessionRepository.countActiveByUser(user!.uid);
    return successResponse({ sessions, activeCount, total: sessions.length });
  },
});

