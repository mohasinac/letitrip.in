import "@/providers.config";
/**
 * Notifications Read-All API
 * PATCH /api/notifications/read-all — Mark all user notifications as read
 */

import { createRouteHandler } from "@mohasinac/appkit/next";
import { successResponse } from "@mohasinac/appkit/next";
import { notificationRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { SUCCESS_MESSAGES } from "@/constants";

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
