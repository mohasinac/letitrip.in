import { NextResponse } from "next/server";
import { productRepository } from "@mohasinac/appkit/repositories";
import { withProviders } from "@/providers.config";
import { POST as _POST } from "@mohasinac/appkit/features/products/server";

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
  try {
    const url = new URL(request.url);
    const page = numParam(url, "page", 1);
    const pageSize = numParam(url, "pageSize", 20);
    const sorts = param(url, "sorts") ?? param(url, "sort") ?? "-createdAt";

    const result = await productRepository.list({
      filters: buildFilters(url),
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
      },
    });
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    console.error("[products] GET /api/products failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export const GET = withProviders(_GET);
export const POST = withProviders(_POST);

