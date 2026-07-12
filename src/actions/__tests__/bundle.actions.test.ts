import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockAddBundleToCartAction,
  mockRedirect,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockAddBundleToCartAction: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
  addBundleToCartAction: mockAddBundleToCartAction,
  ActionResult: {},
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  ROUTES: { USER: { CHECKOUT: "/en/user/checkout" } },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
}));

import { buyBundleAction } from "../bundle.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

describe("buyBundleAction — no wrapAction, throws raw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAddBundleToCartAction.mockResolvedValue(undefined);
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(buyBundleAction({ bundleSlug: "category-starter-bundle" })).rejects.toThrow();
  });

  it("valid → rateLimitByIdentifier called with bundle:buy:{uid}", async () => {
    try {
      await buyBundleAction({ bundleSlug: "category-starter-bundle" });
    } catch {
      // redirect throws
    }
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "bundle:buy:user-buyer-1",
      expect.anything(),
    );
  });

  it("valid → addBundleToCartAction called with (uid, bundleSlug)", async () => {
    try {
      await buyBundleAction({ bundleSlug: "category-starter-bundle" });
    } catch {
      // redirect throws
    }
    expect(mockAddBundleToCartAction).toHaveBeenCalledWith(
      "user-buyer-1",
      "category-starter-bundle",
    );
  });

  it("valid → redirect called with checkout URL containing bundleSlug and type=bundle", async () => {
    try {
      await buyBundleAction({ bundleSlug: "category-starter-bundle" });
    } catch {
      // redirect throws
    }
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("category-starter-bundle"),
    );
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.stringContaining("type=bundle"),
    );
  });

  it("addBundleToCartAction throws ValidationError → propagates", async () => {
    mockAddBundleToCartAction.mockRejectedValue(new Error("Bundle is not available"));
    await expect(
      buyBundleAction({ bundleSlug: "category-starter-bundle" }),
    ).rejects.toThrow("Bundle is not available");
  });

  it("addBundleToCartAction throws NotFoundError → propagates", async () => {
    mockAddBundleToCartAction.mockRejectedValue(new Error("Bundle not found"));
    await expect(
      buyBundleAction({ bundleSlug: "category-nonexistent" }),
    ).rejects.toThrow("Bundle not found");
  });
});
