import { normalizeError } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
import { NextResponse } from "next/server";
import {
  productRepository,
  sanitizeProductsForPublic,
  parseListingParams,
  PRODUCT_FIELDS,
  TABLE_KEYS,
  SIEVE_OP,
  expandSieveParam,
  sieveFilter,
  sieveAnd,
  sortBy,
  isListingTypeEnabled,
  enabledListingTypes,
} from "@mohasinac/appkit";
import { getSiteSettingsSafe } from "@mohasinac/appkit/server";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import {
  callListingProcessor,
  type ListingProcessorResponse,
} from "@/lib/listing-processor";
import { validateSieveFilters } from "@/lib/sieve-validators";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORTS = sortBy(PRODUCT_FIELDS.CREATED_AT);

/** Matches the Cache-Control used by listingProcessor on Firebase side. */
const PUBLIC_LISTING_CACHE_CONTROL =
  "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

function param(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

const SAFE_PRODUCT_FILTER_FIELDS = new Set([
  PRODUCT_FIELDS.STATUS,
  PRODUCT_FIELDS.CATEGORY,
  PRODUCT_FIELDS.CATEGORY_SLUG,
  PRODUCT_FIELDS.CATEGORY_SLUGS,
  PRODUCT_FIELDS.BRAND,
  PRODUCT_FIELDS.CONDITION,
  PRODUCT_FIELDS.STORE_ID,
  PRODUCT_FIELDS.TITLE,
  PRODUCT_FIELDS.PRICE,
  PRODUCT_FIELDS.LISTING_TYPE,
  PRODUCT_FIELDS.FEATURED,
  PRODUCT_FIELDS.IS_PROMOTED,
  PRODUCT_FIELDS.STOCK_QUANTITY,
  PRODUCT_FIELDS.AVAILABLE_QUANTITY,
  PRODUCT_FIELDS.TAGS,
  PRODUCT_FIELDS.CURRENT_BID,
  PRODUCT_FIELDS.AUCTION_END_DATE,
  PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE,
  PRODUCT_FIELDS.PRE_ORDER_PRODUCTION_STATUS,
  PRODUCT_FIELDS.PRIZE_REVEAL_STATUS,
  PRODUCT_FIELDS.SHIPPING_PAID_BY,
  "isPartOfBundle",
]);

/**
 * Builds a Sieve filter string by combining:
 *   1. Per-field query params (status, category, brand, â€¦) â€” the UX-facing API
 *   2. A raw Sieve filter string via `f=` (short) or `filters=` (long) â€” gated
 *      through `validateSieveFilters` so only safelisted fields go through.
 *
 * Multi-value pipe params (e.g. condition=new|used) are expanded to multiple
 * AND clauses (condition==new,condition==used) via expandSieveParam â€” pipe is
 * only valid for string-matching operators (@=, _=, _-= and CI variants).
 */
function buildFilters(url: URL, rawFilters: string | null): string {
  const parts: string[] = [];

  // Multi-select EQ fields use pipe-joined values (`field==v1|v2`) so that
  // sievejs parses them as a single OR-group, which the enhanced Firebase
  // adapter translates to a Firestore `in` query. Using comma-separated AND
  // clauses (old `expandSieveParam` behaviour) would return zero results when
  // multiple values are selected because a document can't satisfy both at once.
  const statusParam = param(url, TABLE_KEYS.STATUS);
  if (statusParam) parts.push(sieveFilter(PRODUCT_FIELDS.STATUS, SIEVE_OP.EQ, statusParam));
  // Default to published-only when the caller sends no status at all — mirrors
  // /api/events's hasStatusFilter fallback. Without this, any client-driven
  // refetch (search/sort/page/other-filter change) that doesn't explicitly pass
  // status leaks draft/archived/in_review products, since useProducts() never
  // sends a status param itself (Root Cause #30).
  else parts.push(sieveFilter(PRODUCT_FIELDS.STATUS, SIEVE_OP.EQ, PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED));

  // categorySlugs is an array field â€” use @= (array-contains). Accepts either
  // ?category= or ?categorySlug= from callers; both map to the same array field.
  const categoryParam = param(url, TABLE_KEYS.CATEGORY) || param(url, TABLE_KEYS.CATEGORY_SLUG);
  if (categoryParam) parts.push(expandSieveParam(PRODUCT_FIELDS.CATEGORY_SLUGS, categoryParam, SIEVE_OP.CONTAINS));

  const brandParam = param(url, TABLE_KEYS.BRAND);
  if (brandParam) parts.push(sieveFilter(PRODUCT_FIELDS.BRAND, SIEVE_OP.EQ, brandParam));

  const conditionParam = param(url, TABLE_KEYS.CONDITION);
  if (conditionParam) parts.push(sieveFilter(PRODUCT_FIELDS.CONDITION, SIEVE_OP.EQ, conditionParam));

  const storeIdParam = param(url, TABLE_KEYS.STORE_ID);
  if (storeIdParam) parts.push(sieveFilter(PRODUCT_FIELDS.STORE_ID, SIEVE_OP.EQ, storeIdParam));

  // NOTE: 'q' (title search) is intentionally NOT included here.
  // Firestore can't combine a prefix-range on `title` with other inequality/orderBy
  // fields without a per-combination composite index. Instead, we apply title search:
  //   - as a Sieve clause in the upstream Firebase Function (which handles it server-side)
  //   - as in-memory post-filtering in the local fallback repo path
  // See the _GET handler below for how q is threaded through.

  // RangeFilter UI sends values in rupees (maxBound=500000 = â‚¹5 lakh, step=500).
  // Firestore stores price in decimal rupees natively — no unit conversion needed.
  const minPriceRs = param(url, TABLE_KEYS.MIN_PRICE);
  if (minPriceRs !== null && !Number.isNaN(Number(minPriceRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRICE, SIEVE_OP.GTE, String(Number(minPriceRs))));
  }
  const maxPriceRs = param(url, TABLE_KEYS.MAX_PRICE);
  if (maxPriceRs !== null && !Number.isNaN(Number(maxPriceRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRICE, SIEVE_OP.LTE, String(Number(maxPriceRs))));
  }

  // NOTE: 'inStock' (stockQuantity>0) is intentionally NOT included here.
  // Firestore can't combine a stockQuantity inequality with arbitrary orderBy fields
  // (title, viewCount, price, etc.) without per-combination composite indexes.
  // Instead, we apply the in-stock filter:
  //   - as a Sieve clause in the upstream Firebase Function (which handles it server-side)
  //   - as in-memory post-filtering in the local fallback repo path
  // See the _GET handler below for how inStock is threaded through.

  // SB1-G â€” canonical listingType discriminator
  const listingTypeParam = param(url, TABLE_KEYS.LISTING_TYPE);
  if (listingTypeParam) {
    parts.push(sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, listingTypeParam));
  }

  const featured = param(url, TABLE_KEYS.FEATURED);
  if (featured === "true") parts.push(sieveFilter(PRODUCT_FIELDS.FEATURED, SIEVE_OP.EQ, true));

  const isPromoted = param(url, "isPromoted");
  if (isPromoted === "true") parts.push(sieveFilter(PRODUCT_FIELDS.IS_PROMOTED, SIEVE_OP.EQ, true));

  // Same unit as minPrice/maxPrice â€” AuctionFilters sends rupees, stored natively.
  const minBidRs = param(url, TABLE_KEYS.MIN_BID);
  if (minBidRs !== null && !Number.isNaN(Number(minBidRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.CURRENT_BID, SIEVE_OP.GTE, String(Number(minBidRs))));
  }
  const maxBidRs = param(url, TABLE_KEYS.MAX_BID);
  if (maxBidRs !== null && !Number.isNaN(Number(maxBidRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.CURRENT_BID, SIEVE_OP.LTE, String(Number(maxBidRs))));
  }

  // NOTE: dateFrom/dateTo are intentionally NOT included here.
  // Combining an inequality on auctionEndDate or preOrderDeliveryDate with
  // arbitrary orderBy fields (currentBid, createdAt, price, etc.) requires
  // per-combination composite indexes AND Firestore's restriction that the
  // inequality field must be the first orderBy. Instead we apply date-range
  // filters the same way as inStock:
  //   - as Sieve clauses in the upstream Firebase Function (handled server-side)
  //   - as in-memory post-filtering in the local fallback repo path
  // See the _GET handler below for how dateFrom/dateTo are threaded through.

  const preOrderProductionStatus = param(url, TABLE_KEYS.PREORDER_STATUS) ?? param(url, "preOrderStatus");
  if (preOrderProductionStatus) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRE_ORDER_PRODUCTION_STATUS, SIEVE_OP.EQ, preOrderProductionStatus));
  }

  const prizeRevealStatus = param(url, TABLE_KEYS.PRIZE_REVEAL_STATUS);
  if (prizeRevealStatus) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRIZE_REVEAL_STATUS, SIEVE_OP.EQ, prizeRevealStatus));
  }

  const freeShipping = param(url, TABLE_KEYS.FREE_SHIPPING);
  if (freeShipping === "true") {
    parts.push(sieveFilter(PRODUCT_FIELDS.SHIPPING_PAID_BY, SIEVE_OP.EQ, PRODUCT_FIELDS.SHIPPING_PAID_BY_VALUES.SELLER));
  }

  const isPartOfBundle = param(url, TABLE_KEYS.IS_PART_OF_BUNDLE);
  if (isPartOfBundle === "true") {
    parts.push(sieveFilter("isPartOfBundle", SIEVE_OP.EQ, true));
  }

  // NOTE: 'features' filter is intentionally NOT included here.
  // Firestore `array-contains-any` (needed for multi-select OR across the
  // features array field) is not supported by the sievejs Firebase adapter.
  // Applied in-memory in the fallback path and passed as Sieve @= to the
  // Firebase Function. See the _GET handler below.

  if (rawFilters) {
    const safe = validateSieveFilters(rawFilters, SAFE_PRODUCT_FILTER_FIELDS);
    if (safe) parts.push(safe);
  }
  return sieveAnd(...parts);
}

