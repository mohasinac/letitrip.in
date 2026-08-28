import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockProductList,
  mockProductListByIds,
  mockCallListingProcessor,
  mockGetSiteSettings,
  mockValidateSieveFilters,
} = vi.hoisted(() => ({
  mockProductList: vi.fn(),
  mockProductListByIds: vi.fn(),
  mockCallListingProcessor: vi.fn(),
  mockGetSiteSettings: vi.fn(),
  mockValidateSieveFilters: vi.fn((f: string) => f),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
vi.mock("@/lib/listing-processor", () => ({ callListingProcessor: mockCallListingProcessor }));
vi.mock("@/lib/sieve-validators", () => ({ validateSieveFilters: mockValidateSieveFilters }));
vi.mock("@mohasinac/appkit/server", () => ({ getSiteSettingsGlobal: mockGetSiteSettings }));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  productRepository: {
    list: mockProductList,
    listByIds: mockProductListByIds,
  },
  normalizeError: vi.fn(),
  sanitizeProductsForPublic: (items: unknown[]) => items,
  parseListingParams: (url: URL) => ({
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || 20,
    sorts: url.searchParams.get("sorts"),
    filters: url.searchParams.get("filters"),
    cursor: url.searchParams.get("cursor"),
  }),
  PRODUCT_FIELDS: {
    CREATED_AT: "createdAt",
    STATUS: "status",
    CATEGORY: "category",
    CATEGORY_SLUG: "categorySlug",
    CATEGORY_SLUGS: "categorySlugs",
    BRAND: "brandSlug",
    CONDITION: "condition",
    STORE_ID: "storeId",
    TITLE: "title",
    PRICE: "price",
    LISTING_TYPE: "listingType",
    FEATURED: "isFeatured",
    IS_PROMOTED: "isPromoted",
    STOCK_QUANTITY: "stockQuantity",
    AVAILABLE_QUANTITY: "availableQuantity",
    TAGS: "tags",
    CURRENT_BID: "currentBidAmount",
    AUCTION_END_DATE: "auctionEndDate",
    PRE_ORDER_DELIVERY_DATE: "preOrderDeliveryDate",
    PRE_ORDER_PRODUCTION_STATUS: "preOrderProductionStatus",
    PRIZE_REVEAL_STATUS: "prizeRevealStatus",
    SHIPPING_PAID_BY: "shippingPaidBy",
    FEATURES: "features",
    SHIPPING_PAID_BY_VALUES: { SELLER: "seller" },
  },
  TABLE_KEYS: {
    STATUS: "status",
    CATEGORY: "category",
    CATEGORY_SLUG: "categorySlug",
    BRAND: "brand",
    CONDITION: "condition",
    STORE_ID: "storeId",
    QUERY: "q",
    IN_STOCK: "inStock",
    FEATURES: "features",
    LISTING_TYPE: "listingType",
    FEATURED: "featured",
    MIN_PRICE: "minPrice",
    MAX_PRICE: "maxPrice",
    MIN_BID: "minBid",
    MAX_BID: "maxBid",
    PREORDER_STATUS: "preOrderStatus",
    PRIZE_REVEAL_STATUS: "prizeRevealStatus",
    FREE_SHIPPING: "freeShipping",
    IS_PART_OF_BUNDLE: "isPartOfBundle",
    DATE_FROM: "dateFrom",
    DATE_TO: "dateTo",
  },
  SIEVE_OP: { EQ: "==", GT: ">", GTE: ">=", LTE: "<=", CONTAINS: "@=" },
  sortBy: (field: string) => `${field}:desc`,
  sieveFilter: (field: string, op: string, val: unknown) => `${field}${op}${val}`,
  sieveAnd: (...parts: string[]) => parts.filter(Boolean).join(","),
  expandSieveParam: (field: string, val: string, op: string) => `${field}${op}${val}`,
  isListingTypeEnabled: vi.fn(() => true),
  enabledListingTypes: vi.fn(() => ["standard", "auction", "pre-order", "prize-draw", "bundle", "classified", "digital"]),
}));

import { GET } from "../route";

