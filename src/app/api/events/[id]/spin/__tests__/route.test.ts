/**
 * Tests for POST /api/events/[id]/spin
 * Auth required — guests cannot spin.
 * assignSpinPrizeAction does the heavy lifting; we verify routing logic.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; displayName: string; email: string } | null = null;

const { mockAssignSpinPrizeAction } = vi.hoisted(() => ({
  mockAssignSpinPrizeAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/features", () => ({
  withFeatureGuard: (_flag: string, handler: unknown) => handler,
  getFlag: () => true,
}));

vi.mock("@mohasinac/appkit/server", () => ({
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise
        ? await (context.params as Promise<unknown>)
        : context?.params;
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
  assignSpinPrizeAction: mockAssignSpinPrizeAction,
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
}));

import { POST } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/events/event-spin-wheel/spin", { method: "POST" });

const makeCtx = (id = "event-spin-wheel") => ({
  params: Promise.resolve({ id }),
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "user-ravi", displayName: "Ravi Kumar", email: "ravi@example.com" };
  mockAssignSpinPrizeAction.mockResolvedValue({
    ok: true,
    data: { spinPrizeId: "prize-20pct-off", spinPrizeCouponCode: "SPIN20", reason: null },
  });
});

describe("POST /api/events/[id]/spin", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never, makeCtx());
    expect(res.status).toBe(401);
    expect(mockAssignSpinPrizeAction).not.toHaveBeenCalled();
  });

  it("successful spin → 200 with prize data", async () => {
    const res = await POST(makeReq() as never, makeCtx());
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean; data: { spinPrizeId: string } };
    expect(body.ok).toBe(true);
    expect(body.data.spinPrizeId).toBe("prize-20pct-off");
  });

  it("assignSpinPrizeAction called with eventId + userId", async () => {
    await POST(makeReq() as never, makeCtx("event-pokemon-spin"));
    expect(mockAssignSpinPrizeAction).toHaveBeenCalledWith({
      eventId: "event-pokemon-spin",
      userId: "user-ravi",
    });
  });

  it("already spun (data.reason present + no spinPrizeId) → 409", async () => {
    mockAssignSpinPrizeAction.mockResolvedValue({
      ok: true,
      data: { spinPrizeId: null, reason: "User has already used their spin for this event." },
    });
    const res = await POST(makeReq() as never, makeCtx());
    expect(res.status).toBe(409);
    const body = await res.json() as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/already used/i);
  });

  it("action fails (ok: false) → 500", async () => {
    mockAssignSpinPrizeAction.mockResolvedValue({
      ok: false,
      error: "Spin wheel is not active for this event",
    });
    const res = await POST(makeReq() as never, makeCtx());
    expect(res.status).toBe(500);
    const body = await res.json() as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/not active/i);
  });
});
