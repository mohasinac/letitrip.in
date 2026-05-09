import { withProviders } from "@/providers.config";
import {
  cartRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);
      const items = await cartRepository.findAll(limit);
      return successResponse({ items, total: items.length });
    },
  }),
);
