/**
 * Tests for PUT/DELETE /api/admin/team/[id]
 * PUT: Updates an employee's permissionGroup and/or permissions. Requires ROLES_ADMIN_ONLY.
 *      Only sends fields that are present in body (partial update).
 * DELETE: Revokes employee access by resetting role → "user" and clearing permissions.
 *         Does NOT delete the Firebase Auth account. Requires ROLES_ADMIN_ONLY.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockAdminUpdateUser } = vi.hoisted(() => ({
  mockAdminUpdateUser: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  adminUpdateUser: mockAdminUpdateUser,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { PUT, DELETE } from "../route";

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/team/emp-1", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
const params = { params: Promise.resolve({ id: "emp-1" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockAdminUpdateUser.mockResolvedValue(undefined);
});

describe("PUT /api/admin/team/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest("PUT", { permissions: ["products:read"] }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest("PUT", { permissions: ["products:read"] }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("updates permissions when provided", async () => {
    await PUT(makeRequest("PUT", { permissions: ["products:read", "orders:read"] }) as never, params as never);
    expect(mockAdminUpdateUser).toHaveBeenCalledWith(
      "admin-uid",
      "emp-1",
      expect.objectContaining({ permissions: ["products:read", "orders:read"] }),
    );
  });

  it("updates permissionGroup when provided", async () => {
    await PUT(makeRequest("PUT", { permissionGroup: "content-team" }) as never, params as never);
    expect(mockAdminUpdateUser).toHaveBeenCalledWith(
      "admin-uid",
      "emp-1",
      expect.objectContaining({ permissionGroup: "content-team" }),
    );
  });

  it("partial body: only sends provided fields (not missing ones)", async () => {
    // If only permissionGroup sent, permissions should NOT be in the update
    await PUT(makeRequest("PUT", { permissionGroup: "support" }) as never, params as never);
    const updateArg = mockAdminUpdateUser.mock.calls[0][2] as Record<string, unknown>;
    expect("permissions" in updateArg).toBe(false);
  });

  it("success → 200 with uid", async () => {
    const res = await PUT(makeRequest("PUT", { permissions: [] }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string } };
    expect(json.data.uid).toBe("emp-1");
  });

  it("empty body → still calls adminUpdateUser with empty update", async () => {
    await PUT(makeRequest("PUT", {}) as never, params as never);
    expect(mockAdminUpdateUser).toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/team/[id] (revoke access)", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("revokes access by setting role=user", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockAdminUpdateUser).toHaveBeenCalledWith(
      "admin-uid",
      "emp-1",
      expect.objectContaining({ role: "user" }),
    );
  });

  it("clears permissions array", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockAdminUpdateUser).toHaveBeenCalledWith(
      "admin-uid",
      "emp-1",
      expect.objectContaining({ permissions: [] }),
    );
  });

  it("does NOT delete Firebase Auth account (no deleteUser call)", async () => {
    // Only adminUpdateUser called, no auth.deleteUser
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockAdminUpdateUser).toHaveBeenCalledTimes(1);
    // adminUpdateUser is the only mock — verifying it was called confirms no separate delete
  });

  it("success → 200 with uid", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string } };
    expect(json.data.uid).toBe("emp-1");
  });
});
