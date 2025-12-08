/**
 * RIPLIMIT TRANSFORMATION TESTS
 *
 * Tests for RipLimit type transformations between Backend and Frontend
 * Epic: E028 - RipLimit Bidding Currency
 */

import { RipLimitTransactionBE } from "../../backend/riplimit.types";
import {
  createEmptyBalance,
  toFERipLimitBalance,
  toFERipLimitTransaction,
  toFERipLimitTransactionHistory,
} from "../riplimit.transforms";

describe("RipLimit Transformations", () => {
  const mockBalanceData = {
    availableBalance: 5000,
    blockedBalance: 1000,
    totalBalance: 6000,
    availableBalanceINR: 50000,
    blockedBalanceINR: 10000,
    totalBalanceINR: 60000,
    hasUnpaidAuctions: false,
    unpaidAuctionIds: [],
    isBlocked: false,
    blockedBids: [
      {
        auctionId: "auction_123",
        bidId: "bid_123",
        amount: 500,
        bidAmountINR: 5000,
      },
      {
        auctionId: "auction_456",
        bidId: "bid_456",
        amount: 500,
        bidAmountINR: 5000,
      },
    ],
  };

  const mockTransactionBE: RipLimitTransactionBE = {
    id: "tx_123",
    userId: "user_123",
    type: "credit",
    amount: 1000,
    inrAmount: 10000,
    balanceAfter: 6000,
    description: "Purchase RipLimit",
    auctionId: undefined,
    orderId: undefined,
    status: "completed",
    createdAt: new Date("2024-01-15T10:00:00Z"),
  };

  describe("toFERipLimitBalance", () => {
    it("should transform basic balance fields", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.availableBalance).toBe(5000);
      expect(result.blockedBalance).toBe(1000);
      expect(result.totalBalance).toBe(6000);
    });

    it("should format RipLimit amounts", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.formattedAvailable).toContain("5,000");
      expect(result.formattedAvailable).toContain("RL");
      expect(result.formattedBlocked).toContain("1,000");
      expect(result.formattedBlocked).toContain("RL");
      expect(result.formattedTotal).toContain("6,000");
      expect(result.formattedTotal).toContain("RL");
    });

    it("should transform INR amounts", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.availableBalanceINR).toBe(50000);
      expect(result.blockedBalanceINR).toBe(10000);
      expect(result.totalBalanceINR).toBe(60000);
    });

    it("should format INR amounts", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.formattedAvailableINR).toContain("₹");
      expect(result.formattedAvailableINR).toContain("50,000");
      expect(result.formattedBlockedINR).toContain("₹");
      expect(result.formattedBlockedINR).toContain("10,000");
      expect(result.formattedTotalINR).toContain("₹");
      expect(result.formattedTotalINR).toContain("60,000");
    });

    it("should handle unpaid auctions", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.hasUnpaidAuctions).toBe(false);
      expect(result.unpaidAuctionCount).toBe(0);
    });

    it("should count unpaid auctions", () => {
      const dataWithUnpaid = {
        ...mockBalanceData,
        hasUnpaidAuctions: true,
        unpaidAuctionIds: ["auction_1", "auction_2", "auction_3"],
      };
      const result = toFERipLimitBalance(dataWithUnpaid);

      expect(result.hasUnpaidAuctions).toBe(true);
      expect(result.unpaidAuctionCount).toBe(3);
    });

    it("should calculate canBid flag when no blocks", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.isBlocked).toBe(false);
      expect(result.hasUnpaidAuctions).toBe(false);
      expect(result.canBid).toBe(true);
    });

    it("should calculate canBid flag when blocked", () => {
      const blockedData = {
        ...mockBalanceData,
        isBlocked: true,
      };
      const result = toFERipLimitBalance(blockedData);

      expect(result.isBlocked).toBe(true);
      expect(result.canBid).toBe(false);
    });

    it("should calculate canBid flag when has unpaid auctions", () => {
      const dataWithUnpaid = {
        ...mockBalanceData,
        hasUnpaidAuctions: true,
        unpaidAuctionIds: ["auction_1"],
      };
      const result = toFERipLimitBalance(dataWithUnpaid);

      expect(result.hasUnpaidAuctions).toBe(true);
      expect(result.canBid).toBe(false);
    });

    it("should transform blocked bids", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.blockedBids).toHaveLength(2);
      expect(result.blockedBids[0].auctionId).toBe("auction_123");
      expect(result.blockedBids[0].bidId).toBe("bid_123");
      expect(result.blockedBids[0].amount).toBe(500);
    });

    it("should format blocked bid amounts", () => {
      const result = toFERipLimitBalance(mockBalanceData);

      expect(result.blockedBids[0].formattedAmount).toContain("500");
      expect(result.blockedBids[0].formattedAmount).toContain("RL");
      expect(result.blockedBids[0].formattedBidAmountINR).toContain("₹");
      expect(result.blockedBids[0].formattedBidAmountINR).toContain("5,000");
    });

    it("should handle empty blocked bids", () => {
      const dataWithoutBlocked = {
        ...mockBalanceData,
        blockedBids: [],
      };
      const result = toFERipLimitBalance(dataWithoutBlocked);

      expect(result.blockedBids).toEqual([]);
    });

    it("should handle zero balances", () => {
      const zeroBalance = {
        availableBalance: 0,
        blockedBalance: 0,
        totalBalance: 0,
        availableBalanceINR: 0,
        blockedBalanceINR: 0,
        totalBalanceINR: 0,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        isBlocked: false,
        blockedBids: [],
      };
      const result = toFERipLimitBalance(zeroBalance);

      expect(result.availableBalance).toBe(0);
      expect(result.formattedAvailable).toContain("0");
    });

    it("should handle large balances", () => {
      const largeBalance = {
        ...mockBalanceData,
        availableBalance: 999999,
        totalBalance: 1000000,
        availableBalanceINR: 9999990,
        totalBalanceINR: 10000000,
      };
      const result = toFERipLimitBalance(largeBalance);

      expect(result.availableBalance).toBe(999999);
      expect(result.formattedAvailable).toContain("9,99,999");
      expect(result.formattedTotalINR).toContain("1,00,00,000");
    });
  });

  describe("toFERipLimitTransaction", () => {
    it("should transform basic transaction fields", () => {
      const result = toFERipLimitTransaction(mockTransactionBE);

      expect(result.id).toBe("tx_123");
      expect(result.type).toBe("credit");
      expect(result.amount).toBe(1000);
      expect(result.inrAmount).toBe(10000);
      expect(result.balanceAfter).toBe(6000);
      expect(result.description).toBe("Purchase RipLimit");
      expect(result.status).toBe("completed");
    });

    it("should format amount for credit transaction", () => {
      const result = toFERipLimitTransaction(mockTransactionBE);

      expect(result.formattedAmount).toContain("+");
      expect(result.formattedAmount).toContain("1,000");
      expect(result.formattedAmount).toContain("RL");
      expect(result.isCredit).toBe(true);
    });

    it("should format amount for debit transaction", () => {
      const debitTransaction = {
        ...mockTransactionBE,
        type: "debit",
        amount: -500,
      };
      const result = toFERipLimitTransaction(debitTransaction);

      expect(result.formattedAmount).toContain("-500");
      expect(result.formattedAmount).toContain("RL");
      expect(result.isCredit).toBe(false);
    });

    it("should format INR amount", () => {
      const result = toFERipLimitTransaction(mockTransactionBE);

      expect(result.formattedINRAmount).toContain("₹");
      expect(result.formattedINRAmount).toContain("10,000");
    });

    it("should format balance after", () => {
      const result = toFERipLimitTransaction(mockTransactionBE);

      expect(result.formattedBalanceAfter).toContain("6,000");
      expect(result.formattedBalanceAfter).toContain("RL");
    });

    it("should parse and format dates", () => {
      const result = toFERipLimitTransaction(mockTransactionBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.formattedDate).toBeTruthy();
      expect(result.timeAgo).toBeTruthy();
    });

    it("should format type label", () => {
      const result = toFERipLimitTransaction(mockTransactionBE);

      expect(result.typeLabel).toBeTruthy();
    });

    it("should format status label", () => {
      const result = toFERipLimitTransaction(mockTransactionBE);

      expect(result.statusLabel).toBeTruthy();
    });

    it("should handle transaction with auction ID", () => {
      const auctionTransaction = {
        ...mockTransactionBE,
        type: "bid",
        auctionId: "auction_123",
        description: "Bid placed on auction",
      };
      const result = toFERipLimitTransaction(auctionTransaction);

      expect(result.auctionId).toBe("auction_123");
      expect(result.description).toContain("auction");
    });

    it("should handle transaction with order ID", () => {
      const orderTransaction = {
        ...mockTransactionBE,
        type: "refund",
        orderId: "order_123",
        description: "Refund for cancelled order",
      };
      const result = toFERipLimitTransaction(orderTransaction);

      expect(result.orderId).toBe("order_123");
      expect(result.description).toContain("order");
    });

    it("should handle transaction with string date", () => {
      const txWithStringDate = {
        ...mockTransactionBE,
        createdAt: "2024-01-15T10:00:00Z",
      };
      const result = toFERipLimitTransaction(txWithStringDate);

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should handle transaction with Firestore timestamp", () => {
      const txWithTimestamp = {
        ...mockTransactionBE,
        createdAt: {
          toDate: () => new Date("2024-01-15T10:00:00Z"),
        },
      };
      const result = toFERipLimitTransaction(txWithTimestamp);

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should handle transaction with _seconds format", () => {
      const txWithSeconds = {
        ...mockTransactionBE,
        createdAt: {
          _seconds: 1705315200,
        },
      };
      const result = toFERipLimitTransaction(txWithSeconds);

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should handle zero amount transaction", () => {
      const zeroTransaction = {
        ...mockTransactionBE,
        amount: 0,
        inrAmount: 0,
      };
      const result = toFERipLimitTransaction(zeroTransaction);

      expect(result.amount).toBe(0);
      expect(result.formattedAmount).toContain("0");
    });

    it("should handle large amounts", () => {
      const largeTransaction = {
        ...mockTransactionBE,
        amount: 100000,
        inrAmount: 1000000,
      };
      const result = toFERipLimitTransaction(largeTransaction);

      expect(result.formattedAmount).toContain("1,00,000");
      expect(result.formattedINRAmount).toContain("10,00,000");
    });
  });

  describe("toFERipLimitTransactionHistory", () => {
    const mockTransactions = [
      mockTransactionBE,
      {
        ...mockTransactionBE,
        id: "tx_456",
        type: "debit",
        amount: -500,
        description: "Bid placed",
      },
      {
        ...mockTransactionBE,
        id: "tx_789",
        type: "refund",
        amount: 300,
        description: "Bid refund",
      },
    ];

    const mockHistoryData = {
      transactions: mockTransactions,
      total: 50,
    };

    it("should transform transaction history", () => {
      const result = toFERipLimitTransactionHistory(mockHistoryData);

      expect(result.transactions).toHaveLength(3);
      expect(result.total).toBe(50);
    });

    it("should calculate hasMore flag", () => {
      const result = toFERipLimitTransactionHistory(mockHistoryData, 20, 0);

      expect(result.hasMore).toBe(true);
    });

    it("should calculate hasMore false when at end", () => {
      const result = toFERipLimitTransactionHistory(mockHistoryData, 20, 47);

      expect(result.hasMore).toBe(false);
    });

    it("should handle custom limit", () => {
      const result = toFERipLimitTransactionHistory(mockHistoryData, 10, 0);

      expect(result.transactions).toHaveLength(3);
      expect(result.hasMore).toBe(true);
    });

    it("should handle custom offset", () => {
      const result = toFERipLimitTransactionHistory(mockHistoryData, 20, 20);

      expect(result.hasMore).toBe(true);
    });

    it("should handle empty transactions", () => {
      const emptyData = {
        transactions: [],
        total: 0,
      };
      const result = toFERipLimitTransactionHistory(emptyData);

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it("should transform all transactions in list", () => {
      const result = toFERipLimitTransactionHistory(mockHistoryData);

      result.transactions.forEach((tx) => {
        expect(tx).toHaveProperty("id");
        expect(tx).toHaveProperty("formattedAmount");
        expect(tx).toHaveProperty("formattedDate");
        expect(tx).toHaveProperty("isCredit");
      });
    });
  });

  describe("createEmptyBalance", () => {
    it("should create empty balance with zero values", () => {
      const result = createEmptyBalance();

      expect(result.availableBalance).toBe(0);
      expect(result.blockedBalance).toBe(0);
      expect(result.totalBalance).toBe(0);
      expect(result.availableBalanceINR).toBe(0);
      expect(result.blockedBalanceINR).toBe(0);
      expect(result.totalBalanceINR).toBe(0);
    });

    it("should format zero amounts", () => {
      const result = createEmptyBalance();

      expect(result.formattedAvailable).toBe("0 RL");
      expect(result.formattedBlocked).toBe("0 RL");
      expect(result.formattedTotal).toBe("0 RL");
      expect(result.formattedAvailableINR).toBe("₹0");
      expect(result.formattedBlockedINR).toBe("₹0");
      expect(result.formattedTotalINR).toBe("₹0");
    });

    it("should set default flags", () => {
      const result = createEmptyBalance();

      expect(result.hasUnpaidAuctions).toBe(false);
      expect(result.unpaidAuctionCount).toBe(0);
      expect(result.isBlocked).toBe(false);
      expect(result.canBid).toBe(true);
    });

    it("should have empty blocked bids", () => {
      const result = createEmptyBalance();

      expect(result.blockedBids).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle negative balances", () => {
      const negativeBalance = {
        ...mockBalanceData,
        availableBalance: -100,
        totalBalance: 0,
      };
      const result = toFERipLimitBalance(negativeBalance);

      expect(result.availableBalance).toBe(-100);
    });

    it("should handle very large transaction amounts", () => {
      const largeTransaction = {
        ...mockTransactionBE,
        amount: 9999999,
        inrAmount: 99999990,
      };
      const result = toFERipLimitTransaction(largeTransaction);

      expect(result.amount).toBe(9999999);
    });

    it("should handle special characters in description", () => {
      const specialTransaction = {
        ...mockTransactionBE,
        description: "Purchase & Top-up @ 10% discount 💰",
      };
      const result = toFERipLimitTransaction(specialTransaction);

      expect(result.description).toContain("&");
      expect(result.description).toContain("@");
      expect(result.description).toContain("💰");
    });

    it("should handle multiple blocked bids", () => {
      const manyBids = Array(50)
        .fill(0)
        .map((_, i) => ({
          auctionId: `auction_${i}`,
          bidId: `bid_${i}`,
          amount: 100,
          bidAmountINR: 1000,
        }));

      const dataWithManyBids = {
        ...mockBalanceData,
        blockedBids: manyBids,
      };
      const result = toFERipLimitBalance(dataWithManyBids);

      expect(result.blockedBids).toHaveLength(50);
    });

    it("should handle transaction history with single item", () => {
      const singleTx = {
        transactions: [mockTransactionBE],
        total: 1,
      };
      const result = toFERipLimitTransactionHistory(singleTx);

      expect(result.transactions).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it("should handle fractional amounts", () => {
      const fractionalTransaction = {
        ...mockTransactionBE,
        amount: 1000.5,
        inrAmount: 10005.75,
      };
      const result = toFERipLimitTransaction(fractionalTransaction);

      expect(result.amount).toBeCloseTo(1000.5, 1);
    });
  });
});
