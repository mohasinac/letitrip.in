/**
 * Tests for GET /api/user/orders/[id]
 * Auth required. Any authenticated user (scope enforced in handler via getOrderByIdForUser).
 * getOrderByIdForUser(uid, orderId) returns null for:
 *   - non-existent orders
 *   - orders belonging to another user
 * Returns 404 in both cases (prevents enumeration).
 * Success → 200 with order transformed through orderDocumentToOrder.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockGetOrderByIdForUser, mockOrderDocumentToOrder } = vi.hoisted(() => ({
  mockGetOrderByIdForUser: vi.fn(),
  mockOrderDocumentToOrder: vi.fn((doc: unknown) => doc),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  getOrderByIdForUser: mockGetOrderByIdForUser,
  orderDocumentToOrder: mockOrderDocumentToOrder,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, { params }: { params: unknown } = { params: {} }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { GET } from "../route";

const params = { params: { id: "order-1-20260601-a1b2c3" } };
const mockOrder = {
  id: "order-1-20260601-a1b2c3",
  buyerId: "buyer-uid",
  storeId: "store-1",
  status: "DELIVERED",
  totalAmount: 50000,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockGetOrderByIdForUser.mockResolvedValue(mockOrder);
  mockOrderDocumentToOrder.mockImplementation((doc: unknown) => doc);
});

describe("GET /api/user/orders/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("calls getOrderByIdForUser with user uid and orderId", async () => {
    await GET(new Request("http://localhost") as never, params as never);
    expect(mockGetOrderByIdForUser).toHaveBeenCalledWith(
      "buyer-uid",
      "order-1-20260601-a1b2c3",
    );
  });

  it("order not found → 404", async () => {
    mockGetOrderByIdForUser.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("order belongs to different user → 404 (scope enforced in getOrderByIdForUser)", async () => {
    // getOrderByIdForUser returns null for other user's orders — we just test null→404
    mockGetOrderByIdForUser.mockResolvedValue(null);
    _user = { uid: "attacker-uid", role: "user" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("order found → transformed through orderDocumentToOrder", async () => {
    await GET(new Request("http://localhost") as never, params as never);
    expect(mockOrderDocumentToOrder).toHaveBeenCalledWith(mockOrder);
  });

  it("success → 200 with transformed order data", async () => {
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("order-1-20260601-a1b2c3");
  });
});
