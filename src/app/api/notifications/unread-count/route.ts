import "@/providers.config";
/**
 * Notifications Unread Count API
 * GET /api/notifications/unread-count — Get unread notification count for current user
 */

import { createRouteHandler } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { notificationRepository } from "@mohasinac/appkit/server";

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

