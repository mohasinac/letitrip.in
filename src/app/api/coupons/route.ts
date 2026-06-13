import { NextResponse } from "next/server";
import { withProviders } from "@/providers.config";
import { couponsRepository } from "@mohasinac/appkit";
import { logError } from "@/lib/logger";
import {
  callListingProcessor,
  type ListingProcessorResponse,
} from "@/lib/listing-processor";

const CACHE = "public, max-age=60, s-maxage=120, stale-while-revalidate=60";

async function _GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 12));
  const sorts =
    url.searchParams.get("sorts") ??
    url.searchParams.get("sort") ??
    "-createdAt";

  const extraFilters = url.searchParams.get("filters") ?? "";
  // Always enforce validity.isActive==true
  const filters = extraFilters
    ? `validity.isActive==true,${extraFilters}`
    : "validity.isActive==true";

  let items: unknown[];
  let total: number;
  let resultPage: number;
  let totalPages: number;
  let hasMore: boolean;

  let upstream: ListingProcessorResponse | null = null;
  try {
    upstream = await callListingProcessor("coupons", {
      filters,
      sorts,
      page,
      pageSize,
      cursor: null,
    });
  } catch (err) {
    logError("coupons", "listingProcessor upstream failed — falling back to local repo", err);
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
      const result = await couponsRepository.list({ filters, sorts, page, pageSize });
      items = result.items;
      total = result.total;
      resultPage = result.page;
      totalPages = result.totalPages;
      hasMore = result.hasMore;
    } catch (error) {
      logError("coupons", "GET /api/coupons failed", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch coupons" },
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

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(_GET);
