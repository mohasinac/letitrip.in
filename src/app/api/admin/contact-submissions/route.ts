import { withProviders } from "@/providers.config";
/**
 * Admin Contact Submissions API Route
 * GET /api/admin/contact-submissions — List inbound contact form submissions
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { contactSubmissionsRepository } from "@mohasinac/appkit/core/contact-submissions.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { COMMON_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { ROLES_ADMIN_ONLY } from "@/constants";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:contact:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

    serverLogger.info("Admin contact submissions list requested", { filters, page, pageSize });

    const result = await contactSubmissionsRepository.list({
      filters,
      sorts,
      page: String(page),
      pageSize: String(pageSize),
    });

    return successResponse({
      items: result.data,
      meta: {
        total: result.total,
        filteredTotal: result.total,
      },
    });
  },
}));
