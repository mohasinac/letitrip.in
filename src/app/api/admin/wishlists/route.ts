import { withProviders } from "@/providers.config";
import { wishlistRepository } from "@mohasinac/appkit";
import {
  createRouteHandler,
  successResponse,
  WISHLIST_MAX,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * GET /api/admin/wishlists — one row per user with item count + last update.
 * Backed by `wishlistRepository.findAllSummaries()` (top-level `wishlists/` docs).
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:wishlists:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);
      const summaries = await wishlistRepository.findAllSummaries();
      const sorted = summaries
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit)
        .map((s) => ({
          id: `wishlist-${s.userId}`,
          userId: s.userId,
          itemCount: s.itemCount,
          limit: WISHLIST_MAX,
          isFull: s.itemCount >= WISHLIST_MAX,
          updatedAt: s.updatedAt.toISOString(),
        }));
      return successResponse({ items: sorted, total: sorted.length });
    },
  }),
);
