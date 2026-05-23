import { withProviders } from "@/providers.config";
import {
  cartRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * GET /api/admin/carts — list all carts.
 * W1-42: switched from cartRepository.findAll(limit) to .list() with Sieve
 * filters (userId, sessionId, updatedAt) so AdminCartsView's filter drawer
 * actually narrows server results instead of returning the first 200 unfiltered.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:carts:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const result = await cartRepository.list({
        filters: url.searchParams.get("filters") ?? undefined,
        sorts: url.searchParams.get("sorts") ?? "-updatedAt",
        page: url.searchParams.get("page") ?? 1,
        pageSize: url.searchParams.get("pageSize") ?? 25,
      });
      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    },
  }),
);
