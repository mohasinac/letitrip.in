import { withProviders } from "@/providers.config";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { CATEGORY_FIELDS } from "@mohasinac/appkit/features/categories/schemas/firestore";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { sieveFilter, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";

const DEFAULT_SORTS = [sortBy(CATEGORY_FIELDS.ORDER, "ASC"), sortBy(CATEGORY_FIELDS.NAME, "ASC")].join(",");

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const activeOnly = url.searchParams.get("active") !== "false";
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
      const sorts = url.searchParams.get("sorts") || DEFAULT_SORTS;

      if (activeOnly) {
        const items = await categoriesRepository.findActiveBrands();
        return successResponse({ items, total: items.length });
      }

      // Same searchTxt pushdown as the admin sibling — see the note there for
      // why a brand row is searchable at all.
      const q = (url.searchParams.get("q") || "").trim();

      const result = await categoriesRepository.list(
        {
          filters: sieveFilter("categoryType", SIEVE_OP.EQ, "brand"),
          sorts,
          page: String(page),
          pageSize: String(pageSize),
        },
        q ? { search: q } : undefined,
      );
      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
    },
  }),
);