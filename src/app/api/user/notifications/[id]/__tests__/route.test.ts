/**
 * Tests for GET/PATCH/DELETE /api/user/notifications/[id]
 * Auth required. Any authenticated user.
 *
 * ALL three verbs share the same ownership check:
 *   notificationRepository.findById(id) → null OR notification.userId !== user.uid → 404
 * This prevents enumeration of other users' notification IDs.
 *
 * GET:    returns notification if owned by user
 * PATCH:  calls notificationRepository.markAsRead(id), returns updated notification
 * DELETE: calls notificationRepository.delete(id), returns 200
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockMarkAsRead, mockDelete } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockMarkAsRead: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  notificationRepository: {
    findById: mockFindById,
    markAsRead: mockMarkAsRead,
    delete: mockDelete,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "notif-order-shipped-001" }) };

const mockNotification = {
  id: "notif-order-shipped-001",
  userId: "buyer-uid",
  type: "order_shipped",
  title: "Your order shipped",
  body: "Track it now",
  isRead: false,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockFindById.mockResolvedValue(mockNotification);
  mockMarkAsRead.mockResolvedValue({ ...mockNotification, isRead: true });
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/user/notifications/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("notification not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("notification belongs to another user → 404 (prevents enumeration)", async () => {
    _user = { uid: "attacker-uid", role: "user" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("own notification → 200 with notification data", async () => {
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string; type: string } };
    expect(json.data.id).toBe("notif-order-shipped-001");
    expect(json.data.type).toBe("order_shipped");
  });

  it("fetches notification by ID from params", async () => {
    await GET(new Request("http://localhost") as never, params as never);
    expect(mockFindById).toHaveBeenCalledWith("notif-order-shipped-001");
  });
});

describe("PATCH /api/user/notifications/[id] (mark as read)", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(new Request("http://localhost", { method: "PATCH" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("notification not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(new Request("http://localhost", { method: "PATCH" }) as never, params as never);
    expect(res.status).toBe(404);
    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it("notification belongs to another user → 404", async () => {
    _user = { uid: "attacker-uid", role: "user" };
    const res = await PATCH(new Request("http://localhost", { method: "PATCH" }) as never, params as never);
    expect(res.status).toBe(404);
    expect(mockMarkAsRead).not.toHaveBeenCalled();
  });

  it("own notification → calls markAsRead with notification id", async () => {
    await PATCH(new Request("http://localhost", { method: "PATCH" }) as never, params as never);
    expect(mockMarkAsRead).toHaveBeenCalledWith("notif-order-shipped-001");
  });

  it("success → 200 with updated notification (isRead=true)", async () => {
    const res = await PATCH(new Request("http://localhost", { method: "PATCH" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { isRead: boolean } };
    expect(json.data.isRead).toBe(true);
  });
});

describe("DELETE /api/user/notifications/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(401);
  });

  it("notification not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("notification belongs to another user → 404", async () => {
    _user = { uid: "attacker-uid", role: "user" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(404);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("own notification → calls delete with notification id", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockDelete).toHaveBeenCalledWith("notif-order-shipped-001");
  });

  it("success → 200", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
  });

  it("findById called before delete — ownership verified before destructive action", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    // Ensure findById was called first, then delete
    const findOrder = mockFindById.mock.invocationCallOrder[0];
    const deleteOrder = mockDelete.mock.invocationCallOrder[0];
    expect(findOrder).toBeLessThan(deleteOrder);
  });
});
