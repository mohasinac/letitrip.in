/**
 * Tests for POST /api/admin/users/[uid]/unban
 * Admin-only. Re-enables Firebase Auth account, clears ban fields.
 * Sends restoration notification fire-and-forget.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockUserUpdate,
  mockAuthUpdateUser,
  mockSendNotification,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockAuthUpdateUser: vi.fn(),
  mockSendNotification: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));
vi.mock("@mohasinac/appkit/server", () => ({
  getAdminAuth: () => ({ updateUser: mockAuthUpdateUser }),
  sendNotification: mockSendNotification,
}));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { findById: mockFindById, update: mockUserUpdate },
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

import { POST } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/admin/users/user-ravi/unban", { method: "POST" });

const bannedUser = {
  id: "user-ravi",
  uid: "uid-ravi",
  role: "user",
  isDisabled: true,
  hardBanReason: "Fraud",
  hardBannedAt: new Date(),
  hardBannedBy: "admin-1",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(bannedUser);
  mockUserUpdate.mockResolvedValue(undefined);
  mockAuthUpdateUser.mockResolvedValue(undefined);
  mockSendNotification.mockResolvedValue(undefined);
});

describe("POST /api/admin/users/[uid]/unban", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (admin-only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(403);
  });

  it("user not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await POST(makeReq() as never, { params: { uid: "nonexistent" } });
    expect(res.status).toBe(404);
  });

  it("re-enables Firebase Auth account using uid param (Firestore doc ID)", async () => {
    await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    // Route uses params.uid, not target.uid
    expect(mockAuthUpdateUser).toHaveBeenCalledWith("user-ravi", { disabled: false });
  });

  it("Auth re-enable failure → swallowed, unban proceeds", async () => {
    mockAuthUpdateUser.mockRejectedValue(new Error("Firebase error"));
    const res = await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalled();
  });

  it("clears isDisabled and hardBan fields from Firestore", async () => {
    await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    const updateArg = mockUserUpdate.mock.calls[0][1] as {
      isDisabled: boolean;
      hardBanReason: unknown;
      hardBannedAt: unknown;
      hardBannedBy: unknown;
    };
    expect(updateArg.isDisabled).toBe(false);
    expect(updateArg.hardBanReason).toBeUndefined();
    expect(updateArg.hardBannedAt).toBeUndefined();
    expect(updateArg.hardBannedBy).toBeUndefined();
  });

  it("sends restoration notification to user", async () => {
    await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    expect(mockSendNotification).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-ravi",
      type: "account_action",
    }));
  });

  it("notification failure → swallowed, unban succeeds", async () => {
    mockSendNotification.mockRejectedValue(new Error("RTDB down"));
    const res = await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(200);
  });

  it("success → 200 with { uid }", async () => {
    const res = await POST(makeReq() as never, { params: { uid: "user-ravi" } });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string } };
    expect(json.data.uid).toBe("user-ravi");
  });
});
