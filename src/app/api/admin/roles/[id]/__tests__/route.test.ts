/**
 * Tests for GET/PATCH/DELETE /api/admin/roles/[id]
 * GET:    ROLES_ADMIN_ONLY + admin:team:write. 404 for missing.
 * PATCH:  ROLES_ADMIN_ONLY. 404 guard. Updates fields. Repo errors → 400.
 * DELETE: ROLES_ADMIN_ONLY. No 404 guard — deletes directly (deletes even if not found).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  customRolesRepository: {
    findById: mockFindById,
    update: mockUpdate,
    delete: mockDelete,
  },
  normalizeError: vi.fn(),
  parseJsonBody: async (req: Request) => req.clone().json().catch(() => ({})),
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ApiErrors: {
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request, params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const params = { params: { id: "role-content-team" } };
const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/roles/role-content-team", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

const mockRole = { id: "role-content-team", name: "Content Team", permissions: ["blog:write"] };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockRole);
  mockUpdate.mockResolvedValue({ ...mockRole, name: "Updated" });
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/roles/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("role not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("role found → 200 with role data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("role-content-team");
  });
});

describe("PATCH /api/admin/roles/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("role not found → 404 before update", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(404);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates the role with provided fields", async () => {
    await PATCH(makeRequest("PATCH", { name: "New Name", permissions: ["orders:read"] }) as never, params as never);
    expect(mockUpdate).toHaveBeenCalledWith("role-content-team", {
      name: "New Name",
      permissions: ["orders:read"],
    });
  });

  it("success → 200 with updated role", async () => {
    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("repo throws → 400 with error message", async () => {
    mockUpdate.mockRejectedValue(new Error("Validation failed"));
    const res = await PATCH(makeRequest("PATCH", { name: "x" }) as never, params as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Validation failed");
  });
});

describe("DELETE /api/admin/roles/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("calls customRolesRepository.delete with correct id", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockDelete).toHaveBeenCalledWith("role-content-team");
  });

  it("success → 200 with { deleted: true }", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { deleted: boolean } };
    expect(json.data.deleted).toBe(true);
  });
});
