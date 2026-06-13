import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  adminNotificationsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async () => {
      const result = await adminNotificationsRepository.listUnread();
      return successResponse({ items: result.items });
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ request }) => {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const doc = await adminNotificationsRepository.create({
        ...body,
        isRead: false,
      });
      return successResponse(doc, "Notification created", 201);
    },
  }),
);
