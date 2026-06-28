/**
 * Tests for GET/POST /api/admin/features
 *
 * GET: ROLES_ADMIN_MOD — productFeaturesRepository.listFiltered({ scope, storeId, isActive })
 *   → { items, total: items.length }
 *   isActive: param "true" → true, "false" → false, absent → undefined
 *
 * POST: ROLES_ADMIN_ONLY — productFeaturesRepository.create(body)
 *   Errors from create() → 400
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListFiltered, mockCreate } = vi.hoisted(() => ({
  mockListFiltered: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  productFeaturesRepository: { listFiltered: mockListFiltered, create: mockCreate },
  productFeatureAdminCreateSchema: {
    safeParse: (body: unknown) => {
      const b = body as Record<string, unknown>;
      if (!b?.name) return { success: false, error: { format: () => ({}) } };
      return { success: true, data: b };
    },
  },
  normalizeError: vi.fn(),
  ERROR_MESSAGES: { PRODUCT_FEATURES: { CREATE_FAILED: "Feature creation failed" } },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
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
      return opts.handler({ request, user: _user ?? undefined, body });
    };
  },
}));

import { GET, POST } from "../route";

const mockFeatures = [
  { id: "feature-free-shipping", name: "Free Shipping", scope: "platform", isActive: true },
  { id: "feature-fragile", name: "Fragile", scope: "store", storeId: "store-pokemon-palace", isActive: false },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListFiltered.mockResolvedValue(mockFeatures);
  mockCreate.mockResolvedValue({ id: "feature-new", name: "New Feature" });
});

describe("GET /api/admin/features", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/features") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/features") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/features") as never);
    expect(res.status).toBe(200);
  });

  it("no params → listFiltered called with all undefined", async () => {
    await GET(new Request("http://localhost/api/admin/features") as never);
    expect(mockListFiltered).toHaveBeenCalledWith({
      scope: undefined,
      storeId: undefined,
      isActive: undefined,
    });
  });

  it("scope=platform → passed to listFiltered", async () => {
    await GET(new Request("http://localhost/api/admin/features?scope=platform") as never);
    expect(mockListFiltered).toHaveBeenCalledWith(expect.objectContaining({ scope: "platform" }));
  });

  it("storeId param → passed to listFiltered", async () => {
    await GET(new Request("http://localhost/api/admin/features?storeId=store-pokemon-palace") as never);
    expect(mockListFiltered).toHaveBeenCalledWith(expect.objectContaining({ storeId: "store-pokemon-palace" }));
  });

  it("isActive=true → boolean true passed to listFiltered", async () => {
    await GET(new Request("http://localhost/api/admin/features?isActive=true") as never);
    expect(mockListFiltered).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }));
  });

  it("isActive=false → boolean false passed to listFiltered", async () => {
    await GET(new Request("http://localhost/api/admin/features?isActive=false") as never);
    expect(mockListFiltered).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
  });

  it("returns { items, total: items.length }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/features") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });
});

describe("POST /api/admin/features", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost/api/admin/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ name: "New Feature" }));
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeRequest({ name: "New Feature" }));
    expect(res.status).toBe(403);
  });

  it("missing name → 400 (schema validation)", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("create() throws → 400 with error message", async () => {
    mockCreate.mockRejectedValue(new Error("At capacity limit"));
    const res = await POST(makeRequest({ name: "Too Many" }));
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("At capacity limit");
  });

  it("create() throws non-Error → 400 with default message", async () => {
    mockCreate.mockRejectedValue("unknown");
    const res = await POST(makeRequest({ name: "Bad Thing" }));
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Feature creation failed");
  });

  it("success → 200 with 'Feature created' message and doc", async () => {
    const res = await POST(makeRequest({ name: "Free Shipping" }));
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string; data: { id: string } };
    expect(json.message).toBe("Feature created");
    expect(json.data.id).toBe("feature-new");
  });
});
