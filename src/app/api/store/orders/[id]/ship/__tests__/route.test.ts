/**
 * Tests for POST /api/store/orders/[id]/ship
 * Requires ROLES_STORE_WRITE + store:api:write.
 * Thin proxy to shipOrderAction(orderId, body) — shipOrderAction returns an
 * ActionResult ({ ok: true, data } | { ok: false, error, code }) via wrapAction,
 * it never rejects. The route unwraps `.ok` and never trusts a throw.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockShipOrderAction } = vi.hoisted(() => ({
  mockShipOrderAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"], USER_ROLE: { EMPLOYEE: "employee" } }));
vi.mock("@/actions/seller.actions", () => ({ shipOrderAction: mockShipOrderAction }));

vi.mock("@mohasinac/appkit", () => ({
  normalizeError: vi.fn(),
  parseJsonBody: async (req: Request) => req.clone().json().catch(() => ({})),
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request, params });
    };
  },
}));

import { POST } from "../route";

const params = { params: Promise.resolve({ id: "order-1-20260601-a1b2c3" }) };
const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/store/orders/order-1/ship", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockShipData = {
  orderId: "order-1-20260601-a1b2c3",
  trackingNumber: "123456789",
  carrier: "DTDC",
  status: "SHIPPED",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockShipOrderAction.mockResolvedValue({ ok: true, data: mockShipData });
});

describe("POST /api/store/orders/[id]/ship", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ method: "custom" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403 (not in ROLES_STORE_WRITE)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeRequest({ method: "custom" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("delegates to shipOrderAction with orderId from params", async () => {
    await POST(makeRequest({ method: "custom" }) as never, params as never);
    expect(mockShipOrderAction).toHaveBeenCalledWith(
      "order-1-20260601-a1b2c3",
      expect.anything(),
    );
  });

  it("passes body to shipOrderAction", async () => {
    const body = { method: "custom", trackingNumber: "ABC123", shippingCarrier: "DTDC", trackingUrl: "https://track.example/ABC123" };
    await POST(makeRequest(body) as never, params as never);
    expect(mockShipOrderAction).toHaveBeenCalledWith(
      "order-1-20260601-a1b2c3",
      expect.objectContaining({ method: "custom", trackingNumber: "ABC123" }),
    );
  });

  it("success → 200 with ship result", async () => {
    const res = await POST(makeRequest({ method: "custom" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { trackingNumber: string } };
    expect(json.data.trackingNumber).toBe("123456789");
  });

  it("shipOrderAction returns ok:false → 400 with error message", async () => {
    mockShipOrderAction.mockResolvedValue({ ok: false, error: "Order already shipped" });
    const res = await POST(makeRequest({ method: "custom" }) as never, params as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Order already shipped");
  });

  it("shipOrderAction returns ok:false with no error message → 400 with generic message", async () => {
    mockShipOrderAction.mockResolvedValue({ ok: false });
    const res = await POST(makeRequest({ method: "custom" }) as never, params as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Failed to ship order");
  });
});
