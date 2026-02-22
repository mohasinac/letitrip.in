/**
 * @jest-environment node
 */

/**
 * Public Bids API Tests
 *
 * GET  /api/bids?productId=... — list bids for a product (public)
 * POST /api/bids               — place a bid (auth required)
 */

import { buildRequest, parseResponse, mockRegularUser } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockRequireAuth = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockFindByProductSorted = jest.fn();
const mockProductFindById = jest.fn();
const mockBidCreate = jest.fn();
const mockBidFindBy = jest.fn();
const mockRunBatch = jest.fn();
const mockBidsUpdateInBatch = jest.fn();
const mockProductsUpdateInBatch = jest.fn();

jest.mock("@/repositories", () => ({
  bidRepository: {
    findByProductSorted: (...args: unknown[]) =>
      mockFindByProductSorted(...args),
    create: (...args: unknown[]) => mockBidCreate(...args),
    findBy: (...args: unknown[]) => mockBidFindBy(...args),
  },
  productRepository: {
    findById: (...args: unknown[]) => mockProductFindById(...args),
  },
  unitOfWork: {
    runBatch: (...args: unknown[]) => mockRunBatch(...args),
    bids: { updateInBatch: (...a: unknown[]) => mockBidsUpdateInBatch(...a) },
    products: {
      updateInBatch: (...a: unknown[]) => mockProductsUpdateInBatch(...a),
    },
  },
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminRealtimeDb: () => ({
    ref: () => ({ set: jest.fn() }),
  }),
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.name = this.constructor.name;
    }
    toJSON() {
      return { success: false, error: this.message, code: this.code };
    }
  }
  class AuthenticationError extends AppError {
    constructor(msg: string) {
      super(401, msg, "AUTH_ERROR");
    }
  }
  class ValidationError extends AppError {
    constructor(msg: string) {
      super(422, msg, "VALIDATION_ERROR");
    }
  }
  class NotFoundError extends AppError {
    constructor(msg: string) {
      super(404, msg, "NOT_FOUND");
    }
  }
  return { AppError, AuthenticationError, ValidationError, NotFoundError };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    const status = error?.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error?.message || "Internal error" },
      { status },
    );
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: any, _message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data }, { status });
  },
  errorResponse: (message: string, status = 400) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: message }, { status });
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getStringParam: (params: any, key: string) => params.get(key) ?? undefined,
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { GET, POST } from "../bids/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockBids = [
  { id: "bid-1", productId: "prod-1", userId: "user-1", bidAmount: 2000 },
  { id: "bid-2", productId: "prod-1", userId: "user-2", bidAmount: 1500 },
];

const mockAuctionProduct = {
  id: "prod-1",
  title: "Vintage Watch",
  isAuction: true,
  sellerId: "seller-uid-001",
  currentBid: 1500,
  startingBid: 1000,
  price: 1000,
  auctionEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
  status: "published",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/bids", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindByProductSorted.mockResolvedValue(mockBids);
  });

  it("returns bid list for a product", async () => {
    const req = buildRequest("/api/bids?productId=prod-1");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });

  it("returns 400 when productId is missing", async () => {
    const req = buildRequest("/api/bids");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("includes meta.total in the response", async () => {
    const req = buildRequest("/api/bids?productId=prod-1");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.total).toBe(2);
  });

  it("calls bidRepository.findByProductSorted with the productId", async () => {
    const req = buildRequest("/api/bids?productId=prod-1");
    await GET(req);

    expect(mockFindByProductSorted).toHaveBeenCalledWith("prod-1");
  });
});

describe("POST /api/bids", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(mockRegularUser());
    mockProductFindById.mockResolvedValue(mockAuctionProduct);
    mockBidCreate.mockResolvedValue({ id: "bid-new", bidAmount: 2000 });
    mockBidFindBy.mockResolvedValue([]);
    mockRunBatch.mockImplementation(async (fn: (batch: object) => void) => {
      fn({});
    });
  });

  it("returns 401 without authentication", async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { statusCode: 401 }),
    );

    const req = buildRequest("/api/bids", {
      method: "POST",
      body: { productId: "prod-1", bidAmount: 2000 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("places a bid and returns 201", async () => {
    const req = buildRequest("/api/bids", {
      method: "POST",
      body: { productId: "prod-1", bidAmount: 2000 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(201);
  });

  it("returns 400 when bid amount is below current highest bid", async () => {
    const req = buildRequest("/api/bids", {
      method: "POST",
      body: { productId: "prod-1", bidAmount: 500 }, // below currentBid of 1500
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when the auction has ended", async () => {
    mockProductFindById.mockResolvedValue({
      ...mockAuctionProduct,
      auctionEndDate: new Date(Date.now() - 1000), // in the past
    });

    const req = buildRequest("/api/bids", {
      method: "POST",
      body: { productId: "prod-1", bidAmount: 5000 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 422 when request body fails schema validation", async () => {
    const req = buildRequest("/api/bids", {
      method: "POST",
      body: { productId: "prod-1" }, // missing bidAmount
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    // 422 from ValidationError or 400 from error response
    expect([400, 422]).toContain(status);
  });

  it("returns 404 when product does not exist", async () => {
    mockProductFindById.mockResolvedValue(null);

    const req = buildRequest("/api/bids", {
      method: "POST",
      body: { productId: "nonexistent", bidAmount: 5000 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 403 when bidding on own auction", async () => {
    mockRequireAuth.mockResolvedValue({ uid: "seller-uid-001" }); // same as sellerId

    const req = buildRequest("/api/bids", {
      method: "POST",
      body: { productId: "prod-1", bidAmount: 5000 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });
});
