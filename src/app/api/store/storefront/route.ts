import { withProviders } from "@/providers.config";
/**
 * Seller Store API Route
 * GET /api/store/store — Returns the authenticated seller's own store
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ } from "@/constants";

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(createApiHandler({
  roles: [...ROLES_STORE_READ],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    return successResponse({ store: store ?? null });
  },
}));

