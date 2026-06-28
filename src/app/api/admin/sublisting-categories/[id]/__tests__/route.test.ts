/**
 * Tests for GET/PUT/DELETE /api/admin/sublisting-categories/[id]
 *
 * GET: ROLES_ADMIN_MOD — findById; 404 if not found or categoryType !== "sublisting"
 * PUT: ROLES_ADMIN_ONLY — updateSchema (name, itemCode, description, coverImage); 404 guard same as GET
 *   coverImage → stored as display.coverImage (merged with existing display)
 * DELETE: ROLES_ADMIN_ONLY — same 404 guard; deleteWithSublistingUnlink(id)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUpdate, mockDeleteWithUnlink } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
  mockDeleteWithUnlink: vi.fn(),
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
    deleteWithSublistingUnlink: mockDeleteWithUnlink,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
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

const sublistingDoc = {
  id: "sublisting-base-set",
  name: "Base Set",
  categoryType: "sublisting",
  display: { coverImage: "/media/base-set.jpg" },
};

const routeParams = { params: Promise.resolve({ id: "sublisting-base-set" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(sublistingDoc);
  mockUpdate.mockResolvedValue(undefined);
  mockDeleteWithUnlink.mockResolvedValue(undefined);
});

describe("GET /api/admin/sublisting-categories/[id]", () => {
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
    expect(json.error).toBe("Sublisting category not found.");
  });

  it("found but categoryType !== 'sublisting' → 404", async () => {
    mockFindById.mockResolvedValue({ ...sublistingDoc, categoryType: "bundle" });
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
  });

  it("found sublisting → 200 with doc", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("sublisting-base-set");
  });
});

describe("PUT /api/admin/sublisting-categories/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PUT(makeRequest({ name: "X" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("wrong categoryType → 404", async () => {
    mockFindById.mockResolvedValue({ ...sublistingDoc, categoryType: "category" });
    const res = await PUT(makeRequest({ name: "X" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("name > 120 chars → 400 (schema)", async () => {
    const res = await PUT(makeRequest({ name: "A".repeat(121) }), routeParams as never);
    expect(res.status).toBe(400);
  });

  it("coverImage → stored in display.coverImage merged with existing", async () => {
    mockFindById
      .mockResolvedValueOnce(sublistingDoc) // guard
      .mockResolvedValueOnce({ ...sublistingDoc, display: { coverImage: "/new.jpg" } }); // re-fetch
    await PUT(makeRequest({ coverImage: "/media/new-cover.jpg" }), routeParams as never);
    const updateArg = mockUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect((updateArg.display as { coverImage: string }).coverImage).toBe("/media/new-cover.jpg");
  });

  it("update call sets updatedAt", async () => {
    await PUT(makeRequest({ name: "Updated Name" }), routeParams as never);
    const updateArg = mockUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(updateArg.updatedAt).toBeInstanceOf(Date);
  });

  it("success → 200 with 'Sub-listing category updated'", async () => {
    mockFindById.mockResolvedValue(sublistingDoc); // both calls
    const res = await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Sub-listing category updated");
  });
});

describe("DELETE /api/admin/sublisting-categories/[id]", () => {
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

  it("not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("wrong categoryType → 404", async () => {
    mockFindById.mockResolvedValue({ ...sublistingDoc, categoryType: "bundle" });
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("calls deleteWithSublistingUnlink (not plain delete)", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(mockDeleteWithUnlink).toHaveBeenCalledWith("sublisting-base-set");
  });

  it("success → 200 with 'Sub-listing category deleted' and null data", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Sub-listing category deleted");
    expect(json.data).toBeNull();
  });
});
