import { withProviders } from "@/providers.config";
/**
 * Notifications Unread Count API
 * GET /api/notifications/unread-count — Get unread notification count for current user
 */

import { createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { notificationRepository } from "@mohasinac/appkit";

/**
 * GET /api/notifications/unread-count
 */
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
// audit-route-schema-ok: pending-bespoke-schema
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const count = await notificationRepository.getUnreadCount(user!.uid);
    return successResponse({ count });
  },
}));

