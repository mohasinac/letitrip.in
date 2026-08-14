import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  getNumberParam,
  getSearchParams,
  getStringParam,
  catalogueRepository,
  sieveAnd,
  sieveFilter,
  SIEVE_OP,
  sortBy,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/** GET /api/admin/catalogue — pending-approval queue. */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:catalogue:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 50 });
      const sorts = getStringParam(searchParams, "sorts") || sortBy("createdAt", "DESC");
      const filters = sieveAnd(sieveFilter("listingStatus", SIEVE_OP.EQ, "pending_admin_approval"));

      const result = await catalogueRepository.listPendingApproval({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        items: result.items,
        meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages, hasMore: result.hasMore },
      });
    },
  }),
);
