import { withProviders } from "@/providers.config";
/**
 * Seller Store API Route
 * GET /api/seller/store — Returns the authenticated seller's own store
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";

export const GET = withProviders(createApiHandler({
  roles: ["seller", "admin", "moderator"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    return successResponse({ store: store ?? null });
  },
}));

