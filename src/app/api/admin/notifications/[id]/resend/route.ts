import { withProviders } from "@/providers.config";
import { notificationRepository } from "@mohasinac/appkit/features/admin/repository/notification.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await notificationRepository.findById(id);
      if (!existing) return errorResponse("Notification not found", 404);
      await notificationRepository.update(id, { isRead: false } as any);
      return successResponse({ id }, "Notification resent");
    },
  }),
);
