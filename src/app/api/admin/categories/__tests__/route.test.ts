/**
 * Tests for GET + POST /api/admin/categories
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCategoriesList,
  mockGetCategoryBySlug,
  mockCreateWithHierarchy,
} = vi.hoisted(() => ({
  mockCategoriesList: vi.fn(),
  mockGetCategoryBySlug: vi.fn(),
  mockCreateWithHierarchy: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  categoriesRepository: {
    list: mockCategoriesList,
    getCategoryBySlug: mockGetCategoryBySlug,
    createWithHierarchy: mockCreateWithHierarchy,
  },
  sortBy: (field: string, dir = "DESC") => `${dir === "ASC" ? "" : "-"}${field}`,
  CATEGORY_FIELDS: { NAME: "name" },
  COMMON_FIELDS: { ORDER: "order" },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: string[];
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

const pagedResult = {
  items: [{ id: "category-action-figures", name: "Action Figures", tier: 1 }],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/categories");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCategoriesList.mockResolvedValue(pagedResult);
  mockGetCategoryBySlug.mockResolvedValue(null);
  mockCreateWithHierarchy.mockResolvedValue({ id: "category-action-figures", tier: 1 });
});

describe("GET /api/admin/categories", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
  });

  it("returns categories list with pagination", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { data: unknown[]; total: number } };
    expect(json.data.total).toBe(1);
    expect(json.data.data).toHaveLength(1);
  });
});

describe("POST /api/admin/categories", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ name: "Action Figures" }) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (admin-only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq({ name: "Action Figures" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing name → 400", async () => {
    const res = await POST(makePostReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("slug auto-generated from name (lowercase, hyphenated)", async () => {
    await POST(makePostReq({ name: "Action Figures" }) as never);
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "action-figures" }),
    );
  });

  it("explicit slug used when provided", async () => {
    await POST(makePostReq({ name: "Action Figures", slug: "action-figs-custom" }) as never);
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "action-figs-custom" }),
    );
  });

  it("duplicate slug → 409", async () => {
    mockGetCategoryBySlug.mockResolvedValue({ id: "existing" });
    const res = await POST(makePostReq({ name: "Action Figures" }) as never);
    expect(res.status).toBe(409);
  });

  it("parentId provided → parentIds array contains it", async () => {
    await POST(makePostReq({ name: "Marvel Figures", parentId: "category-action-figures" }) as never);
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ parentId: "category-action-figures", parentIds: ["category-action-figures"] }),
    );
  });

  it("no parentId → parentIds is empty array", async () => {
    await POST(makePostReq({ name: "Action Figures" }) as never);
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ parentIds: [] }),
    );
  });

  it("createdBy set to admin uid", async () => {
    await POST(makePostReq({ name: "Action Figures" }) as never);
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: "admin-uid" }),
    );
  });

  it("success → 200 with category data", async () => {
    const res = await POST(makePostReq({ name: "Action Figures" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
