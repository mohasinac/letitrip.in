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
import { POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockCollections = Collections as jest.MockedObject<typeof Collections>;

describe("/api/orders/[id]/cancel", () => {
  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  let mockDoc: any;
  let mockRef: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDoc = {
      id: "order123",
      exists: true,
      data: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
    };

    mockRef = {
      doc: jest.fn(() => mockDoc),
      get: jest.fn(() => Promise.resolve(mockDoc)),
      update: jest.fn(),
    };

    mockDoc.get.mockResolvedValue(mockDoc);

    mockCollections.orders = jest.fn(() => mockRef);
  });

  describe("POST /api/orders/[id]/cancel", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 if order does not exist", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "user1@test.com", name: "User 1", role: "user" });
      mockDoc.exists = false;

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Changed my mind" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Not found");
    });

    it("should return 403 if user does not own the order", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user2", email: "user2@test.com", name: "User 2", role: "user" });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        status: "pending",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Changed my mind" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Forbidden");
    });

    it("should allow admin to cancel any order", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "admin1", email: "admin@test.com", name: "Admin", role: "admin" });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        status: "pending",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Admin cancellation" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRef.doc).toHaveBeenCalledWith("order123");
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "canceled",
          cancel_reason: "Admin cancellation",
        })
      );
    });

    it("should return 400 if order is already shipped", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "user1@test.com", name: "User 1", role: "user" });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        status: "shipped",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Changed my mind" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Order cannot be canceled");
    });

    it("should return 400 if order is already delivered", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "user1@test.com", name: "User 1", role: "user" });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        status: "delivered",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Changed my mind" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Order cannot be canceled");
    });

    it("should successfully cancel order with reason", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "user1@test.com", name: "User 1", role: "user" });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        status: "pending",
        amount: 1000,
      });

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Found better price elsewhere" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "canceled",
          cancel_reason: "Found better price elsewhere",
          canceled_at: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it("should successfully cancel order without reason", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "user1@test.com", name: "User 1", role: "user" });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        status: "pending",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "canceled",
          cancel_reason: "",
        })
      );
    });

    it("should allow canceling order in processing status", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "user1@test.com", name: "User 1", role: "user" });
      mockDoc.data.mockReturnValue({
        user_id: "user1",
        status: "processing",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Cancel processing order" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/orders/order123/cancel", {
        method: "POST",
        body: JSON.stringify({ reason: "Test" }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to cancel order");
    });
  });
});
