import { withProviders } from "@/providers.config";
/**
 * Admin Audit Log API
 *
 * GET /api/admin/audit-log — List admin action audit entries (filterable by
 * actor/action/date range). Read-only — entries are written exclusively via
 * `recordAdminAction()` from the instrumented privileged-action call sites,
 * never through this route.
 */
import {
  createRouteHandler,
  successResponse,
  getNumberParam,
  getSearchParams,
  getStringParam,
  adminAuditLogRepository,
  sortBy,
  COMMON_FIELDS,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });
      const filters = getStringParam(searchParams, "filters");
      const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

      const result = await adminAuditLogRepository.list({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        entries: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      });
    },
  }),
);
