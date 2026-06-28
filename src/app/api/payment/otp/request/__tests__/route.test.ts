/**
 * Tests for POST /api/payment/otp/request
 * Enforces per-user 15-minute cooldown and daily global SMS cap (Firebase free-tier).
 * Auth required — OTPs are only for authenticated users about to pay.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCheckAndSetUserCooldown,
  mockCheckAndIncrement,
} = vi.hoisted(() => ({
  mockCheckAndSetUserCooldown: vi.fn(),
  mockCheckAndIncrement: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  smsCounterRepository: {
    checkAndSetUserCooldown: mockCheckAndSetUserCooldown,
    checkAndIncrement: mockCheckAndIncrement,
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiError: class ApiError extends Error {
    constructor(public status: number, msg: string) { super(msg); }
  },
  ERROR_MESSAGES: { CHECKOUT: { OTP_DAILY_LIMIT: "Daily OTP limit reached. Try again tomorrow." } },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      try {
        return await opts.handler({ user: _user ?? undefined });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return new Response(JSON.stringify({ ok: false, error: e.message }), { status: e.status ?? 500 });
      }
    };
  },
}));

import { POST } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/payment/otp/request", { method: "POST" });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockCheckAndSetUserCooldown.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
  mockCheckAndIncrement.mockResolvedValue({ allowed: true, count: 42 });
});

describe("POST /api/payment/otp/request", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("per-user cooldown active → 429 with minutes-remaining in message", async () => {
    mockCheckAndSetUserCooldown.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 720, // 12 minutes remaining
    });
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(429);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("12 minute");
  });

  it("per-user cooldown: 1 second remaining → '1 minute' message (ceil)", async () => {
    mockCheckAndSetUserCooldown.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 1, // 1 second = ceil(1/60) = 1 minute
    });
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(429);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("1 minute");
  });

  it("cooldown not active + daily limit reached → 429 with daily limit message", async () => {
    mockCheckAndSetUserCooldown.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mockCheckAndIncrement.mockResolvedValue({ allowed: false, count: 1000 });
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(429);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Daily OTP limit");
  });

  it("cooldown checked before daily counter (cooldown gate first)", async () => {
    mockCheckAndSetUserCooldown.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 300,
    });
    await POST(makeReq() as never);
    // Daily counter should NOT be checked when cooldown is active
    expect(mockCheckAndIncrement).not.toHaveBeenCalled();
  });

  it("both cooldown and daily limit pass → 200 with { allowed: true, count }", async () => {
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { allowed: boolean; count: number } };
    expect(json.ok).toBe(true);
    expect(json.data.allowed).toBe(true);
    expect(json.data.count).toBe(42);
  });

  it("checkAndSetUserCooldown called with user uid", async () => {
    await POST(makeReq() as never);
    expect(mockCheckAndSetUserCooldown).toHaveBeenCalledWith("buyer-uid");
  });

  it("checkAndIncrement called with today's IST date string (YYYY-MM-DD format)", async () => {
    await POST(makeReq() as never);
    const [dateArg] = mockCheckAndIncrement.mock.calls[0] as [string];
    expect(dateArg).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
