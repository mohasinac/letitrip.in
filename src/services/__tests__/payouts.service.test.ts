import { apiService } from "../api.service";
import type {
  Payout,
  PayoutFilters,
  PayoutFormData,
  PayoutStats,
} from "../payouts.service";
import { payoutsService } from "../payouts.service";

jest.mock("../api.service");

describe("PayoutsService", () => {
  const mockPayout: Payout = {
    id: "payout1",
    sellerId: "seller1",
    sellerName: "John Seller",
    shopId: "shop1",
    shopName: "John's Shop",
    amount: 10000,
    currency: "INR",
    status: "pending",
    paymentMethod: "bank_transfer",
    transactionId: "TXN123456",
    bankDetails: {
      accountName: "John Doe",
      accountNumber: "1234567890",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India",
    },
    period: {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    },
    orderCount: 50,
    totalSales: 12000,
    platformFee: 2000,
    netAmount: 10000,
    notes: "January payout",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPayouts", () => {
    it("should fetch payouts without filters", async () => {
      const mockResponse = {
        payouts: [mockPayout],
        total: 1,
        page: 1,
        limit: 20,
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await payoutsService.getPayouts();

      expect(apiService.get).toHaveBeenCalledWith("/payouts");
      expect(result).toEqual(mockResponse);
      expect(result.payouts).toHaveLength(1);
    });

    it("should filter by sellerId", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        payouts: [mockPayout],
        total: 1,
        page: 1,
        limit: 20,
      });

      await payoutsService.getPayouts({ sellerId: "seller1" });

      expect(apiService.get).toHaveBeenCalledWith("/payouts?sellerId=seller1");
    });

    it("should filter by multiple criteria", async () => {
      const filters: PayoutFilters = {
        sellerId: "seller1",
        status: "completed",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        page: 2,
        limit: 50,
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        payouts: [],
        total: 0,
        page: 2,
        limit: 50,
      });

      await payoutsService.getPayouts(filters);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("sellerId=seller1")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=completed")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-01-01")
      );
    });

    it("should filter by shopId", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        payouts: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await payoutsService.getPayouts({ shopId: "shop1" });

      expect(apiService.get).toHaveBeenCalledWith("/payouts?shopId=shop1");
    });

    it("should filter by payment method", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        payouts: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await payoutsService.getPayouts({ paymentMethod: "upi" });

      expect(apiService.get).toHaveBeenCalledWith("/payouts?paymentMethod=upi");
    });

    it("should handle search query", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        payouts: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await payoutsService.getPayouts({ search: "John" });

      expect(apiService.get).toHaveBeenCalledWith("/payouts?search=John");
    });
  });

  describe("getPayoutStats", () => {
    it("should fetch payout statistics", async () => {
      const mockStats: PayoutStats = {
        totalPending: 5,
        totalProcessing: 2,
        totalCompleted: 100,
        totalFailed: 1,
        pendingAmount: 50000,
        completedAmount: 1000000,
        thisMonthAmount: 150000,
        lastMonthAmount: 120000,
      };

      (apiService.get as jest.Mock).mockResolvedValue({ stats: mockStats });

      const result = await payoutsService.getPayoutStats();

      expect(apiService.get).toHaveBeenCalledWith("/payouts/stats");
      expect(result).toEqual(mockStats);
    });
  });

  describe("getPayoutById", () => {
    it("should fetch single payout", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ payout: mockPayout });

      const result = await payoutsService.getPayoutById("payout1");

      expect(apiService.get).toHaveBeenCalledWith("/payouts/payout1");
      expect(result).toEqual(mockPayout);
    });
  });

  describe("createPayout", () => {
    it("should create new payout", async () => {
      const formData: PayoutFormData = {
        sellerId: "seller1",
        shopId: "shop1",
        amount: 10000,
        paymentMethod: "bank_transfer",
        bankDetails: {
          accountName: "John Doe",
          accountNumber: "1234567890",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
        },
        period: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
        notes: "January payout",
      };

      (apiService.post as jest.Mock).mockResolvedValue({ payout: mockPayout });

      const result = await payoutsService.createPayout(formData);

      expect(apiService.post).toHaveBeenCalledWith("/payouts", formData);
      expect(result).toEqual(mockPayout);
    });

    it("should create payout with UPI", async () => {
      const formData: PayoutFormData = {
        sellerId: "seller1",
        shopId: "shop1",
        amount: 5000,
        paymentMethod: "upi",
        upiId: "john@upi",
        period: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue({ payout: mockPayout });

      await payoutsService.createPayout(formData);

      expect(apiService.post).toHaveBeenCalledWith("/payouts", formData);
    });
  });

  describe("updatePayoutStatus", () => {
    it("should update payout status to completed", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({
        payout: { ...mockPayout, status: "completed" },
      });

      const result = await payoutsService.updatePayoutStatus(
        "payout1",
        "completed",
        "TXN789"
      );

      expect(apiService.patch).toHaveBeenCalledWith("/payouts/payout1/status", {
        status: "completed",
        transactionId: "TXN789",
        failureReason: undefined,
      });
      expect(result.status).toBe("completed");
    });

    it("should update payout status to failed with reason", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({
        payout: { ...mockPayout, status: "failed" },
      });

      await payoutsService.updatePayoutStatus(
        "payout1",
        "failed",
        undefined,
        "Insufficient funds"
      );

      expect(apiService.patch).toHaveBeenCalledWith("/payouts/payout1/status", {
        status: "failed",
        transactionId: undefined,
        failureReason: "Insufficient funds",
      });
    });
  });

  describe("processPayout", () => {
    it("should process pending payout", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        payout: { ...mockPayout, status: "processing" },
      });

      const result = await payoutsService.processPayout("payout1", "TXN456");

      expect(apiService.post).toHaveBeenCalledWith("/payouts/payout1/process", {
        transactionId: "TXN456",
      });
      expect(result.status).toBe("processing");
    });
  });

  describe("cancelPayout", () => {
    it("should cancel payout", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        payout: { ...mockPayout, status: "cancelled" },
      });

      const result = await payoutsService.cancelPayout(
        "payout1",
        "Requested by seller"
      );

      expect(apiService.post).toHaveBeenCalledWith("/payouts/payout1/cancel", {
        reason: "Requested by seller",
      });
      expect(result.status).toBe("cancelled");
    });
  });

  describe("bulkProcess", () => {
    it("should bulk process payouts", async () => {
      const mockResponse = {
        success: 8,
        failed: 2,
        errors: [
          { id: "payout3", error: "Insufficient balance" },
          { id: "payout7", error: "Invalid bank details" },
        ],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await payoutsService.bulkProcess([
        "payout1",
        "payout2",
        "payout3",
      ]);

      expect(apiService.post).toHaveBeenCalledWith("/payouts/bulk-process", {
        ids: ["payout1", "payout2", "payout3"],
      });
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(8);
      expect(result.failed).toBe(2);
    });

    it("should handle empty bulk process", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: 0,
        failed: 0,
        errors: [],
      });

      const result = await payoutsService.bulkProcess([]);

      expect(result.success).toBe(0);
    });
  });

  describe("calculatePayout", () => {
    it("should calculate payout for seller", async () => {
      const mockCalculation = {
        totalSales: 120000,
        orderCount: 60,
        platformFee: 20000,
        netAmount: 100000,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockCalculation);

      const result = await payoutsService.calculatePayout(
        "seller1",
        "shop1",
        "2024-02-01",
        "2024-02-28"
      );

      expect(apiService.post).toHaveBeenCalledWith("/payouts/calculate", {
        sellerId: "seller1",
        shopId: "shop1",
        startDate: "2024-02-01",
        endDate: "2024-02-28",
      });
      expect(result).toEqual(mockCalculation);
    });
  });

  describe("exportPayouts", () => {
    it("should export payouts to CSV", async () => {
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      (apiService.get as jest.Mock).mockResolvedValue(mockBlob);

      const result = await payoutsService.exportPayouts();

      expect(apiService.get).toHaveBeenCalledWith(
        "/payouts/export",
        expect.objectContaining({ responseType: "blob" })
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it("should export with filters", async () => {
      const mockBlob = new Blob(["csv,data"], { type: "text/csv" });
      (apiService.get as jest.Mock).mockResolvedValue(mockBlob);

      await payoutsService.exportPayouts({
        sellerId: "seller1",
        status: "completed",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/payouts/export?"),
        expect.any(Object)
      );
    });
  });

  describe("Bulk operations", () => {
    const mockBulkResponse = {
      success: true,
      results: {
        success: ["payout1", "payout2"],
        failed: [],
      },
      summary: {
        total: 2,
        succeeded: 2,
        failed: 0,
      },
    };

    it("should bulk approve payouts", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      const result = await payoutsService.bulkApprove(["payout1", "payout2"]);

      expect(apiService.post).toHaveBeenCalledWith("/payouts/bulk", {
        action: "approve",
        ids: ["payout1", "payout2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should bulk process payouts", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await payoutsService.bulkProcessPayouts(["payout1"]);

      expect(apiService.post).toHaveBeenCalledWith("/payouts/bulk", {
        action: "process",
        ids: ["payout1"],
        data: undefined,
      });
    });

    it("should bulk complete payouts", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await payoutsService.bulkComplete(["payout1", "payout2"]);

      expect(apiService.post).toHaveBeenCalledWith("/payouts/bulk", {
        action: "complete",
        ids: ["payout1", "payout2"],
        data: undefined,
      });
    });

    it("should bulk reject with reason", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await payoutsService.bulkReject(["payout1"], "Invalid documentation");

      expect(apiService.post).toHaveBeenCalledWith("/payouts/bulk", {
        action: "reject",
        ids: ["payout1"],
        data: { reason: "Invalid documentation" },
      });
    });

    it("should bulk delete payouts", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await payoutsService.bulkDelete(["payout1", "payout2"]);

      expect(apiService.post).toHaveBeenCalledWith("/payouts/bulk", {
        action: "delete",
        ids: ["payout1", "payout2"],
        data: undefined,
      });
    });

    it("should bulk update payouts", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      const updates = { notes: "Updated batch" };

      await payoutsService.bulkUpdate(["payout1"], updates);

      expect(apiService.post).toHaveBeenCalledWith("/payouts/bulk", {
        action: "update",
        ids: ["payout1"],
        data: updates,
      });
    });

    it("should handle bulk operation failures", async () => {
      const failureResponse = {
        success: false,
        results: {
          success: [],
          failed: [
            { id: "payout1", error: "Already processed" },
            { id: "payout2", error: "Not found" },
          ],
        },
        summary: {
          total: 2,
          succeeded: 0,
          failed: 2,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(failureResponse);

      const result = await payoutsService.bulkApprove(["payout1", "payout2"]);

      expect(result.summary.failed).toBe(2);
      expect(result.results.failed).toHaveLength(2);
    });
  });
});
