import { withProviders } from "@/providers.config";
import {
  orderRepository,
  successResponse,
  createRouteHandler,
  getSearchParams,
  getStringParam,
  serverLogger,
  OrderStatusValues,
  orderDocumentToOrder,
  sortBy,
  ORDER_FIELDS,
} from "@mohasinac/appkit";

// Set<string> (not a literal-union Set) — two different `OrderStatus` types
// exist in appkit (features/orders/types and features/account/types, with
// different value sets) and the public barrel re-exports the narrower
// account/ one, which lacks "return_requested". Typing against either here
// would be wrong or fragile; a plain string membership check needs no type
// import at all and sidesteps the collision entirely.
const VALID_STATUSES = new Set<string>([
  OrderStatusValues.PENDING,
  OrderStatusValues.CONFIRMED,
  OrderStatusValues.SHIPPED,
  OrderStatusValues.DELIVERED,
  OrderStatusValues.CANCELLED,
  OrderStatusValues.RETURNED,
  OrderStatusValues.REFUNDED,
  OrderStatusValues.RETURN_REQUESTED,
]);

// Sort fields the client is allowed to request — mirrors the sortable subset
// of OrderRepository.ADMIN_SIEVE_FIELDS (used by listForUser). Prevents an
// arbitrary/unindexed field being passed straight into orderBy().
const VALID_SORT_FIELDS = new Set<string>([
  ORDER_FIELDS.CREATED_AT,
  ORDER_FIELDS.ORDER_DATE,
  ORDER_FIELDS.TOTAL_PRICE,
]);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const searchParams = getSearchParams(request);
      // Two param shapes are accepted: the original hand-rolled `status`/
      // `sort`/`perPage` (still used by useOrders() for the dashboard summary
      // widgets) and DataListingView's standard `filters`/`sorts`/`pageSize`/`q`
      // (used by the /user/orders listing page). Both resolve to the same query.
      const filtersParam = getStringParam(searchParams, "filters");
      const statusParam = getStringParam(searchParams, "status") ??
        filtersParam?.match(/status==([\w-]+)/)?.[1];
      const sortParam = getStringParam(searchParams, "sorts") ?? getStringParam(searchParams, "sort");
      const pageParam = getStringParam(searchParams, "page") ?? "1";
      const perPageParam = String(
        Math.min(50, Math.max(1, Number(getStringParam(searchParams, "pageSize") ?? getStringParam(searchParams, "perPage") ?? "12") || 12)),
      );
      const q = (getStringParam(searchParams, "q") || "").trim().toLowerCase();

      const filters =
        statusParam && VALID_STATUSES.has(statusParam)
          ? `status==${statusParam}`
          : undefined;

      // sortParam arrives as e.g. "-createdAt" / "totalPrice" (sortBy()
      // output). Strip the leading "-" to validate the bare field name
      // against the allowlist; fall back to the default when absent/invalid
      // rather than passing an arbitrary field straight into orderBy().
      const sortField = sortParam?.replace(/^-/, "");
      const sorts =
        sortField && VALID_SORT_FIELDS.has(sortField)
          ? sortParam!
          : sortBy(ORDER_FIELDS.ORDER_DATE);

      const result = await orderRepository.listForUser(user!.uid, {
        filters,
        sorts,
        page: pageParam,
        pageSize: perPageParam,
      });

      let items = result.items.map(orderDocumentToOrder);
      let total = result.total;
      if (q) {
        items = items.filter((o) => o.id.toLowerCase().includes(q));
        total = items.length;
      }

      serverLogger.info("Orders listed", {
        userId: user!.uid,
        count: result.total,
      });

      return successResponse({
        items,
        total,
        page: result.page,
        perPage: result.pageSize,
        totalPages: result.totalPages,
      });
    },
  }),
);