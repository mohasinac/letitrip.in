/**
 * Notifications Unread Count API
 * GET /api/notifications/unread-count — Get unread notification count for current user
 */

import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import { notificationRepository } from "@/repositories";

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
