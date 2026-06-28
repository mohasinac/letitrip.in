/**
 * Tests for DELETE /api/admin/notifications/[id]
 *
 * ROLES_ADMIN_ONLY + permission: admin:notifications:delete
 * Checks existence via findById → 404 if missing.
 * Calls notificationRepository.delete(id) on success.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockNotifFindById,
  mockNotifDelete,
} = vi.hoisted(() => ({
  mockNotifFindById: vi.fn(),
  mockNotifDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  notificationRepository: {
    findById: mockNotifFindById,
    delete: mockNotifDelete,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { DELETE } from "../route";

const params = { params: Promise.resolve({ id: "notif-order-shipped-001" }) };

const mockNotif = {
  id: "notif-order-shipped-001",
  userId: "user-ravi-k",
  type: "order_shipped",
  isRead: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockNotifFindById.mockResolvedValue(mockNotif);
  mockNotifDelete.mockResolvedValue(undefined);
});

describe("DELETE /api/admin/notifications/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(403);
  });

  it("notification not found → 404", async () => {
    mockNotifFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("not found");
  });

  it("calls notificationRepository.delete with id", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockNotifFindById).toHaveBeenCalledWith("notif-order-shipped-001");
    expect(mockNotifDelete).toHaveBeenCalledWith("notif-order-shipped-001");
  });

  it("success → 200 with null data and deleted message", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: null; message: string };
    expect(json.data).toBeNull();
    expect(json.message).toContain("deleted");
  });
});
