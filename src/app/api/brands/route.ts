import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  categoriesRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const activeOnly = url.searchParams.get("active") !== "false";
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
      const sorts = url.searchParams.get("sorts") || "order,name";

      if (activeOnly) {
        const items = await categoriesRepository.findActiveBrands();
        return successResponse({ items, total: items.length });
      }

      const result = await categoriesRepository.list({
        filters: "categoryType==brand",
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });
      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
    },
  }),
);
