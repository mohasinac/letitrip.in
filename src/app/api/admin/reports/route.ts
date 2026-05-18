import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  reportsRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async () => {
      const result = await reportsRepository.listPending();
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);
