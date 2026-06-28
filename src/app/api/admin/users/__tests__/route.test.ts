/**
 * Tests for GET /api/admin/users
 * Lists users with role/search filtering. Email search uses blind index (HMAC), not plaintext.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockUserList,
  mockPiiBlindIndex,
} = vi.hoisted(() => ({
  mockUserList: vi.fn(),
  mockPiiBlindIndex: vi.fn((s: string) => `hashed:${s}`),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { list: mockUserList },
  piiBlindIndex: mockPiiBlindIndex,
  buildSieveFilters: (...groups: (string | undefined)[]) =>
    groups.filter(Boolean).join(","),
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  sortBy: (field: string) => `-${field}`,
  USER_FIELDS: { CREATED_AT: "createdAt", EMAIL_INDEX: "emailIndex", DISPLAY_NAME: "displayName" },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  serverLogger: { info: vi.fn(), error: vi.fn() },
  // createApiHandler is the alias used in admin/users
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const mockUsers = [
  {
    id: "user-ravi", uid: "uid-ravi", email: "ravi@test.com", displayName: "Ravi",
    role: "user", emailVerified: true, disabled: false, createdAt: new Date("2026-01-01"),
    metadata: { loginCount: 5 },
  },
  {
    id: "user-admin", uid: "uid-admin", email: "admin@letitrip.in", displayName: "Admin",
    role: "admin", emailVerified: true, disabled: false, createdAt: new Date("2026-01-02"),
    metadata: { loginCount: 100 },
  },
];

const pagedResult = {
  items: mockUsers,
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/users");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockUserList.mockResolvedValue(pagedResult);
});

describe("GET /api/admin/users", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403 (requires admin or moderator)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("userRepository.list called with pagination defaults", async () => {
    await GET(makeReq() as never);
    expect(mockUserList).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 50 }),
    );
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const callArg = mockUserList.mock.calls[0][0] as { pageSize: number };
    expect(callArg.pageSize).toBeLessThanOrEqual(50);
  });

  it("email search (?q=email@test.com) uses HMAC blind index on emailIndex field", async () => {
    await GET(makeReq({ q: "ravi@test.com" }) as never);
    expect(mockPiiBlindIndex).toHaveBeenCalledWith("ravi@test.com");
    const callArg = mockUserList.mock.calls[0][0] as { filters: string };
    // The filter must reference the emailIndex field with the hashed value, not a raw email==x filter
    expect(callArg.filters).toContain("emailIndex==hashed:ravi@test.com");
  });

  it("name search (?q=Ravi) uses displayName field, not blind index", async () => {
    await GET(makeReq({ q: "Ravi" }) as never);
    expect(mockPiiBlindIndex).not.toHaveBeenCalled();
    const callArg = mockUserList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("displayName==Ravi");
  });

  it("returns users with serialized profile (no raw timestamps)", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { users: Array<{ id: string; createdAt: string }> } };
    expect(json.data.users[0]!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it("returns total and pagination metadata", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { total: number; meta: { page: number; totalPages: number } };
    };
    expect(json.data.total).toBe(2);
    expect(json.data.meta.page).toBe(1);
  });
});
