import { withFeatureGuard } from "@/lib/features";
import { normalizeError } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
import { NextResponse } from "next/server";
import {
  eventRepository,
  parseListingParams,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import {
  callListingProcessor,
  type ListingProcessorResponse,
} from "@/lib/listing-processor";
import { validateSieveFilters } from "@/lib/sieve-validators";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_SORT = "-startsAt";
const CACHE = "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

function param(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

const SAFE_EVENT_FILTER_FIELDS = new Set([
  "status", "title", "type", "startsAt", "endsAt", "createdAt",
]);

async function _GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const std = parseListingParams(url);
  const page = std.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(50, Math.max(1, std.pageSize ?? DEFAULT_PAGE_SIZE));
  const sorts = std.sorts ?? param(url, "sort") ?? DEFAULT_SORT;

  const rawFilters = param(url, "filters");
  const safe = rawFilters ? validateSieveFilters(rawFilters, SAFE_EVENT_FILTER_FIELDS) : "";
  const hasStatusFilter = safe.includes("status==");
  const parts: string[] = hasStatusFilter ? [] : ["status==active"];
  // Token search rides OUTSIDE `filters` — `array-contains` is not expressible
  // in Sieve. As a `title@=*` clause it made the adapter throw, which
  // `throwExceptions: false` turned into silence: the clause, every later
  // clause and the sort were all discarded and the route answered 200 with
  // the entire collection.
  if (safe) parts.push(safe);
  const filters = parts.join(",");

  let items: unknown[];
  let total: number;
  let resultPage: number;
  let totalPages: number;
  let hasMore: boolean;

  let upstream: ListingProcessorResponse | null = null;
  try {
    upstream = await callListingProcessor("events", {
      baseOpts: std.q ? { search: std.q } : undefined,
      filters,
      sorts,
      page,
      pageSize,
      cursor: null,
    });
  } catch (err) {
    void normalizeError(err);
    logError("events", "listingProcessor upstream failed — falling back to local repo", err);
    upstream = null;
  }

  if (upstream) {
    items = upstream.items;
    total = upstream.total;
    resultPage = upstream.page;
    totalPages = upstream.totalPages;
    hasMore = upstream.hasMore;
  } else {
    try {
      const result = await eventRepository.list(
        { filters, sorts, page, pageSize },
        std.q ? { search: std.q } : undefined,
      );
      // Strip internal fields (createdBy) before returning
      items = (result.items as unknown as Array<Record<string, JsonValue>>).map(
        ({ createdBy: _createdBy, ...rest }) => rest,
      );
      total = result.total;
      resultPage = result.page;
      totalPages = result.totalPages;
      hasMore = result.hasMore;
    } catch (error) {
      void normalizeError(error);
      logError("events", "GET /api/events failed", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch events" },
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

export const GET = withFeatureGuard("EVENTS", __GET__g);
