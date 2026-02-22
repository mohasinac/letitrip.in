/**
 * @jest-environment node
 */

/**
 * Admin Dashboard API Tests
 *
 * GET /api/admin/dashboard
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockSellerUser,
} from "./helpers";

// ─── Global mock user for createApiHandler ────────────────────────────────────

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => async (req: any) => {
    const { NextResponse } = require("next/server");
    const user = (global as any).__mockAdminDashboardUser ?? null;
    if (opts.auth && !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const requiredRoles: string[] = opts.roles ?? [];
    if (requiredRoles.length && user && !requiredRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    return opts.handler({ request: req, user });
  },
}));

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockUserCount = jest.fn();
const mockUserCountActive = jest.fn();
const mockUserCountNewSince = jest.fn();
const mockUserCountDisabled = jest.fn();
const mockUserCountByRole = jest.fn();
const mockProductCount = jest.fn();
const mockOrderCount = jest.fn();

jest.mock("@/repositories", () => ({
  userRepository: {
    count: (...args: unknown[]) => mockUserCount(...args),
    countActive: (...args: unknown[]) => mockUserCountActive(...args),
    countNewSince: (...args: unknown[]) => mockUserCountNewSince(...args),
    countDisabled: (...args: unknown[]) => mockUserCountDisabled(...args),
    countByRole: (...args: unknown[]) => mockUserCountByRole(...args),
  },
  productRepository: {
    count: (...args: unknown[]) => mockProductCount(...args),
  },
  orderRepository: {
    count: (...args: unknown[]) => mockOrderCount(...args),
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: any, _message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data }, { status });
  },
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { GET } from "../admin/dashboard/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminDashboardUser = mockAdminUser();
    mockUserCount.mockResolvedValue(100);
    mockUserCountActive.mockResolvedValue(80);
    mockUserCountNewSince.mockResolvedValue(15);
    mockUserCountDisabled.mockResolvedValue(5);
    mockUserCountByRole.mockResolvedValue(3);
    mockProductCount.mockResolvedValue(250);
    mockOrderCount.mockResolvedValue(500);
  });

  afterEach(() => {
    delete (global as any).__mockAdminDashboardUser;
  });

  it("returns 401 without session", async () => {
    (global as any).__mockAdminDashboardUser = null;

    const req = buildRequest("/api/admin/dashboard");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 403 for seller role", async () => {
    (global as any).__mockAdminDashboardUser = mockSellerUser();

    const req = buildRequest("/api/admin/dashboard");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("returns 200 + stats object for admin role", async () => {
    const req = buildRequest("/api/admin/dashboard");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("stats object contains totalUsers, totalOrders, totalProducts", async () => {
    const req = buildRequest("/api/admin/dashboard");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.users).toBeDefined();
    expect(body.data.products).toBeDefined();
    expect(body.data.orders).toBeDefined();
  });

  it("stats values are numbers (not strings or undefined)", async () => {
    const req = buildRequest("/api/admin/dashboard");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(typeof body.data.users.total).toBe("number");
    expect(typeof body.data.products.total).toBe("number");
    expect(typeof body.data.orders.total).toBe("number");
  });

  it("gracefully handles count errors (falls back to 0)", async () => {
    mockUserCount.mockRejectedValue(new Error("DB error"));

    const req = buildRequest("/api/admin/dashboard");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    // Should still return 200 with 0 fallback
    expect(status).toBe(200);
    expect(body.data.users.total).toBe(0);
  });

  it("includes new users count in stats", async () => {
    const req = buildRequest("/api/admin/dashboard");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.users.new).toBe(15);
  });
});
