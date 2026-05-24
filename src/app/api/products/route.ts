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
import { getSiteSettingsGlobal } from "@mohasinac/appkit/server";
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
 *   1. Per-field query params (status, category, brand, …) — the UX-facing API
 *   2. A raw Sieve filter string via `f=` (short) or `filters=` (long) — gated
 *      through `validateSieveFilters` so only safelisted fields go through.
 *
 * Multi-value pipe params (e.g. condition=new|used) are expanded to multiple
 * AND clauses (condition==new,condition==used) via expandSieveParam — pipe is
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

  // categorySlugs is an array field — use @= (array-contains). Accepts either
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

  // RangeFilter UI sends values in rupees (maxBound=500000 = ₹5 lakh, step=500).
  // Firestore stores price in paise (1 INR = 100 paise) so multiply by 100.
  const minPriceRs = param(url, TABLE_KEYS.MIN_PRICE);
  if (minPriceRs !== null && !Number.isNaN(Number(minPriceRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRICE, SIEVE_OP.GTE, String(Math.round(Number(minPriceRs) * 100))));
  }
  const maxPriceRs = param(url, TABLE_KEYS.MAX_PRICE);
  if (maxPriceRs !== null && !Number.isNaN(Number(maxPriceRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRICE, SIEVE_OP.LTE, String(Math.round(Number(maxPriceRs) * 100))));
  }

  // NOTE: 'inStock' (stockQuantity>0) is intentionally NOT included here.
  // Firestore can't combine a stockQuantity inequality with arbitrary orderBy fields
  // (title, viewCount, price, etc.) without per-combination composite indexes.
  // Instead, we apply the in-stock filter:
  //   - as a Sieve clause in the upstream Firebase Function (which handles it server-side)
  //   - as in-memory post-filtering in the local fallback repo path
  // See the _GET handler below for how inStock is threaded through.

  // SB1-G — canonical listingType discriminator
  const listingTypeParam = param(url, TABLE_KEYS.LISTING_TYPE);
  if (listingTypeParam) {
    parts.push(sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, listingTypeParam));
  }

  const featured = param(url, TABLE_KEYS.FEATURED);
  if (featured === "true") parts.push(sieveFilter(PRODUCT_FIELDS.FEATURED, SIEVE_OP.EQ, true));

  const isPromoted = param(url, "isPromoted");
  if (isPromoted === "true") parts.push(sieveFilter(PRODUCT_FIELDS.IS_PROMOTED, SIEVE_OP.EQ, true));

  // Same paise conversion as minPrice/maxPrice — AuctionFilters sends rupees.
  const minBidRs = param(url, TABLE_KEYS.MIN_BID);
  if (minBidRs !== null && !Number.isNaN(Number(minBidRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.CURRENT_BID, SIEVE_OP.GTE, String(Math.round(Number(minBidRs) * 100))));
  }
  const maxBidRs = param(url, TABLE_KEYS.MAX_BID);
  if (maxBidRs !== null && !Number.isNaN(Number(maxBidRs))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.CURRENT_BID, SIEVE_OP.LTE, String(Math.round(Number(maxBidRs) * 100))));
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

  // Batch `ids=` mode — used by Compare overlay (BK3) to fetch up to IDS_MAX
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
            items as unknown as Array<Record<string, unknown>>,
          ),
          total: items.length,
        },
      });
      response.headers.set("Cache-Control", PUBLIC_LISTING_CACHE_CONTROL);
      return response;
    } catch (error) {
      logError("products", "GET /api/products?ids batch failed", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch products" },
        { status: 500 },
      );
    }
  }

  const std = parseListingParams(url);
  const page = std.page ?? DEFAULT_PAGE;
  const pageSize = std.pageSize ?? DEFAULT_PAGE_SIZE;
  const sorts = std.sorts ?? DEFAULT_SORTS;
  const cursor = std.cursor;

  // W1-43 — listing-type feature flag gating. If the caller requested a
  // disabled type (?listingType=auction with auctions off), return empty
  // results immediately. For no-filter calls, post-filter excludes disabled
  // types from the response so the public listing pages stay clean.
  const requestedListingType = param(url, PRODUCT_FIELDS.LISTING_TYPE);
  let siteSettings: Awaited<ReturnType<typeof getSiteSettingsGlobal>> | null = null;
  try {
    siteSettings = await getSiteSettingsGlobal();
  } catch {
    siteSettings = null;
  }
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
  // server-side). Not applied in filtersBase — see comment in buildFilters.
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

  // For the Firebase Function: include all inequality + array filters so it can filter server-side.
  // For features, pass each selected feature as a separate @= clause (array-contains AND semantics
  // on the function side); the function handles the OR case differently.
  const filters = sieveAnd(
    filtersBase,
    ...(q ? [sieveFilter(PRODUCT_FIELDS.TITLE, SIEVE_OP.CONTAINS_CI, q)] : []),
    ...(inStock ? [sieveFilter(PRODUCT_FIELDS.STOCK_QUANTITY, SIEVE_OP.GT, 0)] : []),
    ...(dateFromClause ? [dateFromClause] : []),
    ...(dateToClause ? [dateToClause] : []),
    ...(featureIds.length === 1 ? [sieveFilter(PRODUCT_FIELDS.FEATURES, SIEVE_OP.CONTAINS, featureIds[0])] : []),
  );

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
    // semantically identical — only the data-locality differs.
    let upstream: ListingProcessorResponse | null = null;
    try {
      upstream = await callListingProcessor("products", {
        filters,
        sorts,
        page,
        pageSize,
        cursor,
      });
    } catch (upstreamErr) {
      logError(
        "products",
        "listingProcessor upstream failed — falling back to local repo",
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
    } else if (q || inStock || dateFromClause || dateToClause || featureIds.length > 0) {
      // Fallback repo + in-memory filtering: Firestore can't combine inequality
      // filters (stockQuantity>0, auctionEndDate>=now, etc.) with arbitrary
      // orderBy fields without per-combination composite indexes (and even then
      // the inequality field must be the first orderBy). Fetch up to
      // SEARCH_FETCH_LIMIT docs using only the base filters, then apply all
      // inequality and text filters in memory.
      const SEARCH_FETCH_LIMIT = 500;
      const allResult = await productRepository.list({
        filters: filtersBase,
        sorts,
        page: 1,
        pageSize: SEARCH_FETCH_LIMIT,
      });
      const qLower = q ? q.toLowerCase() : null;
      const dateFromMs = dateFrom ? new Date(dateFrom).getTime() : null;
      const dateToMs = dateTo ? new Date(dateTo).getTime() : null;
      const dateField =
        listingTypeForDate === "auction"
          ? "auctionEndDate"
          : listingTypeForDate === "pre-order"
            ? "preOrderDeliveryDate"
            : null;
      const filtered = (allResult.items as unknown as Record<string, unknown>[]).filter(
        (item) => {
          if (qLower !== null) {
            const title = String(item.title ?? item.name ?? "").toLowerCase();
            const tags = Array.isArray(item.tags)
              ? (item.tags as string[]).join(" ").toLowerCase()
              : "";
            if (!title.includes(qLower) && !tags.includes(qLower)) return false;
          }
          if (inStock) {
            const stock = Number(item.stockQuantity ?? item.availableQuantity ?? 0);
            if (stock <= 0) return false;
          }
          if ((dateFromMs !== null || dateToMs !== null) && dateField) {
            const raw = item[dateField];
            const ts = raw instanceof Date ? raw.getTime() : typeof raw === "string" ? new Date(raw).getTime() : Number(raw);
            const tsValid = !isNaN(ts);
            if (tsValid && dateFromMs !== null && ts < dateFromMs) return false;
            if (tsValid && dateToMs !== null && ts > dateToMs) return false;
          }
          if (featureIds.length > 0) {
            const docFeatures = Array.isArray(item.features) ? (item.features as string[]) : [];
            if (!featureIds.some((fid) => docFeatures.includes(fid))) return false;
          }
          return true;
        },
      );
      total = filtered.length;
      const start = (page - 1) * pageSize;
      items = filtered.slice(start, start + pageSize);
      resultPage = page;
      totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / pageSize));
      hasMore = start + pageSize < total;
    } else {
      const result = await productRepository.list({
        filters: filtersBase,
        sorts,
        page,
        pageSize,
      });
      items = result.items;
      total = result.total;
      resultPage = result.page;
      totalPages = result.totalPages;
      hasMore = result.hasMore;
    }

    // W1-43 — when no specific listingType was requested, strip any documents
    // whose listingType is currently disabled in site settings. Cheap O(n)
    // pass; only triggers when at least one type is off.
    if (!requestedListingType && enabledTypeSet.size > 0 && enabledTypeSet.size < 7) {
      const before = items.length;
      items = (items as Array<Record<string, unknown>>).filter((it) => {
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
          items as Array<Record<string, unknown>>,
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
        ? "Firestore permission denied — check security rules for the products collection"
        : "Firestore index missing — run: firebase deploy --only firestore:indexes";
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

