/**
 * Tests for POST /api/admin/users/[uid]/soft-ban
 * Applies a scoped action ban (e.g. place_bids) with reason + optional expiry.
 * Trust & Safety (admin + employee) can apply soft bans.
 * Existing ban for same action is replaced (idempotent dedup).
 * Ban notification is sent fire-and-forget (failures swallowed).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockUpdate,
  mockSendNotification,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
  mockSendNotification: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_TRUST_SAFETY: ["admin", "employee"] }));
vi.mock("@mohasinac/appkit/server", () => ({
  sendNotification: mockSendNotification,
}));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { findById: mockFindById, update: mockUpdate },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context: { params?: Record<string, string> }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params: context?.params });
    };
  },
}));

import { POST } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/admin/users/user-ravi/soft-ban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockTarget = {
  id: "user-ravi",
  uid: "uid-ravi",
  email: "ravi@test.com",
  role: "user",
  softBans: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue({ ...mockTarget });
  mockUpdate.mockResolvedValue(undefined);
  mockSendNotification.mockResolvedValue(undefined);
});

describe("POST /api/admin/users/[uid]/soft-ban", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ action: "place_bids", reason: "Shill bidding" }) as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(401);
  });

  it("regular user → 403 (trust & safety only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeReq({ action: "place_bids", reason: "Shill bidding" }) as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(403);
  });

  it("employee → allowed (ROLES_TRUST_SAFETY includes employee)", async () => {
    _user = { uid: "emp-uid", role: "employee" };
    const res = await POST(makeReq({ action: "place_bids", reason: "Shill bidding" }) as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(200);
  });

  it("missing reason → 400 (required field)", async () => {
    const res = await POST(makeReq({ action: "place_bids" }) as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(400);
  });

  it("invalid action → 400", async () => {
    const res = await POST(makeReq({ action: "fly_away", reason: "test" }) as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(400);
  });

  it("user not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await POST(makeReq({ action: "place_bids", reason: "test" }) as never, { params: { uid: "nonexistent" } });
    expect(res.status).toBe(404);
  });

  it("new ban → stored in softBans array with action, reason, bannedBy, bannedAt", async () => {
    await POST(makeReq({ action: "place_bids", reason: "Shill bidding" }) as never, { params: { uid: "user-ravi" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { softBans: { action: string; reason: string; bannedBy: string; bannedAt: Date }[] };
    expect(updateArg.softBans).toHaveLength(1);
    expect(updateArg.softBans[0]!.action).toBe("place_bids");
    expect(updateArg.softBans[0]!.reason).toBe("Shill bidding");
    expect(updateArg.softBans[0]!.bannedBy).toBe("admin-uid");
    expect(updateArg.softBans[0]!.bannedAt).toBeInstanceOf(Date);
  });

  it("existing ban for same action → replaced (no duplicate entry)", async () => {
    mockFindById.mockResolvedValue({
      ...mockTarget,
      softBans: [{ action: "place_bids", reason: "Old reason", bannedBy: "mod-1", bannedAt: new Date() }],
    });
    await POST(makeReq({ action: "place_bids", reason: "New reason" }) as never, { params: { uid: "user-ravi" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { softBans: { reason: string }[] };
    // Should have exactly one entry for place_bids
    const bidBans = updateArg.softBans.filter((b) => b.reason !== undefined);
    expect(bidBans).toHaveLength(1);
    expect(bidBans[0]!.reason).toBe("New reason");
  });

  it("ban with different action → both bans retained", async () => {
    mockFindById.mockResolvedValue({
      ...mockTarget,
      softBans: [{ action: "write_reviews", reason: "Fake reviews", bannedBy: "mod-1", bannedAt: new Date() }],
    });
    await POST(makeReq({ action: "place_bids", reason: "Shill" }) as never, { params: { uid: "user-ravi" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { softBans: { action: string }[] };
    expect(updateArg.softBans).toHaveLength(2);
  });

  it("expiresAt provided → stored as Date on ban", async () => {
    const expiryStr = "2026-12-31T00:00:00.000Z";
    await POST(makeReq({ action: "place_bids", reason: "test", expiresAt: expiryStr }) as never, { params: { uid: "user-ravi" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { softBans: { expiresAt: Date | null }[] };
    expect(updateArg.softBans[0]!.expiresAt).toBeInstanceOf(Date);
  });

  it("no expiresAt → ban stored with expiresAt: null", async () => {
    await POST(makeReq({ action: "place_bids", reason: "test" }) as never, { params: { uid: "user-ravi" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { softBans: { expiresAt: Date | null }[] };
    expect(updateArg.softBans[0]!.expiresAt).toBeNull();
  });

  it("sends ban notification to target user", async () => {
    await POST(makeReq({ action: "place_bids", reason: "Shill bidding" }) as never, { params: { uid: "user-ravi" } });
    expect(mockSendNotification).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-ravi",
      type: "account_action",
    }));
  });

  it("notification failure → swallowed, request still succeeds", async () => {
    mockSendNotification.mockRejectedValue(new Error("RTDB down"));
    const res = await POST(makeReq({ action: "place_bids", reason: "test" }) as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(200);
  });

  it("success → 200 with { uid, action }", async () => {
    const res = await POST(makeReq({ action: "place_bids", reason: "test" }) as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string; action: string } };
    expect(json.data.uid).toBe("user-ravi");
    expect(json.data.action).toBe("place_bids");
  });
});
