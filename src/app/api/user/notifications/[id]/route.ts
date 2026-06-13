import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  notificationRepository,
} from "@mohasinac/appkit";

const MSG_NOTIFICATION_NOT_FOUND = "Notification not found.";

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const notification = await notificationRepository.findById(id);
      if (!notification || notification.userId !== user!.uid) {
        return errorResponse(MSG_NOTIFICATION_NOT_FOUND, 404);
      }
      return successResponse(notification);
    },
  }),
);

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const notification = await notificationRepository.findById(id);
      if (!notification || notification.userId !== user!.uid) {
        return errorResponse(MSG_NOTIFICATION_NOT_FOUND, 404);
      }
      const updated = await notificationRepository.markAsRead(id);
      return successResponse(updated, "Notification marked as read");
    },
  }),
);

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const notification = await notificationRepository.findById(id);
      if (!notification || notification.userId !== user!.uid) {
        return errorResponse(MSG_NOTIFICATION_NOT_FOUND, 404);
      }
      await notificationRepository.delete(id);
      return successResponse(null, "Notification deleted");
    },
  }),
);
