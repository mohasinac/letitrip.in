/**
 * Tests for POST /api/user/orders/[id]/cancel
 * Auth required. Any authenticated user.
 * schema: { reason: z.string().min(1).max(500).default("Cancelled by user") }
 * Delegates to cancelOrderForUser(uid, orderId, reason).
 * cancelOrderForUser enforces ownership and status guards internally.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockCancelOrderForUser } = vi.hoisted(() => ({
  mockCancelOrderForUser: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  cancelOrderForUser: mockCancelOrderForUser,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

// Import z to use the same schema validation behaviour

import { POST } from "../route";

const params = { params: Promise.resolve({ id: "order-2-20260601-x1y2z3" }) };

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/user/orders/order-2-20260601-x1y2z3/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeEmptyRequest = () =>
  new Request("http://localhost/api/user/orders/order-2-20260601-x1y2z3/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockCancelOrderForUser.mockResolvedValue(undefined);
});

describe("POST /api/user/orders/[id]/cancel", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeEmptyRequest() as never, params as never);
    expect(res.status).toBe(401);
  });

  it("no reason provided → defaults to 'Cancelled by user'", async () => {
    await POST(makeEmptyRequest() as never, params as never);
    expect(mockCancelOrderForUser).toHaveBeenCalledWith(
      "buyer-uid",
      "order-2-20260601-x1y2z3",
      "Cancelled by user",
    );
  });

  it("custom reason → passed through to cancelOrderForUser", async () => {
    await POST(makeRequest({ reason: "Changed my mind" }) as never, params as never);
    expect(mockCancelOrderForUser).toHaveBeenCalledWith(
      "buyer-uid",
      "order-2-20260601-x1y2z3",
      "Changed my mind",
    );
  });

  it("reason > 500 chars → 400", async () => {
    const longReason = "x".repeat(501);
    const res = await POST(makeRequest({ reason: longReason }) as never, params as never);
    expect(res.status).toBe(400);
    expect(mockCancelOrderForUser).not.toHaveBeenCalled();
  });

  it("empty reason string → 400 (min(1) fails)", async () => {
    const res = await POST(makeRequest({ reason: "" }) as never, params as never);
    expect(res.status).toBe(400);
    expect(mockCancelOrderForUser).not.toHaveBeenCalled();
  });

  it("calls cancelOrderForUser with user uid from token (not from body)", async () => {
    _user = { uid: "specific-buyer-uid", role: "user" };
    await POST(makeRequest({ reason: "Test" }) as never, params as never);
    expect(mockCancelOrderForUser).toHaveBeenCalledWith(
      "specific-buyer-uid",
      expect.any(String),
      expect.any(String),
    );
  });

  it("passes orderId from route params", async () => {
    await POST(makeRequest({ reason: "Test" }) as never, params as never);
    expect(mockCancelOrderForUser).toHaveBeenCalledWith(
      expect.any(String),
      "order-2-20260601-x1y2z3",
      expect.any(String),
    );
  });

  it("success → 200", async () => {
    const res = await POST(makeEmptyRequest() as never, params as never);
    expect(res.status).toBe(200);
  });

  it("cancelOrderForUser throws (e.g. not found or wrong status) → error propagates", async () => {
    mockCancelOrderForUser.mockRejectedValue(new Error("Order not found"));
    await expect(
      POST(makeEmptyRequest() as never, params as never),
    ).rejects.toThrow("Order not found");
  });
});
