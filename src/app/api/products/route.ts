import { normalizeError } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
import { NextResponse } from "next/server";
import {
  productRepository,
  sanitizeProductsForPublic,
  PRODUCT_FIELDS,
  TABLE_KEYS,
  isListingTypeEnabled,
  enabledListingTypes,
} from "@mohasinac/appkit";
import {
  getSiteSettingsSafe,
  listPublicProducts,
  parsePublicProductParams,
  PUBLIC_PRODUCT_MAX_PAGE_SIZE,
  type PublicProductQuery,
  type PublicProductExecutor,
} from "@mohasinac/appkit/server";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import {
  callListingProcessor,
  type ListingProcessorResponse,
} from "@/lib/listing-processor";
import { validateSieveFilters } from "@/lib/sieve-validators";

/** Matches the Cache-Control used by listingProcessor on Firebase side. */
const PUBLIC_LISTING_CACHE_CONTROL =
  "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

function param(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

/**
 * Fields a caller may reference in the raw `f=` / `filters=` Sieve escape hatch.
 * Everything else in the query string goes through `parsePublicProductParams`,
 * which is shared with every SSR listing view.
 */
const SAFE_PRODUCT_FILTER_FIELDS = new Set([
  PRODUCT_FIELDS.STATUS,
  PRODUCT_FIELDS.CATEGORY,
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
  PRODUCT_FIELDS.SUBLISTING_CATEGORY_ID,
  PRODUCT_FIELDS.CURRENT_BID,
  PRODUCT_FIELDS.AUCTION_END_DATE,
  PRODUCT_FIELDS.PRE_ORDER_DELIVERY_DATE,
  PRODUCT_FIELDS.PRE_ORDER_PRODUCTION_STATUS,
  PRODUCT_FIELDS.PRIZE_REVEAL_STATUS,
  PRODUCT_FIELDS.SHIPPING_PAID_BY,
  "isPartOfBundle",
]);

const IDS_MAX = 20;

/**
 * Prefer the colocated `listingProcessor` Firebase Function (cheaper data
 * locality); fall back to the local repository if it is unconfigured OR fails
 * (cold-start crash, 401 from a secret-binding regression, network blip) so the
 * route stays available. Both share the same Sieve filter logic, so results are
 * semantically identical — only the locality differs.
 *
 * This executor is the seam that lets `listPublicProducts` live in appkit while
 * the Function-vs-repository preference (which needs consumer env) stays here.
 */
const listingProcessorFirstExecutor: PublicProductExecutor = async (
  query: PublicProductQuery,
) => {
  let upstream: ListingProcessorResponse | null = null;
  try {
    upstream = await callListingProcessor("products", {
      filters: query.filters,
      sorts: query.sorts,
      page: query.page,
      pageSize: query.pageSize,
      cursor: query.cursor ?? null,
    });
  } catch (upstreamErr) {
    void normalizeError(upstreamErr);
    logError(
      "products",
      "listingProcessor upstream failed - falling back to local repo",
      upstreamErr,
    );
    upstream = null;
  }

  if (upstream) {
    return {
      items: upstream.items,
      total: upstream.total,
      page: upstream.page,
      totalPages: upstream.totalPages,
      hasMore: upstream.hasMore,
      cursor: upstream.cursor,
    };
  }

  const result = await productRepository.list({
    filters: query.filters,
    sorts: query.sorts,
    page: query.page,
    pageSize: query.pageSize,
  });
  return {
    items: result.items,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
    cursor: null,
  };
};

async function _GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);

  // Batch `ids=` mode - used by the Compare overlay (BK3) to fetch up to
  // IDS_MAX products in one round-trip. Bypasses the sieve / filters path.
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

  // Vercel Hobby Fluid Compute cap: never return more than 50 docs/page
  // (CLAUDE.md Rule #6). Reject larger values explicitly so callers see a 400
  // and migrate to pagination instead of silently getting clamped.
  const requestedPageSize = Number(param(url, TABLE_KEYS.PAGE_SIZE) ?? "");
  if (Number.isFinite(requestedPageSize) && requestedPageSize > PUBLIC_PRODUCT_MAX_PAGE_SIZE) {
    return NextResponse.json(
      { success: false, error: "pageSize cannot exceed 50 - paginate instead." },
      { status: 400 },
    );
  }

  // W1-43 - listing-type feature-flag gating. The combined browse pages send a
  // pipe-joined OR-group (`art|stickers`), so the whole string can't be tested
  // as one token - `isListingTypeEnabled("art|stickers")` was always true
  // because the flag lookup is `undefined !== false`, which let a disabled type
  // stay reachable through its combined tab. Split, then require at least one
  // requested type to still be enabled.
  const requestedListingType = param(url, PRODUCT_FIELDS.LISTING_TYPE);
  const siteSettings = await getSiteSettingsSafe();
  const requestedTypeParts = (requestedListingType ?? "").split("|").filter(Boolean);

  const input = parsePublicProductParams(url.searchParams, {
    // No page-level span: this route serves every listing type. The caller's
    // own `listingType` param (if any) is what narrows it.
    listingTypes: requestedTypeParts.length > 0 ? requestedTypeParts : undefined,
  });
  input.rawFilters = validateSieveFilters(
    param(url, "filters") ?? param(url, "f") ?? "",
    SAFE_PRODUCT_FILTER_FIELDS,
  );

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;

  if (
    requestedTypeParts.length > 0 &&
    siteSettings &&
    !requestedTypeParts.some((t) => isListingTypeEnabled(t as never, siteSettings))
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

  // Partially-disabled OR-group: drop the disabled members so a combined tab
  // can't smuggle one back in.
  if (requestedTypeParts.length > 1 && enabledTypeSet.size > 0) {
    const stillEnabled = requestedTypeParts.filter((t) => enabledTypeSet.has(t));
    if (stillEnabled.length > 0 && stillEnabled.length < requestedTypeParts.length) {
      input.listingTypes = stillEnabled;
    }
  }

  const result = await listPublicProducts(input, {
    executor: listingProcessorFirstExecutor,
    // Strip disabled types only when the caller didn't name any - a named
    // request has already been validated above.
    enabledListingTypes:
      requestedTypeParts.length === 0 && enabledTypeSet.size > 0
        ? enabledTypeSet
        : undefined,
  });

  if (!result) {
    // `listPublicProducts` already logged the underlying error. Surface an
    // explicit warning rather than a bare empty page so a broken query is
    // distinguishable from an empty catalogue.
    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasMore: false,
        warning:
          "Product search is temporarily unavailable. Please try again shortly.",
      },
    });
  }

  const response = NextResponse.json({
    success: true,
    data: {
      items: sanitizeProductsForPublic(
        result.items as Array<Record<string, JsonValue>>,
      ),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      cursor: result.cursor,
      // A bounded fetch saturated its ceiling, so `total` above is a FLOOR.
      // The client renders "50+" rather than an exact count when this is set.
      truncated: result.truncated,
      query: {
        filters: result.filters,
        sorts: result.sorts,
        page: result.page,
        pageSize: result.pageSize,
      },
    },
  });
  response.headers.set("Cache-Control", PUBLIC_LISTING_CACHE_CONTROL);
  return response;
}

export const GET = withProviders(_GET);
