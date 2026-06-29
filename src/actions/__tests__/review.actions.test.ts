import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockCreateReviewDomain,
  mockUpdateReviewDomain,
  mockDeleteReviewDomain,
  mockAdminUpdateReviewDomain,
  mockAdminDeleteReviewDomain,
  mockVoteReviewHelpfulDomain,
  mockRequireRoleUser,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCreateReviewDomain: vi.fn(),
  mockUpdateReviewDomain: vi.fn(),
  mockDeleteReviewDomain: vi.fn(),
  mockAdminUpdateReviewDomain: vi.fn(),
  mockAdminDeleteReviewDomain: vi.fn(),
  mockVoteReviewHelpfulDomain: vi.fn(),
  mockRequireRoleUser: vi.fn(),
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

vi.mock("@mohasinac/appkit", async () => {
  const { z } = await import("zod");
  return {
    requireAuthUser: mockRequireAuthUser,
    requireRoleUser: mockRequireRoleUser,
    rateLimitByIdentifier: mockRateLimitByIdentifier,
    RateLimitPresets: { API: "api", STRICT: "strict" },
    AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
    ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
    createReview: mockCreateReviewDomain,
    updateReview: mockUpdateReviewDomain,
    deleteReview: mockDeleteReviewDomain,
    adminUpdateReview: mockAdminUpdateReviewDomain,
    adminDeleteReview: mockAdminDeleteReviewDomain,
    voteReviewHelpful: mockVoteReviewHelpfulDomain,
    listReviewsByProduct: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    listAdminReviews: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    listReviewsBySeller: vi.fn().mockResolvedValue([]),
    getHomepageReviews: vi.fn().mockResolvedValue([]),
    getReviewById: vi.fn().mockResolvedValue(null),
    reviewStatusSchema: z.enum(["pending", "approved", "rejected"]),
  };
});

vi.mock("@/validation/request-schemas", async () => {
  const { z } = await import("zod");
  return { mediaUrlSchema: z.string(), reviewStatusSchema: z.string() };
});

import {
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  adminUpdateReviewAction,
  adminDeleteReviewAction,
  voteReviewHelpfulAction,
} from "../review.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@letitrip.in", role: "admin", ...overrides };
}

function makeReview(overrides: Record<string, unknown> = {}) {
  return {
    id: "review-charizard-ravi-20260629",
    productId: "product-charizard-psa9",
    buyerId: "user-buyer-1",
    rating: 5,
    title: "Amazing card!",
    comment: "This card is in perfect condition.",
    status: "approved",
    ...overrides,
  };
}

function makeCreateInput(overrides: Record<string, unknown> = {}) {
  return {
    productId: "product-charizard-psa9",
    rating: 5,
    title: "Amazing card!",
    comment: "This card is in perfect condition.",
    images: [],
    ...overrides,
  };
}

describe("createReviewAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateReviewDomain.mockResolvedValue(makeReview());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await createReviewAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded (STRICT) → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createReviewAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });
});

describe("createReviewAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateReviewDomain.mockResolvedValue(makeReview());
  });

  it("missing productId → { ok: false }", async () => {
    const result = await createReviewAction(makeCreateInput({ productId: "" }) as any);
    expect(result.ok).toBe(false);
  });

  it("rating < 1 → { ok: false }", async () => {
    const result = await createReviewAction(makeCreateInput({ rating: 0 }) as any);
    expect(result.ok).toBe(false);
  });

  it("rating > 5 → { ok: false }", async () => {
    const result = await createReviewAction(makeCreateInput({ rating: 6 }) as any);
    expect(result.ok).toBe(false);
  });

  it("rating = 3.5 (not integer) → { ok: false }", async () => {
    const result = await createReviewAction(makeCreateInput({ rating: 3.5 }) as any);
    expect(result.ok).toBe(false);
  });

  it("comment < 10 chars → { ok: false }", async () => {
    const result = await createReviewAction(makeCreateInput({ comment: "Short" }) as any);
    expect(result.ok).toBe(false);
  });

  it("comment > 2000 chars → { ok: false }", async () => {
    const result = await createReviewAction(makeCreateInput({ comment: "x".repeat(2001) }) as any);
    expect(result.ok).toBe(false);
  });

  it("title missing → { ok: false }", async () => {
    const result = await createReviewAction(makeCreateInput({ title: "" }) as any);
    expect(result.ok).toBe(false);
  });
});

