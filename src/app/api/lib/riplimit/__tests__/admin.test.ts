/**
 * RipLimit Admin Tests
 * Tests admin operations, stats, and account management
 */

import { COLLECTIONS } from "@/constants/database";
import {
  RipLimitPurchaseStatus,
  RipLimitRefundStatus,
  RipLimitTransactionType,
} from "@/types/backend/riplimit.types";
import { Timestamp } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "../../firebase/admin";
import {
  adminAdjustBalance,
  adminClearUnpaidAuction,
  getAdminStats,
  getAdminUserDetails,
  listAllAccounts,
} from "../admin";
import { creditBalance } from "../transactions";

// Mock firebase admin
jest.mock("../../firebase/admin");
jest.mock("../transactions");

describe("RipLimit Admin", () => {
  const mockCollection = jest.fn();
  const mockDoc = jest.fn();
  const mockGet = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockCount = jest.fn();
  const mockOffset = jest.fn();
  const mockLimit = jest.fn();
  const mockRunTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockDb = {
      collection: mockCollection,
      runTransaction: mockRunTransaction,
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);

    mockCollection.mockReturnValue({
      doc: mockDoc,
      get: mockGet,
      where: mockWhere,
      orderBy: mockOrderBy,
    });

    mockWhere.mockReturnValue({
      get: mockGet,
      where: mockWhere,
      orderBy: mockOrderBy,
      count: mockCount,
      offset: mockOffset,
      limit: mockLimit,
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
        data: () => ({ count: 50 }),
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

  describe("getAdminStats", () => {
    it("should calculate total stats correctly", async () => {
      const mockAccounts = [
        {
          id: "user1",
          data: () => ({
            availableBalance: 1000,
            blockedBalance: 500,
            hasUnpaidAuctions: false,
          }),
        },
        {
          id: "user2",
          data: () => ({
            availableBalance: 2000,
            blockedBalance: 300,
            hasUnpaidAuctions: true,
          }),
        },
        {
          id: "user3",
          data: () => ({
            availableBalance: 1500,
            blockedBalance: 0,
            hasUnpaidAuctions: false,
          }),
        },
      ];

      const mockPurchases = [
        { id: "p1", data: () => ({ inrAmount: 1000 }) },
        { id: "p2", data: () => ({ inrAmount: 2000 }) },
      ];

      const mockRefunds = [{ id: "r1", data: () => ({ netAmount: 500 }) }];

      mockGet
        .mockResolvedValueOnce({
          docs: mockAccounts,
          size: 3,
        })
        .mockResolvedValueOnce({
          docs: mockPurchases,
        })
        .mockResolvedValueOnce({
          docs: mockRefunds,
        });

      const stats = await getAdminStats();

      expect(stats).toEqual({
        totalCirculation: 5300, // 1000 + 2000 + 1500 + 500 + 300
        totalAvailable: 4500,
        totalBlocked: 800,
        totalRevenue: 3000,
        totalRefunded: 500,
        netRevenue: 2500,
        userCount: 3,
        unpaidUserCount: 1,
      });
    });

    it("should handle empty accounts", async () => {
      mockGet
        .mockResolvedValueOnce({
          docs: [],
          size: 0,
        })
        .mockResolvedValueOnce({
          docs: [],
        })
        .mockResolvedValueOnce({
          docs: [],
        });

      const stats = await getAdminStats();

      expect(stats).toEqual({
        totalCirculation: 0,
        totalAvailable: 0,
        totalBlocked: 0,
        totalRevenue: 0,
        totalRefunded: 0,
        netRevenue: 0,
        userCount: 0,
        unpaidUserCount: 0,
      });
    });

    it("should count multiple unpaid users correctly", async () => {
      const mockAccounts = [
        {
          id: "user1",
          data: () => ({
            availableBalance: 1000,
            blockedBalance: 0,
            hasUnpaidAuctions: true,
          }),
        },
        {
          id: "user2",
          data: () => ({
            availableBalance: 2000,
            blockedBalance: 0,
            hasUnpaidAuctions: true,
          }),
        },
        {
          id: "user3",
          data: () => ({
            availableBalance: 1500,
            blockedBalance: 0,
            hasUnpaidAuctions: true,
          }),
        },
      ];

      mockGet
        .mockResolvedValueOnce({
          docs: mockAccounts,
          size: 3,
        })
        .mockResolvedValueOnce({
          docs: [],
        })
        .mockResolvedValueOnce({
          docs: [],
        });

      const stats = await getAdminStats();

      expect(stats.unpaidUserCount).toBe(3);
    });

    it("should query correct collections", async () => {
      mockGet
        .mockResolvedValueOnce({
          docs: [],
          size: 0,
        })
        .mockResolvedValueOnce({
          docs: [],
        })
        .mockResolvedValueOnce({
          docs: [],
        });

      await getAdminStats();

      expect(mockCollection).toHaveBeenCalledWith(
        COLLECTIONS.RIPLIMIT_ACCOUNTS
      );
      expect(mockCollection).toHaveBeenCalledWith(
        COLLECTIONS.RIPLIMIT_PURCHASES
      );
      expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.RIPLIMIT_REFUNDS);
    });

    it("should filter purchases by completed status", async () => {
      mockGet
        .mockResolvedValueOnce({
          docs: [],
          size: 0,
        })
        .mockResolvedValueOnce({
          docs: [],
        })
        .mockResolvedValueOnce({
          docs: [],
        });

      await getAdminStats();

      expect(mockWhere).toHaveBeenCalledWith(
        "status",
        "==",
        RipLimitPurchaseStatus.COMPLETED
      );
    });

    it("should filter refunds by completed status", async () => {
      mockGet
        .mockResolvedValueOnce({
          docs: [],
          size: 0,
        })
        .mockResolvedValueOnce({
          docs: [],
        })
        .mockResolvedValueOnce({
          docs: [],
        });

      await getAdminStats();

      expect(mockWhere).toHaveBeenCalledWith(
        "status",
        "==",
        RipLimitRefundStatus.COMPLETED
      );
    });
  });

  describe("adminAdjustBalance", () => {
    it("should call creditBalance with adjustment type", async () => {
      const userId = "user123";
      const amount = 500;
      const reason = "Compensation for error";
      const adminId = "admin123";

      const mockTransaction = {
        id: "trans123",
        userId,
        type: RipLimitTransactionType.ADJUSTMENT,
        amount,
        balanceAfter: 1500,
        description: reason,
      };

      (creditBalance as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await adminAdjustBalance(userId, amount, reason, adminId);

      expect(creditBalance).toHaveBeenCalledWith(
        userId,
        amount,
        RipLimitTransactionType.ADJUSTMENT,
        reason,
        {
          adjustedBy: adminId,
          reason,
        }
      );
      expect(result).toEqual(mockTransaction);
    });

    it("should handle negative adjustments", async () => {
      const userId = "user123";
      const amount = -200;
      const reason = "Penalty for violation";
      const adminId = "admin123";

      (creditBalance as jest.Mock).mockResolvedValue({});

      await adminAdjustBalance(userId, amount, reason, adminId);

      expect(creditBalance).toHaveBeenCalledWith(
        userId,
        amount,
        RipLimitTransactionType.ADJUSTMENT,
        reason,
        {
          adjustedBy: adminId,
          reason,
        }
      );
    });
  });

  describe("adminClearUnpaidAuction", () => {
    it("should clear unpaid auction and release blocked bid", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const adminId = "admin123";

      const accountRef = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({}),
        }),
      };

      mockDoc.mockReturnValue(accountRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              data: () => ({
                unpaidAuctionIds: [auctionId, "other-auction"],
                hasUnpaidAuctions: true,
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
          update: jest.fn(),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      await adminClearUnpaidAuction(userId, auctionId, adminId);

      expect(mockRunTransaction).toHaveBeenCalled();
    });

    it("should handle case when no blocked bid exists", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const adminId = "admin123";

      const accountRef = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({}),
        }),
      };

      mockDoc.mockReturnValue(accountRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              data: () => ({
                unpaidAuctionIds: [auctionId],
                hasUnpaidAuctions: true,
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

      await adminClearUnpaidAuction(userId, auctionId, adminId);

      expect(mockRunTransaction).toHaveBeenCalled();
    });

    it("should set hasUnpaidAuctions to false when last auction cleared", async () => {
      const userId = "user123";
      const auctionId = "auction123";
      const adminId = "admin123";

      let capturedUpdate: any = null;

      const accountRef = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({}),
        }),
      };

      mockDoc.mockReturnValue(accountRef);

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest
            .fn()
            .mockResolvedValueOnce({
              data: () => ({
                unpaidAuctionIds: [auctionId],
                hasUnpaidAuctions: true,
              }),
            })
            .mockResolvedValueOnce({
              exists: false,
            }),
          set: jest.fn(),
          update: jest.fn((ref, data) => {
            capturedUpdate = data;
          }),
          delete: jest.fn(),
        };

        return callback(mockTransaction);
      });

      await adminClearUnpaidAuction(userId, auctionId, adminId);

      expect(capturedUpdate.hasUnpaidAuctions).toBe(false);
      expect(capturedUpdate.unpaidAuctionIds).toEqual([]);
    });
  });

  describe("getAdminUserDetails", () => {
    it("should get user account details", async () => {
      const userId = "user123";
      const mockAccountData = {
        availableBalance: 1000,
        blockedBalance: 500,
        lifetimePurchases: 10000,
        lifetimeSpent: 5000,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        strikes: 0,
        isBlocked: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccountData,
        }),
      });

      const result = await getAdminUserDetails(userId);

      expect(result).toEqual({
        userId,
        ...mockAccountData,
      });
    });

    it("should return null when account does not exist", async () => {
      const userId = "user123";

      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      });

      const result = await getAdminUserDetails(userId);

      expect(result).toBeNull();
    });

    it("should use correct collection and document", async () => {
      const userId = "user123";

      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      });

      await getAdminUserDetails(userId);

      expect(mockCollection).toHaveBeenCalledWith(
        COLLECTIONS.RIPLIMIT_ACCOUNTS
      );
      expect(mockDoc).toHaveBeenCalledWith(userId);
    });
  });

  describe("listAllAccounts", () => {
    it("should list all accounts without filter", async () => {
      const mockAccounts = [
        {
          id: "user1",
          data: () => ({
            availableBalance: 1000,
            blockedBalance: 0,
          }),
        },
        {
          id: "user2",
          data: () => ({
            availableBalance: 2000,
            blockedBalance: 500,
          }),
        },
      ];

      mockGet.mockResolvedValue({
        docs: mockAccounts,
      });

      const result = await listAllAccounts();

      expect(result.accounts).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.accounts[0].userId).toBe("user1");
      expect(result.accounts[1].userId).toBe("user2");
    });

    it("should filter by unpaid auctions", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      await listAllAccounts({ filter: "unpaid" });

      expect(mockWhere).toHaveBeenCalledWith("hasUnpaidAuctions", "==", true);
    });

    it("should filter by blocked status", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      await listAllAccounts({ filter: "blocked" });

      expect(mockWhere).toHaveBeenCalledWith("isBlocked", "==", true);
    });

    it("should apply pagination with offset", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      await listAllAccounts({ offset: 10 });

      expect(mockOffset).toHaveBeenCalledWith(10);
    });

    it("should apply pagination with limit", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      await listAllAccounts({ limit: 20 });

      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it("should apply pagination with both offset and limit", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      await listAllAccounts({ offset: 5, limit: 15 });

      expect(mockOffset).toHaveBeenCalledWith(5);
      expect(mockLimit).toHaveBeenCalledWith(15);
    });

    it("should order by createdAt desc", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      await listAllAccounts();

      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
    });

    it("should map account IDs correctly", async () => {
      const mockAccounts = [
        {
          id: "mapped-user-123",
          data: () => ({
            availableBalance: 1000,
            blockedBalance: 0,
          }),
        },
      ];

      mockGet.mockResolvedValue({
        docs: mockAccounts,
      });

      const result = await listAllAccounts();

      expect(result.accounts[0].userId).toBe("mapped-user-123");
    });

    it("should return empty array when no accounts", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      const result = await listAllAccounts();

      expect(result.accounts).toEqual([]);
      expect(result.total).toBe(50);
    });

    it("should handle filter with pagination", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      await listAllAccounts({
        filter: "unpaid",
        offset: 10,
        limit: 5,
      });

      expect(mockWhere).toHaveBeenCalledWith("hasUnpaidAuctions", "==", true);
      expect(mockOffset).toHaveBeenCalledWith(10);
      expect(mockLimit).toHaveBeenCalledWith(5);
    });
  });
});
