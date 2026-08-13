import { withProviders } from "@/providers.config";
import {
  createApiHandler as createRouteHandler,
  successResponse,
  getNumberParam,
  getSearchParams,
  getStringParam,
  shipmentLotsRepository,
  sieveAnd,
  sieveFilter,
  SIEVE_OP,
  sortBy,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * Projections — a real, paginated, persisted list of lots across every
 * non-cancelled shipment (never recomputed on load; reads the rollup
 * fields the Firestore Function cascade already wrote).
 *
 * GET /api/admin/shipments/projections
 */

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:shipments:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 50 });
      const sorts = getStringParam(searchParams, "sorts") || sortBy("projectedProfitPaise");
      const userFilters = getStringParam(searchParams, "filters");

      const filters = sieveAnd(
        sieveFilter("shipmentStatus", SIEVE_OP.NEQ, "cancelled"),
        userFilters,
      );

      const result = await shipmentLotsRepository.listForProjections({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        lots: result.items,
        meta: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages, hasMore: result.hasMore },
      });
    },
  }),
);
