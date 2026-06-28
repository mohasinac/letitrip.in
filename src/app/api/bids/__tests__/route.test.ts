import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; email: string; role: string } | null = null;

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => {
  class NotFoundError extends Error { constructor(msg: string) { super(msg); this.name = "NotFoundError"; } }
  class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } }
  class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } }
  return {
    NotFoundError,
    ValidationError,
    AuthorizationError,
    userRepository: { findById: vi.fn() },
    listBidsByProduct: vi.fn(),
    placeBid: vi.fn(),
    getSearchParams: (req: Request) => new URL(req.url).searchParams,
    getStringParam: (sp: URLSearchParams, key: string) => sp.get(key),
    getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
      const v = parseInt(sp.get(key) ?? String(def));
      if (opts?.min !== undefined && v < opts.min) return opts.min;
      if (opts?.max !== undefined && v > opts.max) return opts.max;
      return isNaN(v) ? def : v;
    },
    successResponse: (data: unknown, _msg?: string, status = 200) =>
      new Response(JSON.stringify({ ok: true, data }), { status }),
    errorResponse: (error: string, status = 400, extra?: unknown) =>
      new Response(JSON.stringify({ ok: false, error, ...((extra as object) ?? {}) }), { status }),
    createRouteHandler: (opts: {
      auth?: boolean;
      schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
      handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
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
            if (!result.success) return new Response(JSON.stringify({ ok: false, error: "Validation failed" }), { status: 400 });
            body = result.data;
          }
        }
        return opts.handler({ user: _user ?? undefined, body, request });
      };
    },
  };
});

vi.mock("@mohasinac/appkit/server", () => ({
  isSoftBanned: vi.fn(() => false),
}));

import { GET, POST } from "../route";
import { userRepository, listBidsByProduct, placeBid, NotFoundError, ValidationError, AuthorizationError } from "@mohasinac/appkit";
import { isSoftBanned } from "@mohasinac/appkit/server";

const mockListBids = listBidsByProduct as ReturnType<typeof vi.fn>;
const mockPlaceBid = placeBid as ReturnType<typeof vi.fn>;
const mockUserFindById = userRepository.findById as ReturnType<typeof vi.fn>;
const mockIsSoftBanned = isSoftBanned as ReturnType<typeof vi.fn>;

function makeGetReq(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/bids");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

function makePostReq(body: unknown) {
  return new Request("http://localhost/api/bids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "bidder-uid", email: "bidder@test.com", role: "user" };
  mockListBids.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0, hasMore: false });
  mockPlaceBid.mockResolvedValue({ id: "bid-1", amount: 10000 });
  mockUserFindById.mockResolvedValue({ uid: "bidder-uid", role: "user", softBans: [] });
  mockIsSoftBanned.mockReturnValue(false);
});

describe("GET /api/bids", () => {
  it("missing productId → 400", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("productId is required");
  });

  it("unauthenticated user can list bids (public endpoint)", async () => {
    _user = null;
    mockListBids.mockResolvedValue({ items: [], total: 0 });
    const res = await GET(makeGetReq({ productId: "auction-test" }) as never);
    expect(res.status).toBe(200);
  });

  it("pageSize > 50 → clamped to 50", async () => {
    await GET(makeGetReq({ productId: "auction-test", pageSize: "100" }) as never);
    expect(mockListBids).toHaveBeenCalledWith("auction-test", expect.objectContaining({ pageSize: 50 }));
  });

  it("page < 1 → clamped to 1", async () => {
    await GET(makeGetReq({ productId: "auction-test", page: "0" }) as never);
    expect(mockListBids).toHaveBeenCalledWith("auction-test", expect.objectContaining({ page: 1 }));
  });

  it("valid productId → calls listBidsByProduct with correct args", async () => {
    await GET(makeGetReq({ productId: "auction-test", page: "2", pageSize: "10" }) as never);
    expect(mockListBids).toHaveBeenCalledWith("auction-test", { page: 2, pageSize: 10 });
  });
});

describe("POST /api/bids", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 10000 }) as never);
    expect(res.status).toBe(401);
  });

  it("missing productId → 400", async () => {
    const res = await POST(makePostReq({ bidAmount: 10000 }) as never);
    expect(res.status).toBe(400);
  });

  it("bidAmount = 0 → 400 (must be positive)", async () => {
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 0 }) as never);
    expect(res.status).toBe(400);
  });

  it("negative bidAmount → 400", async () => {
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: -100 }) as never);
    expect(res.status).toBe(400);
  });

  it("user soft-banned for place_bids → 403 with ban reason", async () => {
    mockUserFindById.mockResolvedValue({
      uid: "bidder-uid",
      role: "user",
      softBans: [{ action: "place_bids", reason: "Suspicious bidding activity" }],
    });
    mockIsSoftBanned.mockReturnValue(true);
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 10000 }) as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Suspicious bidding activity");
  });

  it("user soft-banned for different action → NOT blocked", async () => {
    mockUserFindById.mockResolvedValue({
      uid: "bidder-uid",
      role: "user",
      softBans: [{ action: "write_reviews", reason: "Spam" }],
    });
    mockIsSoftBanned.mockReturnValue(false);
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 10000 }) as never);
    expect(res.status).toBe(201);
  });

  it("placeBid throws NotFoundError → 404", async () => {
    mockPlaceBid.mockRejectedValue(new NotFoundError("Auction not found"));
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 10000 }) as never);
    expect(res.status).toBe(404);
  });

  it("placeBid throws ValidationError → 400", async () => {
    mockPlaceBid.mockRejectedValue(new ValidationError("Bid too low"));
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 100 }) as never);
    expect(res.status).toBe(400);
  });

  it("placeBid throws AuthorizationError → 403", async () => {
    mockPlaceBid.mockRejectedValue(new AuthorizationError("Cannot bid on own auction"));
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 10000 }) as never);
    expect(res.status).toBe(403);
  });

  it("success → 201 with bid data", async () => {
    mockPlaceBid.mockResolvedValue({ id: "bid-new", amount: 10000, productId: "auction-x" });
    const res = await POST(makePostReq({ productId: "auction-x", bidAmount: 10000 }) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("bid-new");
  });
});
