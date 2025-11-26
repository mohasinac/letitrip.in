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
jest.mock("@/app/api/lib/firebase/queries");

import { NextRequest } from "next/server";
import { POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockCollections = Collections as jest.MockedObject<typeof Collections>;
const mockUserOwnsShop = userOwnsShop as jest.MockedFunction<typeof userOwnsShop>;

describe("/api/orders/[id]/shipment", () => {
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

  describe("POST /api/orders/[id]/shipment", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "FedEx",
          tracking_number: "TRACK123",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not seller or admin", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "user1", email: "user1@test.com", name: "User 1", role: "user" });

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "FedEx",
          tracking_number: "TRACK123",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Forbidden");
    });

    it("should return 404 if order does not exist", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "seller1", email: "seller1@test.com", name: "Seller 1", role: "seller" });
      mockDoc.exists = false;

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "FedEx",
          tracking_number: "TRACK123",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Not found");
    });

    it("should return 403 if seller does not own the shop", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "seller1", email: "seller1@test.com", name: "Seller 1", role: "seller" });
      mockDoc.data.mockReturnValue({
        shop_id: "shop1",
        status: "processing",
      });
      mockUserOwnsShop.mockResolvedValue(false);

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "FedEx",
          tracking_number: "TRACK123",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Forbidden");
      expect(mockUserOwnsShop).toHaveBeenCalledWith("shop1", "seller1");
    });

    it("should allow seller to create shipment if they own the shop", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "seller1", email: "seller1@test.com", name: "Seller 1", role: "seller" });
      mockDoc.data.mockReturnValue({
        shop_id: "shop1",
        status: "processing",
      });
      mockUserOwnsShop.mockResolvedValue(true);

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "FedEx",
          tracking_number: "TRACK123",
          eta: "2024-01-15",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "shipped",
          shipment: expect.objectContaining({
            carrier: "FedEx",
            tracking_number: "TRACK123",
            eta: "2024-01-15",
            created_by: "seller1",
          }),
        })
      );
    });

    it("should allow admin to create shipment without shop ownership check", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "admin1", email: "admin@test.com", name: "Admin", role: "admin" });
      mockDoc.data.mockReturnValue({
        shop_id: "shop1",
        status: "processing",
      });

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "DHL",
          tracking_number: "DHL999",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUserOwnsShop).not.toHaveBeenCalled();
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "shipped",
          shipment: expect.objectContaining({
            carrier: "DHL",
            tracking_number: "DHL999",
          }),
        })
      );
    });

    it("should handle shipment with null values", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "seller1", email: "seller1@test.com", name: "Seller 1", role: "seller" });
      mockDoc.data.mockReturnValue({
        shop_id: "shop1",
        status: "processing",
      });
      mockUserOwnsShop.mockResolvedValue(true);

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
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
          shipment: expect.objectContaining({
            carrier: null,
            tracking_number: null,
            eta: null,
          }),
        })
      );
    });

    it("should set order status to shipped", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "seller1", email: "seller1@test.com", name: "Seller 1", role: "seller" });
      mockDoc.data.mockReturnValue({
        shop_id: "shop1",
        status: "pending",
      });
      mockUserOwnsShop.mockResolvedValue(true);

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "UPS",
          tracking_number: "UPS456",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "shipped",
        })
      );
    });

    it("should include created_at timestamp in shipment", async () => {
      mockGetCurrentUser.mockResolvedValue({ id: "seller1", email: "seller1@test.com", name: "Seller 1", role: "seller" });
      mockDoc.data.mockReturnValue({
        shop_id: "shop1",
        status: "processing",
      });
      mockUserOwnsShop.mockResolvedValue(true);

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "USPS",
          tracking_number: "USPS789",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          shipment: expect.objectContaining({
            created_at: expect.any(String),
            created_by: "seller1",
          }),
        })
      );
    });

    it("should return 500 on server error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/orders/order123/shipment", {
        method: "POST",
        body: JSON.stringify({
          carrier: "FedEx",
          tracking_number: "TRACK123",
        }),
      });
      const context = createContext("order123");

      const response = await POST(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to create shipment");
    });
  });
});
