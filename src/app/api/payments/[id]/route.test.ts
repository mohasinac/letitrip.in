/**
 * @jest-environment node
 */

// Mock dependencies BEFORE importing the route
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");

import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";

describe("/api/payments/[id]", () => {
  const mockUser = {
    uid: "user123",
    email: "user@test.com",
    role: "user",
  };

  const mockPayment = {
    id: "payment123",
    order_id: "order123",
    user_id: "user123",
    shop_id: "shop123",
    amount: 5000,
    currency: "INR",
    gateway: "razorpay",
    status: "completed",
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/payments/[id]", () => {
    const createContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    it("returns 401 when user is not authenticated", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Authentication required",
      });
    });

    it("returns 404 when payment does not exist", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: false,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/nonexistent",
      );
      const response = await GET(request, createContext("nonexistent"));

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Payment not found",
      });
    });

    it("returns payment for the owning user", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "payment123",
        data: () => ({
          order_id: "order123",
          user_id: "user123",
          shop_id: "shop123",
          amount: 5000,
          currency: "INR",
          gateway: "razorpay",
          status: "completed",
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("payment123");
      expect(json.data.user_id).toBe("user123");
    });

    it("returns 403 when user tries to access another user's payment", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "payment123",
        data: () => ({
          order_id: "order123",
          user_id: "user456", // Different user
          shop_id: "shop123",
          amount: 5000,
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Unauthorized",
      });
    });

    it("returns payment for seller with matching shopId", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
        shopId: "shop123",
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "payment123",
        data: () => ({
          order_id: "order123",
          user_id: "user456",
          shop_id: "shop123",
          amount: 5000,
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.shop_id).toBe("shop123");
    });

    it("returns 403 when seller tries to access different shop's payment", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "seller",
        shopId: "shop123",
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "payment123",
        data: () => ({
          order_id: "order123",
          user_id: "user456",
          shop_id: "shop456", // Different shop
          amount: 5000,
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Unauthorized",
      });
    });

    it("returns any payment for admin", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: "admin",
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "payment123",
        data: () => ({
          order_id: "order123",
          user_id: "user456",
          shop_id: "shop456",
          amount: 5000,
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("returns 500 on database error", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to fetch payment",
      });
    });

    it("includes all payment fields in response", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        id: "payment123",
        data: () => mockPayment,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
      );
      const response = await GET(request, createContext("payment123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toMatchObject({
        id: "payment123",
        order_id: "order123",
        user_id: "user123",
        shop_id: "shop123",
        amount: 5000,
        currency: "INR",
        gateway: "razorpay",
        status: "completed",
      });
    });
  });

  describe("PATCH /api/payments/[id]", () => {
    const createContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    it("returns 403 when user is not admin", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        error: NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        ),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(403);
    });

    it("updates payment status", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...mockPayment,
          status: "completed",
          updated_at: "2025-01-02T10:00:00Z",
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.message).toBe("Payment updated successfully");
      expect(json.data.status).toBe("completed");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
          updated_at: expect.any(String),
        }),
      );
    });

    it("updates gateway_payment_id", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => ({
          ...mockPayment,
          gateway_payment_id: "pay_new123",
        }),
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ gateway_payment_id: "pay_new123" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway_payment_id: "pay_new123",
        }),
      );
    });

    it("updates gateway_response", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => mockPayment,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const gatewayResponse = { code: "success", message: "Payment captured" };
      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ gateway_response: gatewayResponse }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway_response: gatewayResponse,
        }),
      );
    });

    it("updates notes", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => mockPayment,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ notes: "Refund processed" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: "Refund processed",
        }),
      );
    });

    it("updates multiple fields together", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => mockPayment,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "refunded",
            notes: "Customer requested refund",
            gateway_payment_id: "pay_refund123",
          }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "refunded",
          notes: "Customer requested refund",
          gateway_payment_id: "pay_refund123",
          updated_at: expect.any(String),
        }),
      );
    });

    it("sets updated_at timestamp", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => mockPayment,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        }),
      );
    });

    it("returns updated payment data", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const updatedPayment = {
        ...mockPayment,
        status: "refunded",
        updated_at: "2025-01-02T10:00:00Z",
      };
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => updatedPayment,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "refunded" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toMatchObject({
        id: "payment123",
        status: "refunded",
      });
    });

    it("only updates provided fields", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        id: "payment123",
        exists: true,
        data: () => mockPayment,
      });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: mockUpdate,
          get: mockGet,
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(200);
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall).toHaveProperty("status");
      expect(updateCall).toHaveProperty("updated_at");
      expect(updateCall).not.toHaveProperty("gateway_payment_id");
      expect(updateCall).not.toHaveProperty("gateway_response");
      expect(updateCall).not.toHaveProperty("notes");
    });

    it("returns 500 on database error", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      (Collections.payments as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/payments/payment123",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );
      const response = await PATCH(request, createContext("payment123"));

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: "Failed to update payment",
      });
    });
  });
});
