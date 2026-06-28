/**
 * Tests for DELETE /api/admin/users/[uid]/soft-ban/[action]
 * Lifts a specific action ban. Trust & Safety can remove bans.
 * If ban action not found → 404 (not silently no-op).
 * Sends lift-notification fire-and-forget (failure swallowed).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; displayName?: string } | null = null;

const {
  mockFindById,
  mockUpdate,
  mockNotifCreate,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
  mockNotifCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_TRUST_SAFETY: ["admin", "employee"] }));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { findById: mockFindById, update: mockUpdate },
  notificationRepository: { create: mockNotifCreate },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context: { params?: Record<string, string> }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, params: context?.params });
    };
  },
}));

import { DELETE } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/admin/users/user-ravi/soft-ban/place_bids", { method: "DELETE" });

const activeBan = { action: "place_bids", reason: "Shill bidding", bannedBy: "admin-1", bannedAt: new Date() };

const mockTarget = {
  id: "user-ravi",
  uid: "uid-ravi",
  role: "user",
  softBans: [activeBan, { action: "write_reviews", reason: "Fake", bannedBy: "admin-1", bannedAt: new Date() }],
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin", displayName: "Admin User" };
  mockFindById.mockResolvedValue({ ...mockTarget });
  mockUpdate.mockResolvedValue(undefined);
  mockNotifCreate.mockResolvedValue(undefined);
});

describe("DELETE /api/admin/users/[uid]/soft-ban/[action]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq() as never, { params: { uid: "user-ravi", action: "place_bids" } });
    expect(res.status).toBe(401);
  });

  it("regular user → 403 (trust & safety only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await DELETE(makeReq() as never, { params: { uid: "user-ravi", action: "place_bids" } });
    expect(res.status).toBe(403);
  });

  it("user not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(makeReq() as never, { params: { uid: "nonexistent", action: "place_bids" } });
    expect(res.status).toBe(404);
  });

  it("action not in softBans → 404", async () => {
    const res = await DELETE(makeReq() as never, { params: { uid: "user-ravi", action: "send_messages" } });
    expect(res.status).toBe(404);
  });

  it("removes only the specified ban action", async () => {
    await DELETE(makeReq() as never, { params: { uid: "user-ravi", action: "place_bids" } });
    const updateArg = mockUpdate.mock.calls[0][1] as { softBans: { action: string }[] };
    expect(updateArg.softBans.find((b) => b.action === "place_bids")).toBeUndefined();
    // Other bans remain
    expect(updateArg.softBans.find((b) => b.action === "write_reviews")).toBeDefined();
  });

  it("sends lift notification to user", async () => {
    await DELETE(makeReq() as never, { params: { uid: "user-ravi", action: "place_bids" } });
    expect(mockNotifCreate).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-ravi",
      type: "account_action",
    }));
  });

  it("notification failure → swallowed, request succeeds", async () => {
    mockNotifCreate.mockRejectedValue(new Error("DB down"));
    const res = await DELETE(makeReq() as never, { params: { uid: "user-ravi", action: "place_bids" } });
    expect(res.status).toBe(200);
  });

  it("success → 200 with { uid, action }", async () => {
    const res = await DELETE(makeReq() as never, { params: { uid: "user-ravi", action: "place_bids" } });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string; action: string } };
    expect(json.data.uid).toBe("user-ravi");
    expect(json.data.action).toBe("place_bids");
  });
});
