import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  notificationRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const notification = await notificationRepository.findById(id);
      if (!notification || notification.userId !== user!.uid) {
        return errorResponse("Notification not found", 404);
      }
      return successResponse(notification);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const notification = await notificationRepository.findById(id);
      if (!notification || notification.userId !== user!.uid) {
        return errorResponse("Notification not found", 404);
      }
      const updated = await notificationRepository.markAsRead(id);
      return successResponse(updated, "Notification marked as read");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const notification = await notificationRepository.findById(id);
      if (!notification || notification.userId !== user!.uid) {
        return errorResponse("Notification not found", 404);
      }
      await notificationRepository.delete(id);
      return successResponse(null, "Notification deleted");
    },
  }),
);
