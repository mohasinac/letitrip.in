/**
 * Tests for POST /api/admin/payouts/[id]/deduction
 *
 * ROLES_ADMIN_ONLY + permission: admin:payouts:write
 *
 * Schema: orderId (string min 1), refundId (string min 1),
 *         refundedAmount (int positive), deductedAmount (int positive, optional),
 *         reason (string 3-500)
 *
 * Business logic:
 * - deductedAmount defaults to Math.round(refundedAmount * 0.95) if omitted
 * - payoutRepository.applyRefundDeduction(id, { orderId, refundId, refundedAmount, deductedAmount, reason })
 * - Error "not found" → 404
 * - Error with "status \"" → 409 (payout in wrong status for deduction)
 * - Returns { id, netAmount, refundDeductions }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockApplyRefundDeduction } = vi.hoisted(() => ({
  mockApplyRefundDeduction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  payoutRepository: { applyRefundDeduction: mockApplyRefundDeduction },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { POST } from "../route";

const params = { params: Promise.resolve({ id: "payout-pokemon-palace-20260601-a1b2c3" }) };

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/admin/payouts/payout-pokemon-palace-20260601-a1b2c3/deduction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  orderId: "order-2-20260601-x1y2z3",
  refundId: "rfnd-abc123",
  refundedAmount: 10000,
  reason: "Customer returned damaged item",
};

const mockUpdatedPayout = {
  id: "payout-pokemon-palace-20260601-a1b2c3",
  netAmount: 490000,
  refundDeductions: [{ orderId: "order-2-20260601-x1y2z3", deductedAmount: 9500 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockApplyRefundDeduction.mockResolvedValue(mockUpdatedPayout);
});

describe("POST /api/admin/payouts/[id]/deduction", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest(validBody) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeRequest(validBody) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("missing orderId → 400", async () => {
    const { orderId: _, ...rest } = validBody;
    const res = await POST(makeRequest(rest) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("missing refundId → 400", async () => {
    const { refundId: _, ...rest } = validBody;
    const res = await POST(makeRequest(rest) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("refundedAmount = 0 → 400 (must be positive)", async () => {
    const res = await POST(makeRequest({ ...validBody, refundedAmount: 0 }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("refundedAmount negative → 400", async () => {
    const res = await POST(makeRequest({ ...validBody, refundedAmount: -500 }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("reason < 3 chars → 400", async () => {
    const res = await POST(makeRequest({ ...validBody, reason: "ab" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("reason > 500 chars → 400", async () => {
    const res = await POST(makeRequest({ ...validBody, reason: "x".repeat(501) }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("deductedAmount omitted → defaults to Math.round(refundedAmount * 0.95)", async () => {
    await POST(makeRequest(validBody) as never, params as never);
    expect(mockApplyRefundDeduction).toHaveBeenCalledWith(
      "payout-pokemon-palace-20260601-a1b2c3",
      expect.objectContaining({ deductedAmount: Math.round(10000 * 0.95) }),
    );
  });

  it("deductedAmount provided → uses exact value (no default applied)", async () => {
    await POST(makeRequest({ ...validBody, deductedAmount: 8000 }) as never, params as never);
    expect(mockApplyRefundDeduction).toHaveBeenCalledWith(
      "payout-pokemon-palace-20260601-a1b2c3",
      expect.objectContaining({ deductedAmount: 8000 }),
    );
  });

  it("payout not found error → 404", async () => {
    mockApplyRefundDeduction.mockRejectedValue(new Error("Payout not found"));
    const res = await POST(makeRequest(validBody) as never, params as never);
    expect(res.status).toBe(404);
  });

  it('error with status " in message → 409 (wrong payout status)', async () => {
    mockApplyRefundDeduction.mockRejectedValue(new Error('Cannot deduct from payout with status "paid"'));
    const res = await POST(makeRequest(validBody) as never, params as never);
    expect(res.status).toBe(409);
  });

  it("other errors propagate (rethrown)", async () => {
    mockApplyRefundDeduction.mockRejectedValue(new Error("Unexpected DB error"));
    await expect(POST(makeRequest(validBody) as never, params as never)).rejects.toThrow();
  });

  it("success → 200 with { id, netAmount, refundDeductions }", async () => {
    const res = await POST(makeRequest(validBody) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: { id: string; netAmount: number; refundDeductions: unknown[] };
    };
    expect(json.data.id).toBe("payout-pokemon-palace-20260601-a1b2c3");
    expect(json.data.netAmount).toBe(490000);
    expect(json.data.refundDeductions).toHaveLength(1);
  });

  it("passes all required fields to applyRefundDeduction", async () => {
    await POST(makeRequest({ ...validBody, reason: "Damaged item" }) as never, params as never);
    expect(mockApplyRefundDeduction).toHaveBeenCalledWith(
      "payout-pokemon-palace-20260601-a1b2c3",
      expect.objectContaining({
        orderId: "order-2-20260601-x1y2z3",
        refundId: "rfnd-abc123",
        refundedAmount: 10000,
        reason: "Damaged item",
      }),
    );
  });
});
