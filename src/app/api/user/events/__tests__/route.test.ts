/**
 * Tests for GET /api/user/events
 * Auth required. Any authenticated user.
 * Returns authenticated user's event entries with their associated event objects.
 *
 * Pagination: page (min 1), pageSize (min 1, max 50, default 20).
 * Fetches event details for all unique eventIds from entries.
 * Individual event fetch failure → silently null (catch(() => null)).
 * Missing event → entry.event = null in response.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListForUser, mockEventFindById } = vi.hoisted(() => ({
  mockListForUser: vi.fn(),
  mockEventFindById: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  eventEntryRepository: { listForUser: mockListForUser },
  eventRepository: { findById: mockEventFindById },
  sortBy: (field: string, dir: string) => `${field}_${dir}`,
  EVENT_ENTRY_FIELDS: { SUBMITTED_AT: "submittedAt" },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const makeReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/user/events");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const mockEntries = [
  { id: "entry-1", eventId: "event-summer-sale", userId: "buyer-uid", status: "CONFIRMED" },
  { id: "entry-2", eventId: "event-pokemon-tourney", userId: "buyer-uid", status: "WAITLISTED" },
];

const mockEvent1 = { id: "event-summer-sale", title: "Summer Sale", status: "active" };
const mockEvent2 = { id: "event-pokemon-tourney", title: "Pokémon Tournament", status: "upcoming" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockListForUser.mockResolvedValue({
    items: mockEntries,
    total: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasMore: false,
  });
  mockEventFindById.mockImplementation((id: string) => {
    if (id === "event-summer-sale") return Promise.resolve(mockEvent1);
    if (id === "event-pokemon-tourney") return Promise.resolve(mockEvent2);
    return Promise.resolve(null);
  });
});

describe("GET /api/user/events", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("calls listForUser with authenticated uid", async () => {
    await GET(makeReq() as never);
    expect(mockListForUser).toHaveBeenCalledWith("buyer-uid", expect.any(Object));
  });

  it("returns entries enriched with event objects", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: {
        items: Array<{ id: string; event: { title: string } | null }>;
        total: number;
      };
    };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.items[0].event?.title).toBe("Summer Sale");
    expect(json.data.items[1].event?.title).toBe("Pokémon Tournament");
  });

  it("deduplicates event fetches when multiple entries share same eventId", async () => {
    mockListForUser.mockResolvedValue({
      items: [
        { id: "entry-1", eventId: "event-summer-sale", userId: "buyer-uid" },
        { id: "entry-2", eventId: "event-summer-sale", userId: "buyer-uid" },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasMore: false,
    });
    await GET(makeReq() as never);
    // Same eventId should only trigger one fetch
    const eventFetchCallsForSale = mockEventFindById.mock.calls.filter(
      ([id]: [string]) => id === "event-summer-sale",
    );
    expect(eventFetchCallsForSale).toHaveLength(1);
  });

  it("event fetch fails → entry.event = null (not propagated as error)", async () => {
    mockEventFindById.mockRejectedValue(new Error("Firestore error"));
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: Array<{ event: null }> } };
    expect(json.data.items[0].event).toBeNull();
  });

  it("no entries → items=[], total=0, no event fetches", async () => {
    mockListForUser.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
      hasMore: false,
    });
    const res = await GET(makeReq() as never);
    expect(mockEventFindById).not.toHaveBeenCalled();
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(0);
  });

  it("pageSize clamped to 50 max", async () => {
    await GET(makeReq({ pageSize: "100" }) as never);
    const opts = mockListForUser.mock.calls[0][1] as Record<string, string>;
    expect(Number(opts.pageSize)).toBe(50);
  });

  it("page clamped to 1 min", async () => {
    await GET(makeReq({ page: "-5" }) as never);
    const opts = mockListForUser.mock.calls[0][1] as Record<string, string>;
    expect(Number(opts.page)).toBe(1);
  });

  it("returns pagination fields from eventEntryRepository result", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { total: number; page: number; pageSize: number; hasMore: boolean; totalPages: number };
    };
    expect(json.data.total).toBe(2);
    expect(json.data.page).toBe(1);
    expect(json.data.hasMore).toBe(false);
  });
});
