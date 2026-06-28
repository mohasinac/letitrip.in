/**
 * Tests for GET /api/admin/stores
 * Admin/moderator can list all stores across the platform.
 * Status filter and text search applied as Sieve filters.
 * Response shape maps store fields explicitly (no raw passthrough).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListAllStores } = vi.hoisted(() => ({
  mockListAllStores: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { listAllStores: mockListAllStores },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  sortBy: (field: string) => `-${field}`,
  STORE_FIELDS: { CREATED_AT: "createdAt" },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
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

import { GET } from "../route";

const makeStore = (overrides = {}) => ({
  id: "store-palace",
  storeSlug: "store-palace",
  ownerId: "seller-uid",
  storeName: "Pokemon Palace",
  storeDescription: "Best pokemon cards",
  storeCategory: "trading-cards",
  storeLogoURL: "/logo.png",
  storeBannerURL: "/banner.png",
  status: "active",
  isPublic: true,
  isVacationMode: false,
  returnPolicy: "30 days",
  shippingPolicy: "Free shipping",
  bio: "We sell pokemon",
  location: "Mumbai",
  stats: { totalProducts: 10, totalOrders: 100 },
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-06-01"),
  ...overrides,
});

const pagedResult = {
  items: [makeStore()],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/stores");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListAllStores.mockResolvedValue(pagedResult);
});

describe("GET /api/admin/stores", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("storeStatus filter applied when not 'all'", async () => {
    await GET(makeReq({ storeStatus: "active" }) as never);
    const callArg = mockListAllStores.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("status==active");
  });

  it("storeStatus=all → no status filter applied", async () => {
    await GET(makeReq({ storeStatus: "all" }) as never);
    const callArg = mockListAllStores.mock.calls[0][0] as { filters?: string };
    expect(callArg.filters ?? "").not.toContain("status==");
  });

  it("text search (q) appended as contains filter", async () => {
    await GET(makeReq({ q: "pokemon" }) as never);
    const callArg = mockListAllStores.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("storeName_=pokemon");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "100" }) as never);
    const callArg = mockListAllStores.mock.calls[0][0] as { pageSize: number };
    expect(callArg.pageSize).toBe(50);
  });

  it("returns mapped store items (not raw docs)", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: {
        items: {
          id: string;
          storeName: string;
          status: string;
          ownerId: string;
        }[]
      }
    };
    expect(json.data.items[0].id).toBe("store-palace");
    expect(json.data.items[0].storeName).toBe("Pokemon Palace");
    expect(json.data.items[0].ownerId).toBe("seller-uid");
  });

  it("success → 200 with total count", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { total: number } };
    expect(json.data.total).toBe(1);
  });
});
