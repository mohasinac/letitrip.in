import { withProviders } from "@/providers.config";
import {
  markNotificationRead,
  notificationRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
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

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
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
