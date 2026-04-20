import "@/providers.config";
/**
 * Notifications Read-All API
 * PATCH /api/notifications/read-all — Mark all user notifications as read
 */

import { createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { notificationRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";

/**
 * PATCH /api/notifications/read-all
 */
export const PATCH = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    serverLogger.info("Marking all notifications as read", {
      userId: user!.uid,
    });
    const count = await notificationRepository.markAllAsRead(user!.uid);
    return successResponse({ count }, SUCCESS_MESSAGES.NOTIFICATION.ALL_READ);
  },
});

