import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindByUserPaginated } = vi.hoisted(() => ({
  mockFindByUserPaginated: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  bidRepository: { findByUserPaginated: mockFindByUserPaginated },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

function makeReq(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/user/bids");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "bidder-uid", role: "user" };
  mockFindByUserPaginated.mockResolvedValue({
    items: [{ id: "bid-1", amount: 5000, status: "active" }],
    hasMore: false,
  });
});

describe("GET /api/user/bids", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("delegates to bidRepository.findByUserPaginated with uid", async () => {
    await GET(makeReq() as never);
    expect(mockFindByUserPaginated).toHaveBeenCalledWith("bidder-uid", expect.any(Number));
  });

  it("pageSize capped at 25", async () => {
    await GET(makeReq({ pageSize: "100" }) as never);
    const call = mockFindByUserPaginated.mock.calls[0];
    expect(call[1]).toBeLessThanOrEqual(25);
  });

  it("returns only own bids (repository scoped by uid)", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { bids: unknown[]; total: number } };
    expect(json.data.bids).toHaveLength(1);
  });

  it("includes hasMore in response", async () => {
    mockFindByUserPaginated.mockResolvedValue({ items: [], hasMore: true });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { hasMore: boolean } };
    expect(json.data.hasMore).toBe(true);
  });

  it("pageSize >= 1 (never below 1)", async () => {
    await GET(makeReq({ pageSize: "0" }) as never);
    const call = mockFindByUserPaginated.mock.calls[0];
    expect(call[1]).toBeGreaterThanOrEqual(1);
  });
});
