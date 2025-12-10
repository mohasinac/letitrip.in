/**
 * Unit Tests for RipLimit Account Operations
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS, SUBCOLLECTIONS } from "@/constants/database";
import type { RipLimitAccountBE } from "@/types/backend/riplimit.types";
import {
  addStrike,
  getBalanceDetails,
  getBlockedBids,
  getOrCreateAccount,
  markAuctionUnpaid,
} from "../account";

jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/lib/firebase/timestamp-helpers", () => ({
  nowAsFirebaseTimestamp: jest.fn(() => ({
    seconds: 1234567890,
    nanoseconds: 0,
  })),
}));

describe("RipLimit - Account Operations", () => {
  let mockDb: any;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDoc = jest.fn();
    mockCollection = jest.fn(() => ({ doc: mockDoc }));

    mockDb = {
      collection: mockCollection,
      runTransaction: jest.fn(),
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("getOrCreateAccount", () => {
    it("should return existing account", async () => {
      const existingAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 500,
        blockedBalance: 100,
        lifetimePurchases: 1000,
        lifetimeSpent: 400,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        strikes: 0,
        isBlocked: false,
        createdAt: { seconds: 1000000000, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1000000000, nanoseconds: 0 } as any,
      };

      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => existingAccount,
        }),
      });

      const result = await getOrCreateAccount("user123");

      expect(result).toEqual({
        userId: "user123",
        ...existingAccount,
      });
      expect(mockCollection).toHaveBeenCalledWith(
        COLLECTIONS.RIPLIMIT_ACCOUNTS
      );
      expect(mockDoc).toHaveBeenCalledWith("user123");
    });

    it("should create new account if not exists", async () => {
      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
        set: jest.fn().mockResolvedValue(undefined),
      };

      mockDoc.mockReturnValue(mockAccountRef);

      const result = await getOrCreateAccount("newUser");

      expect(mockAccountRef.set).toHaveBeenCalledWith({
        availableBalance: 0,
        blockedBalance: 0,
        lifetimePurchases: 0,
        lifetimeSpent: 0,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        strikes: 0,
        isBlocked: false,
        createdAt: { seconds: 1234567890, nanoseconds: 0 },
        updatedAt: { seconds: 1234567890, nanoseconds: 0 },
      });

      expect(result.userId).toBe("newUser");
      expect(result.availableBalance).toBe(0);
      expect(result.blockedBalance).toBe(0);
    });

    it("should handle database errors gracefully", async () => {
      mockDoc.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(getOrCreateAccount("user123")).rejects.toThrow(
        "Database error"
      );
    });

    it("should create account with all required fields", async () => {
      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn().mockResolvedValue(undefined),
      };

      mockDoc.mockReturnValue(mockAccountRef);

      const result = await getOrCreateAccount("user456");

      expect(result).toMatchObject({
        userId: "user456",
        availableBalance: 0,
        blockedBalance: 0,
        lifetimePurchases: 0,
        lifetimeSpent: 0,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        strikes: 0,
        isBlocked: false,
      });
    });
  });

  describe("getBlockedBids", () => {
    it("should return empty array when no blocked bids", async () => {
      const mockSubcollection = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      mockDoc.mockReturnValue({
        collection: mockSubcollection,
      });

      const result = await getBlockedBids("user123");

      expect(result).toEqual([]);
      expect(mockSubcollection).toHaveBeenCalledWith(
        SUBCOLLECTIONS.RIPLIMIT_BLOCKED_BIDS
      );
    });

    it("should return all blocked bids", async () => {
      const mockBids = [
        {
          id: "auction1",
          data: () => ({
            bidId: "bid1",
            amount: 100,
            bidAmountINR: 1000,
            createdAt: { seconds: 1234567890, nanoseconds: 0 },
          }),
        },
        {
          id: "auction2",
          data: () => ({
            bidId: "bid2",
            amount: 200,
            bidAmountINR: 2000,
            createdAt: { seconds: 1234567891, nanoseconds: 0 },
          }),
        },
      ];

      const mockSubcollection = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockBids,
        }),
      });

      mockDoc.mockReturnValue({
        collection: mockSubcollection,
      });

      const result = await getBlockedBids("user123");

      expect(result).toEqual([
        {
          auctionId: "auction1",
          bidId: "bid1",
          amount: 100,
          bidAmountINR: 1000,
          createdAt: { seconds: 1234567890, nanoseconds: 0 },
        },
        {
          auctionId: "auction2",
          bidId: "bid2",
          amount: 200,
          bidAmountINR: 2000,
          createdAt: { seconds: 1234567891, nanoseconds: 0 },
        },
      ]);
    });

    it("should handle database errors", async () => {
      const mockSubcollection = jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error("Firestore error")),
      });

      mockDoc.mockReturnValue({
        collection: mockSubcollection,
      });

      await expect(getBlockedBids("user123")).rejects.toThrow(
        "Firestore error"
      );
    });
  });

  describe("getBalanceDetails", () => {
    it("should return complete balance details with no blocked bids", async () => {
      const mockAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 500,
        blockedBalance: 100,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        isBlocked: false,
      };

      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccount,
        }),
      };

      const mockSubcollection = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [] }),
      });

      mockDoc.mockReturnValue({
        ...mockAccountRef,
        collection: mockSubcollection,
      });

      const result = await getBalanceDetails("user123");

      expect(result).toEqual({
        availableBalance: 500,
        blockedBalance: 100,
        totalBalance: 600,
        availableBalanceINR: 25, // 500 / 20
        blockedBalanceINR: 5, // 100 / 20
        totalBalanceINR: 30, // 600 / 20
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        isBlocked: false,
        blockedBids: [],
      });
    });

    it("should include blocked bids in response", async () => {
      const mockAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 500,
        blockedBalance: 300,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        isBlocked: false,
      };

      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccount,
        }),
      };

      const mockBids = [
        {
          id: "auction1",
          data: () => ({
            bidId: "bid1",
            amount: 100,
            bidAmountINR: 1000,
            createdAt: { seconds: 1234567890, nanoseconds: 0 },
          }),
        },
        {
          id: "auction2",
          data: () => ({
            bidId: "bid2",
            amount: 200,
            bidAmountINR: 2000,
            createdAt: { seconds: 1234567891, nanoseconds: 0 },
          }),
        },
      ];

      const mockSubcollection = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: mockBids }),
      });

      mockDoc.mockReturnValue({
        ...mockAccountRef,
        collection: mockSubcollection,
      });

      const result = await getBalanceDetails("user123");

      expect(result.blockedBids).toEqual([
        {
          auctionId: "auction1",
          bidId: "bid1",
          amount: 100,
          bidAmountINR: 1000,
        },
        {
          auctionId: "auction2",
          bidId: "bid2",
          amount: 200,
          bidAmountINR: 2000,
        },
      ]);
    });

    it("should handle unpaid auctions flag", async () => {
      const mockAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 500,
        blockedBalance: 100,
        hasUnpaidAuctions: true,
        unpaidAuctionIds: ["auction1", "auction2"],
        isBlocked: false,
      };

      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccount,
        }),
      };

      mockDoc.mockReturnValue({
        ...mockAccountRef,
        collection: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        }),
      });

      const result = await getBalanceDetails("user123");

      expect(result.hasUnpaidAuctions).toBe(true);
      expect(result.unpaidAuctionIds).toEqual(["auction1", "auction2"]);
    });

    it("should handle blocked account", async () => {
      const mockAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 0,
        blockedBalance: 0,
        hasUnpaidAuctions: true,
        unpaidAuctionIds: ["auction1", "auction2", "auction3"],
        isBlocked: true,
      };

      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccount,
        }),
      };

      mockDoc.mockReturnValue({
        ...mockAccountRef,
        collection: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        }),
      });

      const result = await getBalanceDetails("user123");

      expect(result.isBlocked).toBe(true);
    });

    it("should calculate INR values correctly", async () => {
      const mockAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 1234,
        blockedBalance: 5678,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        isBlocked: false,
      };

      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccount,
        }),
      };

      mockDoc.mockReturnValue({
        ...mockAccountRef,
        collection: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        }),
      });

      const result = await getBalanceDetails("user123");

      expect(result.availableBalanceINR).toBe(61.7); // 1234 / 20
      expect(result.blockedBalanceINR).toBe(283.9); // 5678 / 20
      expect(result.totalBalanceINR).toBe(345.6); // 6912 / 20
    });
  });

  describe("markAuctionUnpaid", () => {
    it("should mark auction as unpaid", async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);

      mockDoc.mockReturnValue({
        update: mockUpdate,
      });

      await markAuctionUnpaid("user123", "auction456");

      expect(mockUpdate).toHaveBeenCalledWith({
        hasUnpaidAuctions: true,
        unpaidAuctionIds: expect.any(Object), // FieldValue.arrayUnion
        updatedAt: expect.any(Object), // FieldValue.serverTimestamp
      });
    });

    it("should handle database errors", async () => {
      mockDoc.mockReturnValue({
        update: jest.fn().mockRejectedValue(new Error("Update failed")),
      });

      await expect(markAuctionUnpaid("user123", "auction456")).rejects.toThrow(
        "Update failed"
      );
    });

    it("should use correct collection and doc references", async () => {
      mockDoc.mockReturnValue({
        update: jest.fn().mockResolvedValue(undefined),
      });

      await markAuctionUnpaid("user789", "auction123");

      expect(mockCollection).toHaveBeenCalledWith(
        COLLECTIONS.RIPLIMIT_ACCOUNTS
      );
      expect(mockDoc).toHaveBeenCalledWith("user789");
    });
  });

  describe("addStrike", () => {
    it("should add strike and not block user (1 strike)", async () => {
      const mockAccount = {
        strikes: 0,
        isBlocked: false,
      };

      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const mockT = {
          get: jest.fn().mockResolvedValue({
            data: () => mockAccount,
          }),
          update: jest.fn().mockResolvedValue(undefined),
        };

        return await callback(mockT);
      });

      const result = await addStrike("user123");

      expect(result).toEqual({
        strikes: 1,
        isBlocked: false,
      });
    });

    it("should add strike and not block user (2 strikes)", async () => {
      const mockAccount = {
        strikes: 1,
        isBlocked: false,
      };

      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const mockT = {
          get: jest.fn().mockResolvedValue({
            data: () => mockAccount,
          }),
          update: jest.fn().mockResolvedValue(undefined),
        };

        return await callback(mockT);
      });

      const result = await addStrike("user123");

      expect(result).toEqual({
        strikes: 2,
        isBlocked: false,
      });
    });

    it("should add strike and block user at 3 strikes", async () => {
      const mockAccount = {
        strikes: 2,
        isBlocked: false,
      };

      let updatePayload: any;

      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const mockT = {
          get: jest.fn().mockResolvedValue({
            data: () => mockAccount,
          }),
          update: jest.fn().mockImplementation((ref, payload) => {
            updatePayload = payload;
            return Promise.resolve();
          }),
        };

        return await callback(mockT);
      });

      const result = await addStrike("user123");

      expect(result).toEqual({
        strikes: 3,
        isBlocked: true,
      });

      expect(updatePayload).toMatchObject({
        strikes: 3,
        isBlocked: true,
        blockReason: "Too many unpaid auctions (3 strikes)",
      });
    });

    it("should not set blockReason when not blocking", async () => {
      const mockAccount = {
        strikes: 0,
        isBlocked: false,
      };

      let updatePayload: any;

      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const mockT = {
          get: jest.fn().mockResolvedValue({
            data: () => mockAccount,
          }),
          update: jest.fn().mockImplementation((ref, payload) => {
            updatePayload = payload;
            return Promise.resolve();
          }),
        };

        return await callback(mockT);
      });

      await addStrike("user123");

      expect(updatePayload.blockReason).toBeUndefined();
    });

    it("should handle transaction failures", async () => {
      mockDb.runTransaction.mockRejectedValue(new Error("Transaction failed"));

      await expect(addStrike("user123")).rejects.toThrow("Transaction failed");
    });

    it("should use correct collection reference", async () => {
      const mockAccount = {
        strikes: 0,
        isBlocked: false,
      };

      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const mockT = {
          get: jest.fn().mockResolvedValue({
            data: () => mockAccount,
          }),
          update: jest.fn().mockResolvedValue(undefined),
        };

        await callback(mockT);
      });

      await addStrike("user456");

      expect(mockCollection).toHaveBeenCalledWith(
        COLLECTIONS.RIPLIMIT_ACCOUNTS
      );
      expect(mockDoc).toHaveBeenCalledWith("user456");
    });

    it("should increment from existing strikes", async () => {
      const mockAccount = {
        strikes: 10,
        isBlocked: true,
      };

      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const mockT = {
          get: jest.fn().mockResolvedValue({
            data: () => mockAccount,
          }),
          update: jest.fn().mockResolvedValue(undefined),
        };

        return await callback(mockT);
      });

      const result = await addStrike("user123");

      expect(result.strikes).toBe(11);
      expect(result.isBlocked).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero balance account", async () => {
      const mockAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 0,
        blockedBalance: 0,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        isBlocked: false,
      };

      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccount,
        }),
      };

      mockDoc.mockReturnValue({
        ...mockAccountRef,
        collection: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        }),
      });

      const result = await getBalanceDetails("user123");

      expect(result.totalBalance).toBe(0);
      expect(result.totalBalanceINR).toBe(0);
    });

    it("should handle large balance values", async () => {
      const mockAccount: Partial<RipLimitAccountBE> = {
        availableBalance: 999999999,
        blockedBalance: 888888888,
        hasUnpaidAuctions: false,
        unpaidAuctionIds: [],
        isBlocked: false,
      };

      const mockAccountRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAccount,
        }),
      };

      mockDoc.mockReturnValue({
        ...mockAccountRef,
        collection: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        }),
      });

      const result = await getBalanceDetails("user123");

      expect(result.totalBalance).toBe(1888888887);
    });

    it("should handle empty userId", async () => {
      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
        set: jest.fn().mockResolvedValue(undefined),
      });

      const result = await getOrCreateAccount("");

      expect(result.userId).toBe("");
    });
  });
});
