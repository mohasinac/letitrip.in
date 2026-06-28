import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  orderRepository: { findById: vi.fn() },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params: Record<string, string> }) => Promise<Response>;
  }) => {
    return async (request: Request, context: { params?: Record<string, string> } = {}) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      if (opts.roles && _user && !opts.roles.includes(_user.role)) {
        return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
      }
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success) {
          return new Response(JSON.stringify({ ok: false, error: "Validation failed" }), { status: 400 });
        }
        body = result.data;
      } else if (opts.schema) {
        return new Response(JSON.stringify({ ok: false, error: "Validation failed" }), { status: 400 });
      }
      return opts.handler({ user: _user, body, params: context.params ?? {} });
    };
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (error: string, status = 400, extra?: unknown) =>
    new Response(JSON.stringify({ ok: false, error, ...((extra as object) ?? {}) }), { status }),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  processRefundAction: vi.fn(),
}));

import { POST } from "../route";
import { orderRepository } from "@mohasinac/appkit";
import { processRefundAction } from "@mohasinac/appkit/server";

const mockFindById = orderRepository.findById as ReturnType<typeof vi.fn>;
const mockRefund = processRefundAction as ReturnType<typeof vi.fn>;

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/admin/orders/order-1/refund", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeCtx(id = "order-1") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue({
    id: "order-1",
    status: "delivered",
    totalPrice: 10000,
    paymentMethod: "razorpay",
    paymentId: "pay_abc123",
  });
  mockRefund.mockResolvedValue({ ok: true });
});

describe("POST /api/admin/orders/[id]/refund", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ amount: 1000, reason: "damaged" }), makeCtx() as never);
    expect(res.status).toBe(401);
  });

  it("non-admin role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await POST(makeReq({ amount: 1000, reason: "damaged" }), makeCtx() as never);
    expect(res.status).toBe(403);
  });

  it("missing amount → 400", async () => {
    const res = await POST(makeReq({ reason: "test" }), makeCtx() as never);
    expect(res.status).toBe(400);
  });

  it("amount=0 → 400 (min(1))", async () => {
    const res = await POST(makeReq({ amount: 0, reason: "test" }), makeCtx() as never);
    expect(res.status).toBe(400);
  });

  it("missing reason → 400", async () => {
    const res = await POST(makeReq({ amount: 1000 }), makeCtx() as never);
    expect(res.status).toBe(400);
  });

  it("BUG-3 fix: non-existent order → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await POST(makeReq({ amount: 1000, reason: "not found test" }), makeCtx("nonexistent") as never);
    expect(res.status).toBe(404);
  });

  it("BUG-4 fix: Razorpay order → calls processRefundAction (not cancelOrder)", async () => {
    await POST(makeReq({ amount: 1000, reason: "damaged" }), makeCtx() as never);
    expect(mockRefund).toHaveBeenCalledWith(
      expect.objectContaining({ method: "razorpay", razorpayPaymentId: "pay_abc123" }),
    );
  });

  it("BUG-4 fix: COD order → calls processRefundAction with method: manual", async () => {
    mockFindById.mockResolvedValue({
      id: "order-cod",
      status: "delivered",
      totalPrice: 10000,
      paymentMethod: "cod",
      paymentId: undefined,
    });
    await POST(makeReq({ amount: 10000, reason: "return" }), makeCtx("order-cod") as never);
    expect(mockRefund).toHaveBeenCalledWith(
      expect.objectContaining({ method: "manual" }),
    );
    expect((mockRefund.mock.calls[0][0] as { razorpayPaymentId?: string }).razorpayPaymentId).toBeUndefined();
  });

  it("amount >= totalPrice → type: full", async () => {
    await POST(makeReq({ amount: 10000, reason: "full refund" }), makeCtx() as never);
    expect(mockRefund).toHaveBeenCalledWith(
      expect.objectContaining({ type: "full" }),
    );
  });

  it("amount < totalPrice → type: partial", async () => {
    await POST(makeReq({ amount: 5000, reason: "partial" }), makeCtx() as never);
    expect(mockRefund).toHaveBeenCalledWith(
      expect.objectContaining({ type: "partial" }),
    );
  });

  it("processRefundAction returns ok: false → 400 with error message", async () => {
    mockRefund.mockResolvedValue({ ok: false, error: "Digital code already claimed" });
    const res = await POST(makeReq({ amount: 1000, reason: "test" }), makeCtx() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Digital code");
  });

  it("success → 200 with { id, amount, reason }", async () => {
    const res = await POST(makeReq({ amount: 1000, reason: "damaged item" }), makeCtx() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
