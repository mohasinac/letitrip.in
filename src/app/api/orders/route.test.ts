/**
 * @jest-environment node
 */

// Mock dependencies BEFORE importing the route
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("@/app/api/lib/utils/pagination");

import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

describe("/api/orders", () => {
  const mockUser = {
    uid: "user123",
    email: "user@test.com",
    role: "user",
  };

  const mockOrders = [
    {
      id: "order1",
      user_id: "user123",
      shop_id: "shop123",
      items: [{ product_id: "prod1", quantity: 2, price: 1000 }],
      amount: 2000,
      status: "pending",
      payment_status: "pending",
      created_at: "2025-01-01T10:00:00Z",
      updated_at: "2025-01-01T10:00:00Z",
    },
    {
      id: "order2",
      user_id: "user123",
      shop_id: "shop123",
      items: [{ product_id: "prod2", quantity: 1, price: 3000 }],
      amount: 3000,
      status: "completed",
      payment_status: "paid",
      created_at: "2025-01-02T10:00:00Z",
      updated_at: "2025-01-02T10:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/orders", () => {
    it("returns empty array for guest users", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
      expect(json.count).toBe(0);
    });

    it("returns user's own orders", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest("http://localhost/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockOrders);
      expect(mockQuery.where).toHaveBeenCalledWith("user_id", "==", "user123");
    });

    it("returns 403 when seller does not own the shop", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest(
        "http://localhost/api/orders?shop_id=shop123"
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Forbidden",
      });
    });

    it("returns shop orders for seller who owns the shop", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(true);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?shop_id=shop123"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop123");
    });

    it("returns empty array for seller without shop_id parameter", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
      });

      const request = new NextRequest("http://localhost/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toEqual([]);
    });

    it("returns shop orders for admin with shop_id filter", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "admin",
      });

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?shop_id=shop123"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop123");
    });

    it("returns all orders for admin without shop_id filter", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "admin",
      });

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest("http://localhost/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Admin should not have user_id filter
      expect(mockQuery.where).not.toHaveBeenCalledWith(
        "user_id",
        "==",
        expect.any(String)
      );
    });

    it("filters orders by status", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrders[1]],
        count: 1,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?status=completed"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "completed");
    });

    it("filters orders by paymentStatus", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrders[1]],
        count: 1,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?paymentStatus=paid"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith(
        "payment_status",
        "==",
        "paid"
      );
    });

    it("applies custom sort order", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?sortBy=total_amount&sortOrder=asc"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.orderBy).toHaveBeenCalledWith("total_amount", "asc");
    });

    it("defaults to created_at desc when no sort specified", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest("http://localhost/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.orderBy).toHaveBeenCalledWith("created_at", "desc");
    });

    it("validates sortBy against allowed fields", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?sortBy=invalid_field"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should fall back to created_at
      expect(mockQuery.orderBy).toHaveBeenCalledWith("created_at", "desc");
    });

    it("applies multiple filters together", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrders[1]],
        count: 1,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?status=completed&paymentStatus=paid"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "completed");
      expect(mockQuery.where).toHaveBeenCalledWith(
        "payment_status",
        "==",
        "paid"
      );
    });

    it("returns 500 on database error", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const request = new NextRequest("http://localhost/api/orders");
      const response = await GET(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to list orders",
      });
    });

    it("handles pagination with hasNextPage true", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: true,
          nextCursor: "cursor123",
          count: 2,
        },
      });

      const request = new NextRequest("http://localhost/api/orders?limit=2");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.pagination.hasNextPage).toBe(true);
      expect(json.pagination.nextCursor).toBe("cursor123");
    });

    it("applies cursor pagination correctly", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      const mockDocGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockOrders[0],
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        ...mockQuery,
        doc: jest.fn().mockReturnValue({
          get: mockDocGet,
        }),
      });

      (executeCursorPaginatedQuery as jest.Mock).mockImplementation(
        async (query, searchParams, docFetcher) => {
          await docFetcher("order1");
          return {
            success: true,
            data: [mockOrders[1]],
            count: 1,
            pagination: {
              limit: 50,
              hasNextPage: false,
              nextCursor: null,
              count: 1,
            },
          };
        }
      );

      const request = new NextRequest(
        "http://localhost/api/orders?cursor=order1"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(executeCursorPaginatedQuery).toHaveBeenCalled();
    });

    it("respects limit parameter", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrders[0]],
        count: 1,
        pagination: {
          limit: 10,
          hasNextPage: true,
          nextCursor: "cursor123",
          count: 1,
        },
      });

      const request = new NextRequest("http://localhost/api/orders?limit=10");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.pagination.limit).toBe(10);
    });

    it("handles empty result set", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
        count: 0,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 0,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?status=nonexistent"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toEqual([]);
      expect(json.count).toBe(0);
    });

    it("filters by status with case sensitivity", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrders[0]],
        count: 1,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?status=pending"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "pending");
    });

    it("combines shop_id filter with status filter for admin", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "admin",
      });

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrders[0]],
        count: 1,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?shop_id=shop123&status=pending"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop123");
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "pending");
    });

    it("sorts by total_amount when specified", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?sortBy=total_amount&sortOrder=asc"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.orderBy).toHaveBeenCalledWith("total_amount", "asc");
    });

    it("rejects invalid sortBy field", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockOrders,
        count: 2,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 2,
        },
      });

      const request = new NextRequest(
        "http://localhost/api/orders?sortBy=invalid_field"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery.orderBy).toHaveBeenCalledWith("created_at", "desc");
    });
  });

  describe("POST /api/orders", () => {
    const validOrder = {
      shop_id: "shop123",
      items: [
        { product_id: "prod1", quantity: 2, price: 1000 },
        { product_id: "prod2", quantity: 1, price: 3000 },
      ],
      amount: 5000,
    };

    it("returns 401 when user is not authenticated", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        error: NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ),
      });

      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(validOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("creates order with valid data", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "order123",
        get: jest.fn().mockResolvedValue({
          id: "order123",
          data: () => ({
            user_id: "user123",
            shop_id: "shop123",
            items: validOrder.items,
            amount: 5000,
            status: "pending",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        add: mockAdd,
      });

      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(validOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("order123");
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user123",
          shop_id: "shop123",
          items: validOrder.items,
          amount: 5000,
          status: "pending",
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it("returns 500 when shop_id is missing", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const invalidOrder = { ...validOrder, shop_id: undefined };
      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(invalidOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to create order");
    });

    it("returns 500 when items is not an array", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const invalidOrder = { ...validOrder, items: "not-an-array" };
      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(invalidOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to create order");
    });

    it("creates order even with empty items array", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "order123",
        get: jest.fn().mockResolvedValue({
          id: "order123",
          data: () => ({
            user_id: "user123",
            shop_id: "shop123",
            items: [],
            amount: 5000,
            status: "pending",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        add: mockAdd,
      });

      const orderWithEmptyItems = { ...validOrder, items: [] };
      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(orderWithEmptyItems),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [],
        })
      );
    });

    it("returns 500 when amount is not a number", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const invalidOrder = { ...validOrder, amount: "not-a-number" };
      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(invalidOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to create order");
    });

    it("returns 500 when amount is missing", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const invalidOrder = { ...validOrder, amount: undefined };
      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(invalidOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to create order");
    });

    it("sets status to pending by default", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "order123",
        get: jest.fn().mockResolvedValue({
          id: "order123",
          data: () => ({
            user_id: "user123",
            shop_id: "shop123",
            items: validOrder.items,
            amount: 5000,
            status: "pending",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        add: mockAdd,
      });

      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(validOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending",
        })
      );
    });

    it("sets created_at and updated_at timestamps", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "order123",
        get: jest.fn().mockResolvedValue({
          id: "order123",
          data: () => ({
            user_id: "user123",
            shop_id: "shop123",
            items: validOrder.items,
            amount: 5000,
            status: "pending",
            created_at: "2025-01-01T10:00:00Z",
            updated_at: "2025-01-01T10:00:00Z",
          }),
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        add: mockAdd,
      });

      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(validOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it("converts amount to number", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "order123",
        get: jest.fn().mockResolvedValue({
          id: "order123",
          data: () => ({
            user_id: "user123",
            shop_id: "shop123",
            items: validOrder.items,
            amount: 5000,
            status: "pending",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        add: mockAdd,
      });

      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(validOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 5000,
        })
      );
      expect(typeof mockAdd.mock.calls[0][0].amount).toBe("number");
    });

    it("returns 500 on database error", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      (Collections.orders as jest.Mock).mockReturnValue({
        add: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(validOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to create order",
      });
    });

    it("includes user_id from authenticated user", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const mockAdd = jest.fn().mockResolvedValue({
        id: "order123",
        get: jest.fn().mockResolvedValue({
          id: "order123",
          data: () => ({
            user_id: "user123",
            shop_id: "shop123",
            items: validOrder.items,
            amount: 5000,
            status: "pending",
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        add: mockAdd,
      });

      const request = new NextRequest("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(validOrder),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user123",
        })
      );
    });
  });
});
