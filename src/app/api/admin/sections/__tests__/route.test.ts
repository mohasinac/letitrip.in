/**
 * Tests for GET + POST /api/admin/sections
 * GET: admin-only listing of homepage sections.
 * POST: local Zod validation; auto-assigns order from latest.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockList,
  mockCreate,
} = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));
vi.mock("@/validation/request-schemas", () => ({
  validateRequestBody: (schema: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { path: string[]; message: string }[] } } }, body: unknown) => {
    const result = schema.safeParse(body);
    if (result.success) return { success: true, data: result.data };
    return { success: false, errors: result.error?.issues ?? [] };
  },
  formatZodErrors: (issues: { path: string[]; message: string }[]) => {
    const map: Record<string, string[]> = {};
    for (const issue of issues) {
      const key = issue.path[0] ?? "root";
      (map[key] ??= []).push(issue.message);
    }
    return map;
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  homepageSectionsRepository: { list: mockList, create: mockCreate },
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400, _details?: unknown) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  sortBy: (field: string, dir = "DESC") => `${dir === "ASC" ? "" : "-"}${field}`,
  HOMEPAGE_SECTION_FIELDS: { ORDER: "order" },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  ERROR_MESSAGES: { VALIDATION: { FAILED: "Validation failed" } },
  SUCCESS_MESSAGES: { SECTION: { CREATED: "Section created" } },
  normalizeError: vi.fn(),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/sections");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/sections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const pagedResult = (items: unknown[] = [], total = 0) => ({
  items,
  total,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
});

const mockSection = { id: "section-welcome", type: "welcome", order: 1, enabled: true };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockList.mockResolvedValue(pagedResult([mockSection], 1));
  mockCreate.mockResolvedValue({ id: "section-new", type: "banner", order: 2, enabled: true });
});

describe("GET /api/admin/sections", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer role → 403 (admin-only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("returns sections list and pagination meta", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: typeof mockSection[]; total: number } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(1);
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeGetReq({ pageSize: "200" }) as never);
    const callArg = mockList.mock.calls[0][0] as { pageSize: string };
    expect(callArg.pageSize).toBe("50");
  });

  it("default sorts by order ASC", async () => {
    await GET(makeGetReq() as never);
    const callArg = mockList.mock.calls[0][0] as { sorts: string };
    expect(callArg.sorts).toContain("order");
  });
});

describe("POST /api/admin/sections", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ type: "banner", config: {} }) as never);
    expect(res.status).toBe(401);
  });

  it("missing type → 400", async () => {
    const res = await POST(makePostReq({ config: {} }) as never);
    expect(res.status).toBe(400);
  });

  it("invalid type → 400", async () => {
    const res = await POST(makePostReq({ type: "invalid-section-type", config: {} }) as never);
    expect(res.status).toBe(400);
  });

  it("valid type without order → auto-assigns order = latest.order + 1", async () => {
    // First list call (for order auto-assign) returns section with order=5
    mockList.mockResolvedValueOnce(pagedResult([{ order: 5 }], 1));
    await POST(makePostReq({ type: "banner", config: {} }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { order: number };
    expect(createArg.order).toBe(6);
  });

  it("no existing sections → order = 1", async () => {
    mockList.mockResolvedValueOnce(pagedResult([], 0));
    await POST(makePostReq({ type: "banner", config: {} }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { order: number };
    expect(createArg.order).toBe(1);
  });

  it("explicit order provided → used directly (no list query)", async () => {
    await POST(makePostReq({ type: "banner", config: {}, order: 10 }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { order: number };
    expect(createArg.order).toBe(10);
  });

  it("enabled defaults to true when not provided", async () => {
    mockList.mockResolvedValueOnce(pagedResult([], 0));
    await POST(makePostReq({ type: "banner", config: {} }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { enabled: boolean };
    expect(createArg.enabled).toBe(true);
  });

  it("enabled=false → section created as disabled", async () => {
    mockList.mockResolvedValueOnce(pagedResult([], 0));
    await POST(makePostReq({ type: "banner", config: {}, enabled: false }) as never);
    const createArg = mockCreate.mock.calls[0][0] as { enabled: boolean };
    expect(createArg.enabled).toBe(false);
  });

  it("success → 201 with created section", async () => {
    mockList.mockResolvedValueOnce(pagedResult([], 0));
    const res = await POST(makePostReq({ type: "banner", config: {} }) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("section-new");
  });
});
