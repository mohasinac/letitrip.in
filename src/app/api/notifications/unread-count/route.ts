/**
 * Notifications Unread Count API
 * GET /api/notifications/unread-count — Get unread notification count for current user
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { notificationRepository } from "@/repositories";

/**
 * GET /api/notifications/unread-count
 */
export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    const count = await notificationRepository.getUnreadCount(user!.uid);
    return successResponse({ count });
  },
});
