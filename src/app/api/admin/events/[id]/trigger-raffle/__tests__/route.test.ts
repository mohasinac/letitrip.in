/**
 * Tests for POST /api/admin/events/[id]/trigger-raffle
 *
 * ROLES_ADMIN_ONLY + permission: admin:events:write
 * Imports from @mohasinac/appkit/server (not main index).
 *
 * Delegates entirely to triggerEventRaffleAction({ eventId }).
 * Response logic:
 *   - result.ok = false → 500 with result.error
 *   - result.ok = true, data.reason set AND no raffleWinnerUserId → 409 (idempotent/no entries)
 *   - result.ok = true, raffleWinnerUserId set → 200 with data
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockTriggerEventRaffleAction } = vi.hoisted(() => ({
  mockTriggerEventRaffleAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit/server", () => ({
  triggerEventRaffleAction: mockTriggerEventRaffleAction,
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
}));

import { POST } from "../route";

const params = { params: { id: "event-summer-holo-raffle-2026" } };

const makePost = () =>
  new Request("http://localhost/api/admin/events/event-summer-holo-raffle-2026/trigger-raffle", {
    method: "POST",
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockTriggerEventRaffleAction.mockResolvedValue({
    ok: true,
    data: {
      raffleWinnerUserId: "user-ravi-k",
      raffleWinnerDisplayName: "Ravi K",
      raffleWinnerEntryId: "entry-abc",
      raffleTriggeredAt: new Date().toISOString(),
      raffleEntryCount: 42,
    },
  });
});

describe("POST /api/admin/events/[id]/trigger-raffle", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePost() as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePost() as never, params as never);
    expect(res.status).toBe(403);
  });

  it("passes eventId from params to triggerEventRaffleAction", async () => {
    await POST(makePost() as never, params as never);
    expect(mockTriggerEventRaffleAction).toHaveBeenCalledWith({
      eventId: "event-summer-holo-raffle-2026",
    });
  });

  it("action returns ok: false → 500 with error message", async () => {
    mockTriggerEventRaffleAction.mockResolvedValue({
      ok: false,
      error: "Failed to load event",
    });
    const res = await POST(makePost() as never, params as never);
    expect(res.status).toBe(500);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Failed to load event");
  });

  it("action returns ok: true, reason set, no raffleWinnerUserId → 409 (no eligible entries)", async () => {
    mockTriggerEventRaffleAction.mockResolvedValue({
      ok: true,
      data: {
        reason: "No confirmed entries found",
        raffleWinnerUserId: null,
        raffleEntryCount: 0,
      },
    });
    const res = await POST(makePost() as never, params as never);
    expect(res.status).toBe(409);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("No confirmed entries found");
  });

  it("reason set but raffleWinnerUserId also set → 200 (winner found despite reason field)", async () => {
    mockTriggerEventRaffleAction.mockResolvedValue({
      ok: true,
      data: {
        reason: "Already triggered",
        raffleWinnerUserId: "user-ravi-k",
        raffleEntryCount: 1,
      },
    });
    const res = await POST(makePost() as never, params as never);
    expect(res.status).toBe(200);
  });

  it("action returns ok: true with winner → 200 with raffle data", async () => {
    const res = await POST(makePost() as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: {
        raffleWinnerUserId: string;
        raffleWinnerDisplayName: string;
        raffleEntryCount: number;
      };
    };
    expect(json.data.raffleWinnerUserId).toBe("user-ravi-k");
    expect(json.data.raffleWinnerDisplayName).toBe("Ravi K");
    expect(json.data.raffleEntryCount).toBe(42);
  });

  it("no reason and no raffleWinnerUserId → still 200 (action ok with empty result)", async () => {
    mockTriggerEventRaffleAction.mockResolvedValue({
      ok: true,
      data: { raffleEntryCount: 0 },
    });
    const res = await POST(makePost() as never, params as never);
    expect(res.status).toBe(200);
  });
});
