/**
 * Tests for GET / PUT / DELETE /api/admin/brands/[id]
 *
 * GET: ROLES_ADMIN_MOD — categoriesRepository.findById(id), checks categoryType !== "brand" → 404
 * PUT: ROLES_ADMIN_ONLY — updateBrandAction(id, body)
 * DELETE: ROLES_ADMIN_ONLY — deleteBrandAction(id)
 *
 * BUSINESS RULE: brands live in the categories collection.
 * A doc with categoryType !== "brand" returns 404 even if it exists.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCategoriesFindById,
  mockUpdateBrandAction,
  mockDeleteBrandAction,
} = vi.hoisted(() => ({
  mockCategoriesFindById: vi.fn(),
  mockUpdateBrandAction: vi.fn(),
  mockDeleteBrandAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  categoriesRepository: { findById: mockCategoriesFindById },
  updateBrandAction: mockUpdateBrandAction,
  deleteBrandAction: mockDeleteBrandAction,
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { format: () => unknown } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PUT, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "brand-hot-wheels" }) };

const makeRequest = (method: string, body?: unknown) =>
  new Request(`http://localhost/api/admin/brands/brand-hot-wheels`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockBrand = {
  id: "brand-hot-wheels",
  categoryType: "brand",
  name: "Hot Wheels",
  isActive: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCategoriesFindById.mockResolvedValue(mockBrand);
  mockUpdateBrandAction.mockResolvedValue({ ...mockBrand, name: "Hot Wheels Updated" });
  mockDeleteBrandAction.mockResolvedValue(undefined);
});

describe("GET /api/admin/brands/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator is allowed (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("brand not found → 404", async () => {
    mockCategoriesFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("doc found but categoryType !== 'brand' → 404 (cross-type guard)", async () => {
    mockCategoriesFindById.mockResolvedValue({ ...mockBrand, categoryType: "category" });
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("found brand → 200 with brand data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockBrand };
    expect(json.data.id).toBe("brand-hot-wheels");
  });

  it("fetches by the params id", async () => {
    await GET(makeRequest("GET") as never, params as never);
    expect(mockCategoriesFindById).toHaveBeenCalledWith("brand-hot-wheels");
  });
});

describe("PUT /api/admin/brands/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest("PUT", { name: "New Name" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest("PUT", { name: "New Name" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("invalid website URL → 400", async () => {
    const res = await PUT(makeRequest("PUT", { website: "not-a-url" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("website empty string → allowed (literal('') or())", async () => {
    const res = await PUT(makeRequest("PUT", { website: "" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("calls updateBrandAction with id and body", async () => {
    await PUT(makeRequest("PUT", { name: "Wheels of Fire", isActive: false }) as never, params as never);
    expect(mockUpdateBrandAction).toHaveBeenCalledWith(
      "brand-hot-wheels",
      expect.objectContaining({ name: "Wheels of Fire", isActive: false }),
    );
  });

  it("success → 200 with updated brand", async () => {
    const res = await PUT(makeRequest("PUT", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toContain("updated");
  });
});

describe("DELETE /api/admin/brands/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("calls deleteBrandAction with id", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockDeleteBrandAction).toHaveBeenCalledWith("brand-hot-wheels");
  });

  it("success → 200 with null data and deleted message", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: null; message: string };
    expect(json.data).toBeNull();
    expect(json.message).toContain("deleted");
  });
});
