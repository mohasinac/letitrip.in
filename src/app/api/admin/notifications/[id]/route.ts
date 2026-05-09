import { withProviders } from "@/providers.config";
import {
  notificationRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await notificationRepository.findById(id);
      if (!existing) return errorResponse("Notification not found", 404);
      await notificationRepository.delete(id);
      return successResponse(null, "Notification deleted");
    },
  }),
);
