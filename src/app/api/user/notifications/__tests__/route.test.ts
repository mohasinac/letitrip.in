import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListForUser,
  mockGetUnreadCount,
} = vi.hoisted(() => ({
  mockListForUser: vi.fn(),
  mockGetUnreadCount: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  notificationRepository: {
    listForUser: mockListForUser,
    getUnreadCount: mockGetUnreadCount,
  },
  sortBy: (field: string) => `${field}:desc`,
  NOTIFICATION_FIELDS: { CREATED_AT: "createdAt" },
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

const defaultListResult = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  hasMore: false,
};

function makeReq(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/user/notifications");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "test-uid", role: "user" };
  mockListForUser.mockResolvedValue({ ...defaultListResult });
  mockGetUnreadCount.mockResolvedValue(3);
});

describe("GET /api/user/notifications", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("delegates to notificationRepository.listForUser with uid", async () => {
    await GET(makeReq() as never);
    expect(mockListForUser).toHaveBeenCalledWith("test-uid", expect.any(Object));
  });

  it("returns items, total, page, pageSize, hasMore, unreadCount", async () => {
    mockListForUser.mockResolvedValue({
      items: [{ id: "notif-1", isRead: false }],
      total: 5,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasMore: false,
    });
    mockGetUnreadCount.mockResolvedValue(5);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { items: unknown[]; unreadCount: number; total: number } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.unreadCount).toBe(5);
    expect(json.data.total).toBe(5);
  });

  it("pageSize > 50 → clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const call = mockListForUser.mock.calls[0][1] as { pageSize: string };
    expect(Number(call.pageSize)).toBeLessThanOrEqual(50);
  });

  it("page < 1 → clamped to 1", async () => {
    await GET(makeReq({ page: "0" }) as never);
    const call = mockListForUser.mock.calls[0][1] as { page: string };
    expect(Number(call.page)).toBeGreaterThanOrEqual(1);
  });

  it("isRead=true filter forwarded to repository", async () => {
    await GET(makeReq({ isRead: "true" }) as never);
    const call = mockListForUser.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toContain("isRead==true");
  });

  it("isRead=false filter forwarded", async () => {
    await GET(makeReq({ isRead: "false" }) as never);
    const call = mockListForUser.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toContain("isRead==false");
  });

  it("type filter forwarded", async () => {
    await GET(makeReq({ type: "order_shipped" }) as never);
    const call = mockListForUser.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toContain("type==order_shipped");
  });

  it("combined isRead + type → both in filters string", async () => {
    await GET(makeReq({ isRead: "false", type: "bid_won" }) as never);
    const call = mockListForUser.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toContain("isRead==false");
    expect(call.filters).toContain("type==bid_won");
  });

  it("?filters= param takes precedence over isRead/type params", async () => {
    await GET(makeReq({ filters: "custom==filter", isRead: "true" }) as never);
    const call = mockListForUser.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toBe("custom==filter");
  });

  it("no filter params → filters is undefined", async () => {
    await GET(makeReq() as never);
    const call = mockListForUser.mock.calls[0][1] as { filters?: string };
    expect(call.filters).toBeUndefined();
  });
});
