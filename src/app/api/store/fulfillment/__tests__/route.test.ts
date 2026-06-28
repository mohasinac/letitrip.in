/**
 * Tests for GET /api/store/fulfillment
 * Returns fulfillment queue for the authenticated seller, admin, or employee.
 * Admin: must provide storeId param.
 * Employee: storeId taken from user's Firestore profile.
 * Seller: storeId from owned store.
 * assignedTo=me → filters orders to only those assigned to the requesting user.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockUserFindById,
  mockOrderFindFulfillmentQueue,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockUserFindById: vi.fn(),
  mockOrderFindFulfillmentQueue: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));
vi.mock("@/constants/api-roles", () => ({ USER_ROLE: { EMPLOYEE: "employee" } }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  userRepository: { findById: mockUserFindById },
  orderRepository: { findFulfillmentQueue: mockOrderFindFulfillmentQueue },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
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

const makeReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/store/fulfillment");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const orderA = { id: "order-1", assignedWorkerId: "seller-uid", status: "PROCESSING" };
const orderB = { id: "order-2", assignedWorkerId: "worker-2", status: "PROCESSING" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockUserFindById.mockResolvedValue({ uid: "employee-uid", storeId: "store-pokemon-palace" });
  mockOrderFindFulfillmentQueue.mockResolvedValue([orderA, orderB]);
});

describe("GET /api/store/fulfillment", () => {
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

  it("seller: storeId from owned store", async () => {
    await GET(makeReq() as never);
    expect(mockOrderFindFulfillmentQueue).toHaveBeenCalledWith("store-pokemon-palace");
  });

  it("seller: no store → 404", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(404);
  });

  it("admin: storeId from query param", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    await GET(makeReq({ storeId: "store-other" }) as never);
    expect(mockOrderFindFulfillmentQueue).toHaveBeenCalledWith("store-other");
  });

  it("admin: missing storeId → 400", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/storeId required/i);
  });

  it("employee: storeId from user profile", async () => {
    _user = { uid: "employee-uid", role: "employee" };
    await GET(makeReq() as never);
    expect(mockUserFindById).toHaveBeenCalledWith("employee-uid");
    expect(mockOrderFindFulfillmentQueue).toHaveBeenCalledWith("store-pokemon-palace");
  });

  it("employee: no storeId in profile → 403", async () => {
    _user = { uid: "employee-uid", role: "employee" };
    mockUserFindById.mockResolvedValue({ uid: "employee-uid" }); // no storeId
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/not affiliated/i);
  });

  it("assignedTo=me → filters to requesting user's orders", async () => {
    const res = await GET(makeReq({ assignedTo: "me" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { orders: typeof orderA[]; total: number } };
    expect(json.data.orders).toHaveLength(1);
    expect(json.data.orders[0].id).toBe("order-1"); // assigned to seller-uid
    expect(json.data.total).toBe(1);
  });

  it("no assignedTo filter → returns all orders", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { orders: unknown[]; total: number } };
    expect(json.data.orders).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });
});
