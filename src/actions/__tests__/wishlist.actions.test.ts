import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockAddToWishlist,
  mockRemoveFromWishlist,
  mockGetWishlistForUser,
  MockWishlistFullError,
  WISHLIST_MAX,
} = vi.hoisted(() => {
  class WishlistFullErrorMock extends Error {
    limit: number;
    current: number;
    constructor({ limit, current }: { limit: number; current: number }) {
      super("Wishlist is full");
      this.limit = limit;
      this.current = current;
    }
  }

  return {
    mockRequireAuthUser: vi.fn(),
    mockRateLimitByIdentifier: vi.fn(),
    mockAddToWishlist: vi.fn(),
    mockRemoveFromWishlist: vi.fn(),
    mockGetWishlistForUser: vi.fn(),
    MockWishlistFullError: WishlistFullErrorMock,
    WISHLIST_MAX: 20,
  };
});

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
  addToWishlist: mockAddToWishlist,
  removeFromWishlist: mockRemoveFromWishlist,
  getWishlistForUser: mockGetWishlistForUser,
  WishlistFullError: MockWishlistFullError,
  WISHLIST_MAX,
}));

import {
  addToWishlistAction,
  removeFromWishlistAction,
  getWishlistAction,
} from "../wishlist.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

describe("addToWishlistAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAddToWishlist.mockResolvedValue({ count: 5 });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await addToWishlistAction("product-hot-wheels-redline");
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await addToWishlistAction("product-hot-wheels-redline");
    expect(result.ok).toBe(false);
  });
});

describe("addToWishlistAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAddToWishlist.mockResolvedValue({ count: 5 });
  });

  it("addToWishlist returns { count: 5 } → { ok: true, data: { ok: true, count: 5, limit: 20, isFull: false } }", async () => {
    const result = await addToWishlistAction("product-hot-wheels-redline");
    expect(result.ok).toBe(true);
    const data = (result as { data: Record<string, unknown> }).data;
    expect(data.ok).toBe(true);
    expect(data.count).toBe(5);
    expect(data.limit).toBe(20);
    expect(data.isFull).toBe(false);
  });

  it("count = WISHLIST_MAX (20) → isFull: true", async () => {
    mockAddToWishlist.mockResolvedValue({ count: 20 });
    const result = await addToWishlistAction("product-charizard");
    const data = (result as { data: { isFull: boolean } }).data;
    expect(data.isFull).toBe(true);
  });

  it("count = 19 → isFull: false", async () => {
    mockAddToWishlist.mockResolvedValue({ count: 19 });
    const result = await addToWishlistAction("product-pikachu");
    const data = (result as { data: { isFull: boolean } }).data;
    expect(data.isFull).toBe(false);
  });
});

describe("addToWishlistAction — WishlistFullError handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
  });

  it("addToWishlist throws WishlistFullError({ limit: 20, current: 20 }) → { ok: true, data: { ok: false, code: 'WISHLIST_FULL', limit: 20, current: 20 } }", async () => {
    mockAddToWishlist.mockRejectedValue(new MockWishlistFullError({ limit: 20, current: 20 }));
    const result = await addToWishlistAction("product-charizard");
    expect(result.ok).toBe(true);
    const data = (result as { data: Record<string, unknown> }).data;
    expect(data.ok).toBe(false);
    expect(data.code).toBe("WISHLIST_FULL");
    expect(data.limit).toBe(20);
    expect(data.current).toBe(20);
  });

  it("addToWishlist throws non-WishlistFullError → re-throws (not swallowed), outer wrapAction returns { ok: false }", async () => {
    mockAddToWishlist.mockRejectedValue(new Error("Database error"));
    const result = await addToWishlistAction("product-charizard");
    expect(result.ok).toBe(false);
  });
});

describe("removeFromWishlistAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockRemoveFromWishlist.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(removeFromWishlistAction("product-hot-wheels-redline")).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(removeFromWishlistAction("product-hot-wheels-redline")).rejects.toThrow();
  });

  it("valid → removeFromWishlist called with (uid, productId)", async () => {
    await removeFromWishlistAction("product-hot-wheels-redline");
    expect(mockRemoveFromWishlist).toHaveBeenCalledWith("user-buyer-1", "product-hot-wheels-redline");
  });
});

describe("getWishlistAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockGetWishlistForUser.mockResolvedValue({ items: [], meta: { total: 0 } });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getWishlistAction();
    expect(result.ok).toBe(false);
  });

  it("valid → getWishlistForUser called with uid", async () => {
    await getWishlistAction();
    expect(mockGetWishlistForUser).toHaveBeenCalledWith("user-buyer-1");
  });

  it("returns { ok: true, data: { items, meta: { total } } }", async () => {
    const result = await getWishlistAction();
    expect(result.ok).toBe(true);
    expect((result as { data: { meta: { total: number } } }).data.meta.total).toBe(0);
  });
});
