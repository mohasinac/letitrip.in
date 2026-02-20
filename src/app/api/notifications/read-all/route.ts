/**
 * Notifications Read-All API
 * PATCH /api/notifications/read-all — Mark all user notifications as read
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { notificationRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { SUCCESS_MESSAGES } from "@/constants";

/**
 * PATCH /api/notifications/read-all
 */
export const PATCH = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    serverLogger.info("Marking all notifications as read", {
      userId: user!.uid,
    });
    const count = await notificationRepository.markAllAsRead(user!.uid);
    return successResponse({ count }, SUCCESS_MESSAGES.NOTIFICATION.ALL_READ);
  },
});
