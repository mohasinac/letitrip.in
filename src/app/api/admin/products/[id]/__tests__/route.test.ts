/**
 * Tests for GET / PATCH / DELETE /api/admin/products/[id]
 *
 * GET: ROLES_ADMIN_MOD — productRepository.findByIdOrSlug(id).catch(() => null) → 404 if null
 * PATCH: ROLES_ADMIN_MOD — adminUpdateProduct(user.uid, id, body) — passes uid
 * DELETE: ROLES_ADMIN_ONLY — adminDeleteProduct(user.uid, id) — passes uid
 *
 * BUSINESS NOTE: GET uses findByIdOrSlug so [id] can be either a Firestore ID or a slug.
 * findByIdOrSlug errors are silenced via .catch(() => null).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindByIdOrSlug,
  mockAdminUpdateProduct,
  mockAdminDeleteProduct,
} = vi.hoisted(() => ({
  mockFindByIdOrSlug: vi.fn(),
  mockAdminUpdateProduct: vi.fn(),
  mockAdminDeleteProduct: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  productRepository: { findByIdOrSlug: mockFindByIdOrSlug },
  adminUpdateProduct: mockAdminUpdateProduct,
  adminDeleteProduct: mockAdminDeleteProduct,
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
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

import { GET, PATCH, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "product-charizard-psa9" }) };

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/products/product-charizard-psa9", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockProduct = {
  id: "product-charizard-psa9",
  title: "Charizard PSA 9",
  status: "published",
  storeId: "store-pokemon-palace",
  listingType: "standard",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindByIdOrSlug.mockResolvedValue(mockProduct);
  mockAdminUpdateProduct.mockResolvedValue({ ...mockProduct, status: "suspended" });
  mockAdminDeleteProduct.mockResolvedValue(undefined);
});

describe("GET /api/admin/products/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (ROLES_ADMIN_MOD only)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (allowed in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("product not found → 404", async () => {
    mockFindByIdOrSlug.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("findByIdOrSlug throws → silenced to null → 404", async () => {
    mockFindByIdOrSlug.mockRejectedValue(new Error("Firestore error"));
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("found product → 200 with data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockProduct };
    expect(json.data.id).toBe("product-charizard-psa9");
  });

  it("fetches by the params id (supports slugs)", async () => {
    await GET(makeRequest("GET") as never, params as never);
    expect(mockFindByIdOrSlug).toHaveBeenCalledWith("product-charizard-psa9");
  });
});

describe("PATCH /api/admin/products/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { status: "suspended" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator is allowed (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest("PATCH", { status: "published" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("invalid price (negative) → 400", async () => {
    const res = await PATCH(makeRequest("PATCH", { price: -1 }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("calls adminUpdateProduct with user.uid, id, body", async () => {
    await PATCH(makeRequest("PATCH", { status: "suspended", isFeatured: true }) as never, params as never);
    expect(mockAdminUpdateProduct).toHaveBeenCalledWith(
      "admin-uid",
      "product-charizard-psa9",
      expect.objectContaining({ status: "suspended", isFeatured: true }),
    );
  });

  it("passthrough: unknown fields preserved in body (schema uses .passthrough())", async () => {
    await PATCH(makeRequest("PATCH", { customField: "value" }) as never, params as never);
    expect(mockAdminUpdateProduct).toHaveBeenCalledWith(
      "admin-uid",
      "product-charizard-psa9",
      expect.objectContaining({ customField: "value" }),
    );
  });

  it("success → 200 with updated product", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "suspended" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toContain("updated");
  });
});

describe("DELETE /api/admin/products/[id]", () => {
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

  it("calls adminDeleteProduct with user.uid and id", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockAdminDeleteProduct).toHaveBeenCalledWith("admin-uid", "product-charizard-psa9");
  });

  it("success → 200 with null data and deleted message", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: null; message: string };
    expect(json.data).toBeNull();
    expect(json.message).toContain("deleted");
  });
});
