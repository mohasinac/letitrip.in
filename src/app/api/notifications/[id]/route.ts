import "@/providers.config";
/**
 * Notifications Unread Count API
 * GET /api/notifications/unread-count â€” Get unread notification count for current user
 */

import { createRouteHandler } from "@mohasinac/appkit/next";
import { successResponse } from "@mohasinac/appkit/next";
import { notificationRepository } from "@mohasinac/appkit/repositories";

/**
 * GET /api/notifications/unread-count
 */
export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const count = await notificationRepository.getUnreadCount(user!.uid);
    return successResponse({ count });
  },
});
