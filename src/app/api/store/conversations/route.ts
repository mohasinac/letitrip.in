/**
 * GET /api/store/conversations — list the authenticated seller's conversations.
 */
import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  listConversationsForStore,
  storeRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const items = await listConversationsForStore(store.id);
      return successResponse({ items, total: items.length });
    },
  }),
);

export const GET = withFeatureGuard("CHAT", __GET__g);
