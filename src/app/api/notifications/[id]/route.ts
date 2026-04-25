import { withProviders } from "@/providers.config";
import {
  markNotificationRead,
  notificationRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

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
