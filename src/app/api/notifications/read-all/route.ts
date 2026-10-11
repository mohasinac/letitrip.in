import { withProviders } from "@/providers.config";
/**
 * Notifications Read-All API
 * PATCH /api/notifications/read-all â€” Mark all user notifications as read
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";

/**
 * PATCH /api/notifications/read-all
 */
export const PATCH = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    serverLogger.info("Marking all notifications as read", {
      userId: user!.uid,
    });
    const count = await notificationRepository.markAllAsRead(user!.uid);
    return successResponse({ count }, SUCCESS_MESSAGES.NOTIFICATION.ALL_READ);
  },
}));
