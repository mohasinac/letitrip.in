import { withProviders } from "@/providers.config";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:notifications:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await notificationRepository.findById(id);
      if (!existing) return errorResponse("Notification not found", 404);
      await notificationRepository.delete(id);
      return successResponse(null, "Notification deleted");
    },
  }),
);
