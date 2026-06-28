/**
 * Tests for POST /api/payment/webhook (Razorpay webhook handler)
 * Public endpoint — no auth required.
 * Verifies webhook signature, signals RTDB on payment events.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockVerifyWebhookSignature,
  mockGetAdminRealtimeDb,
  mockHandleApiError,
} = vi.hoisted(() => {
  const mockRef = { update: vi.fn().mockResolvedValue(undefined) };
  const mockDb = { ref: vi.fn(() => mockRef) };
  return {
    mockVerifyWebhookSignature: vi.fn(),
    mockGetAdminRealtimeDb: vi.fn(() => mockDb),
    mockHandleApiError: vi.fn((err: unknown) => {
      const e = err as { status?: number; message?: string };
      return new Response(JSON.stringify({ ok: false, error: e.message }), { status: e.status ?? 500 });
    }),
  };
});

vi.mock("next/server", () => ({
  NextRequest: class NextRequest extends Request {
    constructor(url: string, init?: RequestInit) { super(url, init); }
  },
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), { status: init?.status ?? 200 }),
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  verifyWebhookSignature: mockVerifyWebhookSignature,
  handleApiError: mockHandleApiError,
  getAdminRealtimeDb: mockGetAdminRealtimeDb,
  normalizeError: vi.fn(),
  AuthenticationError: class AuthenticationError extends Error {
    status = 401;
    constructor(msg: string) { super(msg); this.name = "AuthenticationError"; }
  },
  ValidationError: class ValidationError extends Error {
    status = 400;
    constructor(msg: string) { super(msg); this.name = "ValidationError"; }
  },
  ERROR_MESSAGES: {
    AUTH: { INVALID_SIGNATURE: "Invalid webhook signature" },
    CHECKOUT: { PAYMENT_DECLINED: "Payment was declined" },
    VALIDATION: { INVALID_JSON: "Invalid JSON" },
  },
  RTDB_PATHS: { PAYMENT_EVENTS: "payment-events" },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { POST } from "../route";

const makeReq = (body: unknown, signature = "valid-sig") =>
  new Request("http://localhost/api/payment/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature,
    },
    body: JSON.stringify(body),
  });

const makeEvent = (eventName: string, paymentEntity?: Record<string, string>) => ({
  event: eventName,
  payload: paymentEntity
    ? { payment: { entity: paymentEntity } }
    : {},
});

beforeEach(() => {
  vi.clearAllMocks();
  mockVerifyWebhookSignature.mockResolvedValue(true);
  (process.env as Record<string, string>).NODE_ENV = "test";
});

describe("POST /api/payment/webhook", () => {
  it("no auth required — public endpoint (no auth header needed)", async () => {
    const res = await POST(makeReq(makeEvent("order.paid")) as never);
    expect(res.status).toBe(200);
  });

  it("valid signature → 200 with { received: true }", async () => {
    const res = await POST(makeReq(makeEvent("order.paid")) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { received: boolean };
    expect(json.received).toBe(true);
  });

  it("invalid signature (verifyWebhookSignature returns false) → error response", async () => {
    mockVerifyWebhookSignature.mockResolvedValue(false);
    const res = await POST(makeReq(makeEvent("payment.captured"), "bad-sig") as never);
    // handleApiError called with AuthenticationError
    expect(mockHandleApiError).toHaveBeenCalled();
    expect(res.status).not.toBe(200);
  });

  it("payment.captured event → signals RTDB with status=success", async () => {
    const body = makeEvent("payment.captured", {
      id: "pay_abc",
      order_id: "order_razorpay_123",
    });
    await POST(makeReq(body) as never);
    const db = mockGetAdminRealtimeDb();
    expect(db.ref).toHaveBeenCalledWith("payment-events/order_razorpay_123");
    expect(db.ref().update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success" }),
    );
  });

  it("payment.failed event → signals RTDB with status=failed", async () => {
    const body = makeEvent("payment.failed", {
      id: "pay_fail",
      order_id: "order_razorpay_456",
      error_description: "Insufficient funds",
    });
    await POST(makeReq(body) as never);
    const db = mockGetAdminRealtimeDb();
    expect(db.ref).toHaveBeenCalledWith("payment-events/order_razorpay_456");
    expect(db.ref().update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", error: "Insufficient funds" }),
    );
  });

  it("payment.failed with no error_description → falls back to default message", async () => {
    const body = makeEvent("payment.failed", {
      id: "pay_fail",
      order_id: "order_razorpay_789",
    });
    await POST(makeReq(body) as never);
    const db = mockGetAdminRealtimeDb();
    expect(db.ref().update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", error: "Payment was declined" }),
    );
  });

  it("payment.captured without order_id → RTDB ref NOT called", async () => {
    const body = makeEvent("payment.captured", { id: "pay_abc" }); // no order_id
    await POST(makeReq(body) as never);
    const db = mockGetAdminRealtimeDb();
    // ref should not be called with payment-events path
    const calls = db.ref.mock.calls as string[][];
    expect(calls.every((args) => !args[0]?.startsWith("payment-events/"))).toBe(true);
  });

  it("order.paid event → 200 no-op (logged, no RTDB signal)", async () => {
    const body = makeEvent("order.paid");
    const res = await POST(makeReq(body) as never);
    expect(res.status).toBe(200);
    const db = mockGetAdminRealtimeDb();
    expect(db.ref().update).not.toHaveBeenCalled();
  });

  it("unknown event type → 200 with { received: true } (acknowledged but unhandled)", async () => {
    const body = makeEvent("subscription.charged");
    const res = await POST(makeReq(body) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { received: boolean };
    expect(json.received).toBe(true);
  });

  it("RTDB signal failure on payment.captured → swallowed (200 still returned)", async () => {
    const body = makeEvent("payment.captured", {
      id: "pay_ok",
      order_id: "order_123",
    });
    const db = mockGetAdminRealtimeDb();
    db.ref().update.mockRejectedValueOnce(new Error("RTDB unavailable"));
    const res = await POST(makeReq(body) as never);
    expect(res.status).toBe(200);
  });

  it("invalid JSON body → error response via handleApiError", async () => {
    const res = await POST(
      new Request("http://localhost/api/payment/webhook", {
        method: "POST",
        headers: { "Content-Type": "text/plain", "x-razorpay-signature": "valid-sig" },
        body: "not-json",
      }) as never,
    );
    // ValidationError → handleApiError
    expect(mockHandleApiError).toHaveBeenCalled();
    expect(res.status).not.toBe(200);
  });

  it("RTDB signal includes updatedAt timestamp", async () => {
    const body = makeEvent("payment.captured", {
      id: "pay_ts",
      order_id: "order_ts_test",
    });
    const before = Date.now();
    await POST(makeReq(body) as never);
    const after = Date.now();
    const db = mockGetAdminRealtimeDb();
    const updateArg = db.ref().update.mock.calls[0][0] as { updatedAt: number };
    expect(updateArg.updatedAt).toBeGreaterThanOrEqual(before);
    expect(updateArg.updatedAt).toBeLessThanOrEqual(after);
  });
});
