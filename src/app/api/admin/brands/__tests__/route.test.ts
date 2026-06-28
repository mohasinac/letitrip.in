/**
 * Tests for GET + POST /api/admin/brands
 * Brands are stored as categories with categoryType=brand.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCategoriesList,
  mockFindBySlugAndType,
  mockCreateBrandAction,
} = vi.hoisted(() => ({
  mockCategoriesList: vi.fn(),
  mockFindBySlugAndType: vi.fn(),
  mockCreateBrandAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  categoriesRepository: {
    list: mockCategoriesList,
    findBySlugAndType: mockFindBySlugAndType,
  },
  createBrandAction: mockCreateBrandAction,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  sortBy: (field: string, dir = "DESC") => `${dir === "ASC" ? "" : "-"}${field}`,
  COMMON_FIELDS: { ORDER: "order" },
  BRAND_FIELDS: { NAME: "name" },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation error";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/brands");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/brands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockBrand = {
  id: "brand-hot-wheels",
  name: "Hot Wheels",
  slug: "brand-hot-wheels",
  categoryType: "brand",
  isActive: true,
};

const pagedResult = {
  items: [mockBrand],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCategoriesList.mockResolvedValue(pagedResult);
  mockFindBySlugAndType.mockResolvedValue(null);
  mockCreateBrandAction.mockResolvedValue(mockBrand);
});

describe("GET /api/admin/brands", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("non-admin role (seller) → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("categoriesRepository.list called with categoryType==brand filter", async () => {
    await GET(makeGetReq() as never);
    const callArg = mockCategoriesList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("categoryType==brand");
  });

  it("additional filters combined with categoryType==brand", async () => {
    await GET(makeGetReq({ filters: "isActive==true" }) as never);
    const callArg = mockCategoriesList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("isActive==true");
    expect(callArg.filters).toContain("categoryType==brand");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeGetReq({ pageSize: "100" }) as never);
    const callArg = mockCategoriesList.mock.calls[0][0] as { pageSize: string };
    expect(Number(callArg.pageSize)).toBeLessThanOrEqual(50);
  });

  it("success → 200 with items array", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(1);
  });
});

describe("POST /api/admin/brands", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ name: "Pokemon" }) as never);
    expect(res.status).toBe(401);
  });

  it("moderator role → 403 (admin-only endpoint)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq({ name: "Pokemon" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing name → 400", async () => {
    const res = await POST(makePostReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("slug auto-generated from name when not provided", async () => {
    await POST(makePostReq({ name: "Hot Wheels" }) as never);
    expect(mockCreateBrandAction).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "brand-hot-wheels" }),
    );
  });

  it("explicit slug used when provided", async () => {
    await POST(makePostReq({ name: "Hot Wheels", slug: "brand-hw-custom" }) as never);
    expect(mockCreateBrandAction).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "brand-hw-custom" }),
    );
  });

  it("duplicate slug → 409", async () => {
    mockFindBySlugAndType.mockResolvedValue({ id: "brand-hot-wheels" });
    const res = await POST(makePostReq({ name: "Hot Wheels" }) as never);
    expect(res.status).toBe(409);
  });

  it("success → 200 with brand data", async () => {
    const res = await POST(makePostReq({ name: "Hot Wheels" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("brand-hot-wheels");
  });
});
