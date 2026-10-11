import { withProviders } from "@/providers.config";
/**
 * Notifications Unread Count API
 * GET /api/notifications/unread-count — Get unread notification count for current user
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";

/**
 * GET /api/notifications/unread-count
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const count = await notificationRepository.getUnreadCount(user!.uid);
    return successResponse({ count });
  },
}));
