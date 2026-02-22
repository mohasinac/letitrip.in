/**
 * @jest-environment node
 */

/**
 * Seller Payouts API Tests
 *
 * GET  /api/seller/payouts
 * POST /api/seller/payouts
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

const mockProductFindBySeller = jest.fn();
const mockOrderFindByProduct = jest.fn();
const mockPayoutFindBySeller = jest.fn();
const mockPayoutGetPaidOutOrderIds = jest.fn();
const mockPayoutCreate = jest.fn();

jest.mock("@/repositories", () => ({
  productRepository: {
    findBySeller: (...args: unknown[]) => mockProductFindBySeller(...args),
  },
  orderRepository: {
    findByProduct: (...args: unknown[]) => mockOrderFindByProduct(...args),
  },
  payoutRepository: {
    findBySeller: (...args: unknown[]) => mockPayoutFindBySeller(...args),
    getPaidOutOrderIds: (...args: unknown[]) =>
      mockPayoutGetPaidOutOrderIds(...args),
    create: (...args: unknown[]) => mockPayoutCreate(...args),
  },
}));

jest.mock("@/db/schema", () => ({
  DEFAULT_PLATFORM_FEE_RATE: 0.1,
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
  ApiErrors: {
    validationError: (issues: any) => {
      const { NextResponse } = require("next/server");
      return NextResponse.json({ success: false, issues }, { status: 422 });
    },
  },
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    PAYOUT: {
      ALREADY_PENDING: "A payout is already pending",
      NO_EARNINGS: "No eligible earnings to withdraw",
      INVALID_METHOD: "Invalid payment method",
    },
  },
  SUCCESS_MESSAGES: { PAYOUT: { CREATED: "Payout requested" } },
}));

// ─── Import routes ────────────────────────────────────────────────────────────

import { GET, POST } from "../seller/payouts/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const sellerUser = {
  ...mockRegularUser(),
  uid: "seller-uid-001",
  role: "seller",
  email: "seller@test.com",
  name: "Test Seller",
};

const mockProducts = [
  { id: "prod-1", title: "Watch", sellerId: "seller-uid-001" },
];

const mockDeliveredOrders = [
  { id: "ord-1", productId: "prod-1", totalPrice: 5000, status: "delivered" },
];

const validPayoutBody = {
  paymentMethod: "upi",
  upiId: "seller@upi",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/seller/payouts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(sellerUser);
    mockPayoutFindBySeller.mockResolvedValue([]);
    mockProductFindBySeller.mockResolvedValue(mockProducts);
    mockOrderFindByProduct.mockResolvedValue(mockDeliveredOrders);
    mockPayoutGetPaidOutOrderIds.mockResolvedValue(new Set());
  });

  it("returns 401 without authentication", async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { statusCode: 401 }),
    );
    const { status } = await parseResponse(
      await GET(buildRequest("/api/seller/payouts")),
    );
    expect(status).toBe(401);
  });

  it("returns payout list scoped to current seller", async () => {
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/seller/payouts")),
    );
    expect(status).toBe(200);
    expect(body.data.payouts).toBeDefined();
    expect(mockPayoutFindBySeller).toHaveBeenCalledWith("seller-uid-001");
  });

  it("includes summary with availableEarnings and grossEarnings", async () => {
    const { body } = await parseResponse(
      await GET(buildRequest("/api/seller/payouts")),
    );
    expect(body.data.summary).toMatchObject({
      availableEarnings: expect.any(Number),
      grossEarnings: expect.any(Number),
    });
  });
});

describe("POST /api/seller/payouts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(sellerUser);
    mockPayoutFindBySeller.mockResolvedValue([]);
    mockProductFindBySeller.mockResolvedValue(mockProducts);
    mockOrderFindByProduct.mockResolvedValue(mockDeliveredOrders);
    mockPayoutGetPaidOutOrderIds.mockResolvedValue(new Set());
    mockPayoutCreate.mockResolvedValue({ id: "payout-new", amount: 4500 });
  });

  it("returns 401 without authentication", async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { statusCode: 401 }),
    );
    const req = buildRequest("/api/seller/payouts", {
      method: "POST",
      body: validPayoutBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(401);
  });

  it("creates payout request and returns 200", async () => {
    const req = buildRequest("/api/seller/payouts", {
      method: "POST",
      body: validPayoutBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(200);
  });

  it("returns 422 for invalid payment method body", async () => {
    const req = buildRequest("/api/seller/payouts", {
      method: "POST",
      body: { paymentMethod: "cash" },
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(422);
  });

  it("returns 422 when pending payout already exists", async () => {
    mockPayoutFindBySeller.mockResolvedValue([
      { id: "existing", status: "pending" },
    ]);
    const req = buildRequest("/api/seller/payouts", {
      method: "POST",
      body: validPayoutBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(422);
  });

  it("returns 422 when no eligible earnings", async () => {
    mockOrderFindByProduct.mockResolvedValue([]);
    const req = buildRequest("/api/seller/payouts", {
      method: "POST",
      body: validPayoutBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(422);
  });
});
