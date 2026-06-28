/**
 * Tests for GET/PATCH/DELETE /api/admin/users/[uid]
 * GET: admin/moderator can view any user profile.
 * PATCH: update role, emailVerified, displayName, etc. (admin:users:write).
 * DELETE: hard-delete user (admin-only).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; displayName?: string } | null = null;

const {
  mockFindById,
  mockAdminUpdateUser,
  mockAdminDeleteUser,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockAdminUpdateUser: vi.fn(),
  mockAdminDeleteUser: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { findById: mockFindById },
  adminUpdateUser: mockAdminUpdateUser,
  adminDeleteUser: mockAdminDeleteUser,
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

import { GET, PATCH, DELETE } from "../route";

const makeReq = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/users/user-ravi", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockUserDoc = {
  id: "user-ravi",
  uid: "uid-ravi",
  email: "ravi@test.com",
  displayName: "Ravi Kumar",
  role: "user",
  emailVerified: true,
  disabled: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockUserDoc);
  mockAdminUpdateUser.mockResolvedValue(undefined);
  mockAdminDeleteUser.mockResolvedValue(undefined);
});

describe("GET /api/admin/users/[uid]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(401);
  });

  it("seller role → 403 (requires admin or moderator)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(403);
  });

  it("moderator can view user", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
  });

  it("user not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ uid: "nonexistent" }) });
    expect(res.status).toBe(404);
  });

  it("found → 200 with user data", async () => {
    const res = await GET(makeReq("GET") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockUserDoc };
    expect(json.data.uid).toBe("uid-ravi");
  });
});

describe("PATCH /api/admin/users/[uid]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeReq("PATCH", { role: "seller" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(401);
  });

  it("moderator → allowed to patch (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeReq("PATCH", { emailVerified: true }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
  });

  it("invalid role value → 400", async () => {
    const res = await PATCH(makeReq("PATCH", { role: "superadmin" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(400);
  });

  it("role update → adminUpdateUser called with actorId and targetId", async () => {
    await PATCH(makeReq("PATCH", { role: "seller" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockAdminUpdateUser).toHaveBeenCalledWith("admin-uid", "user-ravi", expect.objectContaining({ role: "seller" }));
  });

  it("emailVerified update → adminUpdateUser called", async () => {
    await PATCH(makeReq("PATCH", { emailVerified: false }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockAdminUpdateUser).toHaveBeenCalledWith("admin-uid", "user-ravi", expect.objectContaining({ emailVerified: false }));
  });

  it("displayName update → adminUpdateUser called", async () => {
    await PATCH(makeReq("PATCH", { displayName: "Ravi K." }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockAdminUpdateUser).toHaveBeenCalledWith("admin-uid", "user-ravi", expect.objectContaining({ displayName: "Ravi K." }));
  });

  it("success → 200 with uid and updated fields", async () => {
    const res = await PATCH(makeReq("PATCH", { role: "seller" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string; role: string } };
    expect(json.data.uid).toBe("user-ravi");
    expect(json.data.role).toBe("seller");
  });
});

describe("DELETE /api/admin/users/[uid]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(403);
  });

  it("admin → adminDeleteUser called with actorId and targetId", async () => {
    await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockAdminDeleteUser).toHaveBeenCalledWith("admin-uid", "user-ravi");
  });

  it("success → 200", async () => {
    const res = await DELETE(makeReq("DELETE") as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
  });
});
