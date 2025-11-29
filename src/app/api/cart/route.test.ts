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
import { GET, POST, DELETE } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockCollections = Collections as jest.MockedObject<typeof Collections>;

describe("/api/cart", () => {
  let mockCartRef: any;
  let mockProductsRef: any;
  let mockShopsRef: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockCartRef = {
      where: jest.fn(() => mockQuery),
      orderBy: jest.fn(() => mockQuery),
      doc: jest.fn(),
      add: jest.fn(),
      firestore: {
        batch: jest.fn(() => ({
          delete: jest.fn(),
          commit: jest.fn(),
        })),
      },
    };

    mockProductsRef = {
      doc: jest.fn(),
    };

    mockShopsRef = {
      doc: jest.fn(),
    };

    mockCollections.cart = jest.fn(() => mockCartRef);
    mockCollections.products = jest.fn(() => mockProductsRef);
    mockCollections.shops = jest.fn(() => mockShopsRef);
  });

  describe("GET /api/cart", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should fetch cart items with product and shop details", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 2,
            added_at: "2024-01-01",
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      const mockProductDoc = {
        data: () => ({
          name: "Product 1",
          price: 1000,
          original_price: 1500,
          images: ["image1.jpg"],
          shop_id: "shop1",
          stock_count: 10,
        }),
      };

      const mockShopDoc = {
        data: () => ({ name: "Shop 1" }),
      };

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockProductDoc),
      });

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockShopDoc),
      });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items).toHaveLength(1);
      expect(data.data.items[0].productName).toBe("Product 1");
      expect(data.data.items[0].shopName).toBe("Shop 1");
      expect(data.data.items[0].quantity).toBe(2);
    });

    it("should calculate cart summary correctly", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 2,
            added_at: "2024-01-01",
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      const mockProductDoc = {
        data: () => ({
          name: "Product 1",
          price: 1000,
          shop_id: "shop1",
          stock_count: 10,
        }),
      };

      const mockShopDoc = {
        data: () => ({ name: "Shop 1" }),
      };

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockProductDoc),
      });

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockShopDoc),
      });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(data.data.subtotal).toBe(2000); // 2 * 1000
      expect(data.data.shipping).toBe(100); // Less than 5000
      expect(data.data.tax).toBe(360); // 2000 * 0.18
      expect(data.data.total).toBe(2460); // 2000 + 100 + 360
      expect(data.data.itemCount).toBe(2);
    });

    it("should provide free shipping for orders above 5000", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 6,
            added_at: "2024-01-01",
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      const mockProductDoc = {
        data: () => ({
          name: "Product 1",
          price: 1000,
          shop_id: "shop1",
          stock_count: 10,
        }),
      };

      const mockShopDoc = {
        data: () => ({ name: "Shop 1" }),
      };

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockProductDoc),
      });

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockShopDoc),
      });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(data.data.subtotal).toBe(6000);
      expect(data.data.shipping).toBe(0); // Free shipping
    });

    it("should filter out items with deleted products", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 2,
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: () => null }),
      });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(data.data.items).toHaveLength(0);
    });

    it("should support cursor pagination", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 1,
          }),
        },
        {
          id: "cart2",
          data: () => ({
            user_id: "user1",
            product_id: "prod2",
            quantity: 1,
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      const mockProductDoc = {
        data: () => ({
          name: "Product",
          price: 1000,
          shop_id: "shop1",
          stock_count: 10,
        }),
      };

      const mockShopDoc = {
        data: () => ({ name: "Shop 1" }),
      };

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockProductDoc),
      });

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockShopDoc),
      });

      const req = new NextRequest("http://localhost/api/cart?limit=1");
      const response = await GET(req);
      const data = await response.json();

      expect(data.pagination.hasNextPage).toBe(true);
      expect(data.pagination.nextCursor).toBe("cart1");
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to fetch cart");
    });
  });

  describe("POST /api/cart", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: "prod1", quantity: 1 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if productId is missing", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ quantity: 1 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Product ID is required");
    });

    it("should return 404 if product does not exist", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: "prod1", quantity: 1 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Product not found");
    });

    it("should return 400 if insufficient stock", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ stock_count: 2 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: "prod1", quantity: 5 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Insufficient stock");
    });

    it("should add new item to cart", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ stock_count: 10 }),
        }),
      });

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ empty: true, docs: [] });

      mockCartRef.add.mockResolvedValue({ id: "cart1" });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: "prod1", quantity: 2 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.quantity).toBe(2);
      expect(data.message).toBe("Item added to cart");
      expect(mockCartRef.add).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user1",
          product_id: "prod1",
          quantity: 2,
        }),
      );
    });

    it("should update quantity if item already in cart", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ stock_count: 10 }),
        }),
      });

      const mockExistingDoc = {
        id: "cart1",
        data: () => ({ quantity: 3 }),
        ref: { update: jest.fn() },
      };

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [mockExistingDoc],
      });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: "prod1", quantity: 2 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.quantity).toBe(5);
      expect(data.message).toBe("Cart updated");
      expect(mockExistingDoc.ref.update).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 5 }),
      );
    });

    it("should return 400 if updated quantity exceeds stock", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ stock_count: 5 }),
        }),
      });

      const mockExistingDoc = {
        data: () => ({ quantity: 4 }),
      };

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [mockExistingDoc],
      });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: "prod1", quantity: 3 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Insufficient stock");
    });

    it("should handle variant when adding to cart", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ stock_count: 10 }),
        }),
      });

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ empty: true, docs: [] });

      mockCartRef.add.mockResolvedValue({ id: "cart1" });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: "prod1",
          quantity: 1,
          variant: "size:L,color:red",
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(mockCartRef.add).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "size:L,color:red",
        }),
      );
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: "prod1", quantity: 1 }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to add to cart");
    });
  });

  describe("DELETE /api/cart", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/cart", {
        method: "DELETE",
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should clear entire cart", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockDocs = [
        { ref: { delete: jest.fn() } },
        { ref: { delete: jest.fn() } },
      ];

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn(),
      };

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockDocs });

      mockCartRef.firestore.batch.mockReturnValue(mockBatch);

      const req = new NextRequest("http://localhost/api/cart", {
        method: "DELETE",
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Cart cleared");
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/cart", {
        method: "DELETE",
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to clear cart");
    });

    it("should handle clearing empty cart gracefully", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: [] });

      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn(),
      };
      mockCartRef.firestore.batch.mockReturnValue(mockBatch);

      const req = new NextRequest("http://localhost/api/cart", {
        method: "DELETE",
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large cart (100+ items) with pagination", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      // Create 101 mock items
      const mockCartDocs = Array.from({ length: 101 }, (_, i) => ({
        id: `cart${i}`,
        data: () => ({
          user_id: "user1",
          product_id: `prod${i}`,
          quantity: 1,
          added_at: new Date().toISOString(),
        }),
      }));

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      // Mock product and shop lookups
      mockProductsRef.doc.mockImplementation((id: string) => ({
        get: jest.fn().mockResolvedValue({
          data: () => ({
            name: `Product ${id}`,
            price: 1000,
            shop_id: "shop1",
            stock_count: 10,
            images: ["image.jpg"],
          }),
        }),
      }));

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ name: "Test Shop" }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart?limit=100");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items.length).toBe(100);
      expect(data.pagination.hasNextPage).toBe(true);
    });

    it("should handle products with zero stock correctly", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 2,
            added_at: new Date().toISOString(),
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({
            name: "Out of Stock Product",
            price: 1000,
            shop_id: "shop1",
            stock_count: 0,
            images: ["image.jpg"],
          }),
        }),
      });

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ name: "Test Shop" }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.items[0].stockCount).toBe(0);
    });

    it("should handle multiple products from different shops in cart summary", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 2,
            added_at: "2025-01-01T10:00:00Z",
          }),
        },
        {
          id: "cart2",
          data: () => ({
            user_id: "user1",
            product_id: "prod2",
            quantity: 1,
            added_at: "2025-01-01T11:00:00Z",
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      mockProductsRef.doc
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({
            data: () => ({
              name: "Product 1",
              price: 1000,
              shop_id: "shop1",
              stock_count: 10,
              images: ["image1.jpg"],
            }),
          }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({
            data: () => ({
              name: "Product 2",
              price: 3000,
              shop_id: "shop2",
              stock_count: 5,
              images: ["image2.jpg"],
            }),
          }),
        });

      mockShopsRef.doc
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({
            data: () => ({ name: "Shop 1" }),
          }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({
            data: () => ({ name: "Shop 2" }),
          }),
        });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.items.length).toBe(2);
      expect(data.data.subtotal).toBe(5000);
      expect(data.data.itemCount).toBe(3); // 2 + 1 quantity
    });

    it("should handle adding item with quantity exceeding available stock", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            name: "Limited Product",
            price: 1000,
            stock_count: 3,
            shop_id: "shop1",
          }),
        }),
      });

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ empty: true, docs: [] });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: "prod1",
          quantity: 10,
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Insufficient stock");
    });

    it("should prevent adding item with zero or negative quantity", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            name: "Test Product",
            price: 1000,
            stock_count: 10,
            shop_id: "shop1",
          }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: "prod1",
          quantity: 0,
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Insufficient stock");
    });

    it("should handle cart with items having variants", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 2,
            variant: { size: "L", color: "Red" },
            added_at: new Date().toISOString(),
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({
            name: "Variant Product",
            price: 1500,
            shop_id: "shop1",
            stock_count: 10,
            images: ["image.jpg"],
          }),
        }),
      });

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ name: "Test Shop" }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.items[0].variant).toEqual({ size: "L", color: "Red" });
    });

    it("should handle cart subtotal calculation with discounted prices", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockCartDocs = [
        {
          id: "cart1",
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
            quantity: 2,
            added_at: new Date().toISOString(),
          }),
        },
      ];

      const mockQuery = mockCartRef.where();
      mockQuery.get.mockResolvedValue({ docs: mockCartDocs });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({
            name: "Discounted Product",
            price: 800,
            original_price: 1000,
            shop_id: "shop1",
            stock_count: 10,
            images: ["image.jpg"],
          }),
        }),
      });

      mockShopsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ name: "Test Shop" }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.items[0].price).toBe(800);
      expect(data.data.items[0].originalPrice).toBe(1000);
      expect(data.data.subtotal).toBe(1600);
    });
  });
});
