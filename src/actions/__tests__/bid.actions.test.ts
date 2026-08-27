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
  // Thrown for rate-limit refusals now that the actions fail by throwing and
  // let `wrapAction` build the single envelope, rather than hand-returning a
  // second one.
  ApiError: class ApiError extends Error { constructor(public statusCode: number, msg: string) { super(msg); } },
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
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → inner { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: 500 } as any);
    expect(result.ok).toBe(false);
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
    expect(result.ok).toBe(false);
  });

  it("bidAmount = 0 → { ok: false }", async () => {
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: 0 } as any);
    expect(result.ok).toBe(false);
  });

  it("bidAmount negative → { ok: false }", async () => {
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: -100 } as any);
    expect(result.ok).toBe(false);
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

  it("returns { ok: true, data: <bid result> } — ONE envelope", async () => {
    const result = await placeBidAction({ productId: "auction-charizard", bidAmount: 50000 } as any);
    expect(result.ok).toBe(true);
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

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await buyNowAction("auction-charizard");
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await buyNowAction("auction-charizard");
    expect(result.ok).toBe(false);
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

  /**
   * 🛑 Envelope DEPTH is the contract, and it is what actually broke.
   *
   * These actions used to `return { ok, data }` from inside `wrapAction`, so
   * the wire value was `{ ok: true, data: { ok: false, error } }`. The outer
   * `ok` was `true` for every outcome including every failure, and
   * `PlaceBidFormClient` reads the outer `ok` — so Buy Now placed a real bid
   * and a real locked cart line, then silently refreshed a page that renders
   * nothing from the cart. The old version of this suite asserted
   * `result.ok === true` for an UNAUTHENTICATED call, i.e. it encoded the bug
   * as the expectation.
   *
   * Asserting the payload is not itself an envelope is what makes a
   * re-introduced second wrapper fail here rather than in the browser.
   */
  it("success payload is the domain result, NOT a nested envelope", async () => {
    mockBuyNowAuction.mockResolvedValue({
      bidId: "bid-1",
      checkoutUrl: "/checkout?lane=auction",
    });
    const result = await buyNowAction("auction-charizard");
    expect(result.ok).toBe(true);
    const data = (result as { data: Record<string, unknown> }).data;
    expect(data).not.toHaveProperty("ok");
    expect(data.checkoutUrl).toBe("/checkout?lane=auction");
  });

  it("failure surfaces error + code at the TOP level", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await buyNowAction("auction-charizard");
    expect(result.ok).toBe(false);
    const failed = result as { error: string; code?: string };
    expect(failed.error).toMatch(/too many requests/i);
    expect(failed).not.toHaveProperty("data");
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
