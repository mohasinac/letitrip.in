import { NextResponse } from "next/server";
import {
  productRepository,
  sanitizeProductsForPublic,
  parseListingParams,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORTS = "-createdAt";

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
  "status",
  "category",
  "categorySlug",
  "brand",
  "condition",
  "storeId",
  "title",
  "price",
  // SB1-G — canonical discriminator. Boolean flags kept in allow-list for any
  // consumer that hasn't migrated yet; both shapes resolve to the same docs
  // because seed wrappers set both fields.
  "listingType",
  "isAuction",
  "isPreOrder",
  "featured",
  "isPromoted",
  "stockQuantity",
  "availableQuantity",
  "tags",
  "currentBid",
  "auctionEndDate",
  "preOrderDeliveryDate",
  "preOrderProductionStatus",
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
 * `rawFilters` is passed in so the caller (using `parseListingParams`)
 * resolves short/long precedence before we get here.
 */
function buildFilters(url: URL, rawFilters: string | null): string {
  const parts: string[] = [];
  const status = param(url, "status");
  if (status) parts.push(`status==${status}`);
  const category = param(url, "category");
  if (category) parts.push(`category==${category}`);
  const categorySlug = param(url, "categorySlug");
  if (categorySlug) parts.push(`categorySlug==${categorySlug}`);
  const brand = param(url, "brand");
  if (brand) parts.push(`brand==${brand}`);
  const condition = param(url, "condition");
  if (condition) parts.push(`condition==${condition}`);
  const storeId = param(url, "storeId");
  if (storeId) parts.push(`storeId==${storeId}`);
  const query = param(url, "q");
  if (query) parts.push(`title@=*${query}`);
  const minPrice = param(url, "minPrice");
  if (minPrice !== null && !Number.isNaN(Number(minPrice))) {
    parts.push(`price>=${minPrice}`);
  }
  const maxPrice = param(url, "maxPrice");
  if (maxPrice !== null && !Number.isNaN(Number(maxPrice))) {
    parts.push(`price<=${maxPrice}`);
  }
  const inStock = param(url, "inStock");
  if (inStock === "true") parts.push("stockQuantity>0");
  // SB1-G — translate legacy boolean query params to the canonical
  // `listingType` discriminator. Public ?isAuction=true/?isPreOrder=true URLs
  // keep working; internally we route through the single-field clause that
  // the new composite indexes back. Also accept `?listingType=auction` (etc).
  const listingTypeParam = param(url, "listingType");
  const isAuction = param(url, "isAuction");
  const isPreOrder = param(url, "isPreOrder");
  if (listingTypeParam) {
    parts.push(`listingType==${listingTypeParam}`);
  } else if (isAuction === "true") {
    parts.push(`listingType==auction`);
  } else if (isPreOrder === "true") {
    parts.push(`listingType==pre-order`);
  } else if (isAuction === "false" && isPreOrder === "false") {
    parts.push(`listingType==standard`);
  }
  const featured = param(url, "featured");
  if (featured === "true") parts.push("featured==true");
  const isPromoted = param(url, "isPromoted");
  if (isPromoted === "true") parts.push("isPromoted==true");
  const minBid = param(url, "minBid");
  if (minBid !== null && !Number.isNaN(Number(minBid))) {
    parts.push(`currentBid>=${minBid}`);
  }
  const maxBid = param(url, "maxBid");
  if (maxBid !== null && !Number.isNaN(Number(maxBid))) {
    parts.push(`currentBid<=${maxBid}`);
  }
  const dateFrom = param(url, "dateFrom");
  const dateTo = param(url, "dateTo");
  if (isAuction === "true") {
    if (dateFrom) parts.push(`auctionEndDate>=${dateFrom}`);
    if (dateTo) parts.push(`auctionEndDate<=${dateTo}`);
  } else if (isPreOrder === "true") {
    if (dateFrom) parts.push(`preOrderDeliveryDate>=${dateFrom}`);
    if (dateTo) parts.push(`preOrderDeliveryDate<=${dateTo}`);
  }
  const preOrderProductionStatus = param(url, "preOrderProductionStatus") ?? param(url, "preOrderStatus");
  if (preOrderProductionStatus) parts.push(`preOrderProductionStatus==${preOrderProductionStatus}`);
  const freeShipping = param(url, "freeShipping");
  if (freeShipping === "true") parts.push("freeShipping==true");
  if (rawFilters) {
    const safe = validateSieveFilters(rawFilters, SAFE_PRODUCT_FILTER_FIELDS);
    if (safe) parts.push(safe);
  }
  return parts.join(",");
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

    const upstream = await callListingProcessor("products", {
      filters,
      sorts,
      page,
      pageSize,
      cursor,
    });

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

