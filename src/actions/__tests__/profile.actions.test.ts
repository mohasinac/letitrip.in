import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockUpdateUserProfile,
  mockGetUserProfile,
  mockGetUserSessions,
  mockGetPublicUserProfile,
  mockGetSellerReviews,
  mockGetProfileStoreProducts,
  mockUserRepositoryUpdate,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockUpdateUserProfile: vi.fn(),
  mockGetUserProfile: vi.fn(),
  mockGetUserSessions: vi.fn(),
  mockGetPublicUserProfile: vi.fn(),
  mockGetSellerReviews: vi.fn(),
  mockGetProfileStoreProducts: vi.fn(),
  mockUserRepositoryUpdate: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
  updateUserProfile: mockUpdateUserProfile,
  getUserProfile: mockGetUserProfile,
  getUserSessions: mockGetUserSessions,
  getPublicUserProfile: mockGetPublicUserProfile,
  getSellerReviews: mockGetSellerReviews,
  getProfileStoreProducts: mockGetProfileStoreProducts,
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  userRepository: { update: mockUserRepositoryUpdate },
}));

import {
  updateProfileAction,
  getMyProfileAction,
  listMySessionsAction,
  dismissBannerAction,
  getPublicProfileAction,
  getSellerReviewsAction,
  getProfileStoreProductsAction,
} from "../profile.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", role: "user", ...overrides };
}

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateUserProfile.mockResolvedValue({ id: "user-buyer-1", displayName: "Ravi Kumar" });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await updateProfileAction({ displayName: "Ravi Kumar" });
    expect(result.ok).toBe(false);
  });

  it("email provided but invalid format → { ok: false }", async () => {
    const result = await updateProfileAction({ email: "not-an-email" });
    expect(result.ok).toBe(false);
  });

  it("photoURL provided but not valid URL and not empty string → { ok: false }", async () => {
    const result = await updateProfileAction({ photoURL: "not-a-url-and-not-empty" });
    expect(result.ok).toBe(false);
  });

  it("photoURL = '' (empty string) → valid (explicitly allowed)", async () => {
    const result = await updateProfileAction({ photoURL: "" });
    expect(result.ok).toBe(true);
  });

  it("valid → updateUserProfile called with (user.uid, parsedData) — NOT userRepository directly", async () => {
    await updateProfileAction({ displayName: "Ravi Kumar" });
    expect(mockUpdateUserProfile).toHaveBeenCalledWith("user-buyer-1", expect.objectContaining({ displayName: "Ravi Kumar" }));
    expect(mockUserRepositoryUpdate).not.toHaveBeenCalled();
  });

  it("returns { ok: true, data: UserProfile }", async () => {
    const result = await updateProfileAction({ displayName: "Ravi Kumar" });
    expect(result.ok).toBe(true);
  });
});

describe("getMyProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockGetUserProfile.mockResolvedValue({ id: "user-buyer-1" });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getMyProfileAction();
    expect(result.ok).toBe(false);
  });

  it("valid → getUserProfile called with user.uid", async () => {
    await getMyProfileAction();
    expect(mockGetUserProfile).toHaveBeenCalledWith("user-buyer-1");
  });

  it("returns { ok: true, data: UserProfile }", async () => {
    const result = await getMyProfileAction();
    expect(result.ok).toBe(true);
  });
});

describe("listMySessionsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockGetUserSessions.mockResolvedValue([{ id: "session-1", isActive: true }]);
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await listMySessionsAction();
    expect(result.ok).toBe(false);
  });

  it("valid → getUserSessions called with user.uid", async () => {
    await listMySessionsAction();
    expect(mockGetUserSessions).toHaveBeenCalledWith("user-buyer-1");
  });

  it("returns { ok: true, data: SessionDocument[] }", async () => {
    const result = await listMySessionsAction();
    expect(result.ok).toBe(true);
  });
});

describe("dismissBannerAction — no wrapAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockUserRepositoryUpdate.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(dismissBannerAction("hash12345")).rejects.toThrow();
  });

  it("hash > 20 chars → throws (bannerHashSchema max20)", async () => {
    await expect(dismissBannerAction("a".repeat(21))).rejects.toThrow();
  });

  it("hash missing (empty) → throws (bannerHashSchema min1)", async () => {
    await expect(dismissBannerAction("")).rejects.toThrow();
  });

  it("valid → userRepository.update called with (uid, { dismissedBannerHash }) — direct repo call", async () => {
    await dismissBannerAction("hash12345");
    expect(mockUserRepositoryUpdate).toHaveBeenCalledWith("user-buyer-1", {
      dismissedBannerHash: "hash12345",
    });
  });

  it("userRepository.update throws → propagates", async () => {
    mockUserRepositoryUpdate.mockRejectedValue(new Error("DB error"));
    await expect(dismissBannerAction("hash12345")).rejects.toThrow("DB error");
  });
});

describe("getPublicProfileAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublicUserProfile.mockResolvedValue({ id: "user-buyer-1", displayName: "Ravi" });
  });

  it("no requireAuthUser call", async () => {
    await getPublicProfileAction("user-buyer-1");
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
  });

  it("valid → getPublicUserProfile called with userId", async () => {
    await getPublicProfileAction("user-buyer-1");
    expect(mockGetPublicUserProfile).toHaveBeenCalledWith("user-buyer-1");
  });

  it("returns { ok: true, data: PublicUserProfile }", async () => {
    const result = await getPublicProfileAction("user-buyer-1");
    expect(result.ok).toBe(true);
  });
});

describe("getSellerReviewsAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSellerReviews.mockResolvedValue({ items: [], total: 0 });
  });

  it("no requireAuthUser call", async () => {
    await getSellerReviewsAction("user-seller-1", { page: 1 });
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
  });

  it("valid → getSellerReviews called with sellerId", async () => {
    await getSellerReviewsAction("user-seller-1", { page: 1 });
    expect(mockGetSellerReviews).toHaveBeenCalledWith("user-seller-1", expect.any(Object));
  });
});

describe("getProfileStoreProductsAction — no auth required", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfileStoreProducts.mockResolvedValue({ items: [], total: 0 });
  });

  it("no requireAuthUser call", async () => {
    await getProfileStoreProductsAction("user-seller-1", { page: 1 });
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
  });

  it("valid → getProfileStoreProducts called with sellerId", async () => {
    await getProfileStoreProductsAction("user-seller-1", { page: 1 });
    expect(mockGetProfileStoreProducts).toHaveBeenCalledWith("user-seller-1", expect.any(Object));
  });
});
