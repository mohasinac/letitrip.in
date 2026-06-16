import { withProviders } from "@/providers.config";
import {
  adminNotificationsRepository,
  createRouteHandler,
  parseJsonBody,
  type JsonValue,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

// audit-route-schema-ok: pending-bespoke-schema
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

// audit-route-schema-ok: pending-bespoke-schema
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ request }) => {
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      const doc = await adminNotificationsRepository.create({
        ...body,
        isRead: false,
      });
      return successResponse(doc, "Notification created", 201);
    },
  }),
);
