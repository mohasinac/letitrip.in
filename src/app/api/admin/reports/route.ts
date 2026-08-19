import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  reportsRepository,
} from "@mohasinac/appkit";
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
