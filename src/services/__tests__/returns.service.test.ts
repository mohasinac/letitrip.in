import {
  returnBEtoFE,
  returnFormFEtoRequestBE,
} from "@/types/transforms/return.transforms";
import { apiService } from "../api.service";
import { returnsService } from "../returns.service";

jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock("@/types/transforms/return.transforms", () => ({
  returnBEtoFE: jest.fn(),
  returnFormFEtoRequestBE: jest.fn(),
}));

describe("ReturnsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list returns without filters", async () => {
      const mockBEData = [
        {
          id: "ret_1",
          orderId: "order_123",
          status: "pending",
          reason: "defective",
        },
      ];

      const mockFEData = [
        {
          id: "ret_1",
          orderId: "order_123",
          status: "pending",
          reason: "defective",
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockBEData,
        count: 1,
        pagination: {
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (returnBEtoFE as jest.Mock).mockImplementation((item) => mockFEData[0]);

      const result = await returnsService.list();

      expect(apiService.get).toHaveBeenCalledWith("/returns");
      expect(returnBEtoFE).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should list returns with filters", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await returnsService.list({
        status: "approved",
        shopId: "shop_123",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/returns?")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=approved")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shopId=shop_123")
      );
    });

    it("should handle pagination filters", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 2,
          pageSize: 10,
          totalPages: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await returnsService.list({
        page: 2,
        pageSize: 10,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("page=2")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("pageSize=10")
      );
    });

    it("should filter out undefined and null values", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await returnsService.list({
        status: "pending",
        shopId: undefined,
        userId: null as any,
      });

      const callUrl = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain("status=pending");
      expect(callUrl).not.toContain("shopId");
      expect(callUrl).not.toContain("userId");
    });
  });

  describe("getById", () => {
    it("should fetch return by ID", async () => {
      const mockBEReturn = {
        id: "ret_1",
        orderId: "order_123",
        status: "pending",
        reason: "defective",
      };

      const mockFEReturn = {
        id: "ret_1",
        orderId: "order_123",
        status: "pending",
        reason: "defective",
        createdAt: new Date(),
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockBEReturn,
      });
      (returnBEtoFE as jest.Mock).mockReturnValue(mockFEReturn);

      const result = await returnsService.getById("ret_1");

      expect(apiService.get).toHaveBeenCalledWith("/returns/ret_1");
      expect(returnBEtoFE).toHaveBeenCalledWith(mockBEReturn);
      expect(result).toEqual(mockFEReturn);
    });

    it("should handle errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Return not found")
      );

      await expect(returnsService.getById("invalid")).rejects.toThrow(
        "Return not found"
      );
    });
  });

  describe("initiate", () => {
    it("should initiate return request", async () => {
      const formData = {
        orderId: "order_123",
        items: [
          {
            orderItemId: "item_1",
            quantity: 1,
            reason: "defective",
          },
        ],
        reason: "defective",
        description: "Product is damaged",
        images: ["/image1.jpg"],
      };

      const mockRequestBE = {
        orderId: "order_123",
        items: [
          {
            orderItemId: "item_1",
            quantity: 1,
            reason: "defective",
          },
        ],
        reason: "defective",
        description: "Product is damaged",
        images: ["/image1.jpg"],
      };

      const mockResponseBE = {
        data: {
          id: "ret_new",
          orderId: "order_123",
          status: "pending",
        },
      };

      const mockReturnFE = {
        id: "ret_new",
        orderId: "order_123",
        status: "pending",
        createdAt: new Date(),
      };

      (returnFormFEtoRequestBE as jest.Mock).mockReturnValue(mockRequestBE);
      (apiService.post as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue(mockReturnFE);

      const result = await returnsService.initiate(formData as any);

      expect(returnFormFEtoRequestBE).toHaveBeenCalledWith(formData);
      expect(apiService.post).toHaveBeenCalledWith("/returns", mockRequestBE);
      expect(returnBEtoFE).toHaveBeenCalledWith(mockResponseBE.data);
      expect(result).toEqual(mockReturnFE);
    });

    it("should handle initiation errors", async () => {
      (returnFormFEtoRequestBE as jest.Mock).mockReturnValue({});
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Initiation failed")
      );

      await expect(returnsService.initiate({} as any)).rejects.toThrow(
        "Initiation failed"
      );
    });
  });

  describe("update", () => {
    it("should update return status", async () => {
      const updateData = {
        status: "approved" as const,
        adminNotes: "Approved by admin",
      };

      const mockResponseBE = {
        data: {
          id: "ret_1",
          status: "approved",
          adminNotes: "Approved by admin",
        },
      };

      const mockReturnFE = {
        id: "ret_1",
        status: "approved",
        adminNotes: "Approved by admin",
        createdAt: new Date(),
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue(mockReturnFE);

      const result = await returnsService.update("ret_1", updateData);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/returns/ret_1",
        updateData
      );
      expect(returnBEtoFE).toHaveBeenCalledWith(mockResponseBE.data);
      expect(result.status).toBe("approved");
    });

    it("should update with partial data", async () => {
      const updateData = {
        adminNotes: "Updated notes",
      };

      const mockResponseBE = {
        data: {
          id: "ret_1",
          adminNotes: "Updated notes",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue({} as any);

      await returnsService.update("ret_1", updateData);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/returns/ret_1",
        updateData
      );
    });
  });

  describe("approve", () => {
    it("should approve return", async () => {
      const approvalData = {
        approved: true,
        notes: "Approved for refund",
      };

      const mockResponseBE = {
        data: {
          id: "ret_1",
          status: "approved",
        },
      };

      const mockReturnFE = {
        id: "ret_1",
        status: "approved",
        createdAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue(mockReturnFE);

      const result = await returnsService.approve("ret_1", approvalData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/returns/ret_1/approve",
        approvalData
      );
      expect(result.status).toBe("approved");
    });

    it("should reject return", async () => {
      const rejectionData = {
        approved: false,
        notes: "Does not meet return policy",
      };

      const mockResponseBE = {
        data: {
          id: "ret_1",
          status: "rejected",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue({
        id: "ret_1",
        status: "rejected",
      } as any);

      const result = await returnsService.approve("ret_1", rejectionData);

      expect(result.status).toBe("rejected");
    });
  });

  describe("processRefund", () => {
    it("should process refund", async () => {
      const refundData = {
        refundAmount: 9999,
        refundMethod: "original_payment",
        refundTransactionId: "txn_123",
      };

      const mockResponseBE = {
        data: {
          id: "ret_1",
          status: "refunded",
          refundAmount: 9999,
        },
      };

      const mockReturnFE = {
        id: "ret_1",
        status: "refunded",
        refundAmount: 9999,
        createdAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue(mockReturnFE);

      const result = await returnsService.processRefund("ret_1", refundData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/returns/ret_1/refund",
        refundData
      );
      expect(result.status).toBe("refunded");
      expect(result.refundAmount).toBe(9999);
    });

    it("should handle refund errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Refund failed")
      );

      await expect(
        returnsService.processRefund("ret_1", {
          refundAmount: 9999,
          refundMethod: "original_payment",
        })
      ).rejects.toThrow("Refund failed");
    });
  });

  describe("resolveDispute", () => {
    it("should resolve dispute", async () => {
      const resolutionData = {
        resolution: "Partial refund issued",
        refundAmount: 5000,
        notes: "Customer agreed to partial refund",
      };

      const mockResponseBE = {
        data: {
          id: "ret_1",
          status: "resolved",
        },
      };

      const mockReturnFE = {
        id: "ret_1",
        status: "resolved",
        createdAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue(mockReturnFE);

      const result = await returnsService.resolveDispute(
        "ret_1",
        resolutionData
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/returns/ret_1/resolve",
        resolutionData
      );
      expect(result.status).toBe("resolved");
    });

    it("should resolve without refund", async () => {
      const resolutionData = {
        resolution: "No refund warranted",
        notes: "Product working as expected",
      };

      const mockResponseBE = {
        data: {
          id: "ret_1",
          status: "resolved",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponseBE);
      (returnBEtoFE as jest.Mock).mockReturnValue({
        id: "ret_1",
        status: "resolved",
      } as any);

      await returnsService.resolveDispute("ret_1", resolutionData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/returns/ret_1/resolve",
        resolutionData
      );
    });
  });

  describe("uploadMedia", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it("should upload media files", async () => {
      const mockFiles = [
        new File(["content1"], "image1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "image2.jpg", { type: "image/jpeg" }),
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          urls: ["/uploads/image1.jpg", "/uploads/image2.jpg"],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await returnsService.uploadMedia("ret_1", mockFiles);

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/returns/ret_1/media",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
      expect(result.urls).toHaveLength(2);
    });

    it("should handle upload errors", async () => {
      const mockFiles = [
        new File(["content"], "image.jpg", { type: "image/jpeg" }),
      ];

      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          message: "Upload failed",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        returnsService.uploadMedia("ret_1", mockFiles)
      ).rejects.toThrow("Upload failed");
    });

    it("should handle upload errors without message", async () => {
      const mockFiles = [
        new File(["content"], "image.jpg", { type: "image/jpeg" }),
      ];

      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        returnsService.uploadMedia("ret_1", mockFiles)
      ).rejects.toThrow("Failed to upload media");
    });
  });

  describe("getStats", () => {
    it("should fetch return statistics without filters", async () => {
      const mockStats = {
        total: 100,
        pending: 20,
        approved: 50,
        rejected: 10,
        refunded: 20,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await returnsService.getStats();

      expect(apiService.get).toHaveBeenCalledWith("/returns/stats");
      expect(result).toEqual(mockStats);
    });

    it("should fetch return statistics with filters", async () => {
      const mockStats = {
        total: 25,
        pending: 5,
        approved: 15,
        rejected: 2,
        refunded: 3,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      await returnsService.getStats({
        shopId: "shop_123",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/returns/stats?")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shopId=shop_123")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-01-01")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("endDate=2024-12-31")
      );
    });

    it("should handle stats errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Stats unavailable")
      );

      await expect(returnsService.getStats()).rejects.toThrow(
        "Stats unavailable"
      );
    });
  });
});
