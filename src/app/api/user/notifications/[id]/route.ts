import { withProviders } from "@/providers.config";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { z } from "zod";

const MSG_NOTIFICATION_NOT_FOUND = "Notification not found.";

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

/**
 * 🛑 This handler used to read NO BODY and hard-code `markAsRead(id)`, so
 * `isRead` was a one-way door: a notification clicked by accident left the
 * unread list for good and there was no way to put it back. The buyer's page
 * offered only "Mark read" for exactly that reason.
 *
 * Validated rather than passed through: the body reaches a repository write,
 * and `{ isRead }` is the only thing this route may change.
 */
const notificationPatchSchema = z.object({
  isRead: z.boolean(),
});

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof notificationPatchSchema>>({
    auth: true,
    schema: notificationPatchSchema,
    handler: async ({ user, params, body }) => {
      const id = (params as { id: string }).id;
      const notification = await notificationRepository.findById(id);
      if (!notification || notification.userId !== user!.uid) {
        return errorResponse(MSG_NOTIFICATION_NOT_FOUND, 404);
      }
      const updated = body!.isRead
        ? await notificationRepository.markAsRead(id)
        : await notificationRepository.markAsUnread(id);
      return successResponse(
        updated,
        body!.isRead ? "Notification marked as read" : "Notification marked as unread",
      );
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
        return errorResponse(MSG_NOTIFICATION_NOT_FOUND, 404);
      }
      await notificationRepository.delete(id);
      return successResponse(null, "Notification deleted");
    },
  }),
);
