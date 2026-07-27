import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockListStores,
  mockGetStoreBySlug,
  mockGetStoreProducts,
  mockGetStoreAuctions,
  mockGetStoreReviews,
} = vi.hoisted(() => ({
  mockListStores: vi.fn(),
  mockGetStoreBySlug: vi.fn(),
  mockGetStoreProducts: vi.fn(),
  mockGetStoreAuctions: vi.fn(),
  mockGetStoreReviews: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  listStores: mockListStores,
  getStoreBySlug: mockGetStoreBySlug,
  getStoreProducts: mockGetStoreProducts,
  getStoreAuctions: mockGetStoreAuctions,
  getStoreReviews: mockGetStoreReviews,
}));

import {
  listStoresAction,
  getStoreBySlugAction,
  getStoreProductsAction,
  getStoreAuctionsAction,
  getStoreReviewsAction,
} from "../store.actions";

const emptyListResult = { items: [], total: 0, hasMore: false };

describe("listStoresAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockListStores.mockResolvedValue(emptyListResult); });

  it("no auth guard", async () => { await listStoresAction(); });

  it("empty params → listStores called with {}", async () => {
    await listStoresAction({});
    expect(mockListStores).toHaveBeenCalledWith({});
  });

  it("params forwarded unchanged", async () => {
    await listStoresAction({ isVerified: true, page: 2 });
    expect(mockListStores).toHaveBeenCalledWith({ isVerified: true, page: 2 });
  });

  it("returns { ok: true, data }", async () => {
    const result = await listStoresAction({});
    expect(result.ok).toBe(true);
  });

  it("listStores throws → { ok: false }", async () => {
    mockListStores.mockRejectedValue(new Error("DB error"));
    const result = await listStoresAction({});
    expect(result.ok).toBe(false);
  });
});

describe("getStoreBySlugAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStoreBySlug.mockResolvedValue({ id: "store-pokemon-palace", storeName: "Pokemon Palace" });
  });

  it("storeSlug forwarded to getStoreBySlug", async () => {
    await getStoreBySlugAction("store-pokemon-palace");
    expect(mockGetStoreBySlug).toHaveBeenCalledWith("store-pokemon-palace");
  });

  it("returns { ok: true, data: StoreDocument }", async () => {
    const result = await getStoreBySlugAction("store-pokemon-palace");
    expect(result.ok).toBe(true);
  });

  it("store not found → { ok: true, data: null }", async () => {
    mockGetStoreBySlug.mockResolvedValue(null);
    const result = await getStoreBySlugAction("store-nonexistent");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toBeNull();
  });
});

describe("getStoreProductsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetStoreProducts.mockResolvedValue(emptyListResult); });

  it("storeSlug and params forwarded to getStoreProducts", async () => {
    await getStoreProductsAction("store-pokemon-palace", { page: 1 });
    expect(mockGetStoreProducts).toHaveBeenCalledWith("store-pokemon-palace", { page: 1 });
  });

  it("empty params default", async () => {
    await getStoreProductsAction("store-pokemon-palace");
    expect(mockGetStoreProducts).toHaveBeenCalledWith("store-pokemon-palace", {});
  });

  it("returns { ok: true, data }", async () => {
    const result = await getStoreProductsAction("store-pokemon-palace");
    expect(result.ok).toBe(true);
  });
});

describe("getStoreAuctionsAction — no auth required", () => {
  beforeEach(() => { vi.clearAllMocks(); mockGetStoreAuctions.mockResolvedValue(emptyListResult); });

  it("storeSlug and params forwarded to getStoreAuctions", async () => {
    await getStoreAuctionsAction("store-pokemon-palace", { status: "active" });
    expect(mockGetStoreAuctions).toHaveBeenCalledWith("store-pokemon-palace", { status: "active" });
  });

  it("empty params default", async () => {
    await getStoreAuctionsAction("store-pokemon-palace");
    expect(mockGetStoreAuctions).toHaveBeenCalledWith("store-pokemon-palace", {});
  });

  it("returns { ok: true, data }", async () => {
    const result = await getStoreAuctionsAction("store-pokemon-palace");
    expect(result.ok).toBe(true);
  });
});

describe("getStoreReviewsAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStoreReviews.mockResolvedValue({ items: [], total: 0, averageRating: 0 });
  });

  it("storeSlug forwarded to getStoreReviews", async () => {
    await getStoreReviewsAction("store-pokemon-palace");
    expect(mockGetStoreReviews).toHaveBeenCalledWith("store-pokemon-palace");
  });

  it("returns { ok: true, data: StoreReviewsResult }", async () => {
    const result = await getStoreReviewsAction("store-pokemon-palace");
    expect(result.ok).toBe(true);
  });

  it("getStoreReviews throws → { ok: false }", async () => {
    mockGetStoreReviews.mockRejectedValue(new Error("DB error"));
    const result = await getStoreReviewsAction("store-pokemon-palace");
    expect(result.ok).toBe(false);
  });
});
