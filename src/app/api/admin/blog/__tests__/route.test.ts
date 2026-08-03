/**
 * Tests for GET + POST /api/admin/blog
 * GET: 5 parallel summary counts (published, drafts, featured, all, paginated).
 * POST: media finalization + publishedAt logic.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListAll,
  mockCreate,
  mockFinalizeStagedMediaObject,
  mockFinalizeStagedMediaObjectArray,
} = vi.hoisted(() => ({
  mockListAll: vi.fn(),
  mockCreate: vi.fn(),
  mockFinalizeStagedMediaObject: vi.fn(async (x: unknown) => x),
  mockFinalizeStagedMediaObjectArray: vi.fn(async (x: unknown[]) => x),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));
vi.mock("@/lib/features", () => ({
  withFeatureGuard: (_flag: string, handler: unknown) => handler,
  getFlag: () => true,
}));

vi.mock("@mohasinac/appkit", () => ({
  blogRepository: { listAll: mockListAll, create: mockCreate },
  finalizeStagedMediaObject: mockFinalizeStagedMediaObject,
  finalizeStagedMediaObjectArray: mockFinalizeStagedMediaObjectArray,
  BlogPostStatusValues: { DRAFT: "draft", PUBLISHED: "published", ARCHIVED: "archived" },
  sortBy: (field: string) => `-${field}`,
  sieveFilter: (field: string, _op: string, val: string) => `${field}==${val}`,
  SIEVE_OP: { EQ: "==" },
  BLOG_FIELDS: { STATUS: "status", IS_FEATURED: "isFeatured" },
  COMMON_FIELDS: { CREATED_AT: "createdAt" },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ERROR_MESSAGES: { VALIDATION: { REQUIRED_FIELD: "This field is required" } },
  SUCCESS_MESSAGES: { BLOG: { CREATED: "Blog post created" } },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/blog");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const pagedResult = (total: number, items: unknown[] = []) => ({
  items,
  total,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
});

const makeBlogPost = (overrides = {}) => ({
  id: "blog-pikachu-guide",
  title: "How to grade Pokemon cards",
  slug: "how-to-grade-pokemon-cards",
  status: "draft",
  isFeatured: false,
  ...overrides,
});

const validPost = {
  title: "A Great Blog Post",
  slug: "a-great-blog-post",
  excerpt: "Short summary",
  content: "Full content here",
  category: "guides" as const,
  authorId: "user-admin",
  authorName: "Admin User",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  // Default: 5 parallel listAll calls
  mockListAll.mockResolvedValue(pagedResult(0));
});

describe("GET /api/admin/blog", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer role → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("makes 5 parallel listAll calls (published, drafts, featured, all, paginated)", async () => {
    await GET(makeGetReq() as never);
    expect(mockListAll).toHaveBeenCalledTimes(5);
  });

  it("meta.published = published count from parallel count query", async () => {
    mockListAll
      .mockResolvedValueOnce(pagedResult(12)) // published count
      .mockResolvedValueOnce(pagedResult(4))  // drafts count
      .mockResolvedValueOnce(pagedResult(3))  // featured count
      .mockResolvedValueOnce(pagedResult(16)) // all count
      .mockResolvedValueOnce(pagedResult(16, [makeBlogPost()])); // paginated
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { meta: { published: number; drafts: number; featured: number; total: number } } };
    expect(json.data.meta.published).toBe(12);
    expect(json.data.meta.drafts).toBe(4);
    expect(json.data.meta.featured).toBe(3);
    expect(json.data.meta.total).toBe(16);
  });

  it("posts come from the 5th call (paginated results)", async () => {
    const post = makeBlogPost({ title: "Featured Guide" });
    mockListAll
      .mockResolvedValueOnce(pagedResult(1))  // published
      .mockResolvedValueOnce(pagedResult(0))  // drafts
      .mockResolvedValueOnce(pagedResult(1))  // featured
      .mockResolvedValueOnce(pagedResult(1))  // all
      .mockResolvedValueOnce(pagedResult(1, [post])); // paginated
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { posts: typeof post[] } };
    expect(json.data.posts).toHaveLength(1);
    expect(json.data.posts[0].title).toBe("Featured Guide");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeGetReq({ pageSize: "200" }) as never);
    // The 5th call (paginated) should use pageSize=50
    const fifthCall = mockListAll.mock.calls[4] as [{ pageSize: string }];
    expect(fifthCall[0].pageSize).toBe("50");
  });
});

describe("POST /api/admin/blog", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validPost) as never);
    expect(res.status).toBe(401);
  });

  it("missing title → 400", async () => {
    const res = await POST(makePostReq({ ...validPost, title: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("missing slug → 400", async () => {
    const res = await POST(makePostReq({ ...validPost, slug: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("invalid category → 400", async () => {
    const res = await POST(makePostReq({ ...validPost, category: "invalid-cat" }) as never);
    expect(res.status).toBe(400);
  });

  it("coverImage finalized via finalizeStagedMediaObject", async () => {
    const coverImage = { url: "https://cdn.letitrip.in/media/cover.jpg", type: "image" };
    mockCreate.mockResolvedValue({ id: "blog-new", ...validPost });
    await POST(makePostReq({ ...validPost, coverImage }) as never);
    expect(mockFinalizeStagedMediaObject).toHaveBeenCalledWith(coverImage);
  });

  it("contentImages finalized via finalizeStagedMediaObjectArray", async () => {
    const contentImages = [{ url: "https://cdn.letitrip.in/media/img1.jpg", type: "image" }];
    mockCreate.mockResolvedValue({ id: "blog-new", ...validPost });
    await POST(makePostReq({ ...validPost, contentImages }) as never);
    expect(mockFinalizeStagedMediaObjectArray).toHaveBeenCalledWith(contentImages);
  });

  it("status=published with no publishedAt → publishedAt set to current date", async () => {
    mockCreate.mockResolvedValue({ id: "blog-new", ...validPost, status: "published" });
    const before = new Date();
    await POST(makePostReq({ ...validPost, status: "published" }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { publishedAt: Date };
    expect(createArg.publishedAt).toBeInstanceOf(Date);
    expect(createArg.publishedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("explicit publishedAt string → converted to Date and used", async () => {
    mockCreate.mockResolvedValue({ id: "blog-new", ...validPost });
    await POST(makePostReq({ ...validPost, publishedAt: "2026-01-01T00:00:00Z" }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { publishedAt: Date };
    expect(createArg.publishedAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("status=draft → publishedAt undefined (not set)", async () => {
    mockCreate.mockResolvedValue({ id: "blog-new", ...validPost });
    await POST(makePostReq({ ...validPost, status: "draft" }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { publishedAt: Date | undefined };
    expect(createArg.publishedAt).toBeUndefined();
  });

  it("authorId from body used when provided", async () => {
    mockCreate.mockResolvedValue({ id: "blog-new", ...validPost });
    await POST(makePostReq({ ...validPost, authorId: "user-ravi" }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { authorId: string };
    expect(createArg.authorId).toBe("user-ravi");
  });

  it("missing authorId → 400 (required field, schema enforces min(1))", async () => {
    // The handler has `|| user?.uid` fallback but schema requires authorId.min(1),
    // so empty/missing authorId is rejected before the handler runs.
    const res = await POST(makePostReq({ ...validPost, authorId: "" }) as never);
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("success → 200 with created post", async () => {
    const newPost = { id: "blog-new", title: validPost.title };
    mockCreate.mockResolvedValue(newPost);
    const res = await POST(makePostReq(validPost) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: typeof newPost };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("blog-new");
  });
});
