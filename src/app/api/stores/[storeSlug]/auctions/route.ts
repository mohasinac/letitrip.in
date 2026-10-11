import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { NextResponse } from "next/server";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { sanitizeProductsForPublic } from "@mohasinac/appkit/features/products/utils/sanitize";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { parseListingParams } from "@mohasinac/appkit/utils/listing-params";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import {
  callListingProcessor,
  type ListingProcessorResponse,
} from "@/lib/listing-processor";
import { validateSieveFilters } from "@/lib/sieve-validators";
import { PRODUCT_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { SIEVE_OP, sieveFilter } from "@mohasinac/appkit/utils/sieve-builder";

type RouteContext = { params: Promise<{ storeSlug: string }> };

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_SORT = "-createdAt";
const CACHE = "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

const SAFE_STORE_AUCTION_FILTER_FIELDS = new Set(["price", "category"]);

async function _GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { storeSlug } = await context.params;
  const url = new URL(request.url);

  const store = await storeRepository.findBySlug(storeSlug);
  if (!store || (store as { status?: string }).status !== "active") {
    return NextResponse.json(
      { success: false, error: "Store not found" },
      { status: 404 },
    );
  }

  const std = parseListingParams(url);
  const sorts = std.sorts ?? DEFAULT_SORT;
  const page = std.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(50, Math.max(1, std.pageSize ?? DEFAULT_PAGE_SIZE));
  const cursor = std.cursor;

  const filterParts = [
    `storeId==${store.id}`,
    "status==published",
    sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, "auction"),
  ];
  if (std.filters) {
    const safe = validateSieveFilters(std.filters, SAFE_STORE_AUCTION_FILTER_FIELDS);
    if (safe) filterParts.push(safe);
  }
  const filters = filterParts.join(",");

  let items: unknown[];
  let total: number;
  let resultPage: number;
  let totalPages: number;
  let hasMore: boolean;

  let upstream: ListingProcessorResponse | null = null;
  try {
    upstream = await callListingProcessor("products", {
      filters,
      sorts,
      page,
      pageSize,
      cursor,
      baseOpts: { storeId: store.id },
    });
  } catch (err) {
    void normalizeError(err);
    logError("storeAuctions", "listingProcessor upstream failed — falling back to local repo", err);
    upstream = null;
  }

  if (upstream) {
    items = sanitizeProductsForPublic(upstream.items as Array<Record<string, JsonValue>>);
    total = upstream.total;
    resultPage = upstream.page;
    totalPages = upstream.totalPages;
    hasMore = upstream.hasMore;
  } else {
    try {
      const result = await productRepository.list({ filters, sorts, page, pageSize });
      items = sanitizeProductsForPublic(result.items as unknown as Array<Record<string, JsonValue>>);
      total = result.total;
      resultPage = result.page;
      totalPages = result.totalPages;
      hasMore = result.hasMore;
    } catch (error) {
      void normalizeError(error);
      logError("storeAuctions", `GET /api/stores/${storeSlug}/auctions failed`, error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch store auctions" },
        { status: 500 },
      );
    }
  }

  const response = NextResponse.json({
    success: true,
    data: { items, total, page: resultPage, pageSize, totalPages, hasMore },
  });
  response.headers.set("Cache-Control", CACHE);
  return response;
}

const __GET__g = withProviders(_GET);

export const GET = __GET__g;
