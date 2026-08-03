/**
 * Tests for GET/PATCH/DELETE /api/admin/blog/[id]
 * GET: finds by slug; 404 if not found.
 * PATCH: media finalization; publishedAt auto-set on publish.
 * DELETE: removes post.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindBySlug,
  mockUpdate,
  mockDelete,
  mockFinalizeStagedMediaObject,
  mockFinalizeStagedMediaObjectArray,
} = vi.hoisted(() => ({
  mockFindBySlug: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
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
  blogRepository: { findBySlug: mockFindBySlug, update: mockUpdate, delete: mockDelete },
  finalizeStagedMediaObject: mockFinalizeStagedMediaObject,
  finalizeStagedMediaObjectArray: mockFinalizeStagedMediaObjectArray,
  BlogPostStatusValues: { DRAFT: "draft", PUBLISHED: "published", ARCHIVED: "archived" },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
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
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const makeReq = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/blog/blog-pikachu", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockPost = {
  id: "blog-pikachu-guide",
  title: "How to Grade Pokemon Cards",
  slug: "blog-pikachu",
  status: "draft",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindBySlug.mockResolvedValue(mockPost);
  mockUpdate.mockResolvedValue({ ...mockPost, title: "Updated Title" });
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/blog/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(401);
  });

  it("non-existent slug → 404", async () => {
    mockFindBySlug.mockResolvedValue(null);
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "blog-nonexistent" }) });
    expect(res.status).toBe(404);
  });

  it("findBySlug throws → 404 (caught by .catch(() => null))", async () => {
    mockFindBySlug.mockRejectedValue(new Error("NOT_FOUND"));
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(404);
  });

  it("existing post → 200 with post data", async () => {
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockPost };
    expect(json.data.id).toBe("blog-pikachu-guide");
  });
});

describe("PATCH /api/admin/blog/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeReq("PATCH", { title: "New Title" }) as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(401);
  });

  it("partial update (title only) → update called with title", async () => {
    await PATCH(makeReq("PATCH", { title: "New Title" }) as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(mockUpdate).toHaveBeenCalledWith(
      "blog-pikachu",
      expect.objectContaining({ title: "New Title" }),
    );
  });

  it("coverImage provided → finalized via finalizeStagedMediaObject", async () => {
    const coverImage = { url: "https://cdn.letitrip.in/media/cover.jpg", type: "image" };
    await PATCH(makeReq("PATCH", { coverImage }) as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(mockFinalizeStagedMediaObject).toHaveBeenCalledWith(coverImage);
  });

  it("coverImage absent → finalizeStagedMediaObject NOT called", async () => {
    await PATCH(makeReq("PATCH", { title: "New Title" }) as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(mockFinalizeStagedMediaObject).not.toHaveBeenCalled();
  });

  it("status=published without publishedAt → publishedAt auto-set to now", async () => {
    const before = new Date();
    await PATCH(makeReq("PATCH", { status: "published" }) as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    const updateArg = mockUpdate.mock.calls[0][1] as { publishedAt: Date };
    expect(updateArg.publishedAt).toBeInstanceOf(Date);
    expect(updateArg.publishedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("explicit publishedAt → converted to Date", async () => {
    await PATCH(makeReq("PATCH", { publishedAt: "2026-06-01T12:00:00Z" }) as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    const updateArg = mockUpdate.mock.calls[0][1] as { publishedAt: Date };
    expect(updateArg.publishedAt.toISOString()).toBe("2026-06-01T12:00:00.000Z");
  });

  it("success → 200 with updated post", async () => {
    const res = await PATCH(makeReq("PATCH", { title: "Updated" }) as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/admin/blog/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(401);
  });

  it("buyer role → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(403);
  });

  it("deletes post by id", async () => {
    await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(mockDelete).toHaveBeenCalledWith("blog-pikachu");
  });

  it("success → 200", async () => {
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ id: "blog-pikachu" }) });
    expect(res.status).toBe(200);
  });
});
