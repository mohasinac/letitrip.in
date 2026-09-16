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

  /*
   * 🛑 The rating facet travels as an OPT, not a filter clause — same reasoning
   * as token search two lines above.
   *
   * The client emitted `averageRating>=N`, which is not a field on the document
   * (it nests as `stats.averageRating`), so sievejs dropped it silently and the
   * facet returned every store — `?rating=5` listed stores rated well below 5.
   *
   * It is NOT re-emitted as `stats.averageRating>=N`: a GTE inequality forces
   * Firestore to order by that field first, so pairing it with any other sort
   * demands a composite index nobody declares (Root Cause #59). The repository
   * refines the threshold in memory instead, which composes with every sort.
   */
  const ratingRaw = param(url, "rating");
  const minRating = ratingRaw
    ? Math.max(...ratingRaw.split("|").map(Number).filter((n) => Number.isFinite(n)))
    : undefined;

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
        std.q || minRating !== undefined
          ? { ...(std.q ? { search: std.q } : {}), ...(minRating !== undefined ? { minRating } : {}) }
          : undefined,
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

  /*
   * 🛑 APPLIED HERE, AFTER BOTH EXECUTORS CONVERGE — not inside the repository
   * branch alone.
   *
   * This route prefers the colocated `listingProcessor` Function and only falls
   * back to `storeRepository`. Passing `minRating` to the repository therefore
   * fixed the path that almost never runs: measured on production right after
   * deploying it, `?rating=5` still returned both stores — rated 4.1 and 3.6.
   *
   * That is the two-executor trap of Root Cause #85, and #64 before it: the
   * same request answered by two different implementations, with the one you
   * exercised locally being the one production does not use.
   *
   * The repository keeps its own `minRating` (the fallback must filter too),
   * and this is the belt that covers whichever path actually served.
   */
  if (minRating !== undefined) {
    const before = items.length;
    /*
     * Read the PROJECTED shape. `toPublicStore` has already run by this point
     * and flattens the rating to a top-level `averageRating`, dropping `stats`
     * entirely — so filtering on `stats.averageRating` here resolved undefined
     * for every row and removed the whole list. Measured: rating=3 returned 0
     * when both stores (4.1 and 3.6) qualify.
     *
     * Both spellings are accepted because this filter sits downstream of two
     * executors whose projections need not agree — checking one and trusting
     * the other to match is what produced the bug above.
     */
    items = (items as Array<Record<string, JsonValue>>).filter((s) => {
      const flat = s.averageRating;
      const nested = (s.stats as { averageRating?: number } | undefined)?.averageRating;
      return Number(flat ?? nested ?? 0) >= minRating;
    });
    if (items.length !== before) total = items.length;
  }

  const response = NextResponse.json({
    success: true,
    data: { items, total, page: resultPage, pageSize, totalPages, hasMore },
  });
  response.headers.set("Cache-Control", CACHE);
  return response;
}

export const GET = withProviders(_GET);