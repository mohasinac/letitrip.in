import { NextResponse } from "next/server";
import { productRepository } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

function param(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

function numParam(url: URL, key: string, fallback: number): number {
  const value = url.searchParams.get(key);
  const parsed = value !== null ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

const SAFE_PRODUCT_FILTER_FIELDS = new Set([
  "status",
  "category",
  "categorySlug",
  "brand",
  "condition",
  "sellerId",
  "title",
  "price",
  "isAuction",
  "isPreOrder",
  "featured",
  "isPromoted",
  "stockQuantity",
  "availableQuantity",
  "tags",
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

function buildFilters(url: URL): string {
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
  const sellerId = param(url, "sellerId");
  if (sellerId) parts.push(`sellerId==${sellerId}`);
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
  const isAuction = param(url, "isAuction");
  if (isAuction !== null) parts.push(`isAuction==${isAuction}`);
  const isPreOrder = param(url, "isPreOrder");
  if (isPreOrder !== null) parts.push(`isPreOrder==${isPreOrder}`);
  const featured = param(url, "featured");
  if (featured === "true") parts.push("featured==true");
  const raw = param(url, "filters");
  if (raw) {
    const safe = validateSieveFilters(raw, SAFE_PRODUCT_FILTER_FIELDS);
    if (safe) parts.push(safe);
  }
  return parts.join(",");
}

async function _GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const page = numParam(url, "page", 1);
  const pageSize = numParam(url, "pageSize", 20);
  const sorts = param(url, "sorts") ?? param(url, "sort") ?? "-createdAt";
  const filters = buildFilters(url);

  try {
    const result = await productRepository.list({
      filters,
      sorts,
      page,
      pageSize,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
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
    const isRecoverableQueryError =
      message.includes("FAILED_PRECONDITION") ||
      message.toLowerCase().includes("index") ||
      message.toLowerCase().includes("requires an index");

    if (isRecoverableQueryError) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          hasMore: false,
          query: {
            filters,
            sorts,
            page,
            pageSize,
          },
        },
        warning: "Query fallback due to index constraints",
      });
    }

    console.error("[products] GET /api/products failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export const GET = withProviders(_GET);

