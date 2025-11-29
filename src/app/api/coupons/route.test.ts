/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { getUserShops } from "../lib/auth-helpers";

// Mock dependencies
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("../lib/auth-helpers");
jest.mock("../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
  getFirestoreAdmin: jest.fn(),
}));

const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockUserOwnsShop = userOwnsShop as jest.MockedFunction<
  typeof userOwnsShop
>;
const mockGetUserShops = getUserShops as jest.MockedFunction<
  typeof getUserShops
>;

describe("GET /api/coupons", () => {
  let mockQuery: any;
  let mockSnapshot: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSnapshot = {
      docs: [
        {
          id: "coupon1",
          data: () => ({
            code: "SAVE10",
            shop_id: "shop1",
            is_active: true,
            discount_value: 10,
          }),
        },
        {
          id: "coupon2",
          data: () => ({
            code: "SAVE20",
            shop_id: "shop2",
            is_active: false,
            discount_value: 20,
          }),
        },
      ],
    };

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSnapshot),
    };

    (Collections.coupons as jest.Mock).mockReturnValue(mockQuery);
  });

  it("should return only active coupons for guest users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/coupons");
    const response = await GET(request);
    const data = await response.json();

    expect(mockQuery.where).toHaveBeenCalledWith("is_active", "==", true);
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should return only active coupons for regular users", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "user1",
      role: "user",
      email: "user@test.com",
    } as any);

    const request = new NextRequest("http://localhost:3000/api/coupons");
    const response = await GET(request);

    expect(mockQuery.where).toHaveBeenCalledWith("is_active", "==", true);
    expect(response.status).toBe(200);
  });

  it("should filter by shop_id for sellers with shopId parameter", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "seller1",
      role: "seller",
      email: "seller@test.com",
    } as any);

    const request = new NextRequest(
      "http://localhost:3000/api/coupons?shop_id=shop1",
    );
    const response = await GET(request);

    expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop1");
    expect(response.status).toBe(200);
  });

  it("should get seller's shop coupons when no shopId provided", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "seller1",
      role: "seller",
      email: "seller@test.com",
    } as any);
    mockGetUserShops.mockResolvedValue(["shop1"]);

    const request = new NextRequest("http://localhost:3000/api/coupons");
    const response = await GET(request);

    expect(mockGetUserShops).toHaveBeenCalledWith("seller1");
    expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop1");
    expect(response.status).toBe(200);
  });

  it("should return all coupons for admin without shop filter", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      role: "admin",
      email: "admin@test.com",
    } as any);

    const request = new NextRequest("http://localhost:3000/api/coupons");
    const response = await GET(request);

    expect(mockQuery.where).not.toHaveBeenCalledWith("is_active", "==", true);
    expect(response.status).toBe(200);
  });

  it("should filter by shop_id for admin when provided", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      role: "admin",
      email: "admin@test.com",
    } as any);

    const request = new NextRequest(
      "http://localhost:3000/api/coupons?shop_id=shop1",
    );
    const response = await GET(request);

    expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop1");
    expect(response.status).toBe(200);
  });

  it("should limit results to 200 coupons", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/coupons");
    await GET(request);

    expect(mockQuery.limit).toHaveBeenCalledWith(200);
  });

  it("should handle database errors", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    mockQuery.get.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/coupons");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to list coupons");
  });
});

describe("POST /api/coupons", () => {
  let mockCouponRef: any;
  let mockCouponDoc: any;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCouponDoc = {
      id: "newCoupon1",
      data: () => ({
        code: "SAVE10",
        shop_id: "shop1",
        discount_value: 10,
      }),
      get: jest.fn().mockResolvedValue({
        id: "newCoupon1",
        data: () => ({
          code: "SAVE10",
          shop_id: "shop1",
          discount_value: 10,
        }),
      }),
    };

    mockCouponRef = {
      id: "newCoupon1",
      get: jest.fn().mockResolvedValue(mockCouponDoc),
    };

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      add: jest.fn().mockResolvedValue(mockCouponRef),
    };

    (Collections.coupons as jest.Mock).mockReturnValue(mockQuery);
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as any);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", code: "SAVE10" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("should require seller or admin role", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", role: "user", email: "user@test.com" },
    } as any);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", code: "SAVE10" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Only sellers and admins can create coupons");
  });

  it("should require shop_id and code", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", role: "seller", email: "seller@test.com" },
    } as any);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ code: "SAVE10" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("shop_id");
  });

  it("should support camelCase shopId from frontend", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", role: "seller", email: "seller@test.com" },
    } as any);
    mockUserOwnsShop.mockResolvedValue(true);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shopId: "shop1", code: "SAVE10" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("should validate seller owns shop", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", role: "seller", email: "seller@test.com" },
    } as any);
    mockUserOwnsShop.mockResolvedValue(false);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", code: "SAVE10" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Cannot create coupon for this shop");
  });

  it("should reject duplicate coupon code for same shop", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", role: "seller", email: "seller@test.com" },
    } as any);
    mockUserOwnsShop.mockResolvedValue(true);
    mockQuery.get.mockResolvedValue({
      empty: false,
      docs: [{ id: "existing" }],
    });

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", code: "SAVE10" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Coupon code already exists for this shop");
  });

  it("should create coupon with valid data", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", role: "seller", email: "seller@test.com" },
    } as any);
    mockUserOwnsShop.mockResolvedValue(true);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({
        shop_id: "shop1",
        code: "SAVE10",
        name: "10% Off",
        type: "percentage",
        discount_value: 10,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.code).toBe("SAVE10");
  });

  it("should set default values for optional fields", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", role: "seller", email: "seller@test.com" },
    } as any);
    mockUserOwnsShop.mockResolvedValue(true);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", code: "SAVE10" }),
    });

    await POST(request);

    expect(mockQuery.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "SAVE10", // defaults to code
        type: "percentage",
        discount_value: 0,
        is_active: true,
        usage_limit: null,
      }),
    );
  });

  it("should support camelCase field names", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "admin1", role: "admin", email: "admin@test.com" },
    } as any);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({
        shopId: "shop1",
        code: "SAVE10",
        discountValue: 15,
        isActive: false,
        usageLimit: 100,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      }),
    });

    await POST(request);

    expect(mockQuery.add).toHaveBeenCalledWith(
      expect.objectContaining({
        discount_value: 15,
        is_active: false,
        usage_limit: 100,
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      }),
    );
  });

  it("should allow admin to create coupon without ownership check", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "admin1", role: "admin", email: "admin@test.com" },
    } as any);

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", code: "SAVE10" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(mockUserOwnsShop).not.toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", role: "seller", email: "seller@test.com" },
    } as any);
    mockUserOwnsShop.mockResolvedValue(true);
    mockQuery.add.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/coupons", {
      method: "POST",
      body: JSON.stringify({ shop_id: "shop1", code: "SAVE10" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to create coupon");
  });
});
