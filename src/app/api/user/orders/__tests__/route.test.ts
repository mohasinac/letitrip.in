import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListOrders,
  mockGetOrderById,
  mockOrderToOrder,
} = vi.hoisted(() => ({
  mockListOrders: vi.fn(),
  mockGetOrderById: vi.fn(),
  mockOrderToOrder: vi.fn((doc: unknown) => doc),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  orderRepository: { listForUser: mockListOrders },
  getOrderByIdForUser: mockGetOrderById,
  orderDocumentToOrder: mockOrderToOrder,
  serverLogger: { info: vi.fn() },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key),
  sortBy: (field: string) => `${field}:desc`,
  ORDER_FIELDS: { ORDER_DATE: "createdAt" },
  OrderStatusValues: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    RETURNED: "returned",
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (error: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request: Request; params: Record<string, string> }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      return opts.handler({ user: _user ?? undefined, request, params: params ?? {} });
    };
  },
}));

import { GET } from "../route";
import { GET as GET_ID } from "../[id]/route";

function makeListReq(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/user/orders");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

function makeIdReq(id: string): Request {
  return new Request(`http://localhost/api/user/orders/${id}`, { method: "GET" });
}

const defaultListResult = {
  items: [{ id: "order-1", status: "delivered" }],
  total: 1,
  page: 1,
  pageSize: 12,
  totalPages: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockListOrders.mockResolvedValue({ ...defaultListResult });
  mockGetOrderById.mockResolvedValue({ id: "order-1", buyerId: "buyer-uid", status: "delivered" });
});

describe("GET /api/user/orders", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeListReq() as never);
    expect(res.status).toBe(401);
  });

  it("delegates to orderRepository.listForUser with uid", async () => {
    await GET(makeListReq() as never);
    expect(mockListOrders).toHaveBeenCalledWith("buyer-uid", expect.any(Object));
  });

  it("status filter included when valid status provided", async () => {
    await GET(makeListReq({ status: "shipped" }) as never);
    const call = mockListOrders.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toContain("status==shipped");
  });

  it("invalid status → no filter applied (ignored)", async () => {
    await GET(makeListReq({ status: "invalid" }) as never);
    const call = mockListOrders.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toBeUndefined();
  });

  it("returns items mapped with orderDocumentToOrder", async () => {
    const res = await GET(makeListReq() as never);
    expect(res.status).toBe(200);
    expect(mockOrderToOrder).toHaveBeenCalled();
  });

  it("returns total, page, perPage, totalPages in response", async () => {
    const res = await GET(makeListReq() as never);
    const json = await res.clone().json() as { data: { total: number; page: number; perPage: number; totalPages: number } };
    expect(json.data.total).toBe(1);
    expect(json.data.page).toBe(1);
    expect(json.data.perPage).toBe(12);
    expect(json.data.totalPages).toBe(1);
  });

  it("pagination params forwarded to repository", async () => {
    await GET(makeListReq({ page: "2", perPage: "5" }) as never);
    const call = mockListOrders.mock.calls[0][1] as { page: string; pageSize: string };
    expect(call.page).toBe("2");
    expect(call.pageSize).toBe("5");
  });
});

describe("GET /api/user/orders/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET_ID(makeIdReq("order-1") as never, { params: Promise.resolve({ id: "order-1" }) } as never);
    expect(res.status).toBe(401);
  });

  it("order not found → 404", async () => {
    mockGetOrderById.mockResolvedValue(null);
    const res = await GET_ID(makeIdReq("nonexistent") as never, { params: Promise.resolve({ id: "nonexistent" }) } as never);
    expect(res.status).toBe(404);
  });

  it("order found → 200 with mapped document", async () => {
    const res = await GET_ID(makeIdReq("order-1") as never, { params: Promise.resolve({ id: "order-1" }) } as never);
    expect(res.status).toBe(200);
    expect(mockGetOrderById).toHaveBeenCalledWith("buyer-uid", "order-1");
  });

  it("delegates getOrderByIdForUser with uid + orderId", async () => {
    await GET_ID(makeIdReq("order-abc") as never, { params: Promise.resolve({ id: "order-abc" }) } as never);
    expect(mockGetOrderById).toHaveBeenCalledWith("buyer-uid", "order-abc");
  });
});
