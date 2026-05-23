/**
 * GET / DELETE /api/admin/grouped-listings/[id] — admin moderation endpoint.
 * Seller-scoped CRUD lives at /api/store/grouped-listings/[id].
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  errorResponse,
  successResponse,
  groupedListingsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:content:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await groupedListingsRepository.findById(id);
      if (!doc) return errorResponse("Grouped listing not found", 404);
      return successResponse({ item: doc });
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:content:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await groupedListingsRepository.delete(id);
      return successResponse({ id });
    },
  }),
);
