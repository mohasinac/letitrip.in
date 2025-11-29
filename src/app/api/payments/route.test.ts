/**
 * @jest-environment node
 */

// Mock dependencies BEFORE importing the route
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/utils/pagination");

import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { executeOffsetPaginatedQuery } from "@/app/api/lib/utils/pagination";

describe("/api/payments", () => {
  const mockUser = {
    uid: "user123",
    email: "user@test.com",
    role: "user",
  };

  const mockPayments = [
    {
      id: "payment1",
      order_id: "order123",
      user_id: "user123",
      shop_id: "shop123",
      amount: 5000,
      currency: "INR",
      gateway: "razorpay",
      status: "completed",
      created_at: "2025-01-01T10:00:00Z",
    },
    {
      id: "payment2",
      order_id: "order124",
      user_id: "user123",
      shop_id: "shop123",
      amount: 3000,
      currency: "INR",
      gateway: "stripe",
      status: "pending",
      created_at: "2025-01-02T10:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/payments", () => {
    it("returns 401 when user is not authenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/payments");
      const response = await GET(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Authentication required",
      });
    });

    it("returns user's own payments for regular user", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPayments,
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest("http://localhost/api/payments");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockPayments);
      expect(mockQuery.where).toHaveBeenCalledWith("user_id", "==", "user123");
    });

    it("returns empty array for seller without shopId", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
        shopId: null,
      });

      const request = new NextRequest("http://localhost/api/payments");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toEqual([]);
      expect(json.count).toBe(0);
    });

    it("returns shop payments for seller with shopId", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
        shopId: "shop123",
      });

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPayments,
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest("http://localhost/api/payments");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop123");
    });

    it("returns all payments for admin", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "admin",
      });

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPayments,
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest("http://localhost/api/payments");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      // Admin should not have user_id filter
      expect(mockQuery.where).not.toHaveBeenCalledWith(
        "user_id",
        "==",
        expect.any(String),
      );
    });

    it("filters payments by status", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPayments[0]],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/payments?status=completed",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "completed");
    });

    it("filters payments by gateway", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPayments[0]],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/payments?gateway=razorpay",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("gateway", "==", "razorpay");
    });

    it("filters payments by orderId", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPayments[0]],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/payments?orderId=order123",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith(
        "order_id",
        "==",
        "order123",
      );
    });

    it("filters payments by shopId for admin", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "admin",
      });

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPayments,
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/payments?shopId=shop123",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop123");
    });

    it("filters payments by date range", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPayments[0]],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/payments?startDate=2025-01-01&endDate=2025-01-01",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith(
        "created_at",
        ">=",
        expect.any(String),
      );
      expect(mockQuery.where).toHaveBeenCalledWith(
        "created_at",
        "<=",
        expect.any(String),
      );
    });

    it("applies multiple filters together", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockPayments[0]],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/payments?status=completed&gateway=razorpay&orderId=order123",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "completed");
      expect(mockQuery.where).toHaveBeenCalledWith("gateway", "==", "razorpay");
      expect(mockQuery.where).toHaveBeenCalledWith(
        "order_id",
        "==",
        "order123",
      );
    });

    it("handles pagination parameters", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue(mockQuery);

      (executeOffsetPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockPayments,
        count: 2,
        pagination: {
          page: 2,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: true,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/payments?page=2&limit=10",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.pagination.page).toBe(2);
      expect(json.pagination.limit).toBe(10);
    });

    it("returns 500 on database error", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
      (Collections.payments as jest.Mock).mockReturnValue({
        orderBy: mockQuery.orderBy,
      });

      (executeOffsetPaginatedQuery as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const request = new NextRequest("http://localhost/api/payments");
      const response = await GET(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to fetch payments",
      });
    });
  });

  describe("POST /api/payments", () => {
    const validPayment = {
      order_id: "order123",
      user_id: "user123",
      shop_id: "shop123",
      amount: 5000,
      gateway: "razorpay",
      gateway_payment_id: "pay_xyz123",
    };

    it("returns 403 when user is not admin", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        error: NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        ),
      });

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(validPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it("creates payment with valid data", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "payment123",
      });
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...validPayment,
          currency: "INR",
          status: "pending",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        add: mockAdd,
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(validPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("payment123");
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: "order123",
          user_id: "user123",
          amount: 5000,
          gateway: "razorpay",
          status: "pending",
          currency: "INR",
        }),
      );
    });

    it("returns 400 when order_id is missing", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const invalidPayment = { ...validPayment, order_id: undefined };
      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(invalidPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain("Missing required fields");
    });

    it("returns 400 when user_id is missing", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const invalidPayment = { ...validPayment, user_id: undefined };
      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(invalidPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain("Missing required fields");
    });

    it("returns 400 when amount is missing", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const invalidPayment = { ...validPayment, amount: undefined };
      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(invalidPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain("Missing required fields");
    });

    it("returns 400 when gateway is missing", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const invalidPayment = { ...validPayment, gateway: undefined };
      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(invalidPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain("Missing required fields");
    });

    it("defaults currency to INR when not provided", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "payment123",
      });
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...validPayment,
          currency: "INR",
          status: "pending",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        add: mockAdd,
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const paymentWithoutCurrency = { ...validPayment };
      delete (paymentWithoutCurrency as any).currency;

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(paymentWithoutCurrency),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: "INR",
        }),
      );
    });

    it("defaults status to pending when not provided", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "payment123",
      });
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...validPayment,
          currency: "INR",
          status: "pending",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        add: mockAdd,
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(validPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending",
        }),
      );
    });

    it("sets shop_id to null when not provided", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "payment123",
      });
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...validPayment,
          shop_id: null,
          currency: "INR",
          status: "pending",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        add: mockAdd,
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const paymentWithoutShop = { ...validPayment };
      delete (paymentWithoutShop as any).shop_id;

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(paymentWithoutShop),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          shop_id: null,
        }),
      );
    });

    it("includes gateway_payment_id when provided", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "payment123",
      });
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...validPayment,
          currency: "INR",
          status: "pending",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        add: mockAdd,
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(validPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway_payment_id: "pay_xyz123",
        }),
      );
    });

    it("returns 500 on database error", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      (Collections.payments as jest.Mock).mockReturnValue({
        add: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(validPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to create payment",
      });
    });

    it("sets created_at and updated_at timestamps", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "payment123",
      });
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...validPayment,
          currency: "INR",
          status: "pending",
          created_at: "2025-01-01T10:00:00Z",
          updated_at: "2025-01-01T10:00:00Z",
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        add: mockAdd,
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/payments", {
        method: "POST",
        body: JSON.stringify(validPayment),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      );
    });
  });
});
