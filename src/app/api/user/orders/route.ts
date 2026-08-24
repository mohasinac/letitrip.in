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
  isOrderScope,
  statusesForScope,
} from "@mohasinac/appkit";

// Set<string> (not a literal-union Set) — two different `OrderStatus` types
// exist in appkit (features/orders/types and features/account/types, with
// different value sets) and the public barrel re-exports the narrower
// account/ one, which lacks "return_requested". Typing against either here
// would be wrong or fragile; a plain string membership check needs no type
// import at all and sidesteps the collision entirely.
/**
 * The stored `OrderDocument.orderType` values a buyer can filter by.
 * "standard" also covers legacy orders written before orderType existed —
 * see the in-memory fallback below.
 */
const VALID_ORDER_TYPES = new Set<string>([
  "standard",
  "auction",
  "offer",
  "preorder",
  "prize-draw",
]);

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
      // UserOrdersView's lane tabs emit `orderType==auction` inside `filters`.
      // This handler used to parse only `status==`, so every Type tab was inert
      // (it returned the full unfiltered list) while VALID_ORDER_TYPES sat here
      // unreferenced — see the in-memory "standard" branch below.
      const orderTypeParam = getStringParam(searchParams, "orderType") ??
        filtersParam?.match(/orderType==([\w-]+)/)?.[1];
      const sortParam = getStringParam(searchParams, "sorts") ?? getStringParam(searchParams, "sort");
      const pageParam = getStringParam(searchParams, "page") ?? "1";
      const perPageParam = String(
        Math.min(50, Math.max(1, Number(getStringParam(searchParams, "pageSize") ?? getStringParam(searchParams, "perPage") ?? "12") || 12)),
      );
      const q = (getStringParam(searchParams, "q") || "").trim().toLowerCase();

      const validOrderType =
        orderTypeParam && VALID_ORDER_TYPES.has(orderTypeParam)
          ? orderTypeParam
          : undefined;
      // "standard" is deliberately NOT pushed into Firestore: orders written
      // before `orderType` existed carry no value, and `orderType==standard`
      // would exclude every one of them. It is refined in memory below instead
      // — the same reason OrderRepository.ADMIN_SIEVE_FIELDS carries that note.
      const pushableOrderType =
        validOrderType && validOrderType !== "standard" ? validOrderType : undefined;

      // Lifecycle scope (Active / Closed / All). An explicit `status` always
      // wins: picking "Delivered" while sitting on the Active tab should show
      // delivered orders, not the empty intersection of the two.
      const scopeParam = getStringParam(searchParams, "orderScope") ?? "";
      const scopeStatuses =
        !statusParam && isOrderScope(scopeParam) ? statusesForScope(scopeParam) : undefined;

      const filters =
        [
          statusParam && VALID_STATUSES.has(statusParam) ? `status==${statusParam}` : null,
          // A pipe-joined OR-group on ONE field, which the Firebase Sieve
          // adapter upgrades to a single Firestore "in" query — no fan-out,
          // and it reuses the existing (status, createdAt) composite index.
          scopeStatuses?.length ? `status==${scopeStatuses.join("|")}` : null,
          pushableOrderType ? `orderType==${pushableOrderType}` : null,
        ]
          .filter(Boolean)
          .join(",") || undefined;

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

      // Refine on the raw documents, before the adapter runs — the client-facing
      // `Order` shape is a lossy projection and this must not depend on whether
      // `orderType` happens to survive it.
      let docs = result.items;
      let items = docs.map(orderDocumentToOrder);
      let total = result.total;
      let totalPages = result.totalPages;

      // Both refinements below run over ONE page of results, so the count they
      // produce describes that page, not the result set. Assigning it to
      // `total` (which is what this route did until 2026-08-24) told the pager
      // there was exactly one page — so the default "Normal" lane, the most
      // common view on this screen, could never be paged past page 1.
      // `truncated` reports the honest shape instead: the count is a floor.
      let truncated = false;
      if (validOrderType === "standard") {
        // Legacy orders predate the field entirely, so "no orderType" IS standard.
        docs = docs.filter((d) => !d.orderType || d.orderType === "standard");
        items = docs.map(orderDocumentToOrder);
        truncated = true;
      }
      if (q) {
        items = items.filter((o) => o.id.toLowerCase().includes(q));
        truncated = true;
      }
      if (truncated) {
        // A floor, and a pager that offers Next without claiming a last page.
        total = Math.max(items.length, (result.page - 1) * result.pageSize + items.length);
        totalPages = result.hasMore ? result.page + 1 : result.page;
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
        totalPages,
        truncated,
      });
    },
  }),
);