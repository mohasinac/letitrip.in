/**
 * Tests for GET / PATCH /api/admin/payouts/[id]
 *
 * GET: ROLES_ADMIN_MOD — uses payoutRepository.list() with sieveFilter (NOT findById!)
 *      → payouts.items[0] is the payout; if undefined → 404
 * PATCH: ROLES_ADMIN_MOD — adminUpdatePayout(user.uid, id, body) → returns { id, ...body }
 *
 * BUSINESS NOTE: GET goes through the list() API to leverage sieve filtering, not findById().
 * This means the "not found" path triggers when items[0] is undefined (empty list).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockPayoutList,
  mockAdminUpdatePayout,
} = vi.hoisted(() => ({
  mockPayoutList: vi.fn(),
  mockAdminUpdatePayout: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  PAYOUT_FIELDS: {
    STATUS_VALUES: {
      PENDING: "pending",
      PROCESSING: "processing",
      PAID: "paid",
      FAILED: "failed",
    },
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  payoutRepository: { list: mockPayoutList },
  adminUpdatePayout: mockAdminUpdatePayout,
  sieveFilter: (field: string, _op: string, value: string) => ({ field, value }),
  SIEVE_OP: { EQ: "==" },
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
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
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

import { GET, PATCH } from "../route";

const params = { params: Promise.resolve({ id: "payout-pokemon-palace-20260601-a1b2c3" }) };

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/payouts/payout-pokemon-palace-20260601-a1b2c3", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockPayout = {
  id: "payout-pokemon-palace-20260601-a1b2c3",
  storeId: "store-pokemon-palace",
  amount: 500000,
  status: "pending",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockPayoutList.mockResolvedValue({ items: [mockPayout] });
  mockAdminUpdatePayout.mockResolvedValue(undefined);
});

describe("GET /api/admin/payouts/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (ROLES_ADMIN_MOD only)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (allowed in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("payout not found (empty list) → 404", async () => {
    mockPayoutList.mockResolvedValue({ items: [] });
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("not found");
  });

  it("uses list() with sieve filter (not findById)", async () => {
    await GET(makeRequest("GET") as never, params as never);
    expect(mockPayoutList).toHaveBeenCalledWith(
      expect.objectContaining({ page: "1", pageSize: "1" }),
    );
  });

  it("found payout → 200 with payout data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockPayout };
    expect(json.data.id).toBe("payout-pokemon-palace-20260601-a1b2c3");
  });
});

describe("PATCH /api/admin/payouts/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { status: "paid" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (ROLES_ADMIN_MOD only)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest("PATCH", { status: "paid" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("invalid status value → 400", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "INVALID" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("missing status → 400", async () => {
    const res = await PATCH(makeRequest("PATCH", { transactionId: "txn-123" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("calls adminUpdatePayout with user.uid, id, body", async () => {
    await PATCH(makeRequest("PATCH", { status: "paid", transactionId: "txn-abc" }) as never, params as never);
    expect(mockAdminUpdatePayout).toHaveBeenCalledWith(
      "admin-uid",
      "payout-pokemon-palace-20260601-a1b2c3",
      expect.objectContaining({ status: "paid", transactionId: "txn-abc" }),
    );
  });

  it("success → 200 with { id, ...body } (not the payout document)", async () => {
    const res = await PATCH(makeRequest("PATCH", { status: "paid", transactionId: "txn-abc" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string; status: string; transactionId: string } };
    expect(json.data.id).toBe("payout-pokemon-palace-20260601-a1b2c3");
    expect(json.data.status).toBe("paid");
    expect(json.data.transactionId).toBe("txn-abc");
  });

  it("all valid status values accepted", async () => {
    const statuses = ["pending", "processing", "paid", "failed"];
    for (const status of statuses) {
      const res = await PATCH(makeRequest("PATCH", { status }) as never, params as never);
      expect(res.status).toBe(200);
    }
  });
});
