/**
 * Tests for GET/PATCH /api/store/orders/[id]
 * GET: Seller can only see own store's orders. Admin sees all.
 *      Order from different store → 404 (not 403, to avoid information leak).
 * PATCH: Seller can only set status to "processing" or "shipped".
 *        Seller cannot set status to "delivered" or "cancelled" → 403.
 *        status=shipped + shiprocket method + no manual tracking → delegates to shipOrderAction.
 *        markPicked/markPacked/assignedWorkerId → separate handler paths.
 *        status=cancelled → calls cancelOrder with reason.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockOrderFindById,
  mockOrderCancelOrder,
  mockOrderUpdateStatus,
  mockOrderMarkPicked,
  mockOrderMarkPacked,
  mockOrderAssignWorker,
  mockUserFindById,
  mockShipOrderAction,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockOrderFindById: vi.fn(),
  mockOrderCancelOrder: vi.fn(),
  mockOrderUpdateStatus: vi.fn(),
  mockOrderMarkPicked: vi.fn(),
  mockOrderMarkPacked: vi.fn(),
  mockOrderAssignWorker: vi.fn(),
  mockUserFindById: vi.fn(),
  mockShipOrderAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));
vi.mock("@/constants/api-roles", () => ({ USER_ROLE: { EMPLOYEE: "employee" } }));
vi.mock("@/actions/seller.actions", () => ({ shipOrderAction: mockShipOrderAction }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  orderRepository: {
    findById: mockOrderFindById,
    cancelOrder: mockOrderCancelOrder,
    updateStatus: mockOrderUpdateStatus,
    markPicked: mockOrderMarkPicked,
    markPacked: mockOrderMarkPacked,
    assignWorker: mockOrderAssignWorker,
  },
  userRepository: { findById: mockUserFindById },
  OrderStatusValues: { CANCELLED: "cancelled", PROCESSING: "processing", SHIPPED: "shipped" },
  ShippingMethodValues: { SHIPROCKET: "shiprocket" },
  normalizeError: vi.fn(),
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400, _extra?: unknown) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: undefined }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PATCH } from "../route";

const makeGetReq = (id: string) =>
  new Request(`http://localhost/api/store/orders/${id}`);
const makePatchReq = (id: string, body: unknown) =>
  new Request(`http://localhost/api/store/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const mockOrder = { id: "order-abc", storeId: "store-pokemon-palace", status: "PROCESSING" };
const mockOrderOtherStore = { id: "order-xyz", storeId: "store-other-store", status: "PROCESSING" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockOrderFindById.mockResolvedValue(mockOrder);
  mockOrderCancelOrder.mockResolvedValue(undefined);
  mockOrderUpdateStatus.mockResolvedValue(undefined);
  mockOrderMarkPicked.mockResolvedValue(undefined);
  mockOrderMarkPacked.mockResolvedValue(undefined);
  mockOrderAssignWorker.mockResolvedValue(undefined);
  mockUserFindById.mockResolvedValue({ uid: "seller-uid", storeId: "store-pokemon-palace" });
});

describe("GET /api/store/orders/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq("order-abc") as never, { params: { id: "order-abc" } } as never);
    expect(res.status).toBe(401);
  });

  it("order not found → 404", async () => {
    mockOrderFindById.mockResolvedValue(null);
    const res = await GET(makeGetReq("order-missing") as never, { params: { id: "order-missing" } } as never);
    expect(res.status).toBe(404);
  });

  it("seller sees own store's order → 200", async () => {
    const res = await GET(makeGetReq("order-abc") as never, { params: { id: "order-abc" } } as never);
    expect(res.status).toBe(200);
  });

  it("seller tries to see other store's order → 404 (not 403)", async () => {
    mockOrderFindById.mockResolvedValue(mockOrderOtherStore);
    const res = await GET(makeGetReq("order-xyz") as never, { params: { id: "order-xyz" } } as never);
    expect(res.status).toBe(404);
  });

  it("admin sees any store's order → 200", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    mockOrderFindById.mockResolvedValue(mockOrderOtherStore);
    const res = await GET(makeGetReq("order-xyz") as never, { params: { id: "order-xyz" } } as never);
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/store/orders/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makePatchReq("order-abc", { status: "processing" }) as never, { params: { id: "order-abc" } } as never);
    expect(res.status).toBe(401);
  });

  it("order not found → 404", async () => {
    mockOrderFindById.mockResolvedValue(null);
    const res = await PATCH(makePatchReq("order-missing", { status: "processing" }) as never, { params: { id: "order-missing" } } as never);
    expect(res.status).toBe(404);
  });

  it("seller updates status=processing → calls updateStatus", async () => {
    await PATCH(makePatchReq("order-abc", { status: "processing" }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderUpdateStatus).toHaveBeenCalledWith("order-abc", "processing", expect.any(Object));
  });

  it("seller updates status=shipped (manual tracking) → calls updateStatus", async () => {
    await PATCH(makePatchReq("order-abc", { status: "shipped", trackingNumber: "TRK123", shippingCarrier: "BlueDart" }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderUpdateStatus).toHaveBeenCalledWith("order-abc", "shipped", expect.objectContaining({ trackingNumber: "TRK123" }));
  });

  it("seller tries to set status=delivered → 403", async () => {
    const res = await PATCH(makePatchReq("order-abc", { status: "delivered" }) as never, { params: { id: "order-abc" } } as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/processing or shipped/i);
  });

  it("seller tries to cancel order via PATCH → 403 (not allowed for seller)", async () => {
    const res = await PATCH(makePatchReq("order-abc", { status: "cancelled" }) as never, { params: { id: "order-abc" } } as never);
    // "cancelled" is not in SELLER_ALLOWED_STATUSES
    expect(res.status).toBe(403);
  });

  it("admin can set status=delivered → calls updateStatus", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    await PATCH(makePatchReq("order-abc", { status: "delivered" }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderUpdateStatus).toHaveBeenCalledWith("order-abc", "delivered", expect.any(Object));
  });

  it("admin cancels order → calls cancelOrder with reason", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    await PATCH(makePatchReq("order-abc", { status: "cancelled", cancellationReason: "Out of stock" }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderCancelOrder).toHaveBeenCalledWith("order-abc", "Out of stock");
  });

  it("admin cancels without reason → uses default reason", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    await PATCH(makePatchReq("order-abc", { status: "cancelled" }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderCancelOrder).toHaveBeenCalledWith("order-abc", "Cancelled by seller");
  });

  it("markPicked → calls orderRepository.markPicked", async () => {
    await PATCH(makePatchReq("order-abc", { markPicked: true }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderMarkPicked).toHaveBeenCalledWith("order-abc");
    expect(mockOrderUpdateStatus).not.toHaveBeenCalled();
  });

  it("markPacked → calls orderRepository.markPacked", async () => {
    await PATCH(makePatchReq("order-abc", { markPacked: true }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderMarkPacked).toHaveBeenCalledWith("order-abc");
  });

  it("assignedWorkerId → calls orderRepository.assignWorker", async () => {
    await PATCH(makePatchReq("order-abc", { assignedWorkerId: "worker-123" }) as never, { params: { id: "order-abc" } } as never);
    expect(mockOrderAssignWorker).toHaveBeenCalledWith("order-abc", "worker-123");
  });

  it("seller's other store order → 404 via scope check", async () => {
    mockOrderFindById.mockResolvedValue(mockOrderOtherStore);
    const res = await PATCH(makePatchReq("order-xyz", { status: "processing" }) as never, { params: { id: "order-xyz" } } as never);
    expect(res.status).toBe(404);
  });
});
