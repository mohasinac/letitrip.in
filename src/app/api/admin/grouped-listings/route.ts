/**
 * GET /api/admin/grouped-listings — admin Sieve-paginated list across all stores.
 * DELETE not exposed at the list level (use [id]/route.ts).
 *
 * W1-29 — companion to the seller-scoped /api/store/grouped-listings; gives
 * admin a full cross-store view for moderation.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  groupedListingsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:content:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const pageSize = Math.min(Number(url.searchParams.get("pageSize") ?? "50"), 100);
      const items = await groupedListingsRepository.findAll(pageSize);
      return successResponse({ items, total: items.length });
    },
  }),
);