describe("createReviewAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateReviewDomain.mockResolvedValue(makeReview());
  });

  it("valid → createReviewDomain called with (uid, parsedData)", async () => {
    await createReviewAction(makeCreateInput() as any);
    expect(mockCreateReviewDomain).toHaveBeenCalledWith(
      "user-buyer-1",
      expect.objectContaining({ productId: "product-charizard-psa9", rating: 5 }),
    );
  });

  it("returns { ok: true, data: ReviewDocument }", async () => {
    const result = await createReviewAction(makeCreateInput() as any);
    expect(result.ok).toBe(true);
  });
});

describe("updateReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateReviewDomain.mockResolvedValue(makeReview());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await updateReviewAction("review-abc", { rating: 4 } as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await updateReviewAction("review-abc", { rating: 4 } as any);
    expect(result.ok).toBe(false);
  });

  it("empty reviewId → { ok: false, error: /required/i }", async () => {
    const result = await updateReviewAction("", { rating: 4 } as any);
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/required/i);
  });

  it("valid partial update → updateReviewDomain called with (uid, reviewId, parsedData)", async () => {
    await updateReviewAction("review-abc", { rating: 4 } as any);
    expect(mockUpdateReviewDomain).toHaveBeenCalledWith("user-buyer-1", "review-abc", expect.objectContaining({ rating: 4 }));
  });
});

describe("deleteReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockDeleteReviewDomain.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(deleteReviewAction("review-abc")).rejects.toThrow();
  });

  it("empty reviewId → throws ValidationError", async () => {
    await expect(deleteReviewAction("")).rejects.toThrow();
  });

  it("valid → deleteReviewDomain called with (uid, reviewId)", async () => {
    await deleteReviewAction("review-abc");
    expect(mockDeleteReviewDomain).toHaveBeenCalledWith("user-buyer-1", "review-abc");
  });
});

describe("adminUpdateReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminUpdateReviewDomain.mockResolvedValue(makeReview({ status: "approved" }));
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdateReviewAction("review-abc", { status: "approved" as any });
    expect(result.ok).toBe(false);
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdateReviewAction("review-abc", { status: "approved" as any });
    expect(result.ok).toBe(false);
  });

  it("admin role proceeds; rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await adminUpdateReviewAction("review-abc", { status: "approved" as any });
    expect(result.ok).toBe(false);
  });

  it("empty reviewId → { ok: false }", async () => {
    const result = await adminUpdateReviewAction("", { status: "approved" as any });
    expect(result.ok).toBe(false);
  });

  it("status: 'approved' → adminUpdateReviewDomain called with (adminUid, reviewId, parsedData)", async () => {
    await adminUpdateReviewAction("review-abc", { status: "approved" as any });
    expect(mockAdminUpdateReviewDomain).toHaveBeenCalledWith(
      "user-admin-1",
      "review-abc",
      expect.objectContaining({ status: "approved" }),
    );
  });

  it("NO ownership check — any review can be updated by admin", async () => {
    await adminUpdateReviewAction("review-other-store", { status: "approved" as any });
    expect(mockAdminUpdateReviewDomain).toHaveBeenCalled();
  });

  it("returns { ok: true, data: ReviewDocument }", async () => {
    const result = await adminUpdateReviewAction("review-abc", { status: "approved" as any });
    expect(result.ok).toBe(true);
  });
});

describe("adminDeleteReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockAdminDeleteReviewDomain.mockResolvedValue(undefined);
  });

  it("role 'user' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(adminDeleteReviewAction("review-abc")).rejects.toThrow();
  });

  it("empty reviewId → throws", async () => {
    await expect(adminDeleteReviewAction("")).rejects.toThrow();
  });

  it("valid → adminDeleteReviewDomain called with (adminUid, reviewId)", async () => {
    await adminDeleteReviewAction("review-abc");
    expect(mockAdminDeleteReviewDomain).toHaveBeenCalledWith("user-admin-1", "review-abc");
  });
});

describe("voteReviewHelpfulAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockVoteReviewHelpfulDomain.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(voteReviewHelpfulAction("review-abc", true)).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(voteReviewHelpfulAction("review-abc", true)).rejects.toThrow();
  });

  it("empty reviewId → throws ValidationError", async () => {
    await expect(voteReviewHelpfulAction("", true)).rejects.toThrow();
  });

  it("helpful = true → voteReviewHelpfulDomain called with (reviewId, true)", async () => {
    await voteReviewHelpfulAction("review-abc", true);
    expect(mockVoteReviewHelpfulDomain).toHaveBeenCalledWith("review-abc", true);
  });

  it("helpful = false → voteReviewHelpfulDomain called with (reviewId, false)", async () => {
    await voteReviewHelpfulAction("review-abc", false);
    expect(mockVoteReviewHelpfulDomain).toHaveBeenCalledWith("review-abc", false);
  });
});
