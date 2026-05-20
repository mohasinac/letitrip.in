import { NextResponse } from "next/server";
import {
  storeRepository,
  parseListingParams,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import { logError } from "@/lib/logger";
import {
  callListingProcessor,
  type ListingProcessorResponse,
} from "@/lib/listing-processor";
import { validateSieveFilters } from "@/lib/sieve-validators";
import type { StoreListItem } from "@mohasinac/appkit";

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

function toPublicStore(s: Record<string, unknown>): StoreListItem {
  const stats = s.stats as Record<string, unknown> | undefined;
  return {
    id: s.id as string,
    storeSlug: s.storeSlug as string,
    ownerId: s.ownerId as string,
    storeName: s.storeName as string,
    storeDescription: s.storeDescription as string | undefined,
    storeCategory: s.storeCategory as string | undefined,
    storeLogoURL: s.storeLogoURL as string | undefined,
    storeBannerURL: s.storeBannerURL as string | undefined,
    status: s.status as string,
    isPublic: s.isPublic as boolean,
    totalProducts: (stats?.totalProducts ?? s.totalProducts) as number | undefined,
    itemsSold: (stats?.itemsSold ?? s.itemsSold) as number | undefined,
    totalReviews: (stats?.totalReviews ?? s.totalReviews) as number | undefined,
    averageRating: (stats?.averageRating ?? s.averageRating) as number | undefined,
    createdAt: s.createdAt as string | undefined,
  } as StoreListItem;
}

async function _GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const std = parseListingParams(url);
  const page = std.page ?? DEFAULT_PAGE;
  const pageSize = std.pageSize ?? DEFAULT_PAGE_SIZE;

  const rawSort = std.sorts ?? DEFAULT_SORT;
  const sorts = rawSort
    .replace(/^-itemsSold$/, "-stats.itemsSold")
    .replace(/^itemsSold$/, "stats.itemsSold")
    .replace(/^-averageRating$/, "-stats.averageRating")
    .replace(/^averageRating$/, "stats.averageRating");

  const userParts: string[] = [];
  if (std.q) userParts.push(`storeName@=*${std.q}`);
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

  let upstream: ListingProcessorResponse | null = null;
  try {
    upstream = await callListingProcessor("stores", {
      filters: filtersForFunction,
      sorts,
      page,
      pageSize,
      cursor: null,
    });
  } catch (err) {
    logError("stores", "listingProcessor upstream failed — falling back to local repo", err);
    upstream = null;
  }

  if (upstream) {
    items = (upstream.items as Array<Record<string, unknown>>).map(toPublicStore);
    total = upstream.total;
    resultPage = upstream.page;
    totalPages = upstream.totalPages;
    hasMore = upstream.hasMore;
  } else {
    try {
      const result = await storeRepository.listStores({ filters: filtersForRepo, sorts, page, pageSize });
      items = (result.items as unknown as Array<Record<string, unknown>>).map(toPublicStore);
      total = result.total;
      resultPage = result.page;
      totalPages = result.totalPages;
      hasMore = result.hasMore;
    } catch (error) {
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
