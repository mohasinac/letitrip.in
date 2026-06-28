/**
 * Tests for GET /api/admin/sessions
 * Requires admin/moderator role.
 * Enriches each session with Firebase Auth user details.
 * Failed user lookup → falls back to "Unknown User" placeholder.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindAllForAdmin,
  mockGetUser,
} = vi.hoisted(() => ({
  mockFindAllForAdmin: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  sessionRepository: { findAllForAdmin: mockFindAllForAdmin },
  getAdminAuth: () => ({ getUser: mockGetUser }),
  normalizeError: vi.fn(),
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  SUCCESS_MESSAGES: { SESSION: { FETCHED: "Sessions fetched" } },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (!_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const makeSession = (userId: string, overrides: Record<string, unknown> = {}) => ({
  id: `session-${userId}-001`,
  userId,
  deviceInfo: { browser: "Chrome", os: "Windows", device: "desktop" },
  location: { country: "IN" },
  isActive: true,
  revokedAt: null,
  revokedBy: null,
  createdAt: new Date("2026-06-01"),
  lastActivity: new Date("2026-06-27"),
  expiresAt: new Date("2027-06-01"),
  ...overrides,
});

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/sessions");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindAllForAdmin.mockResolvedValue({
    sessions: [makeSession("buyer-uid")],
    stats: { total: 1, active: 1, revoked: 0 },
  });
  mockGetUser.mockResolvedValue({
    uid: "buyer-uid",
    email: "buyer@test.com",
    displayName: "Test Buyer",
    customClaims: { role: "user" },
  });
});

describe("GET /api/admin/sessions", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer role → 403 (admin/moderator only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator role → 200 (allowed)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("sessions returned from repository", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { sessions: unknown[]; count: number } };
    expect(json.data.sessions).toHaveLength(1);
    expect(json.data.count).toBe(1);
  });

  it("session enriched with Firebase Auth user details", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { sessions: { user: { email: string; displayName: string; role: string } }[] }
    };
    const session = json.data.sessions[0];
    expect(session.user.email).toBe("buyer@test.com");
    expect(session.user.displayName).toBe("Test Buyer");
    expect(session.user.role).toBe("user");
  });

  it("failed getUser → falls back to Unknown User placeholder", async () => {
    mockGetUser.mockRejectedValue(new Error("User not found"));
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { sessions: { user: { displayName: string; email: null } }[] }
    };
    expect(json.data.sessions[0].user.displayName).toBe("Unknown User");
    expect(json.data.sessions[0].user.email).toBeNull();
  });

  it("getUser called once per unique userId (not per session)", async () => {
    // Same user has 2 sessions
    mockFindAllForAdmin.mockResolvedValue({
      sessions: [makeSession("buyer-uid"), makeSession("buyer-uid", { id: "session-buyer-002" })],
      stats: { total: 2, active: 2, revoked: 0 },
    });
    await GET(makeReq() as never);
    expect(mockGetUser).toHaveBeenCalledTimes(1); // deduped by userId
  });

  it("userId query param forwarded to repository", async () => {
    await GET(makeReq({ userId: "specific-user-uid" }) as never);
    expect(mockFindAllForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "specific-user-uid" }),
    );
  });

  it("limit query param forwarded to repository (default 100)", async () => {
    await GET(makeReq() as never);
    expect(mockFindAllForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 }),
    );
  });

  it("limit clamped to max 1000", async () => {
    await GET(makeReq({ limit: "9999" }) as never);
    expect(mockFindAllForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 1000 }),
    );
  });

  it("stats returned alongside sessions", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { stats: { total: number; active: number } } };
    expect(json.data.stats.total).toBe(1);
    expect(json.data.stats.active).toBe(1);
  });

  it("customClaims.role from Firebase Auth used in user.role", async () => {
    mockGetUser.mockResolvedValue({
      uid: "seller-uid",
      email: "seller@test.com",
      displayName: "Seller",
      customClaims: { role: "seller" },
    });
    mockFindAllForAdmin.mockResolvedValue({
      sessions: [makeSession("seller-uid")],
      stats: { total: 1, active: 1, revoked: 0 },
    });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { sessions: { user: { role: string } }[] }
    };
    expect(json.data.sessions[0].user.role).toBe("seller");
  });

  it("no customClaims → role defaults to 'user'", async () => {
    mockGetUser.mockResolvedValue({
      uid: "buyer-uid",
      email: "buyer@test.com",
      displayName: "Buyer",
      customClaims: undefined,
    });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { sessions: { user: { role: string } }[] }
    };
    expect(json.data.sessions[0].user.role).toBe("user");
  });
});
