import { withProviders } from "@/providers.config";
/**
 * GET /api/admin/analytics/pageviews?startDate=&endDate=&entityType=
 *
 * Sums the day-bucketed pageViews collection over the requested date range,
 * grouped both by entity (entityType+entityId) and by raw URL. Bounded by
 * date range — no unbounded scan — so this runs directly on Vercel rather
 * than proxying to a Firebase Function.
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { pageViewsRepository, PAGE_VIEW_ENTITY_TYPES, type PageViewEntityType } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

function isEntityType(v: string): v is PageViewEntityType {
  return (PAGE_VIEW_ENTITY_TYPES as readonly string[]).includes(v);
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
      const entityTypeParam = url.searchParams.get("entityType");
      let entityType: PageViewEntityType | undefined;
      if (entityTypeParam) {
        if (!isEntityType(entityTypeParam)) return errorResponse("Invalid entityType", 400);
        entityType = entityTypeParam;
      }

      const rows = await pageViewsRepository.listInRange(startDate, endDate, entityType);

      const byEntity = new Map<string, { entityType: string; entityId: string; url: string; count: number }>();
      const byUrl = new Map<string, { url: string; count: number }>();
      let total = 0;

      for (const row of rows) {
        total += row.count;

        const entityKey = `${row.entityType}:${row.entityId}`;
        const entityAgg = byEntity.get(entityKey);
        if (entityAgg) entityAgg.count += row.count;
        else byEntity.set(entityKey, { entityType: row.entityType, entityId: row.entityId, url: row.url, count: row.count });

        const urlAgg = byUrl.get(row.url);
        if (urlAgg) urlAgg.count += row.count;
        else byUrl.set(row.url, { url: row.url, count: row.count });
      }

      const byEntityList = [...byEntity.values()].sort((a, b) => b.count - a.count);
      const byUrlList = [...byUrl.values()].sort((a, b) => b.count - a.count);

      return successResponse({
        startDate,
        endDate,
        total,
        byEntity: byEntityList,
        byUrl: byUrlList,
      });
    },
  }),
);
