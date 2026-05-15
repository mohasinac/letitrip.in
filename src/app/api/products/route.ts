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
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORTS = sortBy(PRODUCT_FIELDS.CREATED_AT);

/** Matches the Cache-Control used by listingProcessor on Firebase side. */
const PUBLIC_LISTING_CACHE_CONTROL =
  "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

interface ListingProcessorResponse {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  cursor: string | null;
}

async function callListingProcessor(
  collection: "products",
  args: {
    filters: string;
    sorts: string;
    page: number;
    pageSize: number;
    cursor: string | null;
    baseOpts?: { status?: string; storeId?: string; categoriesIn?: string[] };
  },
): Promise<ListingProcessorResponse | null> {
  const url = process.env.FIREBASE_FUNCTION_LISTING_URL;
  const secret = process.env.LETITRIP_INTERNAL_SECRET;
  if (!url || !secret) return null;
  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": secret,
    },
    body: JSON.stringify({
      collection,
      f: args.filters,
      s: args.sorts,
      p: args.page,
      ps: args.pageSize,
      cursor: args.cursor ?? undefined,
      baseOpts: args.baseOpts,
    }),
  });
  if (!upstream.ok) {
    throw new Error(
      `listingProcessor returned ${upstream.status}: ${await upstream.text().catch(() => "")}`,
    );
  }
  return (await upstream.json()) as ListingProcessorResponse;
}

function param(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

const SAFE_PRODUCT_FILTER_FIELDS = new Set([
  PRODUCT_FIELDS.STATUS,
  PRODUCT_FIELDS.CATEGORY,
  PRODUCT_FIELDS.CATEGORY_SLUG,
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
]);

function validateSieveFilters(
  raw: string,
  allowedFields: ReadonlySet<string>,
): string {
  return raw
    .split(",")
    .map((clause) => clause.trim())
    .filter((clause) => {
      const match = clause.match(/^([^<>=!@]+)\s*(?:==|!=|<=|>=|<|>|@=\*?)/);
      return match ? allowedFields.has(match[1].trim()) : false;
    })
    .join(",");
}

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

  const status = expandSieveParam(PRODUCT_FIELDS.STATUS, param(url, TABLE_KEYS.STATUS));
  if (status) parts.push(status);

  const category = expandSieveParam(PRODUCT_FIELDS.CATEGORY, param(url, TABLE_KEYS.CATEGORY));
  if (category) parts.push(category);

  const categorySlug = expandSieveParam(PRODUCT_FIELDS.CATEGORY_SLUG, param(url, TABLE_KEYS.CATEGORY_SLUG));
  if (categorySlug) parts.push(categorySlug);

  const brand = expandSieveParam(PRODUCT_FIELDS.BRAND, param(url, TABLE_KEYS.BRAND));
  if (brand) parts.push(brand);

  const condition = expandSieveParam(PRODUCT_FIELDS.CONDITION, param(url, TABLE_KEYS.CONDITION));
  if (condition) parts.push(condition);

  const storeId = expandSieveParam(PRODUCT_FIELDS.STORE_ID, param(url, TABLE_KEYS.STORE_ID));
  if (storeId) parts.push(storeId);

  const query = param(url, TABLE_KEYS.QUERY);
  if (query) parts.push(sieveFilter(PRODUCT_FIELDS.TITLE, SIEVE_OP.CONTAINS_CI, query));

  const minPrice = param(url, TABLE_KEYS.MIN_PRICE);
  if (minPrice !== null && !Number.isNaN(Number(minPrice))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRICE, SIEVE_OP.GTE, minPrice));
  }
  const maxPrice = param(url, TABLE_KEYS.MAX_PRICE);
  if (maxPrice !== null && !Number.isNaN(Number(maxPrice))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.PRICE, SIEVE_OP.LTE, maxPrice));
  }

  const inStock = param(url, TABLE_KEYS.IN_STOCK);
  if (inStock === "true") parts.push(sieveFilter(PRODUCT_FIELDS.STOCK_QUANTITY, SIEVE_OP.GT, 0));

  // SB1-G — canonical listingType discriminator
  const listingTypeParam = param(url, TABLE_KEYS.LISTING_TYPE);
  if (listingTypeParam) {
    parts.push(sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, listingTypeParam));
  }

  const featured = param(url, TABLE_KEYS.FEATURED);
  if (featured === "true") parts.push(sieveFilter(PRODUCT_FIELDS.FEATURED, SIEVE_OP.EQ, true));

  const isPromoted = param(url, "isPromoted");
  if (isPromoted === "true") parts.push(sieveFilter(PRODUCT_FIELDS.IS_PROMOTED, SIEVE_OP.EQ, true));

  const minBid = param(url, TABLE_KEYS.MIN_BID);
  if (minBid !== null && !Number.isNaN(Number(minBid))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.CURRENT_BID, SIEVE_OP.GTE, minBid));
  }
  const maxBid = param(url, TABLE_KEYS.MAX_BID);
  if (maxBid !== null && !Number.isNaN(Number(maxBid))) {
    parts.push(sieveFilter(PRODUCT_FIELDS.CURRENT_BID, SIEVE_OP.LTE, maxBid));
  }

  const dateFrom = param(url, TABLE_KEYS.DATE_FROM);
  const dateTo = param(url, TABLE_KEYS.DATE_TO);
  if (listingTypeParam === "auction") {
    if (dateFrom) parts.push(sieveFilter(PRODUCT_FIELDS.AUCTION_END_DATE, SIEVE_OP.GTE, dateFrom));
    if (dateTo) parts.push(sieveFilter(PRODUCT_FIELDS.AUCTION_END_DATE, SIEVE_OP.LTE, dateTo));
  } else if (listingTypeParam === "pre-order") {
    if (dateFrom) parts.push(sieveFilter(PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE, SIEVE_OP.GTE, dateFrom));
    if (dateTo) parts.push(sieveFilter(PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE, SIEVE_OP.LTE, dateTo));
  }

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
  // `q` is folded into title sieve clause via buildFilters → keep that contract.
  // We pass it through the existing per-field `q` param so the buildFilters
  // helper keeps reading both short and long names identically.
  const filters = buildFilters(url, std.filters);
  const cursor = std.cursor;

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
    } else {
      const result = await productRepository.list({
        filters,
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

