/**
 * RipLimit Transactions Tests
 * Tests credit operations and transaction history
 */

import { COLLECTIONS } from "@/constants/database";
import {
  RIPLIMIT_EXCHANGE_RATE,
  RipLimitTransactionStatus,
  RipLimitTransactionType,
} from "@/types/backend/riplimit.types";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "../../firebase/admin";
import { creditBalance, getTransactionHistory } from "../transactions";

// Mock firebase admin
jest.mock("../../firebase/admin");

describe("RipLimit Transactions", () => {
  const mockRunTransaction = jest.fn();
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGet = jest.fn();
  const mockSet = jest.fn();
  const mockUpdate = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockCount = jest.fn();
  const mockOffset = jest.fn();
  const mockLimit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockDb = {
      runTransaction: mockRunTransaction,
      collection: mockCollection,
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);

    // Setup query chain
    mockCollection.mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
    });

    mockDoc.mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
    });

    mockWhere.mockReturnValue({
      orderBy: mockOrderBy,
      where: mockWhere,
      count: mockCount,
      offset: mockOffset,
      limit: mockLimit,
      get: mockGet,
    });

    mockOrderBy.mockReturnValue({
      where: mockWhere,
      count: mockCount,
      offset: mockOffset,
      limit: mockLimit,
      get: mockGet,
    });

    mockCount.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: () => ({ count: 10 }),
      }),
    });

    mockOffset.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    });

    mockLimit.mockReturnValue({
      get: mockGet,
    });
  });

  describe("creditBalance", () => {
    it("should create new account and credit balance for purchase", async () => {
      const userId = "user123";
      const amount = 1000;
      const transactionId = "trans123";

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: false,
          }),
          set: jest.fn(),
          update: jest.fn(),
        };

        // Mock doc() to return transaction ID
        mockDoc.mockReturnValueOnce({
          id: transactionId,
        });

        return callback(mockTransaction);
      });

      const result = await creditBalance(
        userId,
        amount,
        RipLimitTransactionType.PURCHASE,
        "Test purchase"
      );

      expect(result).toMatchObject({
        id: transactionId,
        userId,
        type: RipLimitTransactionType.PURCHASE,
        amount,
        inrAmount: amount / RIPLIMIT_EXCHANGE_RATE,
        balanceAfter: amount,
        status: RipLimitTransactionStatus.COMPLETED,
        description: "Test purchase",
      });
    });

    it("should credit existing account with purchase type", async () => {
      const userId = "user123";
      const amount = 500;
      const existingBalance = 1000;
      const lifetimePurchases = 5000;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: existingBalance,
              blockedBalance: 100,
              lifetimePurchases,
              lifetimeSpent: 2000,
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

        mockDoc.mockReturnValueOnce({
          id: "trans123",
        });

        return callback(mockTransaction);
      });

      const result = await creditBalance(
        userId,
        amount,
        RipLimitTransactionType.PURCHASE,
        "Purchase"
      );

      expect(result.balanceAfter).toBe(existingBalance + amount);
      expect(result.amount).toBe(amount);
      expect(result.type).toBe(RipLimitTransactionType.PURCHASE);
    });

    it("should credit with admin adjustment type (no lifetime purchase update)", async () => {
      const userId = "user123";
      const amount = 100;
      const existingBalance = 500;
      const lifetimePurchases = 1000;

      let capturedUpdate: any = null;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: existingBalance,
              blockedBalance: 0,
              lifetimePurchases,
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
          update: jest.fn((ref, data) => {
            capturedUpdate = data;
          }),
        };

        mockDoc.mockReturnValueOnce({
          id: "trans123",
        });

        return callback(mockTransaction);
      });

      const result = await creditBalance(
        userId,
        amount,
        RipLimitTransactionType.ADJUSTMENT,
        "Admin adjustment",
        { adjustedBy: "admin123" }
      );

      expect(result.type).toBe(RipLimitTransactionType.ADJUSTMENT);
      expect(result.metadata).toEqual({ adjustedBy: "admin123" });
      expect(capturedUpdate.lifetimePurchases).toBe(lifetimePurchases); // Should NOT change
    });

    it("should handle negative credit (deduction)", async () => {
      const userId = "user123";
      const amount = -200;
      const existingBalance = 1000;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: existingBalance,
              blockedBalance: 0,
              lifetimePurchases: 5000,
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

        mockDoc.mockReturnValueOnce({
          id: "trans123",
        });

        return callback(mockTransaction);
      });

      const result = await creditBalance(
        userId,
        amount,
        RipLimitTransactionType.ADJUSTMENT,
        "Penalty"
      );

      expect(result.balanceAfter).toBe(existingBalance + amount); // 800
      expect(result.amount).toBe(amount);
      expect(result.inrAmount).toBe(amount / RIPLIMIT_EXCHANGE_RATE);
    });

    it("should include metadata in transaction", async () => {
      const userId = "user123";
      const metadata = {
        orderId: "order123",
        paymentId: "pay123",
        gateway: "razorpay",
      };

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: 1000,
              blockedBalance: 0,
              lifetimePurchases: 5000,
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

        mockDoc.mockReturnValueOnce({
          id: "trans123",
        });

        return callback(mockTransaction);
      });

      const result = await creditBalance(
        userId,
        500,
        RipLimitTransactionType.PURCHASE,
        "Purchase",
        metadata
      );

      expect(result.metadata).toEqual(metadata);
    });

    it("should use serverTimestamp for updatedAt", async () => {
      const userId = "user123";
      let capturedUpdate: any = null;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              availableBalance: 1000,
              blockedBalance: 0,
              lifetimePurchases: 5000,
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
          update: jest.fn((ref, data) => {
            capturedUpdate = data;
          }),
        };

        mockDoc.mockReturnValueOnce({
          id: "trans123",
        });

        return callback(mockTransaction);
      });

      await creditBalance(
        userId,
        100,
        RipLimitTransactionType.PURCHASE,
        "Test"
      );

      expect(capturedUpdate.updatedAt).toBe(FieldValue.serverTimestamp());
    });
  });

  describe("getTransactionHistory", () => {
    it("should get transaction history without filters", async () => {
      const userId = "user123";
      const mockTransactions = [
        {
          id: "trans1",
          userId,
          type: RipLimitTransactionType.PURCHASE,
          amount: 1000,
          inrAmount: 50,
          balanceAfter: 1000,
          status: RipLimitTransactionStatus.COMPLETED,
          description: "Purchase",
          createdAt: Timestamp.now(),
        },
        {
          id: "trans2",
          userId,
          type: RipLimitTransactionType.BID_BLOCK,
          amount: -100,
          inrAmount: 5,
          balanceAfter: 900,
          status: RipLimitTransactionStatus.COMPLETED,
          description: "Bid blocked",
          createdAt: Timestamp.now(),
        },
      ];

      mockGet.mockResolvedValue({
        docs: mockTransactions.map((t) => ({
          id: t.id,
          data: () => t,
        })),
      });

      const result = await getTransactionHistory(userId);

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(mockWhere).toHaveBeenCalledWith("userId", "==", userId);
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
    });

    it("should filter by transaction type", async () => {
      const userId = "user123";
      const type = RipLimitTransactionType.PURCHASE;

      mockGet.mockResolvedValue({
        docs: [],
      });

      await getTransactionHistory(userId, { type });

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", userId);
      expect(mockWhere).toHaveBeenCalledWith("type", "==", type);
    });

    it("should apply pagination with limit", async () => {
      const userId = "user123";

      mockGet.mockResolvedValue({
        docs: [],
      });

      await getTransactionHistory(userId, { limit: 5 });

      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it("should apply pagination with offset", async () => {
      const userId = "user123";

      mockGet.mockResolvedValue({
        docs: [],
      });

      await getTransactionHistory(userId, { offset: 10 });

      expect(mockOffset).toHaveBeenCalledWith(10);
    });

    it("should apply pagination with both offset and limit", async () => {
      const userId = "user123";

      mockGet.mockResolvedValue({
        docs: [],
      });

      await getTransactionHistory(userId, { offset: 20, limit: 10 });

      expect(mockOffset).toHaveBeenCalledWith(20);
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it("should return empty array when no transactions", async () => {
      const userId = "user123";

      mockGet.mockResolvedValue({
        docs: [],
      });

      const result = await getTransactionHistory(userId);

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(10);
    });

    it("should map transaction IDs correctly", async () => {
      const userId = "user123";
      const mockTransactions = [
        {
          userId,
          type: RipLimitTransactionType.PURCHASE,
          amount: 500,
          inrAmount: 25,
          balanceAfter: 500,
          status: RipLimitTransactionStatus.COMPLETED,
          description: "Purchase",
          createdAt: Timestamp.now(),
        },
      ];

      mockGet.mockResolvedValue({
        docs: [
          {
            id: "mapped-id-123",
            data: () => mockTransactions[0],
          },
        ],
      });

      const result = await getTransactionHistory(userId);

      expect(result.transactions[0].id).toBe("mapped-id-123");
    });

    it("should handle filter with type and pagination", async () => {
      const userId = "user123";

      mockGet.mockResolvedValue({
        docs: [],
      });

      await getTransactionHistory(userId, {
        type: RipLimitTransactionType.BID_RELEASE,
        offset: 5,
        limit: 3,
      });

      expect(mockWhere).toHaveBeenCalledWith(
        "type",
        "==",
        RipLimitTransactionType.BID_RELEASE
      );
      expect(mockOffset).toHaveBeenCalledWith(5);
      expect(mockLimit).toHaveBeenCalledWith(3);
    });

    it("should use correct collection name", async () => {
      const userId = "user123";

      mockGet.mockResolvedValue({
        docs: [],
      });

      await getTransactionHistory(userId);

      expect(mockCollection).toHaveBeenCalledWith(
        COLLECTIONS.RIPLIMIT_TRANSACTIONS
      );
    });
  });
});
