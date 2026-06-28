/**
 * Tests for POST /api/admin/users/[uid]/hard-ban
 * Admin-only. Disables Firebase Auth, marks isDisabled in Firestore,
 * revokes sessions, cascades to store/products if seller, cancels active bids.
 * Self-ban and admin-ban both blocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockUserUpdate,
  mockStoreUpdate,
  mockStoreFind,
  mockProductFindByStore,
  mockProductUpdate,
  mockSessionsFind,
  mockSessionDelete,
  mockBidFindBy,
  mockBidUpdate,
  mockAuthUpdateUser,
  mockSendNotification,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockStoreUpdate: vi.fn(),
  mockStoreFind: vi.fn(),
  mockProductFindByStore: vi.fn(),
  mockProductUpdate: vi.fn(),
  mockSessionsFind: vi.fn(),
  mockSessionDelete: vi.fn(),
  mockBidFindBy: vi.fn(),
  mockBidUpdate: vi.fn(),
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
  storeRepository: { findByOwnerId: mockStoreFind, update: mockStoreUpdate },
  productRepository: { findByStore: mockProductFindByStore, update: mockProductUpdate },
  sessionRepository: { findActiveByUser: mockSessionsFind, delete: mockSessionDelete },
  bidRepository: { findBy: mockBidFindBy, update: mockBidUpdate },
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
  new Request("http://localhost/api/admin/users/user-ravi/hard-ban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const buyerTarget = { id: "user-ravi", uid: "uid-ravi", role: "user", email: "ravi@test.com" };
const sellerTarget = { id: "user-seller", uid: "uid-seller", role: "seller", email: "seller@test.com" };
const adminTarget = { id: "user-admin2", uid: "uid-admin2", role: "admin", email: "admin2@letitrip.in" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(buyerTarget);
  mockUserUpdate.mockResolvedValue(undefined);
  mockAuthUpdateUser.mockResolvedValue(undefined);
  mockSessionsFind.mockResolvedValue([]);
  mockBidFindBy.mockResolvedValue([]);
  mockStoreFind.mockResolvedValue(null);
  mockSendNotification.mockResolvedValue(undefined);
});

describe("POST /api/admin/users/[uid]/hard-ban", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (admin-only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(403);
  });

  it("missing reason → 400", async () => {
    const res = await POST(makeReq({}) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(400);
  });

  it("self-ban → 400 (cannot ban yourself)", async () => {
    const res = await POST(makeReq({ reason: "test" }) as never, { params: Promise.resolve({ uid: "admin-uid" }) });
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Cannot ban yourself");
  });

  it("user not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "nonexistent" }) });
    expect(res.status).toBe(404);
  });

  it("banning another admin → 400", async () => {
    mockFindById.mockResolvedValue(adminTarget);
    const res = await POST(makeReq({ reason: "Rogue admin" }) as never, { params: Promise.resolve({ uid: "uid-admin2" }) });
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Cannot ban an admin");
  });

  it("disables Firebase Auth account using uid param (Firestore doc ID)", async () => {
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    // Route uses params.uid (the Firestore doc ID), not target.uid
    expect(mockAuthUpdateUser).toHaveBeenCalledWith("user-ravi", { disabled: true });
  });

  it("sets isDisabled, hardBanReason, hardBannedAt, hardBannedBy on Firestore doc", async () => {
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    const updateArg = mockUserUpdate.mock.calls[0][1] as {
      isDisabled: boolean;
      hardBanReason: string;
      hardBannedAt: Date;
      hardBannedBy: string;
    };
    expect(updateArg.isDisabled).toBe(true);
    expect(updateArg.hardBanReason).toBe("Fraud");
    expect(updateArg.hardBannedAt).toBeInstanceOf(Date);
    expect(updateArg.hardBannedBy).toBe("admin-uid");
  });

  it("revokes active sessions", async () => {
    mockSessionsFind.mockResolvedValue([{ id: "sess-1" }, { id: "sess-2" }]);
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockSessionDelete).toHaveBeenCalledTimes(2);
  });

  it("session revocation failure → swallowed, ban proceeds", async () => {
    mockSessionsFind.mockRejectedValue(new Error("DB error"));
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
  });

  it("seller → store suspended + products archived", async () => {
    mockFindById.mockResolvedValue(sellerTarget);
    mockStoreFind.mockResolvedValue({ id: "store-seller", status: "active" });
    mockProductFindByStore.mockResolvedValue([{ id: "product-1" }, { id: "product-2" }]);
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "uid-seller" }) });
    expect(mockStoreUpdate).toHaveBeenCalledWith("store-seller", { status: "suspended" });
    expect(mockProductUpdate).toHaveBeenCalledTimes(2);
    expect(mockProductUpdate).toHaveBeenCalledWith("product-1", { status: "archived" });
  });

  it("buyer (non-seller) → store/products cascade NOT triggered", async () => {
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockStoreFind).not.toHaveBeenCalled();
  });

  it("cancels active bids", async () => {
    mockBidFindBy.mockResolvedValue([
      { id: "bid-1", status: "active" },
      { id: "bid-2", status: "active" },
      { id: "bid-3", status: "outbid" },
    ]);
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    // Only active bids cancelled
    expect(mockBidUpdate).toHaveBeenCalledTimes(2);
    expect(mockBidUpdate).toHaveBeenCalledWith("bid-1", { status: "cancelled" });
  });

  it("sends ban notification to target user", async () => {
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockSendNotification).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-ravi",
      type: "account_action",
      priority: "high",
    }));
  });

  it("notification failure → swallowed, ban succeeds", async () => {
    mockSendNotification.mockRejectedValue(new Error("RTDB down"));
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
  });

  it("success → 200 with { uid }", async () => {
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string } };
    expect(json.data.uid).toBe("user-ravi");
  });
});
