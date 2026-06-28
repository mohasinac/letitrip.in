/**
 * Tests for GET/POST /api/admin/roles
 * GET:  ROLES_ADMIN_ONLY + admin:team:read. Lists active custom roles.
 * POST: ROLES_ADMIN_ONLY. Creates custom role with createdBy=user.uid.
 *       Errors from repo returned as 400.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListActive, mockCreate } = vi.hoisted(() => ({
  mockListActive: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  customRolesRepository: { listActive: mockListActive, create: mockCreate },
  normalizeError: vi.fn(),
  parseJsonBody: async (req: Request) => req.clone().json().catch(() => ({})),
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = () => new Request("http://localhost/api/admin/roles");
const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockRoles = [
  { id: "role-content-team", name: "Content Team", permissions: ["blog:write"] },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListActive.mockResolvedValue({ items: mockRoles });
  mockCreate.mockResolvedValue({ id: "role-new", name: "Support" });
});

describe("GET /api/admin/roles", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("admin → 200 with active roles", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(1);
  });

  it("calls customRolesRepository.listActive()", async () => {
    await GET(makeGetReq() as never);
    expect(mockListActive).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/admin/roles", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ name: "Support" }) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq({ name: "Support" }) as never);
    expect(res.status).toBe(403);
  });

  it("injects createdBy = admin's uid", async () => {
    await POST(makePostReq({ name: "Support", permissions: [] }) as never);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: "admin-uid" }),
    );
  });

  it("forwards all body fields to create", async () => {
    await POST(makePostReq({ name: "Support", permissions: ["orders:read"] }) as never);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Support", permissions: ["orders:read"] }),
    );
  });

  it("success → 201 with created role", async () => {
    const res = await POST(makePostReq({ name: "Support" }) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("role-new");
  });

  it("repo throws → 400 with error message", async () => {
    mockCreate.mockRejectedValue(new Error("Duplicate role name"));
    const res = await POST(makePostReq({ name: "Duplicate" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Duplicate role name");
  });
});
