import { withProviders } from "@/providers.config";
import {
  notificationRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:notifications:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const existing = await notificationRepository.findById(id);
      if (!existing) return errorResponse("Notification not found", 404);
      await notificationRepository.delete(id);
      return successResponse(null, "Notification deleted");
    },
  }),
);
