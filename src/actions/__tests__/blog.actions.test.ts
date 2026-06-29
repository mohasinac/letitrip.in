import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockCreateBlogPost,
  mockUpdateBlogPost,
  mockDeleteBlogPost,
  mockGetBlogPostById,
  mockGetFeaturedBlogPosts,
  mockListBlogPosts,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCreateBlogPost: vi.fn(),
  mockUpdateBlogPost: vi.fn(),
  mockDeleteBlogPost: vi.fn(),
  mockGetBlogPostById: vi.fn(),
  mockGetFeaturedBlogPosts: vi.fn(),
  mockListBlogPosts: vi.fn(),
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
  requireRoleUser: mockRequireRoleUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  NotFoundError: class NotFoundError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  createBlogPost: mockCreateBlogPost,
  updateBlogPost: mockUpdateBlogPost,
  deleteBlogPost: mockDeleteBlogPost,
  getBlogPostById: mockGetBlogPostById,
  listBlogPosts: mockListBlogPosts,
  getFeaturedBlogPosts: mockGetFeaturedBlogPosts,
  getLatestBlogPosts: vi.fn().mockResolvedValue([]),
  getBlogPostBySlug: vi.fn().mockResolvedValue(null),
  createBlogPostSchema: { safeParse: (x: unknown) => ({ success: true, data: x }) },
  updateBlogPostSchema: { safeParse: (x: unknown) => ({ success: true, data: x }) },
}));

import {
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
  getFeaturedBlogPostsAction,
  listBlogPostsAction,
} from "../blog.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return {
    uid: "user-admin-1",
    email: "admin@letitrip.in",
    name: "Admin User",
    picture: "/avatar-admin.jpg",
    role: "admin",
    ...overrides,
  };
}

function makeBlogPost(overrides: Record<string, unknown> = {}) {
  return {
    id: "blog-how-to-grade-pokemon-cards",
    title: "How to Grade Pokemon Cards",
    slug: "how-to-grade-pokemon-cards",
    status: "draft",
    ...overrides,
  };
}

function makeCreateInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "How to Grade Pokemon Cards",
    content: "This is the blog post content.",
    category: "guides",
    ...overrides,
  };
}

describe("createBlogPostAction — auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateBlogPost.mockResolvedValue(makeBlogPost());
  });

  it("role 'user' (not admin/moderator) → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createBlogPostAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createBlogPostAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createBlogPostAction(makeCreateInput() as any);
    expect(result.ok).toBe(false);
  });
});

describe("createBlogPostAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin({ uid: "user-admin-1", name: "Admin User", email: "admin@letitrip.in" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateBlogPost.mockResolvedValue(makeBlogPost());
  });

  it("valid → createBlogPost called with (parsedData, { uid, name, email, picture })", async () => {
    await createBlogPostAction(makeCreateInput() as any);
    expect(mockCreateBlogPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: "How to Grade Pokemon Cards" }),
      expect.objectContaining({ uid: "user-admin-1", name: "Admin User", email: "admin@letitrip.in" }),
    );
  });

  it("actor info uses admin.name when present", async () => {
    await createBlogPostAction(makeCreateInput() as any);
    const actorArg = mockCreateBlogPost.mock.calls[0][1];
    expect(actorArg.name).toBe("Admin User");
  });

  it("actor info uses admin.email when present", async () => {
    await createBlogPostAction(makeCreateInput() as any);
    const actorArg = mockCreateBlogPost.mock.calls[0][1];
    expect(actorArg.email).toBe("admin@letitrip.in");
  });

  it("returns { ok: true, data: BlogPostDocument }", async () => {
    const result = await createBlogPostAction(makeCreateInput() as any);
    expect(result.ok).toBe(true);
  });
});

describe("updateBlogPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetBlogPostById.mockResolvedValue(makeBlogPost());
    mockUpdateBlogPost.mockResolvedValue(makeBlogPost({ title: "Updated Title" }));
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await updateBlogPostAction("blog-abc", { title: "Updated" } as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await updateBlogPostAction("blog-abc", { title: "Updated" } as any);
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await updateBlogPostAction("", { title: "Updated" } as any);
    expect(result.ok).toBe(false);
  });

  it("post not found (getBlogPostById returns null) → { ok: false, error: /not found/i }", async () => {
    mockGetBlogPostById.mockResolvedValue(null);
    const result = await updateBlogPostAction("blog-missing", { title: "Updated" } as any);
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/not found/i);
  });

  it("valid → updateBlogPost called with (id, parsedData)", async () => {
    await updateBlogPostAction("blog-abc", { title: "Updated Title" } as any);
    expect(mockUpdateBlogPost).toHaveBeenCalledWith("blog-abc", expect.objectContaining({ title: "Updated Title" }));
  });

  it("returns { ok: true, data: BlogPostDocument }", async () => {
    const result = await updateBlogPostAction("blog-abc", { title: "Updated Title" } as any);
    expect(result.ok).toBe(true);
  });
});

describe("deleteBlogPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetBlogPostById.mockResolvedValue(makeBlogPost());
    mockDeleteBlogPost.mockResolvedValue(undefined);
  });

  it("role 'user' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteBlogPostAction("blog-abc")).rejects.toThrow();
  });

  it("empty id → throws", async () => {
    await expect(deleteBlogPostAction("")).rejects.toThrow();
  });

  it("post not found → throws NotFoundError", async () => {
    mockGetBlogPostById.mockResolvedValue(null);
    await expect(deleteBlogPostAction("blog-missing")).rejects.toThrow(/not found/i);
  });

  it("valid → deleteBlogPost called with id", async () => {
    await deleteBlogPostAction("blog-abc");
    expect(mockDeleteBlogPost).toHaveBeenCalledWith("blog-abc");
  });
});

describe("getFeaturedBlogPostsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFeaturedBlogPosts.mockResolvedValue([makeBlogPost()]);
  });

  it("count defaults to 3; getFeaturedBlogPosts(3) called", async () => {
    await getFeaturedBlogPostsAction();
    expect(mockGetFeaturedBlogPosts).toHaveBeenCalledWith(3);
  });

  it("count = 5 → getFeaturedBlogPosts(5) called", async () => {
    await getFeaturedBlogPostsAction(5);
    expect(mockGetFeaturedBlogPosts).toHaveBeenCalledWith(5);
  });
});

describe("listBlogPostsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListBlogPosts.mockResolvedValue({ items: [], total: 0 });
  });

  it("no auth required; calls through to listBlogPosts(params)", async () => {
    await listBlogPostsAction({ category: "guides" });
    expect(mockListBlogPosts).toHaveBeenCalledWith(expect.objectContaining({ category: "guides" }));
  });
});
