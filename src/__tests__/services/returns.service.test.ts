/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/services/api.service";
import { returnsService } from "@/services/returns.service";

// Mock dependencies
jest.mock("@/services/api.service");

// Mock fetch globally
global.fetch = jest.fn();

describe("ReturnsService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  const mockReturnBE = {
    id: "return123",
    orderId: "order123",
    orderItemId: "item123",
    userId: "user123",
    shopId: "shop123",
    productId: "product123",
    productName: "Test Product",
    reason: "defective",
    description: "Product not working",
    status: "pending",
    quantity: 1,
    refundAmount: 1000,
    media: ["https://example.com/photo1.jpg"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list returns with filters", async () => {
      const mockResponse = {
        data: [mockReturnBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await returnsService.list({
        status: "pending",
        page: 1,
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should list returns without filters", async () => {
      const mockResponse = {
        data: [mockReturnBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await returnsService.list();

      expect(result.data).toHaveLength(1);
    });

    it("should handle empty return list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await returnsService.list();

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("should get return by ID", async () => {
      mockApiService.get.mockResolvedValue({ data: mockReturnBE });

      const result = await returnsService.getById("return123");

      expect(mockApiService.get).toHaveBeenCalledWith("/returns/return123");
      expect(result.id).toBe("return123");
    });

    it("should throw error if return not found", async () => {
      const error = new Error("Return not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(returnsService.getById("invalid")).rejects.toThrow(
        "Return not found"
      );
    });
  });

  describe("initiate", () => {
    it("should initiate return successfully", async () => {
      const formData = {
        orderId: "order123",
        orderItemId: "item123",
        reason: "defective",
        description: "Product not working",
        quantity: 1,
      };

      mockApiService.post.mockResolvedValue({ data: mockReturnBE });

      const result = await returnsService.initiate(formData as any);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/returns",
        expect.any(Object)
      );
      expect(result.id).toBe("return123");
    });

    it("should throw error if return window expired", async () => {
      const error = new Error("Return window expired");
      mockApiService.post.mockRejectedValue(error);

      await expect(returnsService.initiate({} as any)).rejects.toThrow(
        "Return window expired"
      );
    });

    it("should throw error if already returned", async () => {
      const error = new Error("Item already returned");
      mockApiService.post.mockRejectedValue(error);

      await expect(returnsService.initiate({} as any)).rejects.toThrow(
        "Item already returned"
      );
    });
  });

  describe("update", () => {
    it("should update return successfully", async () => {
      const updates = {
        status: "approved",
        adminNotes: "Return approved",
      };

      mockApiService.patch.mockResolvedValue({
        data: { ...mockReturnBE, status: "approved" },
      });

      const result = await returnsService.update("return123", updates as any);

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/returns/return123",
        updates
      );
      expect(result.id).toBe("return123");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.patch.mockRejectedValue(error);

      await expect(
        returnsService.update("return123", {} as any)
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("approve", () => {
    it("should approve return", async () => {
      mockApiService.post.mockResolvedValue({
        data: { ...mockReturnBE, status: "approved" },
      });

      const result = await returnsService.approve("return123", {
        approved: true,
      });

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/returns/return123/approve",
        { approved: true }
      );
      expect(result.id).toBe("return123");
    });

    it("should reject return with notes", async () => {
      mockApiService.post.mockResolvedValue({
        data: { ...mockReturnBE, status: "rejected" },
      });

      const result = await returnsService.approve("return123", {
        approved: false,
        notes: "Does not meet return policy",
      });

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/returns/return123/approve",
        { approved: false, notes: "Does not meet return policy" }
      );
      expect(result.id).toBe("return123");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        returnsService.approve("return123", { approved: true })
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("processRefund", () => {
    it("should process refund successfully", async () => {
      const refundData = {
        refundAmount: 1000,
        refundMethod: "original",
        refundTransactionId: "txn123",
      };

      mockApiService.post.mockResolvedValue({
        data: { ...mockReturnBE, status: "refunded" },
      });

      const result = await returnsService.processRefund(
        "return123",
        refundData
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/returns/return123/refund",
        refundData
      );
      expect(result.id).toBe("return123");
    });

    it("should throw error if refund fails", async () => {
      const error = new Error("Refund processing failed");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        returnsService.processRefund("return123", {
          refundAmount: 1000,
          refundMethod: "original",
        })
      ).rejects.toThrow("Refund processing failed");
    });
  });

  describe("resolveDispute", () => {
    it("should resolve dispute successfully", async () => {
      const disputeData = {
        resolution: "partial_refund",
        refundAmount: 500,
        notes: "Settled dispute",
      };

      mockApiService.post.mockResolvedValue({
        data: { ...mockReturnBE, status: "resolved" },
      });

      const result = await returnsService.resolveDispute(
        "return123",
        disputeData
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/returns/return123/resolve",
        disputeData
      );
      expect(result.id).toBe("return123");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        returnsService.resolveDispute("return123", {
          resolution: "refund",
          notes: "Test",
        })
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("uploadMedia", () => {
    it("should upload media successfully", async () => {
      const mockFiles = [
        new File(["photo1"], "photo1.jpg", { type: "image/jpeg" }),
        new File(["photo2"], "photo2.jpg", { type: "image/jpeg" }),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          urls: [
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg",
          ],
        }),
      } as Response);

      const result = await returnsService.uploadMedia("return123", mockFiles);

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/returns/return123/media",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
      expect(result.urls).toHaveLength(2);
    });

    it("should throw error on upload failure", async () => {
      const mockFiles = [
        new File(["photo"], "photo.jpg", { type: "image/jpeg" }),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Upload failed" }),
      } as Response);

      await expect(
        returnsService.uploadMedia("return123", mockFiles)
      ).rejects.toThrow("Upload failed");
    });

    it("should throw error on invalid file type", async () => {
      const mockFiles = [new File(["doc"], "doc.txt", { type: "text/plain" })];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid file type" }),
      } as Response);

      await expect(
        returnsService.uploadMedia("return123", mockFiles)
      ).rejects.toThrow("Invalid file type");
    });
  });

  describe("getStats", () => {
    it("should get return statistics", async () => {
      const mockStats = {
        totalReturns: 100,
        pendingReturns: 20,
        approvedReturns: 60,
        rejectedReturns: 20,
        totalRefundAmount: 50000,
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await returnsService.getStats();

      expect(mockApiService.get).toHaveBeenCalledWith("/returns/stats");
      expect(result.totalReturns).toBe(100);
    });

    it("should get stats with filters", async () => {
      const mockStats = {
        totalReturns: 50,
        pendingReturns: 10,
        approvedReturns: 30,
        rejectedReturns: 10,
        totalRefundAmount: 25000,
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await returnsService.getStats({
        shopId: "shop123",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/returns/stats?shopId=shop123&startDate=2024-01-01&endDate=2024-12-31"
      );
      expect(result.totalReturns).toBe(50);
    });

    it("should handle empty stats", async () => {
      const mockStats = {
        totalReturns: 0,
        pendingReturns: 0,
        approvedReturns: 0,
        rejectedReturns: 0,
        totalRefundAmount: 0,
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await returnsService.getStats({ shopId: "shop123" });

      expect(result.totalReturns).toBe(0);
    });
  });
});
