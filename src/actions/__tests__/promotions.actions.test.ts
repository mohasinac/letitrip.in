import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetPromotions } = vi.hoisted(() => ({
  mockGetPromotions: vi.fn(),
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
  getPromotions: mockGetPromotions,
}));

import { getPromotionsAction } from "../promotions.actions";

describe("getPromotionsAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPromotions.mockResolvedValue({ featured: [], banners: [], flashSales: [] });
  });

  it("no auth guard — unauthenticated callers can call this", async () => {
    await getPromotionsAction();
    // no requireAuthUser / requireRoleUser mock was even provided — confirms no guard
  });

  it("delegates to getPromotions() with no args", async () => {
    await getPromotionsAction();
    expect(mockGetPromotions).toHaveBeenCalledWith();
    expect(mockGetPromotions).toHaveBeenCalledTimes(1);
  });

  it("returns { ok: true, data: PromotionsResult }", async () => {
    const result = await getPromotionsAction();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({ featured: [], banners: [], flashSales: [] });
    }
  });

  it("getPromotions throws → { ok: false }", async () => {
    mockGetPromotions.mockRejectedValue(new Error("Promotions fetch failed"));
    const result = await getPromotionsAction();
    expect(result.ok).toBe(false);
  });
});
