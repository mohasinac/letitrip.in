/**
 * Tests for POST /api/checkout
 * Thin delegator to createCheckoutOrderAction.
 * Key assertions: userName resolution (displayName → email → "Unknown User"),
 * all params forwarded correctly.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

let _user: { uid: string; email: string | null; displayName?: string | null; role?: string } | null = null;

const { mockCreateCheckoutOrderAction } = vi.hoisted(() => ({
  mockCreateCheckoutOrderAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  createCheckoutOrderAction: mockCreateCheckoutOrderAction,
  SUCCESS_MESSAGES: { CHECKOUT: { ORDER_PLACED: "Order placed successfully" } },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: z.ZodTypeAny;
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation error";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { POST } from "../route";

const validBody = {
  addressId: "addr-001",
  paymentMethod: "cod",
  notes: "Leave at door",
  excludedProductIds: [],
};

const mockOrderResult = {
  orderIds: ["order-1-20260628-abc123"],
  total: 50000,
  itemCount: 2,
};

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "user-001", email: "ravi@test.com", displayName: "Ravi Kumar" };
  mockCreateCheckoutOrderAction.mockResolvedValue(mockOrderResult);
});

describe("POST /api/checkout", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(401);
  });

  it("missing addressId → 400", async () => {
    const { addressId: _, ...bodyWithout } = validBody;
    const res = await POST(makeReq(bodyWithout) as never);
    expect(res.status).toBe(400);
  });

  it("invalid paymentMethod → 400", async () => {
    const res = await POST(makeReq({ ...validBody, paymentMethod: "bitcoin" }) as never);
    expect(res.status).toBe(400);
  });

  it("notes > 500 chars → 400", async () => {
    const res = await POST(makeReq({ ...validBody, notes: "x".repeat(501) }) as never);
    expect(res.status).toBe(400);
  });

  it("delegates to createCheckoutOrderAction with correct params", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith({
      userId: "user-001",
      userName: "Ravi Kumar",
      userEmail: "ravi@test.com",
      addressId: "addr-001",
      paymentMethod: "cod",
      notes: "Leave at door",
      excludedProductIds: [],
    });
  });

  it("userName = displayName when present", async () => {
    _user = { uid: "u", email: "a@b.com", displayName: "John Doe" };
    await POST(makeReq(validBody) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ userName: "John Doe" }),
    );
  });

  it("userName = email when displayName is null", async () => {
    _user = { uid: "u", email: "fallback@test.com", displayName: null };
    await POST(makeReq(validBody) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ userName: "fallback@test.com" }),
    );
  });

  it("userName = 'Unknown User' when neither displayName nor email", async () => {
    _user = { uid: "u", email: null, displayName: null };
    await POST(makeReq(validBody) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ userName: "Unknown User" }),
    );
  });

  it("userEmail = empty string when email is null", async () => {
    _user = { uid: "u", email: null, displayName: "Ghost" };
    await POST(makeReq(validBody) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ userEmail: "" }),
    );
  });

  it("excludedProductIds forwarded to action", async () => {
    await POST(makeReq({ ...validBody, excludedProductIds: ["product-abc"] }) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ excludedProductIds: ["product-abc"] }),
    );
  });

  it("success → 200 with order result", async () => {
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { orderIds: string[]; total: number } };
    expect(json.ok).toBe(true);
    expect(json.data.orderIds).toHaveLength(1);
    expect(json.data.total).toBe(50000);
  });

  it("action throws ValidationError → propagates (no swallow)", async () => {
    mockCreateCheckoutOrderAction.mockRejectedValue(new Error("CART_EMPTY"));
    await expect(POST(makeReq(validBody) as never)).rejects.toThrow("CART_EMPTY");
  });

  it("upi_manual is a valid paymentMethod", async () => {
    const res = await POST(makeReq({ ...validBody, paymentMethod: "upi_manual" }) as never);
    expect(res.status).toBe(200);
  });

  it("online is a valid paymentMethod", async () => {
    const res = await POST(makeReq({ ...validBody, paymentMethod: "online" }) as never);
    expect(res.status).toBe(200);
  });
});
