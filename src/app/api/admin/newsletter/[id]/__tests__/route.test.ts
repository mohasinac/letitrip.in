/**
 * Tests for GET/DELETE /api/admin/newsletter/[id]
 *
 * GET: ROLES_ADMIN_MOD — findById; 404 if not found
 * DELETE: ROLES_ADMIN_MOD — findById guard; unsubscribe(id); "Subscriber unsubscribed"
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUnsubscribe } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  newsletterRepository: { findById: mockFindById, unsubscribe: mockUnsubscribe },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { params?: unknown; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (_request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ params, user: _user ?? undefined });
    };
  },
}));

import { GET, DELETE } from "../route";

const mockSubscriber = { id: "sub-001", email: "ravi@example.com", status: "active" };
const routeParams = { params: Promise.resolve({ id: "sub-001" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockSubscriber);
  mockUnsubscribe.mockResolvedValue(undefined);
});

describe("GET /api/admin/newsletter/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(200);
  });

  it("subscriber not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Subscriber not found");
  });

  it("found → 200 with subscriber data", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("sub-001");
  });
});

describe("DELETE /api/admin/newsletter/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD for DELETE)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(200);
  });

  it("subscriber not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("calls unsubscribe with the subscriber id", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(mockUnsubscribe).toHaveBeenCalledWith("sub-001");
  });

  it("success → 200 with 'Subscriber unsubscribed' and null data", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Subscriber unsubscribed");
    expect(json.data).toBeNull();
  });
});
