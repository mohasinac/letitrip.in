/**
 * Tests for GET /api/admin/events/[id]/stats
 *
 * Roles: ROLES_ADMIN_MOD
 * Logic:
 * - Uses eventRepository.list() with sieveFilter (not findById) → 404 if no items
 * - 3 parallel listForEvent() calls for: total, approved, flagged entries
 * - Returns { event, stats: { totalEntries, approvedEntries, flaggedEntries } }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockEventList,
  mockListForEvent,
  mockSieveFilter,
} = vi.hoisted(() => ({
  mockEventList: vi.fn(),
  mockListForEvent: vi.fn(),
  mockSieveFilter: vi.fn((field: string, _op: string, value: string) => `${field}==${value}`),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  EVENT_FIELDS: { ID: "id" },
  ROLES_ADMIN_MOD: ["admin", "moderator"],
}));

vi.mock("@mohasinac/appkit", () => ({
  eventRepository: { list: mockEventList },
  eventEntryRepository: { listForEvent: mockListForEvent },
  sieveFilter: mockSieveFilter,
  SIEVE_OP: { EQ: "==" },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ params });
    };
  },
}));

import { GET } from "../route";

const mockEvent = { id: "event-summer-holo-sale-2026", title: "Summer Holo Sale", status: "active" };
const routeParams = { params: { id: "event-summer-holo-sale-2026" } };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockEventList.mockResolvedValue({ items: [mockEvent] });
  // 3 parallel calls: total, approved, flagged
  mockListForEvent
    .mockResolvedValueOnce({ total: 100 })
    .mockResolvedValueOnce({ total: 80 })
    .mockResolvedValueOnce({ total: 5 });
});

describe("GET /api/admin/events/[id]/stats", () => {
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

  it("event not found → 404", async () => {
    mockEventList.mockResolvedValue({ items: [] });
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Event not found");
  });

  it("calls listForEvent 3 times in parallel for total/approved/flagged", async () => {
    await GET(new Request("http://localhost") as never, routeParams as never);
    expect(mockListForEvent).toHaveBeenCalledTimes(3);
  });

  it("total entries uses no filter (undefined)", async () => {
    await GET(new Request("http://localhost") as never, routeParams as never);
    const calls = mockListForEvent.mock.calls;
    expect(calls[0][1]).not.toHaveProperty("filters", expect.stringContaining("reviewStatus"));
  });

  it("approved entries filtered by reviewStatus==approved", async () => {
    await GET(new Request("http://localhost") as never, routeParams as never);
    const calls = mockListForEvent.mock.calls;
    const hasApprovedFilter = calls.some(
      ([, opts]: [string, { filters?: string }]) => opts.filters?.includes("reviewStatus") && opts.filters.includes("approved"),
    );
    expect(hasApprovedFilter).toBe(true);
  });

  it("flagged entries filtered by reviewStatus==flagged", async () => {
    await GET(new Request("http://localhost") as never, routeParams as never);
    const calls = mockListForEvent.mock.calls;
    const hasFlaggedFilter = calls.some(
      ([, opts]: [string, { filters?: string }]) => opts.filters?.includes("reviewStatus") && opts.filters.includes("flagged"),
    );
    expect(hasFlaggedFilter).toBe(true);
  });

  it("returns { event, stats } with correct counts", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as {
      data: { event: { id: string }; stats: { totalEntries: number; approvedEntries: number; flaggedEntries: number } };
    };
    expect(json.data.event.id).toBe("event-summer-holo-sale-2026");
    expect(json.data.stats.totalEntries).toBe(100);
    expect(json.data.stats.approvedEntries).toBe(80);
    expect(json.data.stats.flaggedEntries).toBe(5);
  });

  it("listForEvent total=undefined → stats count defaults to 0", async () => {
    mockListForEvent
      .mockReset()
      .mockResolvedValueOnce({ total: undefined })
      .mockResolvedValueOnce({ total: undefined })
      .mockResolvedValueOnce({ total: undefined });
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { stats: { totalEntries: number } } };
    expect(json.data.stats.totalEntries).toBe(0);
  });
});
