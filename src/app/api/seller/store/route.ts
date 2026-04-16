import "@/providers.config";
/**
 * Seller Store API Route
 * GET /api/seller/store — Returns the authenticated seller's own store
 */
import { createApiHandler } from "@mohasinac/appkit/http";
import { successResponse } from "@mohasinac/appkit/next";
import { storeRepository } from "@mohasinac/appkit/repositories";

export const GET = createApiHandler({
  roles: ["seller", "admin", "moderator"],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    return successResponse({ store: store ?? null });
  },
});

