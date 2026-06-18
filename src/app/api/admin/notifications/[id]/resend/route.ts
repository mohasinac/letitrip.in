import { withProviders } from "@/providers.config";
import {
  notificationRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:notifications:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await notificationRepository.findById(id);
      if (!existing) return errorResponse("Notification not found", 404);
      await notificationRepository.update(id, { isRead: false } as any);
      return successResponse({ id }, "Notification resent");
    },
  }),
);
