/**
 * Tests for GET /api/admin/admin-notifications and POST /api/admin/admin-notifications
 *
 * Both verbs: ROLES_ADMIN_ONLY
 * GET: listUnread() → { items }  (no total, no pagination)
 * POST: create({ ...body, isRead: false }) → 201; uses parseJsonBody (no Zod schema)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListUnread,
  mockCreate,
  mockParseJsonBody,
} = vi.hoisted(() => ({
  mockListUnread: vi.fn(),
  mockCreate: vi.fn(),
  mockParseJsonBody: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  adminNotificationsRepository: {
    listUnread: mockListUnread,
    create: mockCreate,
  },
  parseJsonBody: mockParseJsonBody,
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { request: Request; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ request, user: _user ?? undefined });
    };
  },
}));

import { GET, POST } from "../route";

const mockUnreadItems = [
  { id: "admin-notif-001", type: "system", message: "New seller registration", isRead: false },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListUnread.mockResolvedValue({ items: mockUnreadItems });
  mockCreate.mockResolvedValue({ id: "admin-notif-new", isRead: false, type: "system" });
  mockParseJsonBody.mockResolvedValue({ type: "system", message: "Test notification" });
});

describe("GET /api/admin/admin-notifications", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/admin-notifications") as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/admin-notifications") as never);
    expect(res.status).toBe(403);
  });

  it("admin → 200", async () => {
    const res = await GET(new Request("http://localhost/api/admin/admin-notifications") as never);
    expect(res.status).toBe(200);
  });

  it("calls listUnread() with no arguments", async () => {
    await GET(new Request("http://localhost/api/admin/admin-notifications") as never);
    expect(mockListUnread).toHaveBeenCalledWith();
  });

  it("returns { items } (unread notifications only)", async () => {
    const res = await GET(new Request("http://localhost/api/admin/admin-notifications") as never);
    const json = await res.clone().json() as { data: { items: { isRead: boolean }[] } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].isRead).toBe(false);
  });

  it("empty unread list → { items: [] }", async () => {
    mockListUnread.mockResolvedValue({ items: [] });
    const res = await GET(new Request("http://localhost/api/admin/admin-notifications") as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(0);
  });
});

describe("POST /api/admin/admin-notifications", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost/api/admin/admin-notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ type: "system", message: "Test" }));
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeRequest({ type: "system", message: "Test" }));
    expect(res.status).toBe(403);
  });

  it("always sets isRead: false regardless of body", async () => {
    // Even if body contains isRead: true, it must be overridden
    mockParseJsonBody.mockResolvedValue({ type: "system", isRead: true });
    await POST(makeRequest({ type: "system", isRead: true }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ isRead: false }),
    );
  });

  it("body fields passed to create (no Zod schema — raw passthrough)", async () => {
    mockParseJsonBody.mockResolvedValue({ type: "custom_alert", message: "Low stock", priority: "high" });
    await POST(makeRequest({ type: "custom_alert", message: "Low stock", priority: "high" }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: "custom_alert", message: "Low stock", priority: "high" }),
    );
  });

  it("success → 201 with created notification", async () => {
    const res = await POST(makeRequest({ type: "system", message: "Test" }));
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("admin-notif-new");
  });
});
