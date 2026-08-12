import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  itemRequestsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const MAX_LIST_LIMIT = 100;

/**
 * GET /api/admin/item-requests — approval queue (pending-approval only).
 * `itemRequestsRepository` extends the plain BaseRepository (no sieve
 * pagination support), so this mirrors `listOpen()`'s existing shape —
 * `findBy` + an in-memory cap — rather than the sieve-model list pattern
 * used by sieve-aware repositories elsewhere in admin/**.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:products:read",
    handler: async () => {
      const pending = await itemRequestsRepository.findBy("status", "pending-approval");
      const items = [...pending]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, MAX_LIST_LIMIT);
      return successResponse({ items, total: items.length });
    },
  }),
);
