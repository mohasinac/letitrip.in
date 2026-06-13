import { NextResponse } from "next/server";
import {
  productRepository,
  sanitizeProductsForPublic,
  parseListingParams,
  PRODUCT_FIELDS,
  sieveFilter,
  SIEVE_OP,
  sortBy,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import { validateSieveFilters } from "@/lib/sieve-validators";

/**
 * GET /api/pre-orders
 *
 * Lists products where `listingType == "pre-order"`. Q3-pre-orders (S3
 * 2026-05-13) rewired this endpoint to query the products collection through
 * the canonical discriminator instead of a separate `preorders` collection.
 * Mirrors the public filter shape of `/api/products` so consumers can pass the
 * same `filters` / `sorts` / `page` / `pageSize` params.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORTS = sortBy(PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE, "ASC");

const PUBLIC_LISTING_CACHE_CONTROL =
  "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

const LISTING_TYPE_CLAUSE = sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, "pre-order");

const SAFE_PRE_ORDER_FILTER_FIELDS = new Set([
  PRODUCT_FIELDS.STATUS,
  PRODUCT_FIELDS.CATEGORY,
  PRODUCT_FIELDS.CATEGORY_SLUG,
  PRODUCT_FIELDS.BRAND,
  PRODUCT_FIELDS.STORE_ID,
  PRODUCT_FIELDS.CONDITION,
  PRODUCT_FIELDS.PRICE,
  PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE,
  PRODUCT_FIELDS.PRE_ORDER_PRODUCTION_STATUS,
  PRODUCT_FIELDS.FEATURED,
  PRODUCT_FIELDS.IS_PROMOTED,
]);

function mergeListingTypeFilter(filters: string | null | undefined): string {
  const safe = filters ? validateSieveFilters(filters, SAFE_PRE_ORDER_FILTER_FIELDS) : "";
  const parts = safe
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .filter((c) => !c.startsWith(`${PRODUCT_FIELDS.LISTING_TYPE}=`));
  parts.push(LISTING_TYPE_CLAUSE);
  return parts.join(",");
}

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(async (request: Request) => {
  try {
    const url = new URL(request.url);
    const std = parseListingParams(url);
    const page = Math.max(1, std.page ?? DEFAULT_PAGE);
    const pageSize = Math.min(50, Math.max(1, std.pageSize ?? DEFAULT_PAGE_SIZE));
    const sorts = std.sorts ?? DEFAULT_SORTS;
    const filters = mergeListingTypeFilter(std.filters);

    const result = await productRepository.list(
      { filters, sorts, page, pageSize },
      {},
    );

    const items = sanitizeProductsForPublic(
      result.items as unknown as Array<Record<string, unknown>>,
    );
    const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          total: result.total,
          page,
          pageSize,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      { headers: { "Cache-Control": PUBLIC_LISTING_CACHE_CONTROL } },
    );
  } catch (error) {
    logError("pre-orders", "GET /api/pre-orders failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
});
