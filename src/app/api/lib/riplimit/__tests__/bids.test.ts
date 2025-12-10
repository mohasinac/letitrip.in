/**
 * RipLimit Bids Tests
 * Tests bid blocking, releasing, and auction payment
 */

import {
  RIPLIMIT_EXCHANGE_RATE,
  RipLimitTransactionType,
} from "@/types/backend/riplimit.types";
import { Timestamp } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "../../firebase/admin";
import { blockForBid, releaseBlockedBid, useForAuctionPayment } from "../bids";

// Mock firebase admin
jest.mock("../../firebase/admin");

describe("RipLimit Bids", () => {
  const mockRunTransaction = jest.fn();
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReset();

    const mockDb = {
      runTransaction: mockRunTransaction,
      collection: mockCollection,
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);

    mockCollection.mockReturnValue({
      doc: mockDoc,
    });
  });

  describe("blockForBid", () => {
    it("should block RipLimit for first bid on auction", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 100;
      const ripLimitAmount = bidAmountINR * RIPLIMIT_EXCHANGE_RATE;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 5000,
                blockedBalance: 0,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: false, // No previous bid
            }),
          set: jest.fn(),
          update: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.success).toBe(true);
      expect(result.transaction).toBeDefined();
      expect(result.transaction?.type).toBe(RipLimitTransactionType.BID_BLOCK);
      expect(result.transaction?.amount).toBe(-ripLimitAmount);
      expect(result.transaction?.balanceAfter).toBe(5000 - ripLimitAmount);
    });

    it("should fail when account does not exist", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 100;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: false,
          }),
          set: jest.fn(),
          update: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.success).toBe(false);
      expect(result.error).toBe("RipLimit account not found");
    });

    it("should fail when account is blocked", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 100;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: 5000,
              blockedBalance: 0,
              lifetimePurchases: 10000,
              lifetimeSpent: 2000,
              hasUnpaidAuctions: false,
              unpaidAuctionIds: [],
              strikes: 3,
              isBlocked: true,
              blockReason: "Too many strikes",
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            }),
          }),
          set: jest.fn(),
          update: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Too many strikes");
    });

    it("should fail when user has unpaid auctions", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 100;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: 5000,
              blockedBalance: 0,
              lifetimePurchases: 10000,
              lifetimeSpent: 2000,
              hasUnpaidAuctions: true,
              unpaidAuctionIds: ["old-auction"],
              strikes: 0,
              isBlocked: false,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            }),
          }),
          set: jest.fn(),
          update: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You have unpaid won auctions");
    });

    it("should fail when insufficient balance", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 100;
      const ripLimitAmount = bidAmountINR * RIPLIMIT_EXCHANGE_RATE;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: 500, // Less than required
              blockedBalance: 0,
              lifetimePurchases: 1000,
              lifetimeSpent: 0,
              hasUnpaidAuctions: false,
              unpaidAuctionIds: [],
              strikes: 0,
              isBlocked: false,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            }),
          }),
          set: jest.fn(),
          update: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        `Insufficient RipLimit. Required: ${ripLimitAmount}, Available: 500`
      );
    });

    it("should update bid when user already has blocked bid on auction", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 200;
      const ripLimitAmount = bidAmountINR * RIPLIMIT_EXCHANGE_RATE;
      const previousBlocked = 100 * RIPLIMIT_EXCHANGE_RATE;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 5000,
                blockedBalance: previousBlocked,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "old-bid",
                amount: previousBlocked,
                bidAmountINR: 100,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.success).toBe(true);
      const netBlock = ripLimitAmount - previousBlocked;
      expect(result.transaction?.amount).toBe(-netBlock);
    });

    it("should handle bid decrease (release partial)", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 50; // Lower than previous
      const ripLimitAmount = bidAmountINR * RIPLIMIT_EXCHANGE_RATE;
      const previousBlocked = 100 * RIPLIMIT_EXCHANGE_RATE;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: previousBlocked,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "old-bid",
                amount: previousBlocked,
                bidAmountINR: 100,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.success).toBe(true);
      const netBlock = ripLimitAmount - previousBlocked; // Negative (release)
      expect(result.transaction?.amount).toBe(-netBlock);
    });

    it("should include auction and bid IDs in transaction", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const bidId = "bid123";
      const bidAmountINR = 100;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 5000,
                blockedBalance: 0,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: false,
            }),
          set: jest.fn(),
          update: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await blockForBid(userId, auctionId, bidId, bidAmountINR);

      expect(result.transaction?.auctionId).toBe(auctionId);
      expect(result.transaction?.bidId).toBe(bidId);
    });
  });

  describe("releaseBlockedBid", () => {
    it("should release blocked bid successfully", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const blockedAmount = 2000;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: blockedAmount,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: blockedAmount,
                bidAmountINR: 100,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await releaseBlockedBid(userId, auctionId, "Outbid");

      expect(result.success).toBe(true);
      expect(result.releasedAmount).toBe(blockedAmount);
      expect(result.transaction).toBeDefined();
      expect(result.transaction?.type).toBe(
        RipLimitTransactionType.BID_RELEASE
      );
      expect(result.transaction?.amount).toBe(blockedAmount);
    });

    it("should fail when account does not exist", async () => {
      const userId = "user123";
      const auctionId = "auction123";

      const accountRef = { collection: jest.fn() };
      const blockedBidRef = {};

      accountRef.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(blockedBidRef),
      });

      mockDoc.mockReturnValue(accountRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: false,
            })
            .mockResolvedValueOnce({
              exists: false,
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await releaseBlockedBid(userId, auctionId);

      expect(result.success).toBe(false);
    });

    it("should fail when no blocked bid exists", async () => {
      const userId = "user123";
      const auctionId = "auction123";

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: 0,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: false,
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await releaseBlockedBid(userId, auctionId);

      expect(result.success).toBe(false);
    });

    it("should include reason in transaction description", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const reason = "Auction cancelled";

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: 2000,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: 2000,
                bidAmountINR: 100,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await releaseBlockedBid(userId, auctionId, reason);

      expect(result.transaction?.description).toBe(
        `RipLimit released: ${reason}`
      );
    });

    it("should default reason to Outbid", async () => {
      const userId = "user123";
      const auctionId = "auction123";

      const accountRef = { collection: jest.fn() };
      const blockedBidRef = {};
      const transactionRef = { id: "trans123" };

      accountRef.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(blockedBidRef),
      });

      mockDoc
        .mockReturnValueOnce(accountRef)
        .mockReturnValueOnce(transactionRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: 2000,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: 2000,
                bidAmountINR: 100,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await releaseBlockedBid(userId, auctionId);

      expect(result.transaction?.description).toBe("RipLimit released: Outbid");
    });

    it("should update balance correctly after release", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const availableBalance = 1000;
      const blockedAmount = 500;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance,
                blockedBalance: blockedAmount,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: blockedAmount,
                bidAmountINR: 25,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await releaseBlockedBid(userId, auctionId);

      expect(result.transaction?.balanceAfter).toBe(
        availableBalance + blockedAmount
      );
    });
  });

  describe("useForAuctionPayment", () => {
    it("should use blocked RipLimit for auction payment", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";
      const blockedAmount = 2000;

      const accountRef = { collection: jest.fn() };
      const blockedBidRef = {};
      const transactionRef = { id: "trans123" };

      accountRef.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(blockedBidRef),
      });

      mockDoc
        .mockReturnValueOnce(accountRef)
        .mockReturnValueOnce(transactionRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: blockedAmount,
                lifetimePurchases: 10000,
                lifetimeSpent: 5000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: blockedAmount,
                bidAmountINR: 100,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await useForAuctionPayment(userId, auctionId, orderId);

      expect(result.success).toBe(true);
      expect(result.usedAmount).toBe(blockedAmount);
      expect(result.usedAmountINR).toBe(blockedAmount / RIPLIMIT_EXCHANGE_RATE);
      expect(result.transaction?.type).toBe(
        RipLimitTransactionType.AUCTION_PAYMENT
      );
      expect(result.transaction?.orderId).toBe(orderId);
    });

    it("should fail when account does not exist", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";

      const accountRef = { collection: jest.fn() };
      const blockedBidRef = {};

      accountRef.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(blockedBidRef),
      });

      mockDoc.mockReturnValue(accountRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: false,
            })
            .mockResolvedValueOnce({
              exists: false,
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await useForAuctionPayment(userId, auctionId, orderId);

      expect(result.success).toBe(false);
    });

    it("should fail when no blocked bid exists", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: 0,
                lifetimePurchases: 10000,
                lifetimeSpent: 2000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: false,
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await useForAuctionPayment(userId, auctionId, orderId);

      expect(result.success).toBe(false);
    });

    it("should update lifetimeSpent correctly", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";
      const blockedAmount = 1000;
      const lifetimeSpent = 5000;

      let capturedUpdate: any = null;

      const accountRef = { collection: jest.fn() };
      const blockedBidRef = {};
      const transactionRef = { id: "trans123" };

      accountRef.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(blockedBidRef),
      });

      mockDoc
        .mockReturnValueOnce(accountRef)
        .mockReturnValueOnce(transactionRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: blockedAmount,
                lifetimePurchases: 10000,
                lifetimeSpent,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: blockedAmount,
                bidAmountINR: 50,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn((ref, data) => {
            capturedUpdate = data;
          }),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      await useForAuctionPayment(userId, auctionId, orderId);

      expect(capturedUpdate.lifetimeSpent).toBe(lifetimeSpent + blockedAmount);
    });

    it("should remove auction from unpaidAuctionIds if present", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";

      let capturedUpdate: any = null;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: 1000,
                lifetimePurchases: 10000,
                lifetimeSpent: 5000,
                hasUnpaidAuctions: true,
                unpaidAuctionIds: [auctionId, "other-auction"],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: 1000,
                bidAmountINR: 50,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn((ref, data) => {
            capturedUpdate = data;
          }),
          delete: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      await useForAuctionPayment(userId, auctionId, orderId);

      expect(capturedUpdate.unpaidAuctionIds).toEqual(["other-auction"]);
      expect(capturedUpdate.hasUnpaidAuctions).toBe(true);
    });

    it("should set hasUnpaidAuctions to false when last unpaid auction paid", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";

      let capturedUpdate: any = null;

      const accountRef = { collection: jest.fn() };
      const blockedBidRef = {};
      const transactionRef = { id: "trans123" };

      accountRef.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(blockedBidRef),
      });

      mockDoc
        .mockReturnValueOnce(accountRef)
        .mockReturnValueOnce(transactionRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: 1000,
                lifetimePurchases: 10000,
                lifetimeSpent: 5000,
                hasUnpaidAuctions: true,
                unpaidAuctionIds: [auctionId],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: 1000,
                bidAmountINR: 50,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn((ref, data) => {
            capturedUpdate = data;
          }),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      await useForAuctionPayment(userId, auctionId, orderId);

      expect(capturedUpdate.unpaidAuctionIds).toEqual([]);
      expect(capturedUpdate.hasUnpaidAuctions).toBe(false);
    });

    it("should keep availableBalance unchanged", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";
      const availableBalance = 3000;

      const accountRef = { collection: jest.fn() };
      const blockedBidRef = {};
      const transactionRef = { id: "trans123" };

      accountRef.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(blockedBidRef),
      });

      mockDoc
        .mockReturnValueOnce(accountRef)
        .mockReturnValueOnce(transactionRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance,
                blockedBalance: 2000,
                lifetimePurchases: 10000,
                lifetimeSpent: 5000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: 2000,
                bidAmountINR: 100,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      const result = await useForAuctionPayment(userId, auctionId, orderId);

      expect(result.transaction?.balanceAfter).toBe(availableBalance);
    });

    it("should create negative amount transaction for debit", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const orderId = "order123";
      const blockedAmount = 1500;

      mockRunTransaction.mockImplementation(async (callback) => {
        const accountRef = { collection: jest.fn() };
        const blockedBidRef = {};

        accountRef.collection.mockReturnValue({
          doc: jest.fn().mockReturnValue(blockedBidRef),
        });

        mockDoc.mockReturnValueOnce(accountRef);

        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                availableBalance: 3000,
                blockedBalance: blockedAmount,
                lifetimePurchases: 10000,
                lifetimeSpent: 5000,
                hasUnpaidAuctions: false,
                unpaidAuctionIds: [],
                strikes: 0,
                isBlocked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              }),
            })
            .mockResolvedValueOnce({
              exists: true,
              data: () => ({
                auctionId,
                bidId: "bid123",
                amount: blockedAmount,
                bidAmountINR: 75,
                createdAt: Timestamp.now(),
              }),
            }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };

        mockDoc
          .mockReturnValueOnce(accountRef)
          .mockReturnValueOnce({ id: "trans123" });

        return callback(mockTransaction);
      });

      const result = await useForAuctionPayment(userId, auctionId, orderId);

      expect(result.transaction?.amount).toBe(-blockedAmount);
    });
  });
});
