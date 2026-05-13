import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  scammerRepository,
  getSearchParams,
  getStringParam,
  getNumberParam,
} from "@mohasinac/appkit";
import type { SieveModel } from "@mohasinac/appkit";
import { ROLES_TRUST_SAFETY } from "@/constants/api-roles";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_TRUST_SAFETY,
    permission: "admin:scammers:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page     = getNumberParam(searchParams, "page",     1,  { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 100 });
      const sorts    = getStringParam(searchParams, "sort")    || "-createdAt";
      const filters  = getStringParam(searchParams, "filters") || undefined;
      const q        = getStringParam(searchParams, "q")       || undefined;

      const model: SieveModel = {
        page,
        pageSize,
        sorts,
        filters: q
          ? filters ? `${filters},displayNames@=${q}` : `displayNames@=${q}`
          : filters,
      };

      const result = await scammerRepository.listAll(model);
      return successResponse({
        scammers: result.items,
        meta: { total: result.total, page, pageSize },
      });
    },
  }),
);
