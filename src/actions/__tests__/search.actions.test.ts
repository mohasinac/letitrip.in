import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSearchProducts } = vi.hoisted(() => ({
  mockSearchProducts: vi.fn(),
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
  searchProducts: mockSearchProducts,
}));

import { searchProductsAction } from "../search.actions";

function makeSearchResult(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ id: "product-hot-wheels-redline" }],
    q: "hot wheels",
    total: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasMore: false,
    backend: "in-memory" as const,
    ...overrides,
  };
}

describe("searchProductsAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchProducts.mockResolvedValue(makeSearchResult());
  });

  it("empty params → searchProducts called with {}", async () => {
    await searchProductsAction({});
    expect(mockSearchProducts).toHaveBeenCalledWith({});
  });

  it("{ q: 'charizard' } → searchProducts called with { q: 'charizard' }", async () => {
    await searchProductsAction({ q: "charizard" });
    expect(mockSearchProducts).toHaveBeenCalledWith({ q: "charizard" });
  });

  it("{ page: 2, pageSize: 20 } → forwarded to searchProducts", async () => {
    await searchProductsAction({ page: 2, pageSize: 20 });
    expect(mockSearchProducts).toHaveBeenCalledWith(expect.objectContaining({ page: 2, pageSize: 20 }));
  });

  it("{ category: 'trading-cards' } → forwarded to searchProducts", async () => {
    await searchProductsAction({ category: "trading-cards" });
    expect(mockSearchProducts).toHaveBeenCalledWith(expect.objectContaining({ category: "trading-cards" }));
  });

  it("searchProducts success → { ok: true, data: results }", async () => {
    const result = await searchProductsAction({ q: "charizard" });
    expect(result.ok).toBe(true);
    expect((result as { data: unknown }).data).toMatchObject({ total: 1 });
  });

  it("searchProducts throws → { ok: false } (wrapAction captures the error)", async () => {
    mockSearchProducts.mockRejectedValue(new Error("Search service unavailable"));
    const result = await searchProductsAction({ q: "charizard" });
    expect(result.ok).toBe(false);
  });
});
