/**
 * Tests for GET / PATCH / DELETE /api/admin/bids/[id]
 *
 * GET: ROLES_ADMIN_MOD — bidRepository.findById(id) → 404 if null
 * PATCH: ROLES_ADMIN_ONLY — schema: { status: enum ["cancelled"], reason?: string }
 *         findById check → bidRepository.adminUpdateBid(id, { status, updatedAt })
 * DELETE: ROLES_ADMIN_ONLY — findById check → bidRepository.delete(id)
 *
 * BUSINESS NOTE: PATCH status only accepts "cancelled" (not "won", "active", etc.)
 * Both PATCH and DELETE do an existence check before writing.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockBidFindById,
  mockAdminUpdateBid,
  mockBidDelete,
} = vi.hoisted(() => ({
  mockBidFindById: vi.fn(),
  mockAdminUpdateBid: vi.fn(),
  mockBidDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  bidRepository: {
    findById: mockBidFindById,
    adminUpdateBid: mockAdminUpdateBid,
    delete: mockBidDelete,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "bid-charizard-psa9-ravi-20260508-x7y8z9" }) };

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/bids/bid-charizard-psa9-ravi-20260508-x7y8z9", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockBid = {
  id: "bid-charizard-psa9-ravi-20260508-x7y8z9",
  productId: "auction-charizard-psa9",
  bidderId: "user-ravi-k",
  amount: 250000,
  status: "active",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockBidFindById.mockResolvedValue(mockBid);
  mockAdminUpdateBid.mockResolvedValue(undefined);
  mockBidDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/bids/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("bid not found → 404", async () => {
    mockBidFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("not found");
  });

  it("found bid → 200 with bid data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockBid };
    expect(json.data.id).toBe("bid-charizard-psa9-ravi-20260508-x7y8z9");
    expect(json.data.amount).toBe(250000);
  });
});

describe("PATCH /api/admin/bids/[id] — cancel bid", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { status: "cancelled" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest("PATCH", { status: "cancelled" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("status='active' → 400 (only 'cancelled' allowed)", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "active" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("status='won' → 400", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "won" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("missing status → 400", async () => {
    const res = await PATCH(makeRequest("PATCH", { reason: "Admin override" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("bid not found → 404", async () => {
    mockBidFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { status: "cancelled" }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("calls adminUpdateBid with id, status: cancelled, updatedAt", async () => {
    await PATCH(makeRequest("PATCH", { status: "cancelled", reason: "Policy violation" }) as never, params as never);
    expect(mockAdminUpdateBid).toHaveBeenCalledWith(
      "bid-charizard-psa9-ravi-20260508-x7y8z9",
      expect.objectContaining({ status: "cancelled", updatedAt: expect.any(Date) }),
    );
  });

  it("reason is optional — omitting it still succeeds", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "cancelled" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("success → 200 with null data and cancelled message", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "cancelled" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toContain("cancelled");
  });
});

describe("DELETE /api/admin/bids/[id]", () => {
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

  it("bid not found → 404", async () => {
    mockBidFindById.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("calls bidRepository.delete with id after existence check", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockBidFindById).toHaveBeenCalledWith("bid-charizard-psa9-ravi-20260508-x7y8z9");
    expect(mockBidDelete).toHaveBeenCalledWith("bid-charizard-psa9-ravi-20260508-x7y8z9");
  });

  it("success → 200 with null data and deleted message", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: null; message: string };
    expect(json.data).toBeNull();
    expect(json.message).toContain("deleted");
  });
});
