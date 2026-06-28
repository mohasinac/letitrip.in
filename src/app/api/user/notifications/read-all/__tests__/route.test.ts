/**
 * Tests for POST /api/user/notifications/read-all
 * Auth required. Any authenticated user.
 * Calls notificationRepository.markAllAsRead(uid).
 * Returns { count } — number of notifications marked as read.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockMarkAllAsRead } = vi.hoisted(() => ({
  mockMarkAllAsRead: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  notificationRepository: { markAllAsRead: mockMarkAllAsRead },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { POST } from "../route";

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockMarkAllAsRead.mockResolvedValue(5);
});

describe("POST /api/user/notifications/read-all", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(new Request("http://localhost", { method: "POST" }) as never);
    expect(res.status).toBe(401);
  });

  it("calls markAllAsRead with authenticated user's uid", async () => {
    await POST(new Request("http://localhost", { method: "POST" }) as never);
    expect(mockMarkAllAsRead).toHaveBeenCalledWith("buyer-uid");
  });

  it("uses uid from auth token (not from body)", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await POST(new Request("http://localhost", { method: "POST" }) as never);
    expect(mockMarkAllAsRead).toHaveBeenCalledWith("specific-uid");
  });

  it("returns { count } with number of notifications marked", async () => {
    mockMarkAllAsRead.mockResolvedValue(5);
    const res = await POST(new Request("http://localhost", { method: "POST" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { count: number } };
    expect(json.data.count).toBe(5);
  });

  it("zero unread notifications → count = 0", async () => {
    mockMarkAllAsRead.mockResolvedValue(0);
    const res = await POST(new Request("http://localhost", { method: "POST" }) as never);
    const json = await res.clone().json() as { data: { count: number } };
    expect(json.data.count).toBe(0);
  });
});
