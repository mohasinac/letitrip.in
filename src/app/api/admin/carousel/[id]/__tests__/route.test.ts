/**
 * Tests for GET/PUT/DELETE /api/admin/carousel/[id]
 * GET: Requires ROLES_ADMIN_MOD. 404 for non-existent.
 * PUT: Requires ROLES_ADMIN_ONLY. 404 if slide missing before update.
 * DELETE: Requires ROLES_ADMIN_ONLY. 404 if slide missing before delete.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCarouselFindById,
  mockCarouselUpdate,
  mockCarouselDelete,
} = vi.hoisted(() => ({
  mockCarouselFindById: vi.fn(),
  mockCarouselUpdate: vi.fn(),
  mockCarouselDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  carouselRepository: {
    findById: mockCarouselFindById,
    update: mockCarouselUpdate,
    delete: mockCarouselDelete,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
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

import { GET, PUT, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "slide-hero" }) };
const mockSlide = { id: "slide-hero", title: "Hero Slide", active: true };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCarouselFindById.mockResolvedValue(mockSlide);
  mockCarouselUpdate.mockResolvedValue({ ...mockSlide, title: "Updated" });
  mockCarouselDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/carousel/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET({} as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET({} as never, params as never);
    expect(res.status).toBe(200);
  });

  it("slide not found → 404", async () => {
    mockCarouselFindById.mockResolvedValue(null);
    const res = await GET({} as never, params as never);
    expect(res.status).toBe(404);
  });

  it("slide found → 200 with slide data", async () => {
    const res = await GET({} as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("slide-hero");
  });
});

describe("PUT /api/admin/carousel/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(new Request("http://localhost", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY for write)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(new Request("http://localhost", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("slide not found → 404 before update", async () => {
    mockCarouselFindById.mockResolvedValue(null);
    const res = await PUT(new Request("http://localhost", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    }) as never, params as never);
    expect(res.status).toBe(404);
    expect(mockCarouselUpdate).not.toHaveBeenCalled();
  });

  it("success → 200 with updated slide", async () => {
    const res = await PUT(new Request("http://localhost", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Title" }),
    }) as never, params as never);
    expect(res.status).toBe(200);
    expect(mockCarouselUpdate).toHaveBeenCalledWith("slide-hero", expect.any(Object));
  });
});

describe("DELETE /api/admin/carousel/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE({} as never, params as never);
    expect(res.status).toBe(401);
  });

  it("slide not found → 404 before delete", async () => {
    mockCarouselFindById.mockResolvedValue(null);
    const res = await DELETE({} as never, params as never);
    expect(res.status).toBe(404);
    expect(mockCarouselDelete).not.toHaveBeenCalled();
  });

  it("success → 200", async () => {
    const res = await DELETE({} as never, params as never);
    expect(res.status).toBe(200);
    expect(mockCarouselDelete).toHaveBeenCalledWith("slide-hero");
  });
});
