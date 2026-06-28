/**
 * Tests for GET/PATCH /api/admin/orders/[id]
 * GET: admin/moderator can view any single order.
 * PATCH: update status, tracking, notes, and items[].
 *   When items[] is provided, totalPrice is recalculated as sum of items[].totalPrice.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockAdminUpdateOrder,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockAdminUpdateOrder: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  orderRepository: { findById: mockFindById },
  adminUpdateOrder: mockAdminUpdateOrder,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context: { params?: Record<string, string> }) => {
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
      return opts.handler({ user: _user ?? undefined, body, params: context?.params });
    };
  },
}));

import { GET, PATCH } from "../route";

const makeReq = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/orders/order-123", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockOrder = {
  id: "order-123",
  buyerId: "user-ravi",
  storeId: "store-pokemon-palace",
  status: "PROCESSING",
  totalAmount: 150000,
  items: [
    { productId: "product-charizard", productTitle: "Charizard PSA 9", quantity: 1, unitPrice: 150000, totalPrice: 150000 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockOrder);
  mockAdminUpdateOrder.mockResolvedValue(undefined);
});

describe("GET /api/admin/orders/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(res.status).toBe(401);
  });

  it("seller role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(res.status).toBe(403);
  });

  it("order not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "nonexistent" }) });
    expect(res.status).toBe(404);
  });

  it("found → 200 with order data", async () => {
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockOrder };
    expect(json.data.id).toBe("order-123");
  });
});

describe("PATCH /api/admin/orders/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeReq("PATCH", { status: "SHIPPED" }) as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(res.status).toBe(401);
  });

  it("moderator → allowed (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeReq("PATCH", { status: "SHIPPED" }) as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(res.status).toBe(200);
  });

  it("status update → adminUpdateOrder called with actorId, orderId, update", async () => {
    await PATCH(makeReq("PATCH", { status: "SHIPPED" }) as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(mockAdminUpdateOrder).toHaveBeenCalledWith("admin-uid", "order-123", expect.objectContaining({ status: "SHIPPED" }));
  });

  it("tracking update → passes trackingNumber through", async () => {
    await PATCH(makeReq("PATCH", { trackingNumber: "TRK123456" }) as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(mockAdminUpdateOrder).toHaveBeenCalledWith("admin-uid", "order-123", expect.objectContaining({ trackingNumber: "TRK123456" }));
  });

  it("items[] provided → totalPrice recalculated as sum of items[].totalPrice", async () => {
    const newItems = [
      { productId: "product-1", productTitle: "Item A", quantity: 2, unitPrice: 50000, totalPrice: 100000 },
      { productId: "product-2", productTitle: "Item B", quantity: 1, unitPrice: 75000, totalPrice: 75000 },
    ];
    await PATCH(makeReq("PATCH", { items: newItems }) as never, { params: Promise.resolve({ id: "order-123" }) });
    const updateArg = mockAdminUpdateOrder.mock.calls[0][2] as { items: unknown[]; totalPrice: number };
    expect(updateArg.totalPrice).toBe(175000); // 100000 + 75000
  });

  it("no items[] → totalPrice NOT set in update", async () => {
    await PATCH(makeReq("PATCH", { status: "DELIVERED" }) as never, { params: Promise.resolve({ id: "order-123" }) });
    const updateArg = mockAdminUpdateOrder.mock.calls[0][2] as { totalPrice?: number };
    expect(updateArg.totalPrice).toBeUndefined();
  });

  it("items with zero totalPrice → included as 0 in sum", async () => {
    const newItems = [
      { productId: "product-1", productTitle: "Item A", quantity: 1, unitPrice: 50000, totalPrice: 50000 },
      { productId: "product-2", productTitle: "Item B", quantity: 1, unitPrice: 0, totalPrice: 0 },
    ];
    await PATCH(makeReq("PATCH", { items: newItems }) as never, { params: Promise.resolve({ id: "order-123" }) });
    const updateArg = mockAdminUpdateOrder.mock.calls[0][2] as { totalPrice: number };
    expect(updateArg.totalPrice).toBe(50000); // 50000 + 0
  });

  it("success → 200 with id and updated fields", async () => {
    const res = await PATCH(makeReq("PATCH", { status: "DELIVERED" }) as never, { params: Promise.resolve({ id: "order-123" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string; status: string } };
    expect(json.data.id).toBe("order-123");
    expect(json.data.status).toBe("DELIVERED");
  });
});
