/**
 * GET /api/user/conversations â€” list the authenticated buyer's conversations.
 */
import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  listConversationsForBuyer,
} from "@mohasinac/appkit";

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const items = await listConversationsForBuyer(user!.uid);
      return successResponse({ items, total: items.length });
    },
  }),
);

export const GET = withFeatureGuard("CHAT", __GET__g);
