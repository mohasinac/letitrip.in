/**
 * Tests for GET /api/admin/bundles and POST /api/admin/bundles
 *
 * Bundles are `categoryType:"bundle"` rows in the categories collection.
 * GET: ROLES_ADMIN_MOD, permission: admin:categories:read
 *   - uses categoriesRepository.listByType("bundle") — loads up to MAX_LIST_LIMIT (200)
 *   - in-memory filter: q (name/slug), isActive, bundleStockStatus
 *   - in-memory sort: bundlePriceInPaise, name, createdAt; prefix "-" = descending
 *   - paginated: pageSize [1,50] default 25; returns { items, total }
 *
 * POST: ROLES_ADMIN_MOD, permission: admin:categories:write
 *   - slug prefix: must start with "bundle-" (auto-prefixed if missing)
 *   - id === slug
 *   - duplicate id (existing doc) → 400 "Bundle already exists"
 *   - success → 201, fetches and returns created doc
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListByType,
  mockFindById,
  mockCreateWithId,
} = vi.hoisted(() => ({
  mockListByType: vi.fn(),
  mockFindById: vi.fn(),
  mockCreateWithId: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  categoriesRepository: {
    listByType: mockListByType,
    findById: mockFindById,
    createWithId: mockCreateWithId,
  },
  bundleCreateSchema: {
    safeParse: (b: unknown) => {
      const body = b as Record<string, unknown>;
      if (!body.name) return { success: false, error: { format: () => ({}) } };
      return { success: true, data: body };
    },
  },
  sortBy: (field: string, dir = "ASC") => (dir === "DESC" ? `-${field}` : field),
  serverLogger: { info: vi.fn() },
  ApiErrors: {
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
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
        if (!parsed.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = parsed.data;
      }

      return opts.handler({ request, user: _user ?? undefined, body });
    };
  },
}));

import { GET, POST } from "../route";

const makeBundle = (overrides: Record<string, unknown> = {}) => ({
  id: "bundle-pokemon-starter",
  name: "Pokemon Starter Bundle",
  slug: "bundle-pokemon-starter",
  categoryType: "bundle",
  isActive: true,
  bundleStockStatus: "in_stock",
  bundlePriceInPaise: 50000,
  createdAt: new Date("2026-05-01T00:00:00Z"),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListByType.mockResolvedValue([makeBundle()]);
  mockFindById.mockResolvedValue(null);
  mockCreateWithId.mockResolvedValue(undefined);
});

describe("GET /api/admin/bundles", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/bundles") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/bundles") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/bundles") as never);
    expect(res.status).toBe(200);
  });

  it("calls listByType with 'bundle'", async () => {
    await GET(new Request("http://localhost/api/admin/bundles") as never);
    expect(mockListByType).toHaveBeenCalledWith(
      "bundle",
      expect.objectContaining({ activeOnly: false, limit: 200 }),
    );
  });

  it("q filter: name match returned", async () => {
    mockListByType.mockResolvedValue([
      makeBundle({ name: "Pokemon Starter Bundle" }),
      makeBundle({ id: "bundle-digimon", name: "Digimon Bundle", slug: "bundle-digimon" }),
    ]);
    const res = await GET(new Request("http://localhost/api/admin/bundles?q=pokemon") as never);
    const json = await res.clone().json() as { data: { items: { name: string }[]; total: number } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].name).toBe("Pokemon Starter Bundle");
    expect(json.data.total).toBe(1);
  });

  it("isActive==true filter: excludes inactive bundles", async () => {
    mockListByType.mockResolvedValue([
      makeBundle({ isActive: true }),
      makeBundle({ id: "bundle-inactive", slug: "bundle-inactive", isActive: false }),
    ]);
    const res = await GET(new Request("http://localhost/api/admin/bundles?filters=isActive%3D%3Dtrue") as never);
    const json = await res.clone().json() as { data: { items: { isActive: boolean }[] } };
    expect(json.data.items.every((i) => i.isActive)).toBe(true);
  });

  it("isActive==false filter: returns only inactive bundles", async () => {
    mockListByType.mockResolvedValue([
      makeBundle({ isActive: true }),
      makeBundle({ id: "bundle-inactive", slug: "bundle-inactive", isActive: false }),
    ]);
    const res = await GET(new Request("http://localhost/api/admin/bundles?filters=isActive%3D%3Dfalse") as never);
    const json = await res.clone().json() as { data: { items: { isActive: boolean }[] } };
    expect(json.data.items.every((i) => !i.isActive)).toBe(true);
  });

  it("bundleStockStatus==out_of_stock filter works", async () => {
    mockListByType.mockResolvedValue([
      makeBundle({ bundleStockStatus: "in_stock" }),
      makeBundle({ id: "bundle-oos", slug: "bundle-oos", bundleStockStatus: "out_of_stock" }),
    ]);
    const res = await GET(
      new Request("http://localhost/api/admin/bundles?filters=bundleStockStatus%3D%3Dout_of_stock") as never,
    );
    const json = await res.clone().json() as { data: { items: { bundleStockStatus: string }[] } };
    expect(json.data.items.every((i) => i.bundleStockStatus === "out_of_stock")).toBe(true);
  });

  it("default pageSize 25, pagination slices items", async () => {
    const manyBundles = Array.from({ length: 30 }, (_, i) =>
      makeBundle({ id: `bundle-${i}`, slug: `bundle-${i}`, name: `Bundle ${i}` }),
    );
    mockListByType.mockResolvedValue(manyBundles);
    const res = await GET(new Request("http://localhost/api/admin/bundles") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(25);
    expect(json.data.total).toBe(30);
  });

  it("pageSize > 50 clamped to 50", async () => {
    const manyBundles = Array.from({ length: 100 }, (_, i) =>
      makeBundle({ id: `bundle-${i}`, slug: `bundle-${i}`, name: `Bundle ${i}` }),
    );
    mockListByType.mockResolvedValue(manyBundles);
    const res = await GET(new Request("http://localhost/api/admin/bundles?pageSize=200") as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(50);
  });
});

describe("POST /api/admin/bundles", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost/api/admin/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  const validBody = {
    name: "Pokemon Starter Bundle",
    slug: "pokemon-starter",
    bundlePriceInPaise: 50000,
    bundleProductIds: ["product-pikachu", "product-bulbasaur"],
  };

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(403);
  });

  it("moderator → 201 (ROLES_ADMIN_MOD for POST)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    mockFindById.mockResolvedValue(null);
    const created = makeBundle({ id: "bundle-pokemon-starter" });
    // Second findById call (after createWithId) returns the created doc
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(created);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
  });

  it("missing name → 400 (schema validation)", async () => {
    const res = await POST(makeRequest({ slug: "my-bundle" }));
    expect(res.status).toBe(400);
  });

  it("slug auto-prefixed with 'bundle-' when missing prefix", async () => {
    const created = makeBundle({ id: "bundle-pokemon-starter" });
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(created);
    await POST(makeRequest(validBody));
    // id passed to createWithId should have bundle- prefix
    expect(mockCreateWithId).toHaveBeenCalledWith(
      expect.stringMatching(/^bundle-/),
      expect.anything(),
    );
  });

  it("slug already has 'bundle-' prefix → not double-prefixed", async () => {
    const created = makeBundle();
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(created);
    await POST(makeRequest({ ...validBody, slug: "bundle-starter-pack" }));
    const [id] = mockCreateWithId.mock.calls[0];
    expect(id).toBe("bundle-starter-pack");
    expect(id).not.toBe("bundle-bundle-starter-pack");
  });

  it("duplicate id → 400 'Bundle already exists'", async () => {
    mockFindById.mockResolvedValue(makeBundle());
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Bundle already exists");
  });

  it("success → 201 with created bundle document", async () => {
    const created = makeBundle();
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(created);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("bundle-pokemon-starter");
  });

  it("categoryType is set to 'bundle' on created document", async () => {
    const created = makeBundle();
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(created);
    await POST(makeRequest(validBody));
    expect(mockCreateWithId).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ categoryType: "bundle" }),
    );
  });

  it("bundleStockStatus initialized to 'in_stock'", async () => {
    const created = makeBundle();
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(created);
    await POST(makeRequest(validBody));
    expect(mockCreateWithId).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ bundleStockStatus: "in_stock" }),
    );
  });
});
