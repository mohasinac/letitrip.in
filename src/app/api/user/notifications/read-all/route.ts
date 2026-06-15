import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  notificationRepository,
} from "@mohasinac/appkit";

// audit-route-schema-ok: pending-bespoke-schema
// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const count = await notificationRepository.markAllAsRead(user!.uid);
      return successResponse({ count }, `${count} notifications marked as read`);
    },
  }),
);
