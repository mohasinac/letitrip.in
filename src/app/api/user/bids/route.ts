import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  bidRepository,
  createRouteHandler,
  successResponse,
  sieveAnd,
  sieveFilter,
  sortBy,
  SIEVE_OP,
  BID_FIELDS,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

const MAX_PAGE_SIZE = 50;

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_AUTHENTICATED,
    permission: "bids:read",
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get("pageSize")) || MAX_PAGE_SIZE));
      const status = url.searchParams.get("status") || undefined;
      // "-bidDate" (newest first) matches the client's own default sort —
      // see UserBidsPage's useUrlTable default and Root Cause #30 (SSR/client
      // filter parity) for why the server default must mirror it.
      const sort = url.searchParams.get("sort") || sortBy(BID_FIELDS.BID_DATE, "DESC");

      const userFilter = sieveFilter(BID_FIELDS.USER_ID, SIEVE_OP.EQ, user!.uid);
      const filters = status
        ? sieveAnd(userFilter, sieveFilter(BID_FIELDS.STATUS, SIEVE_OP.EQ, status))
        : userFilter;

      const result = await bidRepository.list({ filters, sorts: sort, page, pageSize });
      return successResponse({
        bids: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);

export const GET = withFeatureGuard("AUCTIONS", __GET__g);
