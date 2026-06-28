import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockGetHistory,
  mockTrackHistory,
  mockClearHistory,
} = vi.hoisted(() => ({
  mockGetHistory: vi.fn(),
  mockTrackHistory: vi.fn(),
  mockClearHistory: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  HISTORY_MAX: 50,
  getHistoryForUser: mockGetHistory,
  trackHistoryView: mockTrackHistory,
  clearHistory: mockClearHistory,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request; params: Record<string, string> }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      let body: unknown;
      if (request.method !== "GET") {
        try { body = await request.clone().json(); } catch { body = undefined; }
        if (opts.schema) {
          const result = opts.schema.safeParse(body);
          if (!result.success) return new Response(JSON.stringify({ ok: false, error: "Validation" }), { status: 400 });
          body = result.data;
        }
      }
      return opts.handler({ user: _user ?? undefined, body, request, params: {} });
    };
  },
}));

import { GET, POST, DELETE } from "../route";

function makeReq(body?: unknown, method = "GET"): Request {
  return new Request("http://localhost/api/user/history", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "test-uid", role: "user" };
  mockGetHistory.mockResolvedValue({ items: [], meta: { total: 0 } });
  mockTrackHistory.mockResolvedValue({ count: 1 });
  mockClearHistory.mockResolvedValue(undefined);
});

// ── GET ───────────────────────────────────────────────────────────────────────

describe("GET /api/user/history", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("returns items and meta with limit: HISTORY_MAX", async () => {
    mockGetHistory.mockResolvedValue({
      items: [{ productId: "p-1", viewedAt: new Date() }],
      meta: { total: 1 },
    });
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[]; meta: { limit: number } } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.meta.limit).toBe(50);
  });

  it("delegates to getHistoryForUser with uid", async () => {
    await GET(makeReq() as never);
    expect(mockGetHistory).toHaveBeenCalledWith("test-uid");
  });
});

// ── POST ──────────────────────────────────────────────────────────────────────

describe("POST /api/user/history", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ productId: "p-1", productType: "product" }, "POST") as never);
    expect(res.status).toBe(401);
  });

  it("missing productId → 400", async () => {
    const res = await POST(makeReq({ productType: "product" }, "POST") as never);
    expect(res.status).toBe(400);
  });

  it("missing productType → 400", async () => {
    const res = await POST(makeReq({ productId: "p-1" }, "POST") as never);
    expect(res.status).toBe(400);
  });

  it("invalid productType → 400", async () => {
    const res = await POST(makeReq({ productId: "p-1", productType: "invalid" }, "POST") as never);
    expect(res.status).toBe(400);
  });

  it("re-track same product succeeds (trackHistoryView handles dedup)", async () => {
    mockTrackHistory.mockResolvedValue({ count: 5 });
    const res = await POST(makeReq({ productId: "p-1", productType: "product" }, "POST") as never);
    expect(res.status).toBe(200);
  });

  it("returns { productId, count, limit: HISTORY_MAX }", async () => {
    mockTrackHistory.mockResolvedValue({ count: 7 });
    const res = await POST(makeReq({ productId: "p-1", productType: "auction" }, "POST") as never);
    const json = await res.clone().json() as { data: { productId: string; count: number; limit: number } };
    expect(json.data.productId).toBe("p-1");
    expect(json.data.count).toBe(7);
    expect(json.data.limit).toBe(50);
  });

  it("forwards snapshot when provided", async () => {
    const snap = { title: "Test", price: 1000 };
    await POST(makeReq({ productId: "p-1", productType: "product", snapshot: snap }, "POST") as never);
    expect(mockTrackHistory).toHaveBeenCalledWith(
      "test-uid",
      expect.objectContaining({ snapshot: snap }),
    );
  });
});

// ── DELETE ────────────────────────────────────────────────────────────────────

describe("DELETE /api/user/history", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq(undefined, "DELETE") as never);
    expect(res.status).toBe(401);
  });

  it("clears history and returns { cleared: true }", async () => {
    const res = await DELETE(makeReq(undefined, "DELETE") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { cleared: boolean } };
    expect(json.data.cleared).toBe(true);
    expect(mockClearHistory).toHaveBeenCalledWith("test-uid");
  });
});