const IDS_MAX = 20;

async function _GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);

  // Batch `ids=` mode â€” used by Compare overlay (BK3) to fetch up to IDS_MAX
  // products in a single round-trip. Bypasses the sieve / filters path.
  const idsParam = param(url, "ids");
  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, IDS_MAX);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: { items: [], total: 0 } });
    }
    try {
      const items = await productRepository.listByIds(ids);
      const response = NextResponse.json({
        success: true,
        data: {
          items: sanitizeProductsForPublic(
            items as unknown as Array<Record<string, JsonValue>>,
          ),
          total: items.length,
        },
      });
      response.headers.set("Cache-Control", PUBLIC_LISTING_CACHE_CONTROL);
      return response;
    } catch (error) {
      void normalizeError(error);
      logError("products", "GET /api/products?ids batch failed", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch products" },
        { status: 500 },
      );
    }
  }

  const std = parseListingParams(url);
  const page = std.page ?? DEFAULT_PAGE;
  // Vercel Hobby Fluid Compute cap: never return more than 50 docs/page
  // (CLAUDE.md Rule #6). Reject larger values explicitly so callers see a
  // 400 and migrate to pagination instead of silently getting clamped.
  const requestedPageSize = std.pageSize ?? DEFAULT_PAGE_SIZE;
  if (requestedPageSize > 50) {
    return NextResponse.json(
      { success: false, error: "pageSize cannot exceed 50 â€” paginate instead." },
      { status: 400 },
    );
  }
  const pageSize = requestedPageSize;
  const sorts = std.sorts ?? DEFAULT_SORTS;
  const cursor = std.cursor;

  // W1-43 â€” listing-type feature flag gating. If the caller requested a
  // disabled type (?listingType=auction with auctions off), return empty
  // results immediately. For no-filter calls, post-filter excludes disabled
  // types from the response so the public listing pages stay clean.
  const requestedListingType = param(url, PRODUCT_FIELDS.LISTING_TYPE);
  const siteSettings = await getSiteSettingsSafe();
  if (
    requestedListingType &&
    siteSettings &&
    !isListingTypeEnabled(requestedListingType as never, siteSettings)
  ) {
    const response = NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasMore: false,
        listingTypeDisabled: true,
      },
    });
    response.headers.set("Cache-Control", PUBLIC_LISTING_CACHE_CONTROL);
    return response;
  }
  const enabledTypeSet = new Set<string>(
    siteSettings ? enabledListingTypes(siteSettings) : [],
  );
  // 'q' and 'inStock' are extracted here and handled separately from other Sieve filters.
  // Firestore can't combine a title prefix-range or stockQuantity inequality with arbitrary
  // orderBy fields without per-combination composite indexes. So we pass both to the upstream
  // Firebase Function (which handles Sieve server-side) but apply them as in-memory filters
  // for the local repo fallback.
  const q = param(url, TABLE_KEYS.QUERY);
  const inStock = param(url, TABLE_KEYS.IN_STOCK) === "true";
  const featuresParam = param(url, TABLE_KEYS.FEATURES);
  const featureIds = featuresParam ? featuresParam.split("|").filter(Boolean) : [];
  const listingTypeForDate = param(url, TABLE_KEYS.LISTING_TYPE);
  const dateFrom = param(url, TABLE_KEYS.DATE_FROM);
  const dateTo = param(url, TABLE_KEYS.DATE_TO);
  const filtersBase = buildFilters(url, std.filters);

  // Build date-range Sieve clauses for the Firebase Function (which handles them
  // server-side). Not applied in filtersBase â€” see comment in buildFilters.
  const dateFromClause =
    dateFrom && listingTypeForDate === "auction"
      ? sieveFilter(PRODUCT_FIELDS.AUCTION_END_DATE, SIEVE_OP.GTE, dateFrom)
      : dateFrom && listingTypeForDate === "pre-order"
        ? sieveFilter(PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE, SIEVE_OP.GTE, dateFrom)
        : null;
  const dateToClause =
    dateTo && listingTypeForDate === "auction"
      ? sieveFilter(PRODUCT_FIELDS.AUCTION_END_DATE, SIEVE_OP.LTE, dateTo)
      : dateTo && listingTypeForDate === "pre-order"
        ? sieveFilter(PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE, SIEVE_OP.LTE, dateTo)
        : null;

  // Firestore rejects a query with inequality/range filters on more than one
  // field (root-caused 2026-08-20: stockQuantity>0 combined with the
  // createdAt-ordered/cursor-paginated query threw FAILED_PRECONDITION on
  // both the upstream Function and the local repo fallback, since they share
  // the same Sieve->Firestore push-down — the "in-memory post-filtering"
  // this comment block used to promise was never actually implemented).
  // inStock and the date-range clauses can conflict with the createdAt/other
  // orderBy field, so they're never pushed into the Firestore-level query —
  // applied as in-memory predicates below instead, over a single bounded
  // fetch (pageSize capped at 50 per Rule #6; this catalog is deliberately
  // small — see CLAUDE.md Seed Data Reference — so one page covers it).
  const hasUnsafeFilter = inStock || !!dateFromClause || !!dateToClause;
  const filters = sieveAnd(
    filtersBase,
    ...(q ? [sieveFilter(PRODUCT_FIELDS.TITLE, SIEVE_OP.CONTAINS_CI, q)] : []),
    ...(featureIds.length === 1 ? [sieveFilter(PRODUCT_FIELDS.FEATURES, SIEVE_OP.CONTAINS, featureIds[0])] : []),
  );

  function passesUnsafeFilters(item: Record<string, JsonValue>): boolean {
    if (inStock && !(typeof item.stockQuantity === "number" && item.stockQuantity > 0)) return false;
    if (dateFromClause) {
      const field = listingTypeForDate === "auction" ? "auctionEndDate" : "preOrderDeliveryDate";
      const raw = item[field];
      if (!raw || String(raw) < String(dateFrom)) return false;
    }
    if (dateToClause) {
      const field = listingTypeForDate === "auction" ? "auctionEndDate" : "preOrderDeliveryDate";
      const raw = item[field];
      if (!raw || String(raw) > String(dateTo)) return false;
    }
    return true;
  }

  try {
    // Q3: prefer the colocated listingProcessor Firebase Function when the
    // FIREBASE_FUNCTION_LISTING_URL env var is set; otherwise fall back to the
    // local repository call (keeps dev workflow working without the Function).
  let items: unknown[];
    let total: number;
    let resultPage: number;
    let totalPages: number;
    let hasMore: boolean;
    let nextCursor: string | null = null;

    // listingProcessor preference: try the colocated Firebase Function first
    // (cheaper data-locality); if it's not configured OR it fails (cold-start
    // crash, 401 from a secret-binding regression, network blip), fall through
    // to the local repository so the route stays available. The function and
    // the repository share the same Sieve filter logic so results are
    // semantically identical â€” only the data-locality differs.
    const fetchPage = hasUnsafeFilter ? 1 : page;
    const fetchPageSize = hasUnsafeFilter ? 50 : pageSize;

    let upstream: ListingProcessorResponse | null = null;
    try {
      upstream = await callListingProcessor("products", {
        filters,
        sorts,
        page: fetchPage,
        pageSize: fetchPageSize,
        cursor: hasUnsafeFilter ? null : cursor,
      });
    } catch (upstreamErr) {
      void normalizeError(upstreamErr);
      logError(
        "products",
        "listingProcessor upstream failed â€” falling back to local repo",
        upstreamErr,
      );
      upstream = null;
    }

    if (upstream) {
      items = upstream.items;
      total = upstream.total;
      resultPage = upstream.page;
      totalPages = upstream.totalPages;
      hasMore = upstream.hasMore;
      nextCursor = upstream.cursor;
    } else {
      const result = await productRepository.list({
        filters,
        sorts,
        page: fetchPage,
        pageSize: fetchPageSize,
      });
      items = result.items;
      total = result.total;
      resultPage = result.page;
      totalPages = result.totalPages;
      hasMore = result.hasMore;
    }

    // inStock / date-range filters couldn't be pushed into the Firestore
    // query (see hasUnsafeFilter above) — apply them now over the bounded
    // fetch, then paginate the filtered set to the caller's real page/pageSize.
    if (hasUnsafeFilter) {
      const filtered = (items as Array<Record<string, JsonValue>>).filter(passesUnsafeFilters);
      total = filtered.length;
      totalPages = Math.max(1, Math.ceil(total / pageSize));
      resultPage = page;
      const start = (page - 1) * pageSize;
      items = filtered.slice(start, start + pageSize);
      hasMore = start + pageSize < total;
      nextCursor = null;
    }

    // W1-43 â€” when no specific listingType was requested, strip any documents
    // whose listingType is currently disabled in site settings. Cheap O(n)
    // pass; only triggers when at least one type is off.
    if (!requestedListingType && enabledTypeSet.size > 0 && enabledTypeSet.size < 7) {
      const before = items.length;
      items = (items as Array<Record<string, JsonValue>>).filter((it) => {
        const lt = typeof it.listingType === "string" ? it.listingType : "standard";
        return enabledTypeSet.has(lt);
      });
      const removed = before - items.length;
      if (removed > 0) total = Math.max(0, total - removed);
    }

    const response = NextResponse.json({
      success: true,
      data: {
        items: sanitizeProductsForPublic(
          items as Array<Record<string, JsonValue>>,
        ),
        total,
        page: resultPage,
        pageSize,
        totalPages,
        hasMore,
        cursor: nextCursor,
        query: {
          filters,
          sorts,
          page,
          pageSize,
        },
      },
    });
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    void normalizeError(error);
    const message = error instanceof Error ? error.message : String(error);
    const isIndexError =
      message.includes("FAILED_PRECONDITION") ||
      message.toLowerCase().includes("index") ||
      message.toLowerCase().includes("requires an index");
    const isPermissionError =
      message.includes("PERMISSION_DENIED") ||
      message.includes("7 PERMISSION_DENIED") ||
      message.toLowerCase().includes("permission denied");

    if (isIndexError || isPermissionError) {
      const warning = isPermissionError
        ? "Firestore permission denied â€” check security rules for the products collection"
        : "Firestore index missing â€” run: firebase deploy --only firestore:indexes";
      logError("products", `GET /api/products recoverable DB error: ${warning}`, error);
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          hasMore: false,
          warning,
        },
      });
    }

    logError("products", "GET /api/products failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export const GET = withProviders(_GET);
