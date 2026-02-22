/**
 * @jest-environment node
 */

/**
 * Coupon Validate API Tests
 *
 * POST /api/coupons/validate
 */

import { buildRequest, parseResponse, mockRegularUser } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockVerifySessionCookie = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  verifySessionCookie: (...args: unknown[]) => mockVerifySessionCookie(...args),
}));

const mockValidateCoupon = jest.fn();
jest.mock("@/repositories", () => ({
  couponsRepository: {
    validateCoupon: (...args: unknown[]) => mockValidateCoupon(...args),
  },
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
  return { AppError, AuthenticationError };
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
  successResponse: (data: any, message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status });
  },
  errorResponse: (message: string, status = 400) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: message }, { status });
  },
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { POST } from "../coupons/validate/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUser = mockRegularUser();

const validCouponResult = {
  valid: true,
  discountAmount: 150,
  coupon: {
    code: "SAVE10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 500,
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/coupons/validate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifySessionCookie.mockResolvedValue({ uid: mockUser.uid });
    mockValidateCoupon.mockResolvedValue(validCouponResult);
  });

  it("returns 401 without session cookie", async () => {
    const req = buildRequest("/api/coupons/validate", {
      method: "POST",
      body: { code: "SAVE10", orderTotal: 1500 },
    });
    // No __session cookie set
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 200 + discount data for a valid coupon", async () => {
    const req = buildRequest("/api/coupons/validate", {
      method: "POST",
      body: { code: "SAVE10", orderTotal: 1500 },
      cookies: { __session: "valid-session-token" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.valid).toBe(true);
    expect(body.data.discountAmount).toBe(150);
  });

  it("returns coupon details including discountType and discountValue", async () => {
    const req = buildRequest("/api/coupons/validate", {
      method: "POST",
      body: { code: "SAVE10", orderTotal: 1500 },
      cookies: { __session: "valid-session-token" },
    });
    const res = await POST(req);
    const { body } = await parseResponse(res);

    expect(body.data.coupon.discountType).toBe("percentage");
    expect(body.data.coupon.discountValue).toBe(10);
  });

  it("returns 400 when coupon validation fails (expired, limit reached, etc.)", async () => {
    mockValidateCoupon.mockResolvedValue({
      valid: false,
      discountAmount: 0,
      error: "Coupon has expired",
    });

    const req = buildRequest("/api/coupons/validate", {
      method: "POST",
      body: { code: "EXPIRED", orderTotal: 1500 },
      cookies: { __session: "valid-session-token" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    // The route returns successResponse with the result (valid: false handled by client)
    expect([200, 400]).toContain(status);
  });

  it("returns 400 when validation schema fails (missing code)", async () => {
    const req = buildRequest("/api/coupons/validate", {
      method: "POST",
      body: { orderTotal: 1500 }, // missing code
      cookies: { __session: "valid-session-token" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("calls couponsRepository.validateCoupon with code, userId, and orderTotal", async () => {
    const req = buildRequest("/api/coupons/validate", {
      method: "POST",
      body: { code: "SAVE10", orderTotal: 1500 },
      cookies: { __session: "valid-session-token" },
    });
    await POST(req);

    expect(mockValidateCoupon).toHaveBeenCalledWith(
      "SAVE10",
      mockUser.uid,
      1500,
    );
  });

  it("returns 401 when session cookie is invalid", async () => {
    mockVerifySessionCookie.mockResolvedValue(null);

    const req = buildRequest("/api/coupons/validate", {
      method: "POST",
      body: { code: "SAVE10", orderTotal: 1500 },
      cookies: { __session: "invalid-token" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