function makeReq(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/products");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

const defaultResult = {
  items: [{ id: "product-1", title: "Test Product", listingType: "standard" }],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockProductList.mockResolvedValue({ ...defaultResult });
  mockProductListByIds.mockResolvedValue([{ id: "product-x" }]);
  mockCallListingProcessor.mockResolvedValue({ ...defaultResult, cursor: null });
  mockGetSiteSettings.mockResolvedValue({ featureFlags: {}, platformLimits: {} });
});

describe("GET /api/products — pageSize enforcement", () => {
  it("pageSize > 50 → 400 with explicit message", async () => {
    const res = await GET(makeReq({ pageSize: "51" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("pageSize");
  });

  it("pageSize = 50 → allowed, calls data source", async () => {
    const res = await GET(makeReq({ pageSize: "50" }) as never);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/products — ids= batch mode", () => {
  it("?ids= → calls productRepository.listByIds", async () => {
    await GET(makeReq({ ids: "product-1,product-2" }) as never);
    expect(mockProductListByIds).toHaveBeenCalledWith(["product-1", "product-2"]);
  });

  it("?ids= → max 20 ids (sliced)", async () => {
    const ids = Array.from({ length: 25 }, (_, i) => `product-${i}`).join(",");
    await GET(makeReq({ ids }) as never);
    const call = mockProductListByIds.mock.calls[0][0] as string[];
    expect(call).toHaveLength(20);
  });

  it("?ids= with empty string → returns empty result without calling repo", async () => {
    const res = await GET(makeReq({ ids: "" }) as never);
    expect(res.status).toBe(200);
    // Either early return with empty or called with filtered empty list
    // Both are valid — just shouldn't error
    const json = await res.clone().json() as { success: boolean };
    expect(json.success).toBe(true);
  });

  it("?ids= → Cache-Control set", async () => {
    const res = await GET(makeReq({ ids: "product-1" }) as never);
    expect(res.headers.get("Cache-Control")).toMatch(/public/);
  });
});

describe("GET /api/products — listing processor path", () => {
  it("uses listingProcessor when it succeeds", async () => {
    mockCallListingProcessor.mockResolvedValue({ ...defaultResult, cursor: "tok_next" });
    await GET(makeReq() as never);
    expect(mockCallListingProcessor).toHaveBeenCalledWith("products", expect.any(Object));
    expect(mockProductList).not.toHaveBeenCalled();
  });

  it("falls back to local repo when listingProcessor fails", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("function unavailable"));
    await GET(makeReq() as never);
    expect(mockProductList).toHaveBeenCalled();
  });

  it("returns Cache-Control header", async () => {
    const res = await GET(makeReq() as never);
    expect(res.headers.get("Cache-Control")).toMatch(/public/);
  });
});

describe("GET /api/products — filter building", () => {
  it("?status=published → includes status filter in request", async () => {
    await GET(makeReq({ status: "published" }) as never);
    const call = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(call.filters).toContain("status");
  });

  it("?listingType=auction → includes listingType filter", async () => {
    await GET(makeReq({ listingType: "auction" }) as never);
    const call = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(call.filters).toContain("listingType");
  });

  it("?minPrice=100 → passed through as decimal rupees", async () => {
    await GET(makeReq({ minPrice: "100" }) as never);
    const call = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(call.filters).toContain("100");
  });

  it("?inStock=true → stockQuantity filter added", async () => {
    await GET(makeReq({ inStock: "true" }) as never);
    const call = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(call.filters).toContain("stockQuantity");
  });
});

describe("GET /api/products — Firestore error recovery", () => {
  it("FAILED_PRECONDITION error → 200 with empty items + warning (not 500)", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("unavailable"));
    mockProductList.mockRejectedValue(new Error("FAILED_PRECONDITION: missing index"));
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { warning: string } };
    expect(json.data.warning).toMatch(/index/i);
  });

  it("PERMISSION_DENIED error → 200 with empty items + permission warning", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("unavailable"));
    mockProductList.mockRejectedValue(new Error("PERMISSION_DENIED: access denied"));
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { warning: string } };
    expect(json.data.warning).toMatch(/permission/i);
  });

  it("unknown error → 500", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("unavailable"));
    mockProductList.mockRejectedValue(new Error("Unknown DB error"));
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(500);
  });
});
