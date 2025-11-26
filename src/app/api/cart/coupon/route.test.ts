/**
 * @jest-environment node
 */

process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
process.env.FIREBASE_PRIVATE_KEY = "test-key";

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => [{ name: "test" }]),
  getApp: jest.fn(() => ({ name: "test" })),
  cert: jest.fn(),
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
}));

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/session");

import { NextRequest } from "next/server";
import { POST, DELETE } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockCollections = Collections as jest.MockedObject<typeof Collections>;

describe("/api/cart/coupon", () => {
  let mockCartRef: any;
  let mockProductsRef: any;
  let mockCouponsRef: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCartRef = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockProductsRef = {
      doc: jest.fn(),
    };

    mockCouponsRef = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockCollections.cart = jest.fn(() => mockCartRef);
    mockCollections.products = jest.fn(() => mockProductsRef);
    mockCollections.coupons = jest.fn(() => mockCouponsRef);
  });

  describe("POST /api/cart/coupon", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if coupon code is missing", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Coupon code is required");
    });

    it("should return 400 if cart is empty", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({ empty: true });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Cart is empty");
    });

    it("should return 404 if coupon code is invalid", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ product_id: "prod1", quantity: 2 }) }],
      });

      mockCouponsRef.get.mockResolvedValue({ empty: true });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "INVALID" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Invalid coupon code");
    });

    it("should return 400 if coupon is not active", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ product_id: "prod1", quantity: 2 }) }],
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "SAVE10",
              status: "inactive",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2024-12-31").toISOString(),
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Coupon is not active");
    });

    it("should return 400 if coupon is not yet valid", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ product_id: "prod1", quantity: 2 }) }],
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "SAVE10",
              status: "active",
              start_date: futureDate.toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Coupon not yet valid");
    });

    it("should return 400 if coupon has expired", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ product_id: "prod1", quantity: 2 }) }],
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "SAVE10",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2024-01-02").toISOString(),
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Coupon has expired");
    });

    it("should return 400 if usage limit reached", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ product_id: "prod1", quantity: 2 }) }],
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "SAVE10",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
              usage_limit: 100,
              usage_count: 100,
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Coupon usage limit reached");
    });

    it("should return 400 if minimum purchase amount not met", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 1 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 500 }),
        }),
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "SAVE10",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
              min_purchase_amount: 1000,
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Minimum purchase amount is ₹1000");
    });

    it("should apply percentage discount correctly", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 2 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "SAVE10",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
              type: "percentage",
              discount_value: 10,
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.subtotal).toBe(2000);
      expect(data.data.discount).toBe(200); // 10% of 2000
      expect(data.data.tax).toBe(324); // 18% of (2000-200)
      expect(data.message).toBe("Coupon applied successfully");
    });

    it("should cap percentage discount at max_discount_amount", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 10 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "SAVE20",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
              type: "percentage",
              discount_value: 20,
              max_discount_amount: 500,
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE20" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.subtotal).toBe(10000);
      expect(data.data.discount).toBe(500); // capped at 500
    });

    it("should apply flat discount correctly", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 2 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "FLAT100",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
              type: "flat",
              discount_value: 100,
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "FLAT100" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.discount).toBe(100);
    });

    it("should not exceed subtotal with flat discount", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 1 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 50 }),
        }),
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "FLAT100",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
              type: "flat",
              discount_value: 100,
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "FLAT100" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.discount).toBe(50); // capped at subtotal
    });

    it("should handle free shipping coupon", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 1 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 500 }),
        }),
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "coupon1",
            data: () => ({
              code: "FREESHIP",
              status: "active",
              start_date: new Date("2024-01-01").toISOString(),
              end_date: new Date("2025-12-31").toISOString(),
              type: "free-shipping",
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "FREESHIP" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.shipping).toBe(0);
      expect(data.data.discount).toBe(0);
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "SAVE10" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to apply coupon");
    });
  });

  describe("DELETE /api/cart/coupon", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "DELETE",
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should remove coupon and recalculate totals", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.get.mockResolvedValue({
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 2 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "DELETE",
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.subtotal).toBe(2000);
      expect(data.data.discount).toBe(0);
      expect(data.data.tax).toBe(360); // 18% of 2000
      expect(data.message).toBe("Coupon removed");
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "DELETE",
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to remove coupon");
    });
  });

  describe("Edge Cases", () => {
    it("should handle coupon expiry at exact midnight boundary", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const now = new Date("2025-01-15T23:59:59.999Z");
      const expiryDate = new Date("2025-01-15T23:59:59.999Z");

      jest.spyOn(global, "Date").mockImplementation(() => now as any);

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: "EXPIRING",
              discount_type: "percentage",
              discount_value: 10,
              valid_until: expiryDate.toISOString(),
              min_order_value: 0,
              usage_limit: 100,
              times_used: 50,
              is_active: true,
            }),
          },
        ],
      });

      mockCartRef.get.mockResolvedValue({
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 2 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "EXPIRING" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      jest.restoreAllMocks();
    });

    it("should handle minimum order value edge case (exact match)", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: "MIN5000",
              discount_type: "fixed",
              discount_value: 500,
              valid_until: new Date("2099-12-31").toISOString(),
              min_order_value: 5000,
              usage_limit: 100,
              times_used: 0,
              is_active: true,
            }),
          },
        ],
      });

      mockCartRef.get.mockResolvedValue({
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 5 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "MIN5000" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.subtotal).toBe(5000);
      expect(data.data.discount).toBe(500);
    });

    it("should handle coupon with usage limit reached", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: "LIMITED",
              discount_type: "percentage",
              discount_value: 20,
              valid_until: new Date("2099-12-31").toISOString(),
              min_order_value: 0,
              usage_limit: 100,
              times_used: 100,
              is_active: true,
            }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "LIMITED" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Coupon usage limit reached");
    });

    it("should handle percentage discount resulting in fractional amount", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: "FRACTION",
              discount_type: "percentage",
              discount_value: 15,
              valid_until: new Date("2099-12-31").toISOString(),
              min_order_value: 0,
              usage_limit: 100,
              times_used: 0,
              is_active: true,
            }),
          },
        ],
      });

      mockCartRef.get.mockResolvedValue({
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 3 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 999 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "FRACTION" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.subtotal).toBe(2997);
      // 15% of 2997 = 449.55
      expect(typeof data.data.discount).toBe("number");
    });

    it("should handle fixed discount greater than subtotal", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: "HUGE",
              discount_type: "fixed",
              discount_value: 10000,
              valid_until: new Date("2099-12-31").toISOString(),
              min_order_value: 0,
              usage_limit: 100,
              times_used: 0,
              is_active: true,
            }),
          },
        ],
      });

      mockCartRef.get.mockResolvedValue({
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 1 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 500 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "HUGE" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.discount).toBeLessThanOrEqual(data.data.subtotal);
    });

    it("should handle coupon code case insensitivity", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: "SAVE20",
              discount_type: "percentage",
              discount_value: 20,
              valid_until: new Date("2099-12-31").toISOString(),
              min_order_value: 0,
              usage_limit: 100,
              times_used: 0,
              is_active: true,
            }),
          },
        ],
      });

      mockCartRef.get.mockResolvedValue({
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 2 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "save20" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should handle empty cart when applying coupon", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCouponsRef.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({
              code: "EMPTYCART",
              discount_type: "percentage",
              discount_value: 10,
              valid_until: new Date("2099-12-31").toISOString(),
              min_order_value: 0,
              usage_limit: 100,
              times_used: 0,
              is_active: true,
            }),
          },
        ],
      });

      mockCartRef.get.mockResolvedValue({
        docs: [],
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "EMPTYCART" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("minimum");
    });

    it("should handle coupon application race condition (concurrent updates)", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      let callCount = 0;
      mockCouponsRef.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          empty: false,
          docs: [
            {
              data: () => ({
                code: "RACE",
                discount_type: "percentage",
                discount_value: 10,
                valid_until: new Date("2099-12-31").toISOString(),
                min_order_value: 0,
                usage_limit: 1,
                times_used: callCount > 1 ? 1 : 0,
                is_active: true,
              }),
            },
          ],
        });
      });

      mockCartRef.get.mockResolvedValue({
        docs: [
          {
            data: () => ({ product_id: "prod1", quantity: 2 }),
          },
        ],
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ price: 1000 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code: "RACE" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
