/**
 * Tests for GET /api/bids/[id]
 * Public endpoint — lists bids for a given product (auction) by productId in the path.
 * No auth required. pageSize clamped to 50 by getNumberParam.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockListBidsByProduct } = vi.hoisted(() => ({
  mockListBidsByProduct: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/features", () => ({
  withFeatureGuard: (_flag: string, handler: unknown) => handler,
  getFlag: () => true,
}));

vi.mock("@mohasinac/appkit", () => ({
  createRouteHandler: (opts: {
    handler: (ctx: { request: Request; params: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params =
        context?.params instanceof Promise
          ? await (context.params as Promise<unknown>)
          : context?.params;
      return opts.handler({ request, params });
    };
  },
  listBidsByProduct: mockListBidsByProduct,
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getNumberParam: (
    params: URLSearchParams,
    key: string,
    defaultVal: number,
    opts?: { min?: number; max?: number },
  ) => {
    const raw = params.get(key);
    if (raw === null) return defaultVal;
    const n = parseInt(raw, 10);
    if (isNaN(n)) return defaultVal;
    let result = n;
    if (opts?.min !== undefined) result = Math.max(opts.min, result);
    if (opts?.max !== undefined) result = Math.min(opts.max, result);
    return result;
  },
}));

import { GET } from "../route";

const makeReq = (search = "") =>
  new Request(`http://localhost/api/bids/auction-charizard-psa9${search}`);

const makeCtx = (id = "auction-charizard-psa9") => ({
  params: Promise.resolve({ id }),
});

const makeBidsPage = (count = 3) => ({
  items: Array.from({ length: count }, (_, i) => ({
    id: `bid-charizard-ravi-${i}`,
    productId: "auction-charizard-psa9",
    amount: 10000 + i * 500,
    status: "active",
  })),
  total: count,
  page: 1,
  pageSize: 20,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockListBidsByProduct.mockResolvedValue(makeBidsPage());
});

describe("GET /api/bids/[id]", () => {
  it("returns 200 with bids list", async () => {
    const res = await GET(makeReq() as never, makeCtx());
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean; data: { items: unknown[] } };
    expect(body.ok).toBe(true);
    expect(body.data.items).toHaveLength(3);
  });

  it("listBidsByProduct called with productId from path param", async () => {
    await GET(makeReq() as never, makeCtx("auction-charizard-psa9"));
    expect(mockListBidsByProduct).toHaveBeenCalledWith(
      "auction-charizard-psa9",
      expect.any(Object),
    );
  });

  it("no query params → defaults page=1 and pageSize=20", async () => {
    await GET(makeReq() as never, makeCtx());
    expect(mockListBidsByProduct).toHaveBeenCalledWith(
      expect.any(String),
      { page: 1, pageSize: 20 },
    );
  });

  it("pageSize=99 is clamped to 50 (getNumberParam max)", async () => {
    await GET(makeReq("?pageSize=99") as never, makeCtx());
    expect(mockListBidsByProduct).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ pageSize: 50 }),
    );
  });

  it("page=3 and pageSize=10 are forwarded correctly", async () => {
    await GET(makeReq("?page=3&pageSize=10") as never, makeCtx());
    expect(mockListBidsByProduct).toHaveBeenCalledWith(
      expect.any(String),
      { page: 3, pageSize: 10 },
    );
  });
});
