import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; email: string; displayName?: string; role: string } | null = null;

const { mockVerifyAndPlace } = vi.hoisted(() => ({
  mockVerifyAndPlace: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  verifyAndPlaceRazorpayOrderAction: mockVerifyAndPlace,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  SUCCESS_MESSAGES: { CHECKOUT: { PAYMENT_RECEIVED: "Payment received" } },
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) return new Response(JSON.stringify({ ok: false, error: "Validation" }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { POST } from "../route";

const validBody = {
  razorpay_order_id: "order_abc",
  razorpay_payment_id: "pay_xyz",
  razorpay_signature: "sig_123",
  addressId: "addr-1",
};

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/payment/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", email: "buyer@test.com", displayName: "Test Buyer", role: "user" };
  mockVerifyAndPlace.mockResolvedValue({ orderIds: ["order-1"], total: 5000 });
});

describe("POST /api/payment/verify", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(401);
  });

  it("missing razorpay_order_id → 400", async () => {
    const res = await POST(makeReq({ ...validBody, razorpay_order_id: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("missing razorpay_payment_id → 400", async () => {
    const res = await POST(makeReq({ ...validBody, razorpay_payment_id: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("missing razorpay_signature → 400", async () => {
    const res = await POST(makeReq({ ...validBody, razorpay_signature: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("missing addressId → 400", async () => {
    const res = await POST(makeReq({ ...validBody, addressId: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("BUG-2 check: platformFee NOT in schema (already removed from schema, not sent)", async () => {
    // The schema only has: razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId, notes
    // platformFee was previously in the schema but silently dropped — it's now removed entirely
    const bodyWithPlatformFee = { ...validBody, platformFee: 500 };
    const res = await POST(makeReq(bodyWithPlatformFee) as never);
    // Extra unknown fields are stripped by Zod (not an error) — request still succeeds
    expect(res.status).toBe(200);
  });

  it("delegates to verifyAndPlaceRazorpayOrderAction with correct params", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockVerifyAndPlace).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "buyer-uid",
        razorpay_order_id: "order_abc",
        razorpay_payment_id: "pay_xyz",
        razorpay_signature: "sig_123",
        addressId: "addr-1",
      }),
    );
  });

  it("userName uses displayName when present", async () => {
    _user = { uid: "u1", email: "u@test.com", displayName: "Ravi Kumar", role: "user" };
    await POST(makeReq(validBody) as never);
    const call = mockVerifyAndPlace.mock.calls[0][0] as { userName: string };
    expect(call.userName).toBe("Ravi Kumar");
  });

  it("userName falls back to email when no displayName", async () => {
    _user = { uid: "u1", email: "u@test.com", role: "user" };
    await POST(makeReq(validBody) as never);
    const call = mockVerifyAndPlace.mock.calls[0][0] as { userName: string };
    expect(call.userName).toBe("u@test.com");
  });

  it("userName falls back to 'Unknown User' when email is null/undefined", async () => {
    // ?? only guards null/undefined — empty string won't trigger the fallback
    _user = { uid: "u1", email: null as unknown as string, role: "user" };
    await POST(makeReq(validBody) as never);
    const call = mockVerifyAndPlace.mock.calls[0][0] as { userName: string };
    expect(call.userName).toBe("Unknown User");
  });

  it("notes optional — not required for success", async () => {
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(200);
  });

  it("notes forwarded when provided", async () => {
    await POST(makeReq({ ...validBody, notes: "Please wrap carefully" }) as never);
    const call = mockVerifyAndPlace.mock.calls[0][0] as { notes?: string };
    expect(call.notes).toBe("Please wrap carefully");
  });

  it("notes > 500 chars → 400", async () => {
    const res = await POST(makeReq({ ...validBody, notes: "x".repeat(501) }) as never);
    expect(res.status).toBe(400);
  });

  it("success → 200 with action result", async () => {
    mockVerifyAndPlace.mockResolvedValue({ orderIds: ["order-abc"], total: 10000, itemCount: 2 });
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { orderIds: string[] } };
    expect(json.ok).toBe(true);
    expect(json.data.orderIds).toContain("order-abc");
  });

  it("action throws → propagates error", async () => {
    mockVerifyAndPlace.mockRejectedValue(new Error("Invalid signature"));
    await expect(POST(makeReq(validBody) as never)).rejects.toThrow("Invalid signature");
  });
});
