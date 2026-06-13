/**
 * GET /api/user/conversations — list the authenticated buyer's conversations.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  listConversationsForBuyer,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const items = await listConversationsForBuyer(user!.uid);
      return successResponse({ items, total: items.length });
    },
  }),
);
