import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  supportRepository,
  getSearchParams,
  getStringParam,
  getNumberParam,
  sortBy,
  SUPPORT_TICKET_FIELDS,
} from "@mohasinac/appkit";
import type { SieveModel } from "@mohasinac/appkit";

const DEFAULT_SORTS = sortBy(SUPPORT_TICKET_FIELDS.CREATED_AT);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "employee"],
    permission: "admin:support-tickets:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 100 });
      const sorts = getStringParam(searchParams, "sort") || DEFAULT_SORTS;
      const filters = getStringParam(searchParams, "filters") || undefined;
      const q = getStringParam(searchParams, "q") || undefined;

      const model: SieveModel = {
        page,
        pageSize,
        sorts,
        filters: q
          ? filters
            ? `${filters},subject@=${q}`
            : `subject@=${q}`
          : filters,
      };

      const result = await supportRepository.listAll(model);
      return successResponse(result);
    },
  }),
);
