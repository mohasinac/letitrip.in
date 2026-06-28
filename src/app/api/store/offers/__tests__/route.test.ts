/**
 * Tests for GET /api/store/offers
 * Returns incoming offers for the authenticated seller's store.
 * No store → empty list (not 404).
 * Status filter applied via query param.
 * pageSize clamped to 50.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockOfferFindByStore,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockOfferFindByStore: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_READ: ["seller", "admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  offerRepository: { findByStore: mockOfferFindByStore },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const makeReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/store/offers");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const pagedOffers = (items: unknown[] = []) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockOfferFindByStore.mockResolvedValue(pagedOffers());
});

describe("GET /api/store/offers", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("no store → empty list (not 404)", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { total: number; items: unknown[] } };
    expect(json.data.total).toBe(0);
    expect(json.data.items).toHaveLength(0);
  });

  it("findByStore called with seller's store id", async () => {
    await GET(makeReq() as never);
    expect(mockOfferFindByStore).toHaveBeenCalledWith("store-pokemon-palace", expect.any(Object));
  });

  it("status filter forwarded to repository", async () => {
    await GET(makeReq({ status: "pending" }) as never);
    const opts = mockOfferFindByStore.mock.calls[0][1] as { filters?: string };
    expect(opts.filters).toContain("status==pending");
  });

  it("status=all → no status filter applied", async () => {
    await GET(makeReq({ status: "all" }) as never);
    const opts = mockOfferFindByStore.mock.calls[0][1] as { filters?: string };
    expect(opts.filters ?? "").not.toContain("status==");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const opts = mockOfferFindByStore.mock.calls[0][1] as { pageSize: number };
    expect(opts.pageSize).toBeLessThanOrEqual(50);
  });

  it("default sort is -createdAt (newest first)", async () => {
    await GET(makeReq() as never);
    const opts = mockOfferFindByStore.mock.calls[0][1] as { sorts: string };
    expect(opts.sorts).toBe("-createdAt");
  });

  it("returns pagination metadata", async () => {
    mockOfferFindByStore.mockResolvedValue(pagedOffers([{ id: "offer-1" }]));
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { total: number; hasMore: boolean } };
    expect(json.data.total).toBe(1);
    expect(json.data.hasMore).toBe(false);
  });
});
