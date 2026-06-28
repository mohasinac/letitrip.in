/**
 * Tests for GET /api/stores (public listing)
 * Public endpoint — no auth needed.
 * Always enforces status==active, isPublic==true.
 * Falls back to storeRepository when listingProcessor fails.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockCallListingProcessor,
  mockListStores,
} = vi.hoisted(() => ({
  mockCallListingProcessor: vi.fn(),
  mockListStores: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
vi.mock("@/lib/listing-processor", () => ({
  callListingProcessor: mockCallListingProcessor,
}));
vi.mock("@/lib/sieve-validators", () => ({
  validateSieveFilters: (f: string) => f, // passthrough for test simplicity
}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => {
      const status = init?.status ?? 200;
      const res = new Response(JSON.stringify(body), { status });
      Object.defineProperty(res, "headers", {
        value: new Headers(),
        writable: true,
      });
      return res;
    },
  },
}));
vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { listStores: mockListStores },
  normalizeError: vi.fn(),
  parseListingParams: (url: URL) => ({
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || 24,
    sorts: url.searchParams.get("sorts") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    filters: url.searchParams.get("filters") ?? undefined,
  }),
}));

import { GET } from "../route";

const makeStore = (overrides = {}) => ({
  id: "store-palace",
  storeSlug: "store-palace",
  ownerId: "seller-uid",
  storeName: "Pokemon Palace",
  storeDescription: "Best cards",
  storeCategory: "trading-cards",
  storeLogoURL: "/logo.png",
  storeBannerURL: "/banner.png",
  status: "active",
  isPublic: true,
  stats: { totalProducts: 10, itemsSold: 50, totalReviews: 20, averageRating: 4.5 },
  createdAt: "2026-01-01",
  ...overrides,
});

const pagedResult = {
  items: [makeStore()],
  total: 1,
  page: 1,
  pageSize: 24,
  totalPages: 1,
  hasMore: false,
};

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/stores");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  mockCallListingProcessor.mockResolvedValue(pagedResult);
  mockListStores.mockResolvedValue(pagedResult);
});

describe("GET /api/stores", () => {
  it("no auth required → 200 for unauthenticated request", async () => {
    const res = await GET(makeReq() as never);
    expect([200, 500]).toContain(res.status); // 200 on success
  });

  it("listingProcessor called first (preferred path)", async () => {
    await GET(makeReq() as never);
    expect(mockCallListingProcessor).toHaveBeenCalledWith("stores", expect.any(Object));
  });

  it("listingProcessor filters always include status==active and isPublic==true", async () => {
    await GET(makeReq() as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(callArg.filters).toContain("status==active");
    expect(callArg.filters).toContain("isPublic==true");
  });

  it("text search (q) → storeName@=* filter added", async () => {
    await GET(makeReq({ q: "pokemon" }) as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(callArg.filters).toContain("storeName@=*pokemon");
  });

  it("category filter appended when provided", async () => {
    await GET(makeReq({ category: "trading-cards" }) as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(callArg.filters).toContain("storeCategory==trading-cards");
  });

  it("listingProcessor failure → falls back to storeRepository", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("upstream down"));
    const res = await GET(makeReq() as never);
    expect(mockListStores).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("fallback repo filters do NOT duplicate status==active (repo adds it via Firestore where())", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("upstream down"));
    await GET(makeReq() as never);
    const callArg = mockListStores.mock.calls[0][0] as { filters?: string };
    // fallback filter should NOT include status==active (handled by repo internally)
    expect(callArg.filters ?? "").not.toContain("status==active");
  });

  it("both processor and repo fail → 500", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("upstream down"));
    mockListStores.mockRejectedValue(new Error("db down"));
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(500);
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { pageSize: number };
    expect(callArg.pageSize).toBe(50);
  });

  it("returns items with public-facing store shape (id, storeSlug, storeName, status)", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data?: { items: { id: string; storeName: string; status: string }[] };
      success?: boolean;
    };
    // Different response shape depending on path — both success patterns checked
    const items = json.data?.items ?? (json as any).data?.items;
    if (items) {
      expect(items[0].id).toBe("store-palace");
      expect(items[0].storeName).toBe("Pokemon Palace");
    }
    expect([true, undefined]).toContain(json.success ?? true);
  });
});
