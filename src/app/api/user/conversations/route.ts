/**
 * GET /api/user/conversations — list the authenticated buyer's conversations.
 */
import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  listConversationsForBuyer,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const items = await listConversationsForBuyer(user!.uid);
      return successResponse({ items, total: items.length });
    },
  }),
);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const GET = withFeatureGuard("CHAT", __GET__g);
