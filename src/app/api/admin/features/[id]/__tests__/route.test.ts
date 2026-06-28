/**
 * Tests for GET/PUT/DELETE /api/admin/features/[id]
 *
 * GET: ROLES_ADMIN_MOD — findById; 404 via ERROR_MESSAGES
 * PUT: ROLES_ADMIN_ONLY — findById guard; productFeatureUpdateSchema; update(id, body)
 * DELETE: ROLES_ADMIN_ONLY — findById guard; delete(id); errors on delete → 409
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
  productFeaturesRepository: {
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
  },
  productFeatureUpdateSchema: {
    safeParse: (body: unknown) => {
      const b = body as Record<string, unknown>;
      if (b && typeof b === "object") return { success: true, data: b };
      return { success: false, error: { format: () => ({}) } };
    },
  },
  normalizeError: vi.fn(),
  ERROR_MESSAGES: {
    PRODUCT_FEATURES: {
      NOT_FOUND: "Feature not found",
      DELETE_FAILED: "Feature deletion failed",
    },
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
    handler: (ctx: { params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
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
      return opts.handler({ params, user: _user ?? undefined, body });
    };
  },
}));

import { GET, PUT, DELETE } from "../route";

const featureDoc = { id: "feature-free-shipping", name: "Free Shipping", scope: "platform", isActive: true };
const routeParams = { params: { id: "feature-free-shipping" } };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(featureDoc);
  mockUpdate.mockResolvedValue({ ...featureDoc, name: "Updated" });
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/features/[id]", () => {
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

  it("feature not found → 404 with ERROR_MESSAGES.NOT_FOUND", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Feature not found");
  });

  it("found → 200 with feature data", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("feature-free-shipping");
  });
});

describe("PUT /api/admin/features/[id]", () => {
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

  it("feature not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PUT(makeRequest({ name: "X" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("calls update with id and body", async () => {
    await PUT(makeRequest({ name: "Updated", isActive: false }), routeParams as never);
    expect(mockUpdate).toHaveBeenCalledWith(
      "feature-free-shipping",
      expect.objectContaining({ name: "Updated", isActive: false }),
    );
  });

  it("success → 200 with 'Feature updated' message", async () => {
    const res = await PUT(makeRequest({ name: "Updated" }), routeParams as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Feature updated");
  });
});

describe("DELETE /api/admin/features/[id]", () => {
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

  it("feature not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("delete() throws (feature in use) → 409 with error message", async () => {
    mockDelete.mockRejectedValue(new Error("Feature is still in use by 3 products"));
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(409);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Feature is still in use by 3 products");
  });

  it("delete() throws non-Error → 409 with default message", async () => {
    mockDelete.mockRejectedValue("unknown");
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(409);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Feature deletion failed");
  });

  it("success → 200 with 'Feature deleted' and null data", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Feature deleted");
    expect(json.data).toBeNull();
  });
});
