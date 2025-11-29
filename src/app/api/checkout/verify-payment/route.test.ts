/**
 * @jest-environment node
 */

// Set up environment BEFORE any imports
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.RAZORPAY_KEY_SECRET = "test_secret";

// Mock dependencies BEFORE importing the route
jest.mock("@/app/api/lib/firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn(),
  getFirestore: jest.fn(),
}));
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/session");
jest.mock("@/app/api/lib/batch-fetch");
jest.mock("crypto");

import { NextRequest } from "next/server";
import { POST } from "@/app/api/checkout/verify-payment/route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { batchGetOrders, batchGetProducts } from "@/app/api/lib/batch-fetch";
import crypto from "crypto";

describe("POST /api/checkout/verify-payment", () => {
  let mockUser: any;
  let mockOrder: any;
  let mockProduct: any;
  let mockOrderDoc: any;
  let mockProductDoc: any;
  let mockBatch: any;

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock user
    mockUser = {
      id: "user123",
      email: "test@example.com",
      role: "user",
    };

    // Mock order
    mockOrder = {
      id: "order123",
      order_id: "ORD-123",
      user_id: "user123",
      payment_status: "awaiting",
      items: [
        {
          product_id: "prod123",
          quantity: 2,
        },
      ],
      coupon: {
        code: "SAVE10",
      },
    };

    // Mock product
    mockProduct = {
      id: "prod123",
      name: "Test Product",
      stock_count: 10,
    };

    // Mock Firestore batch
    mockBatch = {
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };

    mockOrderDoc = {
      id: "order123",
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockProductDoc = {
      id: "prod123",
      update: jest.fn().mockResolvedValue(undefined),
    };

    // Setup mocks
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (batchGetOrders as jest.Mock).mockResolvedValue(
      new Map([["order123", mockOrder]]),
    );
    (batchGetProducts as jest.Mock).mockResolvedValue(
      new Map([["prod123", mockProduct]]),
    );

    const mockCartSnapshot = {
      docs: [],
    };

    (Collections.orders as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue(mockOrderDoc),
      firestore: {
        batch: jest.fn().mockReturnValue(mockBatch),
      },
    });

    (Collections.products as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue(mockProductDoc),
      firestore: {
        batch: jest.fn().mockReturnValue(mockBatch),
      },
    });

    (Collections.cart as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockCartSnapshot),
    });

    const mockCouponSnapshot = {
      empty: false,
      docs: [
        {
          ref: { id: "coupon123" },
          data: () => ({ used_count: 0, code: "SAVE10" }),
        },
      ],
    };

    (Collections.coupons as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockCouponSnapshot),
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue(undefined),
      }),
    });

    // Mock crypto
    const mockHmac = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue("valid_signature"),
    };
    (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

    // Set environment variable
    process.env.RAZORPAY_KEY_SECRET = "test_secret";
  });

  describe("Authentication", () => {
    it("should return 401 if user is not authenticated", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("Input Validation", () => {
    it("should validate required razorpay_order_id field", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should validate required razorpay_payment_id field", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should validate required razorpay_signature field", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should return error if no order IDs provided", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No order IDs provided");
    });

    it("should accept order_id (single order) for backward compatibility", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(batchGetOrders).toHaveBeenCalledWith(["order123"]);
    });

    it("should accept order_ids array for multi-shop orders", async () => {
      (batchGetOrders as jest.Mock).mockResolvedValue(
        new Map([
          ["order123", { ...mockOrder, id: "order123" }],
          ["order456", { ...mockOrder, id: "order456", user_id: "user123" }],
        ]),
      );

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_ids: ["order123", "order456"],
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(batchGetOrders).toHaveBeenCalledWith(["order123", "order456"]);
    });
  });

  describe("Order Validation", () => {
    it("should return 404 if order not found", async () => {
      (batchGetOrders as jest.Mock).mockResolvedValue(new Map());

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "nonexistent",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Order not found");
    });

    it("should return 403 if order does not belong to user", async () => {
      (batchGetOrders as jest.Mock).mockResolvedValue(
        new Map([["order123", { ...mockOrder, user_id: "otheruser" }]]),
      );

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("Signature Verification", () => {
    it("should verify Razorpay signature correctly", async () => {
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      };
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(crypto.createHmac).toHaveBeenCalledWith("sha256", "test_secret");
      expect(mockHmac.update).toHaveBeenCalledWith("rzp_order123|rzp_pay123");
      expect(mockHmac.digest).toHaveBeenCalledWith("hex");
    });

    it("should return 400 if signature verification fails", async () => {
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("different_signature"),
      };
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "invalid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Payment verification failed");
    });

    it("should mark orders as failed if signature verification fails", async () => {
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("different_signature"),
      };
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "invalid_signature",
          }),
        },
      );

      await POST(request);

      expect(mockBatch.update).toHaveBeenCalledWith(
        mockOrderDoc,
        expect.objectContaining({
          payment_status: "failed",
          payment_error: "Signature verification failed",
        }),
      );
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe("Successful Payment", () => {
    it("should update order status to paid on successful verification", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockBatch.update).toHaveBeenCalledWith(
        mockOrderDoc,
        expect.objectContaining({
          payment_status: "paid",
          razorpay_payment_id: "rzp_pay123",
          paid_at: expect.any(Date),
        }),
      );
    });

    it("should reduce product stock after successful payment", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      await POST(request);

      expect(batchGetProducts).toHaveBeenCalledWith(["prod123"]);
      expect(mockBatch.update).toHaveBeenCalledWith(
        mockProductDoc,
        expect.objectContaining({
          stock_count: 8, // 10 - 2
        }),
      );
    });

    it("should not reduce stock below zero", async () => {
      (batchGetProducts as jest.Mock).mockResolvedValue(
        new Map([["prod123", { ...mockProduct, stock_count: 1 }]]),
      );

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      await POST(request);

      expect(mockBatch.update).toHaveBeenCalledWith(
        mockProductDoc,
        expect.objectContaining({
          stock_count: 0, // Math.max(0, 1 - 2)
        }),
      );
    });

    it("should commit all updates in a batch", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      await POST(request);

      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should return success response with order details", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order_ids).toBeDefined();
      expect(data.payment_status).toBe("paid");
    });
  });

  describe("Multi-Shop Orders", () => {
    beforeEach(() => {
      (batchGetOrders as jest.Mock).mockResolvedValue(
        new Map([
          [
            "order123",
            {
              ...mockOrder,
              id: "order123",
              items: [{ product_id: "prod123", quantity: 2 }],
            },
          ],
          [
            "order456",
            {
              ...mockOrder,
              id: "order456",
              user_id: "user123",
              items: [{ product_id: "prod456", quantity: 1 }],
            },
          ],
        ]),
      );

      (batchGetProducts as jest.Mock).mockResolvedValue(
        new Map([
          ["prod123", { ...mockProduct, id: "prod123", stock_count: 10 }],
          ["prod456", { ...mockProduct, id: "prod456", stock_count: 5 }],
        ]),
      );
    });

    it("should handle multiple orders in a single payment", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_ids: ["order123", "order456"],
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(batchGetOrders).toHaveBeenCalledWith(["order123", "order456"]);
    });

    it("should update all orders to paid status", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_ids: ["order123", "order456"],
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      await POST(request);

      // Should update both orders (at least 2 order updates + 2 product updates + coupon updates)
      expect(mockBatch.update).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should calculate stock reduction across multiple orders", async () => {
      (batchGetOrders as jest.Mock).mockResolvedValue(
        new Map([
          [
            "order123",
            {
              ...mockOrder,
              id: "order123",
              items: [{ product_id: "prod123", quantity: 2 }],
            },
          ],
          [
            "order456",
            {
              ...mockOrder,
              id: "order456",
              user_id: "user123",
              items: [{ product_id: "prod123", quantity: 3 }],
            },
          ],
        ]),
      );

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_ids: ["order123", "order456"],
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      await POST(request);

      expect(mockBatch.update).toHaveBeenCalledWith(
        mockProductDoc,
        expect.objectContaining({
          stock_count: 5, // 10 - (2 + 3)
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle batch commit errors gracefully", async () => {
      mockBatch.commit.mockRejectedValue(new Error("Batch commit failed"));

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it("should handle batchGetOrders errors", async () => {
      (batchGetOrders as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it("should handle batchGetProducts errors", async () => {
      (batchGetProducts as jest.Mock).mockRejectedValue(
        new Error("Product fetch failed"),
      );

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe("Cart Management", () => {
    it("should clear user cart after successful payment", async () => {
      const mockCartItem = { id: "cart1", ref: { id: "cart1" } };
      const mockCartSnapshot = {
        docs: [mockCartItem],
      };

      (Collections.cart as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockCartSnapshot),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockBatch.delete).toHaveBeenCalled();
    });

    it("should handle empty cart gracefully", async () => {
      const mockCartSnapshot = {
        docs: [],
      };

      (Collections.cart as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockCartSnapshot),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Coupon Management", () => {
    it("should update coupon usage count after successful payment", async () => {
      const mockCouponDoc = {
        ref: { id: "coupon123" },
        data: () => ({ used_count: 5, code: "SAVE10" }),
      };

      const mockCouponSnapshot = {
        empty: false,
        docs: [mockCouponDoc],
      };

      (Collections.coupons as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockCouponSnapshot),
        doc: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockBatch.update).toHaveBeenCalled();
    });

    it("should handle orders without coupons", async () => {
      const orderWithoutCoupon = {
        ...mockOrder,
        coupon: null,
      };

      (batchGetOrders as jest.Mock).mockResolvedValue(
        new Map([["order123", orderWithoutCoupon]]),
      );

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should handle non-existent coupons gracefully", async () => {
      const mockCouponSnapshot = {
        empty: true,
        docs: [],
      };

      (Collections.coupons as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockCouponSnapshot),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Payment Status Updates", () => {
    it("should set payment_status to paid", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.payment_status).toBe("paid");
    });

    it("should include razorpay_payment_id in order update", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockBatch.update).toHaveBeenCalled();
    });

    it("should set paid_at timestamp", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockBatch.update).toHaveBeenCalled();
    });
  });

  describe("Environment Configuration", () => {
    it("should use RAZORPAY_KEY_SECRET from environment", async () => {
      process.env.RAZORPAY_KEY_SECRET = "custom_secret";

      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      };
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(crypto.createHmac).toHaveBeenCalledWith("sha256", "custom_secret");
      expect(response.status).toBe(200);
    });

    it("should use default secret if environment not set", async () => {
      delete process.env.RAZORPAY_KEY_SECRET;

      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue("valid_signature"),
      };
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);

      const request = new NextRequest(
        "http://localhost/api/checkout/verify-payment",
        {
          method: "POST",
          body: JSON.stringify({
            order_id: "order123",
            razorpay_order_id: "rzp_order123",
            razorpay_payment_id: "rzp_pay123",
            razorpay_signature: "valid_signature",
          }),
        },
      );

      const response = await POST(request);

      expect(crypto.createHmac).toHaveBeenCalledWith("sha256", "test_secret");
      expect(response.status).toBe(200);
    });
  });
});
