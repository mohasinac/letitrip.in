import { withProviders } from "@/providers.config";
/**
 * GET /api/admin/analytics/pageviews?startDate=&endDate=&page=&pageSize=&sorts=&q=&filters=
 *
 * Sums the day-bucketed pageViews collection over the requested date range,
 * grouped by entity (entityType+entityId+url), then applies search/sort/
 * pagination in-memory before returning a page. Bounded by date range — no
 * unbounded scan — so this runs directly on Vercel rather than proxying to
 * a Firebase Function.
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { pageViewsRepository, PAGE_VIEW_ENTITY_TYPES, type PageViewEntityType } from "@mohasinac/appkit";
import { sortBy } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy("count", "DESC");

function isEntityType(v: string): v is PageViewEntityType {
  return (PAGE_VIEW_ENTITY_TYPES as readonly string[]).includes(v);
}

interface EntityAgg {
  entityType: string;
  entityId: string;
  url: string;
  count: number;
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const today = new Date().toISOString().slice(0, 10);
      const startDate = url.searchParams.get("startDate") ?? today;
      const endDate = url.searchParams.get("endDate") ?? today;
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 25));
      const sorts = url.searchParams.get("sorts") || DEFAULT_SORTS;
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();

      const filtersParam = url.searchParams.get("filters") || "";
      const entityTypeMatch = filtersParam.match(/entityType==([\w-]+)/);
      let entityType: PageViewEntityType | undefined;
      if (entityTypeMatch) {
        if (!isEntityType(entityTypeMatch[1])) return errorResponse("Invalid entityType", 400);
        entityType = entityTypeMatch[1];
      }

      const rows = await pageViewsRepository.listInRange(startDate, endDate, entityType);

      const byEntity = new Map<string, EntityAgg>();
      let total = 0;
      for (const row of rows) {
        total += row.count;
        const entityKey = `${row.entityType}:${row.entityId}`;
        const agg = byEntity.get(entityKey);
        if (agg) agg.count += row.count;
        else byEntity.set(entityKey, { entityType: row.entityType, entityId: row.entityId, url: row.url, count: row.count });
      }

      let list = [...byEntity.values()];
      if (q) {
        list = list.filter(
          (row) => row.entityId.toLowerCase().includes(q) || row.url.toLowerCase().includes(q),
        );
      }
      list.sort((a, b) => (sorts === "count" ? a.count - b.count : b.count - a.count));

      const totalFiltered = list.length;
      const start = (page - 1) * pageSize;
      const items = list.slice(start, start + pageSize);

      return successResponse({
        startDate,
        endDate,
        total: totalFiltered,
        totalViews: total,
        items,
      });
    },
  }),
);
