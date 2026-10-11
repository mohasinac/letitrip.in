import { withProviders } from "@/providers.config";
import { reportsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async () => {
      const result = await reportsRepository.listPending();
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);
