import { withProviders } from "@/providers.config";
import { BID_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { bidRepository } from "@mohasinac/appkit/features/auctions/repository/bid.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { sieveAnd, sieveFilter, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";
import { ROLES_AUTHENTICATED } from "@/constants";

const MAX_PAGE_SIZE = 50;

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_AUTHENTICATED,
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get("pageSize")) || MAX_PAGE_SIZE));
      const filtersParam = url.searchParams.get("filters") || "";
      const status = url.searchParams.get("status") || filtersParam.match(/status==([\w-]+)/)?.[1] || undefined;
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      // "-bidDate" (newest first) matches the client's own default sort —
      // see UserBidsPage's useUrlTable default and Root Cause #30 (SSR/client
      // filter parity) for why the server default must mirror it.
      const sort = url.searchParams.get("sorts") || url.searchParams.get("sort") || sortBy(BID_FIELDS.BID_DATE, "DESC");

      const userFilter = sieveFilter(BID_FIELDS.USER_ID, SIEVE_OP.EQ, user!.uid);
      const filters = status
        ? sieveAnd(userFilter, sieveFilter(BID_FIELDS.STATUS, SIEVE_OP.EQ, status))
        : userFilter;

      /*
       * 🛑 `q` travels as an OPT, not as a post-filter.
       *
       * This used to page first and then run
       * `bids.filter((b) => b.productTitle.includes(q))` over the page, which
       * is Root Cause-style post-pagination filtering: a match on page 2 was
       * unreachable, and `total = bids.length` then asserted that one page was
       * the whole result set. It also could not match case-insensitively on
       * anything but an exact lowercase substring.
       *
       * `searchTxt` is `array-contains`, which Sieve cannot express, so it
       * cannot ride inside `filters` — the repository takes it as a second
       * argument and pushes it into the query.
       */
      const result = await bidRepository.list(
        { filters, sorts: sort, page, pageSize },
        q ? { search: q } : undefined,
      );
      const bids = result.items;
      const total = result.total;
      return successResponse({
        items: bids,
        total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);

export const GET = __GET__g;
