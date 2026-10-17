import { withProviders } from "@/providers.config";
/**
 * Admin Audit Log API
 *
 * GET /api/admin/audit-log — List admin action audit entries (filterable by
 * actor/action/date range). Read-only — entries are written exclusively via
 * `recordAdminAction()` from the instrumented privileged-action call sites,
 * never through this route.
 */
import { COMMON_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { adminAuditLogRepository } from "@mohasinac/appkit/features/audit-log/repository/audit-log.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
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
      // AdminAuditLogView's toolbar says "Search by actor uid" but this handler
      // never read `q`, so the box was inert. An actor uid is an exact id, so
      // this is an equality lookup rather than a prefix/contains match (`@=` is
      // prefix-only against Firestore anyway — see providers/db-firebase/sieve.ts).
      const q = (getStringParam(searchParams, "q") || "").trim();
      const effectiveFilters =
        [filters, q ? `actorUid==${q}` : null].filter(Boolean).join(",") || undefined;

      const result = await adminAuditLogRepository.list({
        filters: effectiveFilters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        items: result.items,
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
