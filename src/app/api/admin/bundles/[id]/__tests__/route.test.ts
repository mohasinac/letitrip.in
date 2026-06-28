/**
 * Tests for GET/PUT/DELETE /api/admin/bundles/[id]
 *
 * All verbs use loadBundleOrFail:
 *   - findById returns null → 404
 *   - categoryType !== "bundle" → 404 (not a bundle)
 *
 * GET: ROLES_ADMIN_MOD
 * PUT: ROLES_ADMIN_MOD — calls update(id, body), re-fetches with findById, returns updated
 * DELETE: ROLES_ADMIN_ONLY — calls categoriesRepository.delete(id)
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
  bundleUpdateSchema: {
    safeParse: (body: unknown) => {
      const b = body as Record<string, unknown>;
      if (b && typeof b === "object") return { success: true, data: b };
      return { success: false, error: { format: () => ({}) } };
    },
  },
  serverLogger: { info: vi.fn() },
  ApiErrors: {
    badRequest: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
    notFound: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: B | undefined;
      if (opts.schema) {
        let raw: unknown = {};
        try { raw = await request.json(); } catch { /* empty */ }
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = parsed.data;
      }
      return opts.handler({ request, params, user: _user ?? undefined, body });
    };
  },
}));

import { GET, PUT, DELETE } from "../route";

const bundleDoc = {
  id: "bundle-pokemon-starter",
  name: "Pokemon Starter Bundle",
  categoryType: "bundle",
  isActive: true,
  bundleStockStatus: "in_stock",
};

const routeParams = { params: Promise.resolve({ id: "bundle-pokemon-starter" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(bundleDoc);
  mockUpdate.mockResolvedValue(undefined);
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/bundles/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(200);
  });

  it("not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Bundle not found.");
  });

  it("exists but categoryType != 'bundle' → 404 (guard rejects non-bundles)", async () => {
    mockFindById.mockResolvedValue({ ...bundleDoc, categoryType: "category" });
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
  });

  it("found bundle → 200 with bundle data", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("bundle-pokemon-starter");
  });
});

describe("PUT /api/admin/bundles/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest({ name: "Updated Bundle" }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD allows PUT)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("bundle not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PUT(makeRequest({ name: "X" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("non-bundle categoryType → 404", async () => {
    mockFindById.mockResolvedValue({ ...bundleDoc, categoryType: "sublisting" });
    const res = await PUT(makeRequest({ name: "X" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("calls update with id and body, then re-fetches", async () => {
    mockFindById
      .mockResolvedValueOnce(bundleDoc) // loadBundleOrFail
      .mockResolvedValueOnce({ ...bundleDoc, name: "Updated" }); // re-fetch
    await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    expect(mockUpdate).toHaveBeenCalledWith("bundle-pokemon-starter", expect.any(Object));
    expect(mockFindById).toHaveBeenCalledTimes(2);
  });

  it("success → 200 with 'Bundle updated' message", async () => {
    const res = await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Bundle updated");
  });
});

describe("DELETE /api/admin/bundles/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(403);
  });

  it("bundle not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("non-bundle categoryType → 404", async () => {
    mockFindById.mockResolvedValue({ ...bundleDoc, categoryType: "category" });
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("calls delete with the bundle id", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(mockDelete).toHaveBeenCalledWith("bundle-pokemon-starter");
  });

  it("success → 200 with 'Bundle deleted' and null data", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Bundle deleted");
    expect(json.data).toBeNull();
  });
});
