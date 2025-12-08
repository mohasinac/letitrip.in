import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "../api.service";
import { ripLimitService } from "../riplimit.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("RipLimitService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getBalance", () => {
    it("should fetch RipLimit balance", async () => {
      const mockResponse = {
        success: true,
        data: {
          availableBalance: 5000,
          blockedBalance: 1000,
          totalBalance: 6000,
          availableBalanceINR: 5000,
          blockedBalanceINR: 1000,
          totalBalanceINR: 6000,
          hasUnpaidAuctions: false,
          unpaidAuctionIds: [],
          isBlocked: false,
          blockedBids: [],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.getBalance();

      expect(apiService.get).toHaveBeenCalledWith("/riplimit/balance");
      expect(result.availableBalance).toBe(5000);
      expect(result.blockedBalance).toBe(1000);
      expect(result.totalBalance).toBe(6000);
      expect(result.hasUnpaidAuctions).toBe(false);
      expect(result.isBlocked).toBe(false);
    });

    it("should handle blocked account", async () => {
      const mockResponse = {
        success: true,
        data: {
          availableBalance: 0,
          blockedBalance: 5000,
          totalBalance: 5000,
          availableBalanceINR: 0,
          blockedBalanceINR: 5000,
          totalBalanceINR: 5000,
          hasUnpaidAuctions: true,
          unpaidAuctionIds: ["auction1", "auction2"],
          isBlocked: true,
          blockedBids: [
            {
              auctionId: "auction1",
              bidId: "bid1",
              amount: 2500,
              bidAmountINR: 2500,
            },
          ],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.getBalance();

      expect(result.isBlocked).toBe(true);
      expect(result.hasUnpaidAuctions).toBe(true);
      expect(result.unpaidAuctionCount).toBe(2);
      expect(result.blockedBids).toHaveLength(1);
    });

    it("should handle API failure gracefully", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ success: false });

      const result = await ripLimitService.getBalance();

      expect(result.availableBalance).toBe(0);
      expect(result.totalBalance).toBe(0);
      expect(result.isBlocked).toBe(false);
    });

    it("should handle API errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await ripLimitService.getBalance();

      expect(logError).toHaveBeenCalled();
      expect(result.availableBalance).toBe(0);
    });
  });

  describe("getTransactions", () => {
    it("should fetch transaction history", async () => {
      const mockResponse = {
        success: true,
        data: {
          transactions: [
            {
              id: "txn1",
              userId: "user1",
              type: "purchase",
              amount: 1000,
              inrAmount: 10000,
              balanceAfter: 1000,
              status: "completed",
              description: "Purchased RipLimit",
              metadata: {},
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
            },
          ],
          total: 1,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.getTransactions();

      expect(apiService.get).toHaveBeenCalledWith("/riplimit/transactions");
      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should filter by transaction type", async () => {
      const mockResponse = {
        success: true,
        data: {
          transactions: [],
          total: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await ripLimitService.getTransactions({ type: "bid_block" });

      expect(apiService.get).toHaveBeenCalledWith(
        "/riplimit/transactions?type=bid_block"
      );
    });

    it("should handle pagination", async () => {
      const mockResponse = {
        success: true,
        data: {
          transactions: [],
          total: 100,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await ripLimitService.getTransactions({ limit: 50, offset: 50 });

      expect(apiService.get).toHaveBeenCalledWith(
        "/riplimit/transactions?limit=50&offset=50"
      );
    });

    it("should handle all filters combined", async () => {
      const mockResponse = {
        success: true,
        data: {
          transactions: [],
          total: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await ripLimitService.getTransactions({
        type: "refund",
        limit: 10,
        offset: 20,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/riplimit/transactions?type=refund&limit=10&offset=20"
      );
    });
  });

  describe("initiatePurchase", () => {
    it("should initiate RipLimit purchase", async () => {
      const mockResponse = {
        success: true,
        data: {
          orderId: "order123",
          razorpayOrderId: "rzp_order_123",
          amount: 10000,
          currency: "INR",
          ripLimitAmount: 1000,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.initiatePurchase(1000);

      expect(apiService.post).toHaveBeenCalledWith("/riplimit/purchase", {
        ripLimitAmount: 1000,
      });
      expect(result.orderId).toBe("order123");
      expect(result.razorpayOrderId).toBe("rzp_order_123");
      expect(result.amount).toBe(10000);
      expect(result.ripLimitAmount).toBe(1000);
      expect(result.formattedAmount).toBe("₹10,000");
    });

    it("should handle purchase initiation failure", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({ success: false });

      await expect(ripLimitService.initiatePurchase(500)).rejects.toThrow(
        "Failed to initiate purchase"
      );
    });
  });

  describe("verifyPurchase", () => {
    it("should verify successful purchase", async () => {
      const mockResponse = {
        success: true,
        data: {
          newBalance: 2000,
          purchasedAmount: 1000,
        },
        message: "Purchase verified successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const verifyData = {
        razorpay_order_id: "rzp_order_123",
        razorpay_payment_id: "rzp_pay_123",
        razorpay_signature: "signature123",
      };

      const result = await ripLimitService.verifyPurchase(verifyData);

      expect(apiService.post).toHaveBeenCalledWith(
        "/riplimit/purchase/verify",
        verifyData
      );
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(2000);
      expect(result.purchasedAmount).toBe(1000);
      expect(result.formattedNewBalance).toBe("2,000 RL");
      expect(result.formattedPurchasedAmount).toBe("1,000 RL");
    });

    it("should handle verification failure", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        message: "Invalid signature",
      });

      const verifyData = {
        razorpay_order_id: "rzp_order_123",
        razorpay_payment_id: "rzp_pay_123",
        razorpay_signature: "invalid",
      };

      await expect(ripLimitService.verifyPurchase(verifyData)).rejects.toThrow(
        "Invalid signature"
      );
    });
  });

  describe("requestRefund", () => {
    it("should request refund", async () => {
      const mockResponse = {
        success: true,
        data: {
          refundId: "refund123",
        },
        message: "Refund requested successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.requestRefund(500, "Test reason");

      expect(apiService.post).toHaveBeenCalledWith("/riplimit/refund", {
        amount: 500,
        reason: "Test reason",
      });
      expect(result.success).toBe(true);
      expect(result.refundId).toBe("refund123");
      expect(result.message).toBe("Refund requested successfully");
    });

    it("should request refund without reason", async () => {
      const mockResponse = {
        success: true,
        data: {
          refundId: "refund456",
        },
        message: "Refund request submitted!",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await ripLimitService.requestRefund(1000);

      expect(apiService.post).toHaveBeenCalledWith("/riplimit/refund", {
        amount: 1000,
        reason: undefined,
      });
    });

    it("should handle refund failure", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        message: "Insufficient balance",
      });

      await expect(ripLimitService.requestRefund(5000)).rejects.toThrow(
        "Insufficient balance"
      );
    });
  });

  describe("canBid", () => {
    it("should allow bidding with sufficient balance", async () => {
      const mockResponse = {
        success: true,
        data: {
          availableBalance: 5000,
          blockedBalance: 0,
          totalBalance: 5000,
          availableBalanceINR: 5000,
          blockedBalanceINR: 0,
          totalBalanceINR: 5000,
          hasUnpaidAuctions: false,
          unpaidAuctionIds: [],
          isBlocked: false,
          blockedBids: [],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.canBid(1000);

      expect(result.canBid).toBe(true);
      expect(result.availableBalance).toBe(5000);
      expect(result.requiredBalance).toBe(1000);
      expect(result.reason).toBeUndefined();
    });

    it("should prevent bidding with insufficient balance", async () => {
      const mockResponse = {
        success: true,
        data: {
          availableBalance: 500,
          blockedBalance: 0,
          totalBalance: 500,
          availableBalanceINR: 500,
          blockedBalanceINR: 0,
          totalBalanceINR: 500,
          hasUnpaidAuctions: false,
          unpaidAuctionIds: [],
          isBlocked: false,
          blockedBids: [],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.canBid(1000);

      expect(result.canBid).toBe(false);
      expect(result.reason).toContain("Insufficient RipLimit");
      expect(result.availableBalance).toBe(500);
      expect(result.requiredBalance).toBe(1000);
    });

    it("should prevent bidding when account is blocked", async () => {
      const mockResponse = {
        success: true,
        data: {
          availableBalance: 0,
          blockedBalance: 5000,
          totalBalance: 5000,
          availableBalanceINR: 0,
          blockedBalanceINR: 5000,
          totalBalanceINR: 5000,
          hasUnpaidAuctions: false,
          unpaidAuctionIds: [],
          isBlocked: true,
          blockedBids: [],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.canBid(1000);

      expect(result.canBid).toBe(false);
      expect(result.reason).toBe("Your RipLimit account is blocked");
    });

    it("should prevent bidding with unpaid auctions", async () => {
      const mockResponse = {
        success: true,
        data: {
          availableBalance: 5000,
          blockedBalance: 0,
          totalBalance: 5000,
          availableBalanceINR: 5000,
          blockedBalanceINR: 0,
          totalBalanceINR: 5000,
          hasUnpaidAuctions: true,
          unpaidAuctionIds: ["auction1"],
          isBlocked: false,
          blockedBids: [],
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ripLimitService.canBid(1000);

      expect(result.canBid).toBe(false);
      expect(result.reason).toBe("You have unpaid won auctions");
    });
  });

  describe("Cache invalidation", () => {
    it("should invalidate balance cache", () => {
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      ripLimitService.invalidateBalanceCache();

      expect(apiService.invalidateCache).toHaveBeenCalledWith(
        "/riplimit/balance"
      );
    });

    it("should invalidate transactions cache", () => {
      (apiService.invalidateCache as jest.Mock).mockImplementation(() => {});

      ripLimitService.invalidateTransactionsCache();

      expect(apiService.invalidateCache).toHaveBeenCalledWith(
        "/riplimit/transactions"
      );
    });
  });
});
