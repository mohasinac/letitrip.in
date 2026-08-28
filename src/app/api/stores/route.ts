import { normalizeError } from "@mohasinac/appkit";
import { NextResponse } from "next/server";
import {
  storeRepository,
  parseListingParams,
} from "@mohasinac/appkit";
import { filterTestDataForViewer, safeRead, toStoreListItem } from "@mohasinac/appkit/server";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import {
  callListingProcessor,
  type ListingProcessorResponse,
} from "@/lib/listing-processor";
import { validateSieveFilters } from "@/lib/sieve-validators";
import type { StoreListItem, JsonValue } from "@mohasinac/appkit";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_SORT = "-createdAt";
const CACHE = "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

function param(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

const SAFE_STORE_FILTER_FIELDS = new Set([
  "storeName", "storeCategory", "status", "isPublic", "isFeatured",
  "averageRating", "stats.totalProducts",
]);

/** The public projection is `toStoreListItem` — see appkit's stores/adapters.ts. */
function toPublicStore(s: Record<string, JsonValue>): StoreListItem {
  return toStoreListItem(s as Record<string, unknown>);
}

async function _GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const std = parseListingParams(url);
  const page = std.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(50, Math.max(1, std.pageSize ?? DEFAULT_PAGE_SIZE));

  const sorts = std.sorts ?? DEFAULT_SORT;

  const userParts: string[] = [];
  // Token search travels as an opt, not a filter clause — see events/route.ts.
  const category = param(url, "category");
  if (category) userParts.push(`storeCategory==${category}`);
  if (std.filters) {
    const safe = validateSieveFilters(std.filters, SAFE_STORE_FILTER_FIELDS);
    if (safe) userParts.push(safe);
  }
  // listingProcessor doesn't apply baseQuery guards — include them in the full filter string.
  const filtersForFunction = ["status==active", "isPublic==true", ...userParts].join(",");
  // listStores() adds status==active + isPublic==true as Firestore .where() — don't duplicate.
  const filtersForRepo = userParts.join(",");

  let items: unknown[];
  let total: number;
  let resultPage: number;
  let totalPages: number;
  let hasMore: boolean;

  // Anonymous is a legitimate viewer for this public listing, so a failed
  // session read degrades to it — but it must not do so invisibly, or a
  // tester/admin silently loses their test-data visibility.
  const viewer = await safeRead(() => getServerSessionUser(), {
    route: "/stores",
    key: "session.getServerSessionUser",
    fallback: null,
  });

  let upstream: ListingProcessorResponse | null = null;
  try {
    upstream = await callListingProcessor("stores", {
      baseOpts: std.q ? { search: std.q } : undefined,
      filters: filtersForFunction,
      sorts,
      page,
      pageSize,
      cursor: null,
    });
  } catch (err) {
    void normalizeError(err);
    logError("stores", "listingProcessor upstream failed — falling back to local repo", err);
    upstream = null;
  }

  if (upstream) {
    items = filterTestDataForViewer(upstream.items as Array<Record<string, JsonValue>>, viewer).map(toPublicStore);
    total = upstream.total;
    resultPage = upstream.page;
    totalPages = upstream.totalPages;
    hasMore = upstream.hasMore;
  } else {
    try {
      const result = await storeRepository.listStores(
        { filters: filtersForRepo, sorts, page, pageSize },
        true,
        std.q ? { search: std.q } : undefined,
      );
      items = filterTestDataForViewer(result.items as unknown as Array<Record<string, JsonValue>>, viewer).map(toPublicStore);
      total = result.total;
      resultPage = result.page;
      totalPages = result.totalPages;
      hasMore = result.hasMore;
    } catch (error) {
      void normalizeError(error);
      logError("stores", "GET /api/stores failed", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch stores" },
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

export const GET = withProviders(_GET);