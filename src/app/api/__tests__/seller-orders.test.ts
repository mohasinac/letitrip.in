/**
 * @jest-environment node
 */

/**
 * Seller Orders API Tests
 *
 * GET /api/seller/orders
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

const mockFindBySeller = jest.fn();
const mockListForSeller = jest.fn();

jest.mock("@/repositories", () => ({
  productRepository: {
    findBySeller: (...args: unknown[]) => mockFindBySeller(...args),
  },
  orderRepository: {
    listForSeller: (...args: unknown[]) => mockListForSeller(...args),
  },
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(s: number, m: string, c: string) {
      super(m);
      this.statusCode = s;
      this.code = c;
      this.name = this.constructor.name;
    }
  }
  class AuthenticationError extends AppError {
    constructor(m: string) {
      super(401, m, "AUTH_ERROR");
    }
  }
  class AuthorizationError extends AppError {
    constructor(m: string) {
      super(403, m, "FORBIDDEN");
    }
  }
  class ValidationError extends AppError {
    constructor(m: string) {
      super(422, m, "VALIDATION_ERROR");
    }
  }
  class NotFoundError extends AppError {
    constructor(m: string) {
      super(404, m, "NOT_FOUND");
    }
  }
  return {
    AppError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
  };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: error?.statusCode || 500 },
    );
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: any, _msg?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data }, { status });
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getStringParam: (p: any, k: string) => p.get(k) ?? undefined,
  getNumberParam: (p: any, k: string, def: number) => {
    const v = p.get(k);
    return v ? Number(v) : def;
  },
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: { ORDER: { FETCH_FAILED: "Failed to fetch orders" } },
}));

// ─── Import route ─────────────────────────────────────────────────────────────

import { GET } from "../seller/orders/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const sellerUser = {
  ...mockRegularUser(),
  uid: "seller-uid-001",
  role: "seller",
};

const mockSellerProducts = [
  { id: "prod-1", title: "Watch", sellerId: "seller-uid-001" },
  { id: "prod-2", title: "Bag", sellerId: "seller-uid-001" },
];

const mockOrdersResult = {
  items: [
    { id: "ord-1", productId: "prod-1", userId: "user-1", status: "pending" },
    { id: "ord-2", productId: "prod-2", userId: "user-2", status: "delivered" },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/seller/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(sellerUser);
    mockFindBySeller.mockResolvedValue(mockSellerProducts);
    mockListForSeller.mockResolvedValue(mockOrdersResult);
  });

  it("returns 401 without authentication", async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { statusCode: 401 }),
    );
    const { status } = await parseResponse(
      await GET(buildRequest("/api/seller/orders")),
    );
    expect(status).toBe(401);
  });

  it("returns paginated order list scoped to seller", async () => {
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/seller/orders")),
    );
    expect(status).toBe(200);
    expect(body.data.orders).toHaveLength(2);
  });

  it("queries products for current seller's uid", async () => {
    await GET(buildRequest("/api/seller/orders"));
    expect(mockFindBySeller).toHaveBeenCalledWith("seller-uid-001");
  });

  it("returns empty orders when seller has no products", async () => {
    mockFindBySeller.mockResolvedValue([]);
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/seller/orders")),
    );
    expect(status).toBe(200);
    expect(body.data.orders).toHaveLength(0);
    expect(mockListForSeller).not.toHaveBeenCalled();
  });

  it("forwards Sieve params to orderRepository.listForSeller", async () => {
    await GET(
      buildRequest(
        "/api/seller/orders?filters=status==pending&sorts=-orderDate&page=2",
      ),
    );
    expect(mockListForSeller).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        filters: "status==pending",
        sorts: "-orderDate",
      }),
    );
  });
});
