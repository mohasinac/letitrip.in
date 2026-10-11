import { withProviders } from "@/providers.config";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { supportRepository } from "@mohasinac/appkit/features/support/repository/support.repository";
import { SUPPORT_TICKET_FIELDS } from "@mohasinac/appkit/features/support/schemas/firestore";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam, getNumberParam } from "@mohasinac/appkit/next/request-helpers";
import type { SieveModel } from "@mohasinac/appkit/providers/db-firebase/sieve";
import { ROLES_TRUST_SAFETY } from "@/constants";

const DEFAULT_SORTS = sortBy(SUPPORT_TICKET_FIELDS.CREATED_AT);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_TRUST_SAFETY],
    permission: "admin:support-tickets:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 50 });
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
