import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockMakeOffer,
  mockRespondToOffer,
  mockAcceptCounterOffer,
  mockCounterOfferByBuyer,
  mockWithdrawOffer,
  mockListBuyerOffers,
  mockListSellerOffers,
  mockCheckoutOffer,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockMakeOffer: vi.fn(),
  mockRespondToOffer: vi.fn(),
  mockAcceptCounterOffer: vi.fn(),
  mockCounterOfferByBuyer: vi.fn(),
  mockWithdrawOffer: vi.fn(),
  mockListBuyerOffers: vi.fn(),
  mockListSellerOffers: vi.fn(),
  mockCheckoutOffer: vi.fn(),
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
  normalizeError: vi.fn(),
  makeOffer: mockMakeOffer,
  respondToOffer: mockRespondToOffer,
  acceptCounterOffer: mockAcceptCounterOffer,
  counterOfferByBuyer: mockCounterOfferByBuyer,
  withdrawOffer: mockWithdrawOffer,
  listBuyerOffers: mockListBuyerOffers,
  listSellerOffers: mockListSellerOffers,
  checkoutOffer: mockCheckoutOffer,
}));

import { makeOfferAction, respondToOfferAction, counterOfferByBuyerAction, withdrawOfferAction, listBuyerOffersAction, listSellerOffersAction, checkoutOfferAction } from "../offer.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeOffer(overrides: Record<string, unknown> = {}) {
  return {
    id: "offer-charizard-psa9-ravi-20260629",
    productId: "product-charizard-psa9",
    buyerId: "user-buyer-1",
    offerAmount: 45000,
    status: "pending",
    ...overrides,
  };
}

describe("makeOfferAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockMakeOffer.mockResolvedValue(makeOffer());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await makeOfferAction({ productId: "product-charizard-psa9", offerAmount: 45000 } as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await makeOfferAction({ productId: "product-charizard-psa9", offerAmount: 45000 } as any);
    expect(result.ok).toBe(false);
  });
});

describe("makeOfferAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockMakeOffer.mockResolvedValue(makeOffer());
  });

  it("empty productId → { ok: false }", async () => {
    const result = await makeOfferAction({ productId: "", offerAmount: 45000 } as any);
    expect(result.ok).toBe(false);
  });

  it("offerAmount = 0 → { ok: false }", async () => {
    const result = await makeOfferAction({ productId: "product-charizard-psa9", offerAmount: 0 } as any);
    expect(result.ok).toBe(false);
  });

  it("offerAmount negative → { ok: false }", async () => {
    const result = await makeOfferAction({ productId: "product-charizard-psa9", offerAmount: -100 } as any);
    expect(result.ok).toBe(false);
  });

  it("buyerNote > 300 chars → { ok: false }", async () => {
    const result = await makeOfferAction({
      productId: "product-charizard-psa9",
      offerAmount: 45000,
      buyerNote: "x".repeat(301),
    } as any);
    expect(result.ok).toBe(false);
  });
});

describe("makeOfferAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1", email: "buyer@test.com" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockMakeOffer.mockResolvedValue(makeOffer());
  });

  it("valid → makeOffer called with (uid, email, parsedData)", async () => {
    await makeOfferAction({ productId: "product-charizard-psa9", offerAmount: 45000 } as any);
    expect(mockMakeOffer).toHaveBeenCalledWith(
      "user-buyer-1",
      "buyer@test.com",
      expect.objectContaining({ productId: "product-charizard-psa9", offerAmount: 45000 }),
    );
  });

  it("returns { ok: true, data: OfferDocument }", async () => {
    const result = await makeOfferAction({ productId: "product-charizard-psa9", offerAmount: 45000 } as any);
    expect(result.ok).toBe(true);
  });
});

describe("respondToOfferAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockRespondToOffer.mockResolvedValue(makeOffer({ status: "accepted" }));
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await respondToOfferAction({ offerId: "offer-abc", action: "accept" } as any);
    expect(result.ok).toBe(false);
  });

  it("empty offerId → { ok: false }", async () => {
    const result = await respondToOfferAction({ offerId: "", action: "accept" } as any);
    expect(result.ok).toBe(false);
  });

  it("invalid action → { ok: false }", async () => {
    const result = await respondToOfferAction({ offerId: "offer-abc", action: "invalidAction" } as any);
    expect(result.ok).toBe(false);
  });

  it("valid accept → respondToOffer called with (uid, parsedData)", async () => {
    await respondToOfferAction({ offerId: "offer-abc", action: "accept" } as any);
    expect(mockRespondToOffer).toHaveBeenCalledWith(
      "user-buyer-1",
      expect.objectContaining({ offerId: "offer-abc", action: "accept" }),
    );
  });
});

describe("counterOfferByBuyerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCounterOfferByBuyer.mockResolvedValue(makeOffer({ status: "countered" }));
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await counterOfferByBuyerAction({ offerId: "offer-abc", counterAmount: 40000 } as any);
    expect(result.ok).toBe(false);
  });

  it("counterAmount not integer → { ok: false }", async () => {
    const result = await counterOfferByBuyerAction({ offerId: "offer-abc", counterAmount: 40000.5 } as any);
    expect(result.ok).toBe(false);
  });

  it("valid → counterOfferByBuyer called with (uid, email, parsedData)", async () => {
    await counterOfferByBuyerAction({ offerId: "offer-abc", counterAmount: 40000 } as any);
    expect(mockCounterOfferByBuyer).toHaveBeenCalledWith(
      "user-buyer-1",
      "buyer@test.com",
      expect.objectContaining({ offerId: "offer-abc", counterAmount: 40000 }),
    );
  });
});

describe("withdrawOfferAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockWithdrawOffer.mockResolvedValue(undefined);
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await withdrawOfferAction({ offerId: "offer-abc" });
    expect(result.ok).toBe(false);
  });

  it("empty offerId → { ok: false }", async () => {
    const result = await withdrawOfferAction({ offerId: "" });
    expect(result.ok).toBe(false);
  });

  it("valid → withdrawOffer called with (uid, offerId)", async () => {
    await withdrawOfferAction({ offerId: "offer-abc" });
    expect(mockWithdrawOffer).toHaveBeenCalledWith("user-buyer-1", "offer-abc");
  });
});

describe("listBuyerOffersAction / listSellerOffersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockListBuyerOffers.mockResolvedValue([makeOffer()]);
    mockListSellerOffers.mockResolvedValue([makeOffer()]);
  });

  it("listBuyerOffers → called with uid", async () => {
    await listBuyerOffersAction();
    expect(mockListBuyerOffers).toHaveBeenCalledWith("user-buyer-1");
  });

  it("listSellerOffers → called with uid", async () => {
    await listSellerOffersAction();
    expect(mockListSellerOffers).toHaveBeenCalledWith("user-buyer-1");
  });
});

describe("checkoutOfferAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCheckoutOffer.mockResolvedValue({ id: "cart-001", items: [] });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await checkoutOfferAction("offer-abc");
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await checkoutOfferAction("offer-abc");
    expect(result.ok).toBe(false);
  });

  it("valid → checkoutOffer called with (uid, offerId)", async () => {
    await checkoutOfferAction("offer-abc");
    expect(mockCheckoutOffer).toHaveBeenCalledWith("user-buyer-1", "offer-abc");
  });
});
