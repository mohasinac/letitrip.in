import { withProviders } from "@/providers.config";
import { markNotificationRead } from "@mohasinac/appkit/features/admin/actions/notification-actions";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await markNotificationRead(id);
      return successResponse(null, "Notification marked as read");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await notificationRepository.delete(id);
      return successResponse(null, "Notification deleted");
    },
  }),
);