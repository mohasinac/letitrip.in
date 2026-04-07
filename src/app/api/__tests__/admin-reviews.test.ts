/**
 * @jest-environment node
 */

import { buildRequest, parseResponse, mockAdminUser } from "./helpers";

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => {
    const handler = opts.handler;
    return async (req: any, ctx?: any) => {
      const user = (global as any).__mockAdminReviewsUser ?? null;
      return handler({ request: req, user }, ctx);
    };
  },
}));

const mockReviewListAll = jest.fn();

jest.mock("@/repositories", () => ({
  reviewRepository: {
    listAll: (...args: unknown[]) => mockReviewListAll(...args),
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data }, { status: 200 });
  },
}));

jest.mock("@/lib/pii", () => ({
  piiBlindIndex: (value: string) => `hash:${value.toLowerCase().trim()}`,
}));

import { GET } from "../admin/reviews/route";

describe("GET /api/admin/reviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminReviewsUser = mockAdminUser();
    mockReviewListAll.mockResolvedValue({
      items: [{ id: "rev-1", userName: "John", status: "pending" }],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
      hasMore: false,
    });
  });

  afterEach(() => {
    delete (global as any).__mockAdminReviewsUser;
  });

  it("returns paginated reviews list", async () => {
    const req = buildRequest("/api/admin/reviews");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(1);
  });

  it("forwards Sieve filters/sorts when q is absent", async () => {
    const req = buildRequest(
      "/api/admin/reviews?filters=status==pending&sorts=-createdAt&page=2&pageSize=10",
    );
    await GET(req);

    expect(mockReviewListAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: "status==pending",
        sorts: "-createdAt",
        page: 2,
        pageSize: 10,
      }),
    );
  });

  it("maps q to userName blind-index filter", async () => {
    const req = buildRequest("/api/admin/reviews?q=John Doe");
    await GET(req);

    expect(mockReviewListAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: "userNameIndex==hash:john doe",
        sorts: undefined,
      }),
    );
  });
});
