/**
 * Unit Tests for Firebase Transaction Helpers
 * Comprehensive testing of atomic operations and batch writes
 */

import { COLLECTIONS } from "@/constants/database";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "../admin";
import {
  arrayRemove,
  arrayUnion,
  createBatch,
  createOrderWithItems,
  decrement,
  deleteField,
  increment,
  placeBid,
  runTransaction,
  serverTimestamp,
  updateProductStock,
} from "../transactions";

// Mock dependencies
jest.mock("../admin");

describe("Firebase Transactions", () => {
  let mockDb: any;
  let mockTransaction: any;
  let mockBatch: any;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransaction = {
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockBatch = {
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(),
    };

    mockDoc = jest.fn(() => ({
      id: "mock_doc_id",
    }));

    mockCollection = jest.fn(() => ({
      doc: mockDoc,
      where: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        get: jest.fn(),
      })),
    }));

    mockDb = {
      runTransaction: jest.fn((callback) => callback(mockTransaction)),
      batch: jest.fn(() => mockBatch),
      collection: mockCollection,
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("runTransaction", () => {
    it("should execute transaction callback", async () => {
      const callback = jest.fn().mockResolvedValue("result");

      const result = await runTransaction(callback);

      expect(mockDb.runTransaction).toHaveBeenCalledWith(callback);
      expect(callback).toHaveBeenCalledWith(mockTransaction);
      expect(result).toBe("result");
    });

    it("should handle transaction errors", async () => {
      const callback = jest
        .fn()
        .mockRejectedValue(new Error("Transaction failed"));

      await expect(runTransaction(callback)).rejects.toThrow(
        "Transaction failed"
      );
    });

    it("should pass transaction object to callback", async () => {
      const callback = jest.fn(async (t) => {
        expect(t).toBe(mockTransaction);
        return "success";
      });

      await runTransaction(callback);

      expect(callback).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe("createBatch", () => {
    it("should create a batch write instance", () => {
      const batch = createBatch();

      expect(mockDb.batch).toHaveBeenCalled();
      expect(batch).toBe(mockBatch);
    });

    it("should return new batch instance each time", () => {
      const batch1 = createBatch();
      const batch2 = createBatch();

      expect(mockDb.batch).toHaveBeenCalledTimes(2);
    });
  });

  describe("FieldValue helpers", () => {
    it("increment should use FieldValue.increment", () => {
      const result = increment(5);

      expect(result).toEqual(FieldValue.increment(5));
    });

    it("decrement should use FieldValue.increment with negative value", () => {
      const result = decrement(3);

      expect(result).toEqual(FieldValue.increment(-3));
    });

    it("arrayUnion should use FieldValue.arrayUnion", () => {
      const result = arrayUnion("item1", "item2");

      expect(result).toEqual(FieldValue.arrayUnion("item1", "item2"));
    });

    it("arrayRemove should use FieldValue.arrayRemove", () => {
      const result = arrayRemove("item1", "item2");

      expect(result).toEqual(FieldValue.arrayRemove("item1", "item2"));
    });

    it("serverTimestamp should use FieldValue.serverTimestamp", () => {
      const result = serverTimestamp();

      expect(result).toEqual(FieldValue.serverTimestamp());
    });

    it("deleteField should use FieldValue.delete", () => {
      const result = deleteField();

      expect(result).toEqual(FieldValue.delete());
    });

    it("increment should handle negative numbers", () => {
      const result = increment(-10);

      expect(result).toEqual(FieldValue.increment(-10));
    });

    it("decrement should handle negative numbers (double negative = positive)", () => {
      const result = decrement(-5);

      expect(result).toEqual(FieldValue.increment(5));
    });

    it("arrayUnion should handle single element", () => {
      const result = arrayUnion("single");

      expect(result).toEqual(FieldValue.arrayUnion("single"));
    });

    it("arrayRemove should handle single element", () => {
      const result = arrayRemove("single");

      expect(result).toEqual(FieldValue.arrayRemove("single"));
    });

    it("arrayUnion should handle multiple elements", () => {
      const result = arrayUnion("a", "b", "c", "d");

      expect(result).toEqual(FieldValue.arrayUnion("a", "b", "c", "d"));
    });

    it("arrayRemove should handle multiple elements", () => {
      const result = arrayRemove("a", "b", "c");

      expect(result).toEqual(FieldValue.arrayRemove("a", "b", "c"));
    });
  });

  describe("createOrderWithItems", () => {
    it("should create order and order items atomically", async () => {
      mockDoc.mockReturnValue({ id: "order_123" });

      const orderData = {
        user_id: "user123",
        total: 100,
        status: "pending",
      };

      const orderItems = [
        { product_id: "prod1", quantity: 2, price: 50 },
        { product_id: "prod2", quantity: 1, price: 50 },
      ];

      const orderId = await createOrderWithItems(orderData, orderItems);

      expect(orderId).toBe("order_123");
      expect(mockTransaction.set).toHaveBeenCalledTimes(3); // 1 order + 2 items
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.ORDERS);
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.ORDER_ITEMS);
    });

    it("should add timestamps to order and items", async () => {
      mockDoc.mockReturnValue({ id: "order_456" });

      const orderData = { total: 200 };
      const orderItems = [{ product_id: "prod1", quantity: 1 }];

      await createOrderWithItems(orderData, orderItems);

      const orderSetCall = mockTransaction.set.mock.calls[0][1];
      expect(orderSetCall).toHaveProperty("created_at");
      expect(orderSetCall).toHaveProperty("updated_at");

      const itemSetCall = mockTransaction.set.mock.calls[1][1];
      expect(itemSetCall).toHaveProperty("created_at");
      expect(itemSetCall).toHaveProperty("updated_at");
    });

    it("should add order_id to each order item", async () => {
      mockDoc.mockReturnValue({ id: "order_789" });

      const orderItems = [
        { product_id: "prod1", quantity: 1 },
        { product_id: "prod2", quantity: 2 },
      ];

      await createOrderWithItems({}, orderItems);

      const item1SetCall = mockTransaction.set.mock.calls[1][1];
      const item2SetCall = mockTransaction.set.mock.calls[2][1];

      expect(item1SetCall).toHaveProperty("order_id", "order_789");
      expect(item2SetCall).toHaveProperty("order_id", "order_789");
    });

    it("should handle empty order items array", async () => {
      mockDoc.mockReturnValue({ id: "order_empty" });

      const orderId = await createOrderWithItems({}, []);

      expect(orderId).toBe("order_empty");
      expect(mockTransaction.set).toHaveBeenCalledTimes(1); // Only order
    });

    it("should handle transaction errors", async () => {
      mockDb.runTransaction.mockRejectedValue(new Error("Transaction failed"));

      await expect(createOrderWithItems({}, [])).rejects.toThrow(
        "Transaction failed"
      );
    });
  });

  describe("updateProductStock", () => {
    it("should update product stock successfully", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 10 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", 5);

      expect(mockTransaction.get).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          stock: 15,
        })
      );
    });

    it("should throw error when product not found", async () => {
      mockTransaction.get.mockResolvedValue({ exists: false });

      await expect(updateProductStock("nonexistent", 5)).rejects.toThrow(
        "Product not found"
      );
    });

    it("should throw error when insufficient stock", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 5 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await expect(updateProductStock("prod123", -10)).rejects.toThrow(
        "Insufficient stock"
      );
    });

    it("should handle negative quantity (stock decrease)", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 100 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", -20);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          stock: 80,
        })
      );
    });

    it("should handle positive quantity (stock increase)", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 50 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", 30);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          stock: 80,
        })
      );
    });

    it("should allow stock to reach exactly 0", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 10 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", -10);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          stock: 0,
        })
      );
    });

    it("should handle products with undefined stock as 0", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({}),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", 5);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          stock: 5,
        })
      );
    });

    it("should add updated_at timestamp", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 10 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", 5);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          updated_at: expect.anything(),
        })
      );
    });
  });

  describe("placeBid", () => {
    it("should place bid successfully", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({
          current_bid: 100,
          starting_bid: 50,
        }),
      };

      const mockPreviousBids = {
        docs: [{ ref: { id: "bid_old" } }],
      };

      mockTransaction.get
        .mockResolvedValueOnce(mockAuctionDoc)
        .mockResolvedValueOnce(mockPreviousBids);

      mockDoc.mockReturnValue({ id: "bid_new" });

      const bidId = await placeBid("auction123", "user123", 150);

      expect(bidId).toBe("bid_new");
      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalledTimes(2); // previous bid + auction
    });

    it("should throw error when auction not found", async () => {
      mockTransaction.get.mockResolvedValue({ exists: false });

      await expect(placeBid("nonexistent", "user123", 100)).rejects.toThrow(
        "Auction not found"
      );
    });

    it("should throw error when bid amount too low", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({
          current_bid: 100,
        }),
      };

      mockTransaction.get.mockResolvedValue(mockAuctionDoc);

      await expect(placeBid("auction123", "user123", 50)).rejects.toThrow(
        "Bid amount must be higher than current bid"
      );

      // Reset and test equal bid
      mockTransaction.get.mockResolvedValue(mockAuctionDoc);

      await expect(placeBid("auction123", "user123", 100)).rejects.toThrow(
        "Bid amount must be higher than current bid"
      );
    });

    it("should use starting_bid when current_bid not set", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({
          starting_bid: 50,
        }),
      };

      mockTransaction.get
        .mockResolvedValueOnce(mockAuctionDoc)
        .mockResolvedValueOnce({ docs: [] });

      mockDoc.mockReturnValue({ id: "bid_first" });

      await placeBid("auction123", "user123", 60);

      expect(mockTransaction.set).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          auction_id: "auction123",
          user_id: "user123",
          amount: 60,
          is_winning: true,
        })
      );
    });

    it("should mark previous winning bids as non-winning", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({ current_bid: 100 }),
      };

      const mockPreviousBids = {
        docs: [{ ref: { id: "bid1" } }, { ref: { id: "bid2" } }],
      };

      mockTransaction.get
        .mockResolvedValueOnce(mockAuctionDoc)
        .mockResolvedValueOnce(mockPreviousBids);

      mockDoc.mockReturnValue({ id: "bid_new" });

      await placeBid("auction123", "user123", 150);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        { id: "bid1" },
        { is_winning: false }
      );
      expect(mockTransaction.update).toHaveBeenCalledWith(
        { id: "bid2" },
        { is_winning: false }
      );
    });

    it("should increment auction bid_count", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({ current_bid: 100 }),
      };

      mockTransaction.get
        .mockResolvedValueOnce(mockAuctionDoc)
        .mockResolvedValueOnce({ docs: [] });

      mockDoc.mockReturnValue({ id: "bid_new" });

      await placeBid("auction123", "user123", 150);

      // Find the auction update call
      const auctionUpdateCall = mockTransaction.update.mock.calls.find((call) =>
        call[1].hasOwnProperty("bid_count")
      );

      expect(auctionUpdateCall[1]).toHaveProperty("bid_count");
      expect(auctionUpdateCall[1]).toHaveProperty("current_bid", 150);
      expect(auctionUpdateCall[1]).toHaveProperty("updated_at");
    });

    it("should add created_at timestamp to new bid", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({ current_bid: 100 }),
      };

      mockTransaction.get
        .mockResolvedValueOnce(mockAuctionDoc)
        .mockResolvedValueOnce({ docs: [] });

      mockDoc.mockReturnValue({ id: "bid_new" });

      await placeBid("auction123", "user123", 150);

      expect(mockTransaction.set).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          created_at: expect.anything(),
        })
      );
    });
  });

  describe("Real Code Issues Found", () => {
    it("PATTERN: All helper functions use runTransaction internally", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 10 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", 5);

      expect(mockDb.runTransaction).toHaveBeenCalled();
    });

    it("PATTERN: All operations add timestamps using serverTimestamp()", async () => {
      mockDoc.mockReturnValue({ id: "order_123" });

      await createOrderWithItems({}, [{ product_id: "prod1" }]);

      const orderSetCall = mockTransaction.set.mock.calls[0][1];
      expect(orderSetCall.created_at).toEqual(serverTimestamp());
      expect(orderSetCall.updated_at).toEqual(serverTimestamp());
    });

    it("ISSUE: placeBid queries all previous winning bids instead of using single update", async () => {
      // This could be optimized with a single where query + batch update
      const mockAuctionDoc = {
        exists: true,
        data: () => ({ current_bid: 100 }),
      };

      mockTransaction.get
        .mockResolvedValueOnce(mockAuctionDoc)
        .mockResolvedValueOnce({ docs: [] });

      await placeBid("auction123", "user123", 150);

      // Current implementation queries for is_winning bids
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.BIDS);
    });

    it("SAFETY: Stock update prevents negative stock", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 5 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await expect(updateProductStock("prod123", -10)).rejects.toThrow(
        "Insufficient stock"
      );
    });

    it("SAFETY: Bid validation prevents equal or lower bids", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({ current_bid: 100 }),
      };

      mockTransaction.get.mockResolvedValue(mockAuctionDoc);

      await expect(placeBid("auction123", "user123", 100)).rejects.toThrow(
        "Bid amount must be higher than current bid"
      );

      await expect(placeBid("auction123", "user123", 50)).rejects.toThrow(
        "Bid amount must be higher than current bid"
      );
    });

    it("PATTERN: increment helper wraps FieldValue.increment", () => {
      const result = increment(10);

      expect(result).toEqual(FieldValue.increment(10));
    });

    it("PATTERN: decrement is implemented as increment with negative value", () => {
      const result = decrement(5);

      expect(result).toEqual(FieldValue.increment(-5));
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero quantity stock update", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 10 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", 0);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          stock: 10, // No change
        })
      );
    });

    it("should handle very large stock quantities", async () => {
      const mockProductDoc = {
        exists: true,
        data: () => ({ stock: 1000000 }),
      };

      mockTransaction.get.mockResolvedValue(mockProductDoc);

      await updateProductStock("prod123", 1000000);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          stock: 2000000,
        })
      );
    });

    it("should handle very large bid amounts", async () => {
      const mockAuctionDoc = {
        exists: true,
        data: () => ({ current_bid: 1000000 }),
      };

      mockTransaction.get
        .mockResolvedValueOnce(mockAuctionDoc)
        .mockResolvedValueOnce({ docs: [] });

      mockDoc.mockReturnValue({ id: "bid_huge" });

      await placeBid("auction123", "user123", 10000000);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          current_bid: 10000000,
        })
      );
    });

    it("should handle order with many items", async () => {
      mockDoc.mockReturnValue({ id: "order_large" });

      const orderItems = Array.from({ length: 100 }, (_, i) => ({
        product_id: `prod${i}`,
        quantity: 1,
      }));

      await createOrderWithItems({}, orderItems);

      expect(mockTransaction.set).toHaveBeenCalledTimes(101); // 1 order + 100 items
    });

    it("should handle arrayUnion with complex objects", () => {
      const complexObj = { id: 1, nested: { key: "value" } };
      const result = arrayUnion(complexObj);

      expect(result).toEqual(FieldValue.arrayUnion(complexObj));
    });

    it("should handle arrayRemove with complex objects", () => {
      const complexObj = { id: 1, nested: { key: "value" } };
      const result = arrayRemove(complexObj);

      expect(result).toEqual(FieldValue.arrayRemove(complexObj));
    });
  });
});
