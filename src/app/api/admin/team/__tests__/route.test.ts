/**
 * Tests for GET/POST /api/admin/team
 * GET: Lists employees (role=employee). Requires ROLES_TRUST_SAFETY.
 *      Supports text search (q) for displayName/email filtering in-memory.
 *      Applies role==employee filter to query.
 * POST: Invites (creates/updates) an employee. Requires ROLES_ADMIN_ONLY.
 *       If user already exists → updates role+permissions.
 *       If user doesn't exist → creates Firebase Auth account + sets role.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockUserList,
  mockUserFindByEmail,
  mockAdminUpdateUser,
  mockCreateUser,
  mockGetProviders,
} = vi.hoisted(() => {
  const mockCreateUser = vi.fn();
  return {
    mockUserList: vi.fn(),
    mockUserFindByEmail: vi.fn(),
    mockAdminUpdateUser: vi.fn(),
    mockCreateUser,
    mockGetProviders: vi.fn(() => ({ auth: { createUser: mockCreateUser } })),
  };
});

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_ONLY: ["admin"],
  ROLES_TRUST_SAFETY: ["admin", "moderator"],
}));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { list: mockUserList, findByEmail: mockUserFindByEmail },
  adminUpdateUser: mockAdminUpdateUser,
  getProviders: mockGetProviders,
  buildSieveFilters: (...args: string[]) => args.filter(Boolean).join(","),
  sortBy: (field: string) => `-${field}`,
  USER_FIELDS: { CREATED_AT: "createdAt" },
  getNumberParam: (params: URLSearchParams, key: string, def: number) =>
    Number(params.get(key) ?? def),
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (params: URLSearchParams, key: string) => params.get(key) ?? "",
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
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
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/admin/team");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};
const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockEmployees = [
  { uid: "emp-1", id: "emp-1", email: "alice@letitrip.in", displayName: "Alice", role: "employee", permissions: [], createdAt: new Date() },
  { uid: "emp-2", id: "emp-2", email: "bob@letitrip.in", displayName: "Bob Smith", role: "employee", permissions: [], createdAt: new Date() },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockUserList.mockResolvedValue({ items: mockEmployees, total: 2, page: 1, pageSize: 25 });
  mockUserFindByEmail.mockResolvedValue(null);
  mockCreateUser.mockResolvedValue({ uid: "new-emp-uid" });
  mockAdminUpdateUser.mockResolvedValue(undefined);
});

describe("GET /api/admin/team", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (not in ROLES_TRUST_SAFETY)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (in ROLES_TRUST_SAFETY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
  });

  it("always filters by role==employee", async () => {
    await GET(makeGetReq() as never);
    const listArg = mockUserList.mock.calls[0][0] as { filters: string };
    expect(listArg.filters).toContain("role==employee");
  });

  it("text search (q) filters results in-memory by displayName", async () => {
    const res = await GET(makeGetReq({ q: "alice" }) as never);
    const json = await res.clone().json() as { data: { users: { displayName: string }[] } };
    expect(json.data.users).toHaveLength(1);
    expect(json.data.users[0].displayName).toBe("Alice");
  });

  it("text search (q) filters results in-memory by email", async () => {
    const res = await GET(makeGetReq({ q: "bob" }) as never);
    const json = await res.clone().json() as { data: { users: { email: string }[] } };
    expect(json.data.users).toHaveLength(1);
    expect(json.data.users[0].email).toBe("bob@letitrip.in");
  });

  it("no search → returns all employees", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { users: unknown[]; total: number } };
    expect(json.data.users).toHaveLength(2);
  });
});

describe("POST /api/admin/team (invite employee)", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ email: "new@letitrip.in" }) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY for invite)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq({ email: "new@letitrip.in" }) as never);
    expect(res.status).toBe(403);
  });

  it("invalid email → 400", async () => {
    const res = await POST(makePostReq({ email: "not-an-email" }) as never);
    expect(res.status).toBe(400);
  });

  it("existing user → updates role without creating new Auth account", async () => {
    mockUserFindByEmail.mockResolvedValue({ uid: "existing-emp", id: "existing-emp" });
    await POST(makePostReq({ email: "alice@letitrip.in" }) as never);
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockAdminUpdateUser).toHaveBeenCalledWith("admin-uid", "existing-emp", expect.objectContaining({ role: "employee" }));
  });

  it("new user → creates Firebase Auth account", async () => {
    await POST(makePostReq({ email: "newstaff@letitrip.in" }) as never);
    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({
      email: "newstaff@letitrip.in",
    }));
  });

  it("new user → adminUpdateUser called with role=employee", async () => {
    await POST(makePostReq({ email: "newstaff@letitrip.in" }) as never);
    expect(mockAdminUpdateUser).toHaveBeenCalledWith(
      "admin-uid",
      "new-emp-uid",
      expect.objectContaining({ role: "employee" }),
    );
  });

  it("response includes isNewUser flag", async () => {
    const res = await POST(makePostReq({ email: "newstaff@letitrip.in" }) as never);
    const json = await res.clone().json() as { data: { isNewUser: boolean } };
    expect(json.data.isNewUser).toBe(true);
  });

  it("existing user → isNewUser=false", async () => {
    mockUserFindByEmail.mockResolvedValue({ uid: "existing-emp", id: "existing-emp" });
    const res = await POST(makePostReq({ email: "alice@letitrip.in" }) as never);
    const json = await res.clone().json() as { data: { isNewUser: boolean } };
    expect(json.data.isNewUser).toBe(false);
  });
});
