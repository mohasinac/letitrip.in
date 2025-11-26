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
import { PATCH, DELETE } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockCollections = Collections as jest.MockedObject<typeof Collections>;

describe("/api/cart/[itemId]", () => {
  const createContext = (itemId: string) => ({
    params: Promise.resolve({ itemId }),
  });

  let mockCartRef: any;
  let mockProductsRef: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCartRef = {
      doc: jest.fn(),
    };

    mockProductsRef = {
      doc: jest.fn(),
    };

    mockCollections.cart = jest.fn(() => mockCartRef);
    mockCollections.products = jest.fn(() => mockProductsRef);
  });

  describe("PATCH /api/cart/[itemId]", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 3 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 if quantity is invalid", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: -1 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid quantity");
    });

    it("should return 404 if cart item not found", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 3 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Cart item not found");
    });

    it("should return 403 if user does not own the cart item", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user2",
        email: "user2@test.com",
        name: "User 2",
        role: "user",
      });

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
          }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 3 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    it("should return 404 if product not found", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
          }),
        }),
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => null,
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 3 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Product not found");
    });

    it("should return 400 if quantity exceeds stock", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
          }),
        }),
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ stock_count: 5 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 10 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Only 5 items available");
    });

    it("should successfully update cart item quantity", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockItemRef = {
        update: jest.fn(),
      };

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
          }),
          ref: mockItemRef,
        }),
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ stock_count: 10 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 5 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.quantity).toBe(5);
      expect(data.message).toBe("Cart item updated");
      expect(mockItemRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 5,
          updated_at: expect.any(String),
        })
      );
    });

    it("should handle quantity set to 0", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockItemRef = {
        update: jest.fn(),
      };

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
          }),
          ref: mockItemRef,
        }),
      });

      mockProductsRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: () => ({ stock_count: 10 }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 0 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.quantity).toBe(0);
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "PATCH",
        body: JSON.stringify({ quantity: 3 }),
      });
      const context = createContext("item1");

      const response = await PATCH(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update cart item");
    });
  });

  describe("DELETE /api/cart/[itemId]", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "DELETE",
      });
      const context = createContext("item1");

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 if cart item not found", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "DELETE",
      });
      const context = createContext("item1");

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Cart item not found");
    });

    it("should return 403 if user does not own the cart item", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user2",
        email: "user2@test.com",
        name: "User 2",
        role: "user",
      });

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
          }),
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "DELETE",
      });
      const context = createContext("item1");

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    it("should successfully delete cart item", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "user1",
        email: "user1@test.com",
        name: "User 1",
        role: "user",
      });

      const mockItemRef = {
        delete: jest.fn(),
      };

      mockCartRef.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            user_id: "user1",
            product_id: "prod1",
          }),
          ref: mockItemRef,
        }),
      });

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "DELETE",
      });
      const context = createContext("item1");

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Item removed from cart");
      expect(mockItemRef.delete).toHaveBeenCalled();
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/cart/item1", {
        method: "DELETE",
      });
      const context = createContext("item1");

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to remove cart item");
    });
  });
});
