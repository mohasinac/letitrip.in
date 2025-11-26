/**
 * @jest-environment node
 */

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/queries");

import { NextRequest } from "next/server";
import { POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCollections = Collections as jest.MockedObject<typeof Collections>;
const mockUserOwnsShop = userOwnsShop as jest.MockedFunction<typeof userOwnsShop>;

describe("/api/orders/bulk", () => {
  let mockDoc: any;
  let mockRef: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDoc = {
      id: "order1",
      exists: true,
      data: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockRef = {
      doc: jest.fn(() => mockDoc),
      get: jest.fn(() => Promise.resolve(mockDoc)),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockDoc.get.mockResolvedValue(mockDoc);

    mockCollections.orders = jest.fn(() => mockRef);
  });

  describe("POST /api/orders/bulk", () => {
    it("should return error if user is not authenticated", async () => {
      mockRequireAuth.mockResolvedValue({
        user: null,
        error: { json: async () => ({ error: "Unauthorized" }), status: 401 } as any,
      });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not seller or admin", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "user1", role: "user" },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Only sellers and admins can perform bulk operations");
    });

    it("should return 400 if action is missing", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Action and orderIds array are required");
    });

    it("should return 400 if orderIds is not an array", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: "order1" }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Action and orderIds array are required");
    });

    it("should return 400 if orderIds array is empty", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: [] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Action and orderIds array are required");
    });

    it("should return 400 if action is invalid", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "invalid_action", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid action");
    });

    it("should confirm pending orders (admin)", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "pending" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results[0].success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "confirmed",
          confirmed_at: expect.any(String),
        })
      );
    });

    it("should not confirm non-pending orders", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "confirmed" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(false);
      expect(data.results[0].error).toContain("pending orders can be confirmed");
    });

    it("should process confirmed orders", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "seller1", role: "seller" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "confirmed", shop_id: "shop1" });
      mockUserOwnsShop.mockResolvedValue(true);

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "process", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "processing",
          processing_at: expect.any(String),
        })
      );
    });

    it("should ship processing orders with tracking number", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "processing" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({
          action: "ship",
          orderIds: ["order1"],
          data: { trackingNumber: "TRACK123" },
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "shipped",
          tracking_number: "TRACK123",
        })
      );
    });

    it("should deliver shipped orders", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "shipped" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "deliver", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "delivered",
          delivered_at: expect.any(String),
        })
      );
    });

    it("should cancel orders with reason", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "pending" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({
          action: "cancel",
          orderIds: ["order1"],
          data: { reason: "Out of stock" },
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "cancelled",
          cancellation_reason: "Out of stock",
        })
      );
    });

    it("should refund delivered orders", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "delivered", amount: 1000 });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({
          action: "refund",
          orderIds: ["order1"],
          data: { refundAmount: 1000, reason: "Customer request" },
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "refunded",
          refund_amount: 1000,
          refund_reason: "Customer request",
        })
      );
    });

    it("should delete cancelled orders", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "cancelled" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "delete", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it("should update order fields", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "pending" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({
          action: "update",
          orderIds: ["order1"],
          data: { notes: "Updated notes", priority: "high" },
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: "Updated notes",
          priority: "high",
          updated_at: expect.any(String),
        })
      );
    });

    it("should prevent seller from editing orders from other shops", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "seller1", role: "seller" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "pending", shop_id: "shop2" });
      mockUserOwnsShop.mockResolvedValue(false);

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(false);
      expect(data.results[0].error).toContain("Not authorized");
    });

    it("should handle multiple orders with mixed results", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });

      const mockDoc1 = { ...mockDoc, id: "order1", exists: true };
      const mockDoc2 = { ...mockDoc, id: "order2", exists: false };
      const mockDoc3 = { ...mockDoc, id: "order3", exists: true };

      mockRef.doc.mockImplementation((id: string) => {
        if (id === "order1") {
          mockDoc1.data = jest.fn().mockReturnValue({ status: "pending" });
          mockDoc1.get = jest.fn().mockResolvedValue(mockDoc1);
          return mockDoc1;
        }
        if (id === "order2") {
          mockDoc2.get = jest.fn().mockResolvedValue(mockDoc2);
          return mockDoc2;
        }
        if (id === "order3") {
          mockDoc3.data = jest.fn().mockReturnValue({ status: "pending" });
          mockDoc3.get = jest.fn().mockResolvedValue(mockDoc3);
          return mockDoc3;
        }
      });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({
          action: "confirm",
          orderIds: ["order1", "order2", "order3"],
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.summary.total).toBe(3);
      expect(data.summary.succeeded).toBe(2);
      expect(data.summary.failed).toBe(1);
    });

    it("should return summary with success and failure counts", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "pending" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: ["order1", "order2"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.summary).toEqual({
        total: 2,
        succeeded: 2,
        failed: 0,
      });
    });

    it("should handle server errors", async () => {
      mockRequireAuth.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({ action: "confirm", orderIds: ["order1"] }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to perform bulk operation");
    });

    it("should prevent updating protected fields", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "admin1", role: "admin" },
        error: null,
      });
      mockDoc.data.mockReturnValue({ status: "pending", user_id: "user1" });

      const req = new NextRequest("http://localhost/api/orders/bulk", {
        method: "POST",
        body: JSON.stringify({
          action: "update",
          orderIds: ["order1"],
          data: { user_id: "hacker", created_at: "fake", notes: "OK" },
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.results[0].success).toBe(true);
      const updateCall = mockDoc.update.mock.calls[0][0];
      expect(updateCall.user_id).toBeUndefined();
      expect(updateCall.created_at).toBeUndefined();
      expect(updateCall.notes).toBe("OK");
    });
  });
});
