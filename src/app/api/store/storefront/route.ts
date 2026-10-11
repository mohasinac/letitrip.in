import { withProviders } from "@/providers.config";
/**
 * Seller Store API Route
 * GET /api/store/store â€” Returns the authenticated seller's own store
 */
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { ROLES_STORE_READ } from "@/constants";

export const GET = withProviders(createApiHandler({
  roles: [...ROLES_STORE_READ],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    return successResponse({ store: store ?? null });
  },
}));
