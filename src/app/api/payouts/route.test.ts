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

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe("GET /api/payouts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/payouts");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should list seller's own payouts", async () => {
    const mockPayouts = [
      {
        id: "payout1",
        seller_id: "seller1",
        amount: 1000,
        status: "pending",
      },
      {
        id: "payout2",
        seller_id: "seller1",
        amount: 2000,
        status: "completed",
      },
    ];

    mockGetUserFromRequest.mockResolvedValue({
      uid: "seller1",
      email: "seller@test.com",
      role: "seller",
    } as any);

    const mockGet = jest.fn().mockResolvedValue({
      size: 2,
      docs: mockPayouts.map((p) => ({
        id: p.id,
        data: () => p,
      })),
    });

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: mockGet,
    };

    mockCollections.payouts.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/payouts");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(mockQuery.where).toHaveBeenCalledWith("seller_id", "==", "seller1");
  });

  it("should list all payouts for admin", async () => {
    const mockPayouts = [
      { id: "payout1", seller_id: "seller1", amount: 1000, status: "pending" },
      { id: "payout2", seller_id: "seller2", amount: 2000, status: "pending" },
    ];

    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockGet = jest.fn().mockResolvedValue({
      size: 2,
      docs: mockPayouts.map((p) => ({
        id: p.id,
        data: () => p,
      })),
    });

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: mockGet,
    };

    mockCollections.payouts.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/payouts");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Admin doesn't filter by seller_id
    expect(mockQuery.where).not.toHaveBeenCalledWith(
      "seller_id",
      expect.anything(),
      expect.anything(),
    );
  });

  it("should filter by status", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockGet = jest.fn().mockResolvedValue({
      size: 0,
      docs: [],
    });

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: mockGet,
    };

    mockCollections.payouts.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/payouts?status=pending");
    await GET(req);

    expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "pending");
  });

  it("should filter by date range", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockGet = jest.fn().mockResolvedValue({
      size: 0,
      docs: [],
    });

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: mockGet,
    };

    mockCollections.payouts.mockReturnValue(mockQuery as any);

    const startDate = "2024-01-01";
    const endDate = "2024-12-31";
    const req = new NextRequest(
      `http://localhost/api/payouts?startDate=${startDate}&endDate=${endDate}`,
    );
    await GET(req);

    expect(mockQuery.where).toHaveBeenCalledWith(
      "created_at",
      ">=",
      new Date(startDate),
    );
    expect(mockQuery.where).toHaveBeenCalledWith(
      "created_at",
      "<=",
      new Date(endDate),
    );
  });

  it("should paginate results", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockGet = jest.fn().mockResolvedValue({
      size: 50,
      docs: [],
    });

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: mockGet,
    };

    mockCollections.payouts.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/payouts?page=2&limit=10");
    const response = await GET(req);
    const data = await response.json();

    expect(mockQuery.limit).toHaveBeenCalledWith(10);
    expect(mockQuery.offset).toHaveBeenCalledWith(10); // (page 2 - 1) * 10
    expect(data.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 50,
      totalPages: 5,
    });
  });

  it("should handle database errors", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    mockCollections.payouts.mockImplementation(() => {
      throw new Error("Database error");
    });

    const req = new NextRequest("http://localhost/api/payouts");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Database error");
  });
});

describe("POST /api/payouts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      ),
    } as any);

    const req = new NextRequest("http://localhost/api/payouts", {
      method: "POST",
      body: JSON.stringify({ amount: 1000, paymentMethod: "bank" }),
    });
    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it("should only allow sellers to create payout requests", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user@test.com", role: "user" },
    } as any);

    const req = new NextRequest("http://localhost/api/payouts", {
      method: "POST",
      body: JSON.stringify({ amount: 1000, paymentMethod: "bank" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Only sellers can create payout requests");
  });

  it("should require amount and paymentMethod", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const req = new NextRequest("http://localhost/api/payouts", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("amount");
    expect(data.error).toContain("paymentMethod");
  });

  it("should create payout request successfully", async () => {
    mockRequireAuth.mockResolvedValue({
      user: {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller",
        shopId: "shop1",
      },
    } as any);

    const mockAdd = jest.fn().mockResolvedValue({ id: "payout1" });
    mockCollections.payouts.mockReturnValue({ add: mockAdd } as any);

    const payoutData = {
      amount: 5000,
      paymentMethod: "bank",
      bankDetails: {
        accountNumber: "1234567890",
        ifsc: "SBIN0001234",
        accountName: "Test Seller",
      },
      notes: "Monthly payout",
    };

    const req = new NextRequest("http://localhost/api/payouts", {
      method: "POST",
      body: JSON.stringify(payoutData),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.payout.id).toBe("payout1");
    expect(data.payout.amount).toBe(5000);
    expect(data.payout.status).toBe("pending");
    expect(data.payout.seller_id).toBe("seller1");
  });

  it("should use UPI when provided", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const mockAdd = jest.fn().mockResolvedValue({ id: "payout1" });
    mockCollections.payouts.mockReturnValue({ add: mockAdd } as any);

    const payoutData = {
      amount: 1000,
      paymentMethod: "upi",
      upiId: "seller@upi",
    };

    const req = new NextRequest("http://localhost/api/payouts", {
      method: "POST",
      body: JSON.stringify(payoutData),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.payout.upi_id).toBe("seller@upi");
    expect(data.payout.payment_method).toBe("upi");
  });

  it("should set default currency to INR", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const mockAdd = jest.fn().mockResolvedValue({ id: "payout1" });
    mockCollections.payouts.mockReturnValue({ add: mockAdd } as any);

    const req = new NextRequest("http://localhost/api/payouts", {
      method: "POST",
      body: JSON.stringify({ amount: 1000, paymentMethod: "bank" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(data.payout.currency).toBe("INR");
  });

  it("should handle database errors", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    mockCollections.payouts.mockReturnValue({
      add: jest.fn().mockRejectedValue(new Error("Database error")),
    } as any);

    const req = new NextRequest("http://localhost/api/payouts", {
      method: "POST",
      body: JSON.stringify({ amount: 1000, paymentMethod: "bank" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
