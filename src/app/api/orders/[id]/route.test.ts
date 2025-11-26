/**
 * @jest-environment node
 */

// Mock dependencies BEFORE importing the route
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/queries");

import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

describe("/api/orders/[id]", () => {
  const mockUser = {
    uid: "user123",
    email: "user@test.com",
    role: "user",
  };

  const mockOrder = {
    id: "order123",
    user_id: "user123",
    shop_id: "shop123",
    items: [{ product_id: "prod1", quantity: 2, price: 1000 }],
    amount: 2000,
    status: "pending",
    payment_status: "pending",
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/orders/[id]", () => {
    const createContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    it("returns 404 when order does not exist", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: false,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Not found",
      });
    });

    it("returns order for the owning user", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => mockOrder,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("order123");
      expect(json.data.user_id).toBe("user123");
    });

    it("returns 404 when user tries to access another user's order", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => ({
          ...mockOrder,
          user_id: "user456", // Different user
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Not found",
      });
    });

    it("returns order for seller who owns the shop", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(true);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => mockOrder,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(userOwnsShop).toHaveBeenCalledWith("shop123", "user123");
    });

    it("returns 404 when seller does not own the shop", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(false);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => mockOrder,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Not found",
      });
    });

    it("returns any order for admin", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "admin",
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => ({
          ...mockOrder,
          user_id: "user456", // Different user
        }),
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("returns order for guest user if no authentication", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => mockOrder,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("includes all order fields in response", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => mockOrder,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toMatchObject({
        id: "order123",
        user_id: "user123",
        shop_id: "shop123",
        amount: 2000,
        status: "pending",
        payment_status: "pending",
      });
    });

    it("returns 500 on database error", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123");
      const response = await GET(request, createContext("order123"));

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to load order",
      });
    });
  });

  describe("PATCH /api/orders/[id]", () => {
    const createContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    it("returns 401 when user is not authenticated", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        error: NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        ),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(401);
    });

    it("returns 403 when user is neither seller nor admin", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({ user: mockUser });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toBe("Only sellers and admins can update orders");
    });

    it("returns 404 when order does not exist", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: false,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Not found",
      });
    });

    it("returns 403 when seller does not own the shop", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "seller" },
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(false);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "order123",
        data: () => mockOrder,
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Forbidden",
      });
    });

    it("updates order status for seller who owns the shop", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "seller" },
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(true);

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          id: "order123",
          data: () => mockOrder,
        })
        .mockResolvedValueOnce({
          id: "order123",
          data: () => ({
            ...mockOrder,
            status: "completed",
            updated_at: "2025-01-02T10:00:00Z",
          }),
        });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe("completed");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
          updated_at: expect.any(String),
        })
      );
    });

    it("updates order status for admin", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          id: "order123",
          data: () => mockOrder,
        })
        .mockResolvedValueOnce({
          id: "order123",
          data: () => ({
            ...mockOrder,
            status: "completed",
            updated_at: "2025-01-02T10:00:00Z",
          }),
        });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe("completed");
    });

    it("updates order notes", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          id: "order123",
          data: () => mockOrder,
        })
        .mockResolvedValueOnce({
          id: "order123",
          data: () => ({
            ...mockOrder,
            notes: "Customer requested express delivery",
            updated_at: "2025-01-02T10:00:00Z",
          }),
        });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ notes: "Customer requested express delivery" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: "Customer requested express delivery",
          updated_at: expect.any(String),
        })
      );
    });

    it("updates multiple fields together", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          id: "order123",
          data: () => mockOrder,
        })
        .mockResolvedValueOnce({
          id: "order123",
          data: () => ({
            ...mockOrder,
            status: "shipped",
            notes: "Package sent via FedEx",
            updated_at: "2025-01-02T10:00:00Z",
          }),
        });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({
          status: "shipped",
          notes: "Package sent via FedEx",
        }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "shipped",
          notes: "Package sent via FedEx",
          updated_at: expect.any(String),
        })
      );
    });

    it("sets updated_at timestamp", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          id: "order123",
          data: () => mockOrder,
        })
        .mockResolvedValueOnce({
          id: "order123",
          data: () => mockOrder,
        });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });

    it("only updates allowed fields", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          id: "order123",
          data: () => mockOrder,
        })
        .mockResolvedValueOnce({
          id: "order123",
          data: () => mockOrder,
        });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({
          status: "completed",
          amount: 9999, // Not allowed
          user_id: "hacker123", // Not allowed
        }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(200);
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall).toHaveProperty("status");
      expect(updateCall).toHaveProperty("updated_at");
      expect(updateCall).not.toHaveProperty("amount");
      expect(updateCall).not.toHaveProperty("user_id");
    });

    it("returns updated order data", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const updatedOrder = {
        ...mockOrder,
        status: "shipped",
        updated_at: "2025-01-02T10:00:00Z",
      };
      const mockGet = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          id: "order123",
          data: () => mockOrder,
        })
        .mockResolvedValueOnce({
          id: "order123",
          data: () => updatedOrder,
        });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          update: mockUpdate,
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "shipped" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toMatchObject({
        id: "order123",
        status: "shipped",
      });
    });

    it("returns 500 on database error", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
      });

      (Collections.orders as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      const request = new NextRequest("http://localhost/api/orders/order123", {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      const response = await PATCH(request, createContext("order123"));

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to update order",
      });
    });
  });
});
