/**
 * Tests for GET /api/events (public listing)
 * Public endpoint — no auth needed.
 * Defaults to status==active unless caller provides their own status filter.
 * Falls back to eventRepository when listingProcessor fails.
 * createdBy field stripped from fallback repo results.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockCallListingProcessor,
  mockEventList,
} = vi.hoisted(() => ({
  mockCallListingProcessor: vi.fn(),
  mockEventList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
vi.mock("@/lib/listing-processor", () => ({
  callListingProcessor: mockCallListingProcessor,
}));
vi.mock("@/lib/sieve-validators", () => ({
  validateSieveFilters: (f: string) => f,
}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => {
      const status = init?.status ?? 200;
      const res = new Response(JSON.stringify(body), { status });
      Object.defineProperty(res, "headers", { value: new Headers(), writable: true });
      return res;
    },
  },
}));
vi.mock("@mohasinac/appkit", () => ({
  eventRepository: { list: mockEventList },
  normalizeError: vi.fn(),
  parseListingParams: (url: URL) => ({
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || 24,
    sorts: url.searchParams.get("sorts") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    filters: url.searchParams.get("filters") ?? undefined,
  }),
}));

import { GET } from "../route";

const makeEvent = (overrides = {}) => ({
  id: "event-summer-sale",
  type: "sale",
  status: "active",
  title: "Summer Holo Sale",
  startsAt: "2026-07-01",
  endsAt: "2026-07-31",
  createdBy: "admin-uid",
  ...overrides,
});

const pagedResult = {
  items: [makeEvent()],
  total: 1,
  page: 1,
  pageSize: 24,
  totalPages: 1,
  hasMore: false,
};

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/events");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  mockCallListingProcessor.mockResolvedValue(pagedResult);
  mockEventList.mockResolvedValue(pagedResult);
});

describe("GET /api/events", () => {
  it("no auth required → 200", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("listingProcessor called first (preferred path)", async () => {
    await GET(makeReq() as never);
    expect(mockCallListingProcessor).toHaveBeenCalledWith("events", expect.any(Object));
  });

  it("default filter includes status==active when no status filter provided", async () => {
    await GET(makeReq() as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(callArg.filters).toContain("status==active");
  });

  it("explicit status filter from caller overrides default (no duplicate status==active)", async () => {
    await GET(makeReq({ filters: "status==ended" }) as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    // caller's status filter used, default NOT prepended
    expect(callArg.filters).toContain("status==ended");
    expect(callArg.filters).not.toContain("status==active");
  });

  it("text search (q) → title@=* filter added", async () => {
    await GET(makeReq({ q: "pokemon" }) as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(callArg.filters).toContain("title@=*pokemon");
  });

  it("listingProcessor failure → falls back to eventRepository", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("upstream down"));
    const res = await GET(makeReq() as never);
    expect(mockEventList).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("fallback: createdBy field stripped from repo results", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("upstream down"));
    mockEventList.mockResolvedValue({
      ...pagedResult,
      items: [makeEvent({ createdBy: "admin-uid" })],
    });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { items: Record<string, unknown>[] } };
    expect("createdBy" in json.data.items[0]).toBe(false);
  });

  it("both processor and repo fail → 500", async () => {
    mockCallListingProcessor.mockRejectedValue(new Error("upstream down"));
    mockEventList.mockRejectedValue(new Error("db down"));
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(500);
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "500" }) as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { pageSize: number };
    expect(callArg.pageSize).toBe(50);
  });

  it("type filter passed through (in safe fields)", async () => {
    await GET(makeReq({ filters: "type==sale" }) as never);
    const callArg = mockCallListingProcessor.mock.calls[0][1] as { filters: string };
    expect(callArg.filters).toContain("type==sale");
  });
});
