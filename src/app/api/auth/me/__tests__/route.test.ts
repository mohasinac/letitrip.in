/**
 * Tests for GET /api/auth/me
 * Returns the current authenticated user's profile.
 * Syncs stale custom claims when role in Firestore differs from claims.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockApplyRateLimit,
  mockGetProviders,
  mockGetUser,
  mockGetAdminAuth,
  mockFindById,
  mockSetCustomUserClaims,
} = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockGetProviders: vi.fn(),
  mockGetUser: vi.fn(),
  mockGetAdminAuth: vi.fn(),
  mockFindById: vi.fn(),
  mockSetCustomUserClaims: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  getProviders: mockGetProviders,
  getAdminAuth: mockGetAdminAuth,
  userRepository: { findById: mockFindById },
  applyRateLimit: mockApplyRateLimit,
  RateLimitPresets: { AUTH: "auth" },
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const makeReq = () => new Request("http://localhost/api/auth/me", { method: "GET" });

const mockAuthUser = {
  uid: "uid-abc",
  email: "user@test.com",
  displayName: "Test User",
  photoURL: null,
  emailVerified: true,
  role: "user",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "uid-abc", role: "user" };
  mockApplyRateLimit.mockResolvedValue({ success: true });
  mockGetProviders.mockReturnValue({ auth: { getUser: mockGetUser } });
  mockGetUser.mockResolvedValue(mockAuthUser);
  mockGetAdminAuth.mockReturnValue({ setCustomUserClaims: mockSetCustomUserClaims });
  mockFindById.mockResolvedValue({ uid: "uid-abc", email: "user@test.com", role: "user" });
  mockSetCustomUserClaims.mockResolvedValue(undefined);
});

describe("GET /api/auth/me", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(429);
  });

  it("auth provider not configured → 503", async () => {
    mockGetProviders.mockReturnValue({ auth: null });
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(503);
  });

  it("user not found in auth provider → 404", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(404);
  });

  it("returns user profile data from auth provider", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { success: boolean; data: { id: string; email: string } };
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("uid-abc");
    expect(json.data.email).toBe("user@test.com");
  });

  it("stale claims: auth role='user' but Firestore role='admin' → returns role: admin", async () => {
    mockGetUser.mockResolvedValue({ ...mockAuthUser, role: "user" });
    mockFindById.mockResolvedValue({ uid: "uid-abc", role: "admin" });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { role: string } };
    expect(json.data.role).toBe("admin");
  });

  it("stale claims: role mismatch → setCustomUserClaims called to sync", async () => {
    mockGetUser.mockResolvedValue({ ...mockAuthUser, role: "user" });
    mockFindById.mockResolvedValue({ uid: "uid-abc", role: "seller" });
    await GET(makeReq() as never);
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("uid-abc", { role: "seller" });
  });

  it("auth role is already 'admin' → Firestore not consulted for role sync", async () => {
    _user = { uid: "uid-abc", role: "admin" };
    mockGetUser.mockResolvedValue({ ...mockAuthUser, role: "admin" });
    await GET(makeReq() as never);
    // findById may still be called but role sync should not happen
    expect(mockSetCustomUserClaims).not.toHaveBeenCalled();
  });

  it("returns isEmailVerified from auth provider record", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { isEmailVerified: boolean } };
    expect(json.data.isEmailVerified).toBe(true);
  });
});
