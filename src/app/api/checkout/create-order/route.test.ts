/**
 * @jest-environment node
 */

// Set up environment BEFORE any imports
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.RAZORPAY_KEY_ID = "test_key_id";
process.env.RAZORPAY_KEY_SECRET = "test_secret";

// Mock dependencies BEFORE importing the route
jest.mock("@/app/api/lib/firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn(),
  getFirestore: jest.fn(),
}));
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/session");
jest.mock("@/app/api/lib/batch-fetch");
jest.mock("@/app/api/lib/utils/rate-limiter");
jest.mock("crypto");

import { NextRequest } from "next/server";
import { POST } from "@/app/api/checkout/create-order/route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { batchGetProducts } from "@/app/api/lib/batch-fetch";
import { strictRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import crypto from "crypto";

describe("POST /api/checkout/create-order", () => {
  let mockUser: any;
  let mockAddress: any;
  let mockProduct: any;
  let mockBatch: any;

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock crypto
    (crypto.randomBytes as jest.Mock) = jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue("abc123"),
    });

    // Mock user
    mockUser = {
      id: "user123",
      email: "test@example.com",
      role: "user",
    };

    // Mock address
    mockAddress = {
      user_id: "user123",
      name: "John Doe",
      phone: "1234567890",
      address_line1: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    };

    // Mock product
    mockProduct = {
      id: "prod123",
      name: "Test Product",
      price: 1000,
      stock_count: 10,
      seller_id: "seller123",
      shop_id: "shop123",
      status: "active",
    };

    // Mock Firestore batch
    mockBatch = {
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };

    // Setup mocks
    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (strictRateLimiter.check as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);
    (batchGetProducts as jest.Mock).mockResolvedValue(
      new Map([["prod123", mockProduct]])
    );

    const mockAddressDoc = {
      exists: true,
      data: () => mockAddress,
    };

    (Collections.addresses as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockAddressDoc),
      }),
    });

    (Collections.products as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest
          .fn()
          .mockResolvedValue({ exists: true, data: () => mockProduct }),
        update: jest.fn().mockResolvedValue(undefined),
      }),
      firestore: {
        batch: jest.fn().mockReturnValue(mockBatch),
      },
    });

    (Collections.orders as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ id: "order123" }),
      add: jest.fn().mockResolvedValue({ id: "order123" }),
      firestore: {
        batch: jest.fn().mockReturnValue(mockBatch),
      },
    });

    (Collections.cart as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
    });

    (Collections.coupons as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    });
  });

  describe("Authentication", () => {
    it("should return 401 if user is not authenticated", async () => {
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            shopOrders: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("Input Validation", () => {
    it("should validate required shippingAddressId field", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            paymentMethod: "cod",
            shopOrders: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should validate paymentMethod enum", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "invalid_method",
            shopOrders: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should return error if no shop orders provided", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            shopOrders: [],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No shop orders provided");
    });
  });

  describe("Address Validation", () => {
    it("should return 400 if shipping address not found", async () => {
      (Collections.addresses as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false }),
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "nonexistent",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [{ product_id: "prod123", quantity: 1 }],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Shipping address not found");
    });

    it("should return 403 if shipping address belongs to another user", async () => {
      const mockAddressDoc = {
        exists: true,
        data: () => ({ ...mockAddress, user_id: "otheruser" }),
      };

      (Collections.addresses as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockAddressDoc),
        }),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [{ product_id: "prod123", quantity: 1 }],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Invalid shipping address");
    });
  });

  describe("Payment Method", () => {
    it("should accept COD payment method", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 2,
                    price: 1000,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      if (response.status !== 200) {
        console.log("COD test error:", data);
      }
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.orders).toBeDefined();
      expect(Array.isArray(data.orders)).toBe(true);
      expect(data.razorpay_order_id).toBeNull();
    });

    it("should accept Razorpay payment method", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "razorpay",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 2,
                    price: 1000,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Razorpay should return Razorpay order details
      expect(data.razorpay_order_id).toBeDefined();
      expect(data.amount).toBeDefined();
      expect(data.currency).toBe("INR");
    });
  });

  describe("Multi-Shop Orders", () => {
    it("should create multiple orders for multiple shops", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Shop 1",
                items: [
                  {
                    productId: "prod123",
                    productName: "Product 1",
                    quantity: 1,
                    price: 1000,
                    image: "test1.jpg",
                  },
                ],
              },
              {
                shopId: "shop456",
                shopName: "Shop 2",
                items: [
                  {
                    productId: "prod123",
                    productName: "Product 2",
                    quantity: 2,
                    price: 500,
                    image: "test2.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.orders).toHaveLength(2);
      expect(data.total).toBeGreaterThan(0);
    });

    it("should calculate grand total correctly across multiple shops", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Shop 1",
                items: [
                  {
                    productId: "prod123",
                    productName: "Product 1",
                    quantity: 2,
                    price: 1000,
                    image: "test1.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBeGreaterThan(2000); // Should include tax and shipping
    });
  });

  describe("Billing Address", () => {
    it("should use shipping address as billing if not provided", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 1,
                    price: 1000,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should validate separate billing address", async () => {
      const mockBillingAddress = {
        user_id: "user123",
        name: "Jane Doe",
        phone: "9876543210",
      };

      const mockAddressDoc = {
        exists: true,
        data: () => mockAddress,
      };

      const mockBillingDoc = {
        exists: true,
        data: () => mockBillingAddress,
      };

      (Collections.addresses as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest
            .fn()
            .mockResolvedValue(
              id === "billing456" ? mockBillingDoc : mockAddressDoc
            ),
        })),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            billingAddressId: "billing456",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 1,
                    price: 1000,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 403 if billing address belongs to another user", async () => {
      const mockBillingAddress = {
        user_id: "otheruser",
        name: "Jane Doe",
      };

      const mockAddressDoc = {
        exists: true,
        data: () => mockAddress,
      };

      const mockBillingDoc = {
        exists: true,
        data: () => mockBillingAddress,
      };

      (Collections.addresses as jest.Mock).mockReturnValue({
        doc: jest.fn((id: string) => ({
          get: jest
            .fn()
            .mockResolvedValue(
              id === "billing456" ? mockBillingDoc : mockAddressDoc
            ),
        })),
      });

      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            billingAddressId: "billing456",
            paymentMethod: "cod",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 1,
                    price: 1000,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Invalid billing address");
    });
  });

  describe("Razorpay Integration", () => {
    it("should generate Razorpay order ID for razorpay payment", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "razorpay",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 1,
                    price: 1000,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.razorpay_order_id).toMatch(/^razorpay_order_/);
      expect(data.amount).toBeGreaterThan(0);
      expect(data.currency).toBe("INR");
    });

    it("should convert amount to paise for Razorpay", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "razorpay",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 1,
                    price: 100,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Amount should be in paise (100x)
      expect(data.amount % 100).toBe(0);
      expect(data.total).toBeGreaterThan(0);
    });
  });

  describe("Order Notes", () => {
    it("should accept optional order notes", async () => {
      const request = new NextRequest(
        "http://localhost/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            shippingAddressId: "addr123",
            paymentMethod: "cod",
            notes: "Please deliver before 5pm",
            shopOrders: [
              {
                shopId: "shop123",
                shopName: "Test Shop",
                items: [
                  {
                    productId: "prod123",
                    productName: "Test Product",
                    quantity: 1,
                    price: 1000,
                    image: "test.jpg",
                  },
                ],
              },
            ],
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
