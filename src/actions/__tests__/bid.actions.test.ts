import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockPlaceBid,
  mockBuyNowAuction,
  mockListBidsByProduct,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockPlaceBid: vi.fn(),
  mockBuyNowAuction: vi.fn(),
  mockListBidsByProduct: vi.fn(),
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
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  placeBid: mockPlaceBid,
  buyNowAuction: mockBuyNowAuction,
  listBidsByProduct: mockListBidsByProduct,
  getBidById: vi.fn().mockResolvedValue(null),
  normalizeError: vi.fn(),
}));

import {
  placeBidAction,
  buyNowAction,
  listBidsByProductAction,
} from "../bid.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeBidResult(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    bid: { id: "bid-charizard-ravi-001", amount: 500000, status: "active" },
    ...overrides,
  };
}

describe("placeBidAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockPlaceBid.mockResolvedValue(makeBidResult());
  });

  it("unauthenticated → inner { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: 500 } as any);
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(false);
  });

  it("rate limit exceeded → inner { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: 500 } as any);
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(false);
  });
});

describe("placeBidAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockPlaceBid.mockResolvedValue(makeBidResult());
  });

  it("missing productId → { ok: false }", async () => {
    const result = await placeBidAction({ productId: "", bidAmount: 500 } as any);
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(false);
  });

  it("bidAmount = 0 → { ok: false }", async () => {
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: 0 } as any);
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(false);
  });

  it("bidAmount negative → { ok: false }", async () => {
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: -100 } as any);
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(false);
  });
});

describe("placeBidAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1", email: "buyer@test.com" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockPlaceBid.mockResolvedValue(makeBidResult());
  });

  it("valid → placeBid called with (uid, email, parsedData)", async () => {
    await placeBidAction({ productId: "auction-charizard", bidAmount: 50000 } as any);
    expect(mockPlaceBid).toHaveBeenCalledWith(
      "user-buyer-1",
      "buyer@test.com",
      expect.objectContaining({ productId: "auction-charizard", bidAmount: 50000 }),
    );
  });

  it("returns { ok: true, data: { ok: true, bid: … } }", async () => {
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: 50000 } as any);
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(true);
  });

  it("autoMaxBid forwarded when provided", async () => {
    await placeBidAction({ productId: "auction-charizard", bidAmount: 50000, autoMaxBid: 100000 } as any);
    expect(mockPlaceBid).toHaveBeenCalledWith(
      "user-buyer-1",
      "buyer@test.com",
      expect.objectContaining({ autoMaxBid: 100000 }),
    );
  });
});

describe("buyNowAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockBuyNowAuction.mockResolvedValue({ success: true, order: { id: "order-1" } });
  });

  it("unauthenticated → returns { ok: false } data", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await buyNowAction("auction-charizard");
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(false);
  });

  it("rate limit exceeded → data.ok === false", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await buyNowAction("auction-charizard");
    expect(result.ok).toBe(true);
    const data = (result as { data: { ok: boolean } }).data;
    expect(data.ok).toBe(false);
  });

  it("valid → buyNowAuction called with (uid, displayName, email, { productId })", async () => {
    await buyNowAction("auction-charizard");
    expect(mockBuyNowAuction).toHaveBeenCalledWith(
      "user-buyer-1",
      expect.any(String),
      "buyer@test.com",
      { productId: "auction-charizard" },
    );
  });
});

describe("listBidsByProductAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListBidsByProduct.mockResolvedValue({ items: [], total: 0 });
  });

  it("no auth required; calls listBidsByProduct(productId, params)", async () => {
    await listBidsByProductAction("auction-charizard");
    expect(mockListBidsByProduct).toHaveBeenCalledWith("auction-charizard", undefined);
  });

  it("passes page + pageSize params through", async () => {
    await listBidsByProductAction("auction-charizard", { page: 2, pageSize: 20 });
    expect(mockListBidsByProduct).toHaveBeenCalledWith("auction-charizard", { page: 2, pageSize: 20 });
  });
});
