import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  notificationRepository,
} from "@mohasinac/appkit";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const count = await notificationRepository.markAllAsRead(user!.uid);
      return successResponse({ count }, `${count} notifications marked as read`);
    },
  }),
);
