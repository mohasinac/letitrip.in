/**
 * Tests for GET/PUT/DELETE /api/admin/categories/[id]
 * GET:    ROLES_ADMIN_MOD + admin:categories:read. 404 for missing.
 * PUT:    ROLES_ADMIN_ONLY + admin:categories:write. 404 guard. Partial update.
 *         Adds updatedAt timestamp.
 * DELETE: ROLES_ADMIN_ONLY + admin:categories:delete. 404 guard.
 *         Non-leaf category (isLeaf: false) → 409 (has subcategories).
 *         Leaf category (isLeaf: true) → 200.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  categoriesRepository: {
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
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
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PUT, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "category-action-figures" }) };
const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/categories/category-action-figures", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

const mockLeafCategory = {
  id: "category-action-figures",
  name: "Action Figures",
  tier: 2,
  isLeaf: true,
  isActive: true,
};
const mockNonLeafCategory = {
  id: "category-root",
  name: "Root",
  tier: 1,
  isLeaf: false,
  isActive: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockLeafCategory);
  mockUpdate.mockResolvedValue({ ...mockLeafCategory, name: "Updated" });
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/categories/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("category not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("returns category data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("category-action-figures");
  });
});

describe("PUT /api/admin/categories/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest("PUT", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY for PUT)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest("PUT", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("category not found → 404 before update", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(404);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates only provided fields", async () => {
    await PUT(makeRequest("PUT", { isActive: false }) as never, params as never);
    expect(mockUpdate).toHaveBeenCalledWith(
      "category-action-figures",
      expect.objectContaining({ isActive: false }),
    );
  });

  it("adds updatedAt timestamp to update", async () => {
    await PUT(makeRequest("PUT", { name: "Updated" }) as never, params as never);
    const updateArg = mockUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(updateArg.updatedAt).toBeDefined();
  });

  it("success → 200", async () => {
    const res = await PUT(makeRequest("PUT", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("display.showInMenu accepted as nested update", async () => {
    await PUT(makeRequest("PUT", { display: { showInMenu: false } }) as never, params as never);
    const updateArg = mockUpdate.mock.calls[0][1] as Record<string, { showInMenu: boolean }>;
    expect(updateArg.display?.showInMenu).toBe(false);
  });
});

describe("DELETE /api/admin/categories/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY for delete)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("category not found → 404 before delete", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("non-leaf category (has children) → 409", async () => {
    mockFindById.mockResolvedValue(mockNonLeafCategory);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(409);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("409 message explains children must be removed first", async () => {
    mockFindById.mockResolvedValue(mockNonLeafCategory);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("children");
  });

  it("leaf category → deleted successfully", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith("category-action-figures");
  });
});
