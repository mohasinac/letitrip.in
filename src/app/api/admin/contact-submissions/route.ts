import { withProviders } from "@/providers.config";
/**
 * Admin Contact Submissions API Route
 * GET /api/admin/contact-submissions — List inbound contact form submissions
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit";
import { contactSubmissionsRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { sortBy, COMMON_FIELDS } from "@mohasinac/appkit";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: ["admin"],
  permission: "admin:contact:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 200 });
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
      submissions: result.data,
      meta: {
        total: result.total,
        filteredTotal: result.total,
      },
    });
  },
}));
