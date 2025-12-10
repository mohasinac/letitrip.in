/**
 * Unit Tests: Firestore Transactions
 * File: src/app/api/lib/firebase/transactions.ts
 */

import {
  arrayRemove,
  arrayUnion,
  createBatch,
  createOrderWithItems,
  decrement,
  deleteField,
  increment,
  placeBid,
  processRefund,
  runTransaction,
  serverTimestamp,
  transferCartToOrder,
  updateProductStock,
} from "@/app/api/lib/firebase/transactions";

// Mock firebase admin
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(),
}));

jest.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    increment: jest.fn((val) => ({ _increment: val })),
    arrayUnion: jest.fn((...elements) => ({ _arrayUnion: elements })),
    arrayRemove: jest.fn((...elements) => ({ _arrayRemove: elements })),
    serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
    delete: jest.fn(() => ({ _delete: true })),
  },
}));

describe("Firestore Transactions", () => {
  let mockDb: any;
  let mockTransaction: any;
  let mockBatch: any;
  let mockDocRef: any;
  let mockDocSnap: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDocSnap = {
      exists: true,
      id: "doc123",
      data: jest.fn(() => ({ stock: 100, status: "active" })),
      ref: { id: "doc123", path: "collection/doc123" },
    };

    mockDocRef = {
      get: jest.fn(() => Promise.resolve(mockDocSnap)),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTransaction = {
      get: jest.fn(() => Promise.resolve(mockDocSnap)),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockBatch = {
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(() => Promise.resolve()),
    };

    let docCounter = 0;
    const mockCollection = {
      doc: jest.fn((id?: string) => {
        const docId = id || `generated_doc_${++docCounter}`;
        return {
          ...mockDocRef,
          id: docId,
          collection: jest.fn(() => mockCollection),
        };
      }),
      where: jest.fn(() => mockCollection),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
      runTransaction: jest.fn(async (callback) => {
        const result = await callback(mockTransaction);
        return result;
      }),
      batch: jest.fn(() => mockBatch),
    };

    const { getFirestoreAdmin } = require("@/app/api/lib/firebase/admin");
    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("runTransaction", () => {
    it("should execute transaction callback", async () => {
      const callback = jest.fn(async (t) => "success");

      const result = await runTransaction(callback);

      expect(mockDb.runTransaction).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(mockTransaction);
      expect(result).toBe("success");
    });

    it("should return callback result", async () => {
      const result = await runTransaction(async () => ({
        id: "123",
        value: 456,
      }));

      expect(result).toEqual({ id: "123", value: 456 });
    });

    it("should handle transaction errors", async () => {
      const error = new Error("Transaction failed");
      mockDb.runTransaction.mockRejectedValue(error);

      await expect(runTransaction(async () => {})).rejects.toThrow(
        "Transaction failed"
      );
    });
  });

  describe("createBatch", () => {
    it("should create a batch", () => {
      const batch = createBatch();

      expect(mockDb.batch).toHaveBeenCalled();
      expect(batch).toBe(mockBatch);
    });

    it("should return batch with write operations", () => {
      const batch = createBatch();

      expect(batch).toHaveProperty("set");
      expect(batch).toHaveProperty("update");
      expect(batch).toHaveProperty("delete");
      expect(batch).toHaveProperty("commit");
    });
  });

  describe("Field Value Helpers", () => {
    it("increment should create increment value", () => {
      const { FieldValue } = require("firebase-admin/firestore");

      const result = increment(5);

      expect(FieldValue.increment).toHaveBeenCalledWith(5);
      expect(result).toEqual({ _increment: 5 });
    });

    it("decrement should create negative increment", () => {
      const { FieldValue } = require("firebase-admin/firestore");

      const result = decrement(3);

      expect(FieldValue.increment).toHaveBeenCalledWith(-3);
      expect(result).toEqual({ _increment: -3 });
    });

    it("arrayUnion should add elements to array", () => {
      const { FieldValue } = require("firebase-admin/firestore");

      const result = arrayUnion("a", "b", "c");

      expect(FieldValue.arrayUnion).toHaveBeenCalledWith("a", "b", "c");
      expect(result).toEqual({ _arrayUnion: ["a", "b", "c"] });
    });

    it("arrayRemove should remove elements from array", () => {
      const { FieldValue } = require("firebase-admin/firestore");

      const result = arrayRemove("x", "y");

      expect(FieldValue.arrayRemove).toHaveBeenCalledWith("x", "y");
      expect(result).toEqual({ _arrayRemove: ["x", "y"] });
    });

    it("serverTimestamp should create server timestamp", () => {
      const { FieldValue } = require("firebase-admin/firestore");

      const result = serverTimestamp();

      expect(FieldValue.serverTimestamp).toHaveBeenCalled();
      expect(result).toEqual({ _serverTimestamp: true });
    });

    it("deleteField should create delete sentinel", () => {
      const { FieldValue } = require("firebase-admin/firestore");

      const result = deleteField();

      expect(FieldValue.delete).toHaveBeenCalled();
      expect(result).toEqual({ _delete: true });
    });
  });

  describe("createOrderWithItems", () => {
    it("should create order with items atomically", async () => {
      const orderData = { user_id: "user123" };
      const items = [
        { product_id: "prod1", quantity: 2, price: 10 },
        { product_id: "prod2", quantity: 1, price: 20 },
      ];

      // Mock runTransaction to execute callback and return result
      const mockOrderId = "order123";
      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const result = await callback(mockTransaction);
        return result;
      });
      mockDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ id: mockOrderId }),
      } as any);

      const orderId = await createOrderWithItems(orderData, items);

      expect(orderId).toBeDefined();
      expect(mockTransaction.set).toHaveBeenCalled();
    });

    it("should set order data with timestamps", async () => {
      await createOrderWithItems({ user_id: "user123" }, []);

      const setCall = mockTransaction.set.mock.calls[0];
      expect(setCall[1]).toHaveProperty("user_id", "user123");
      expect(setCall[1]).toHaveProperty("created_at");
      expect(setCall[1]).toHaveProperty("updated_at");
    });

    it("should create order items with order_id", async () => {
      const items = [{ product_id: "p1", quantity: 1 }];

      await createOrderWithItems({}, items);

      // First set is order, subsequent sets are items
      expect(mockTransaction.set).toHaveBeenCalledTimes(2);
      const itemCall = mockTransaction.set.mock.calls[1];
      expect(itemCall[1]).toHaveProperty("order_id");
      expect(itemCall[1]).toHaveProperty("product_id", "p1");
    });

    it("should handle empty items array", async () => {
      const mockOrderId = "order123";
      mockDb.runTransaction.mockImplementation(async (callback: any) => {
        const result = await callback(mockTransaction);
        return result;
      });
      mockDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ id: mockOrderId }),
      } as any);

      const orderId = await createOrderWithItems({ user_id: "user123" }, []);

      expect(orderId).toBeDefined();
      expect(mockTransaction.set).toHaveBeenCalledTimes(1); // Only order
    });

    it("should handle multiple items", async () => {
      const items = Array(5).fill({ product_id: "p1", quantity: 1 });

      await createOrderWithItems({}, items);

      expect(mockTransaction.set).toHaveBeenCalledTimes(6); // 1 order + 5 items
    });
  });

  describe("updateProductStock", () => {
    it("should update stock atomically", async () => {
      mockDocSnap.data.mockReturnValue({ stock: 100 });

      await updateProductStock("product123", -5);

      expect(mockTransaction.get).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1]).toHaveProperty("stock", 95);
    });

    it("should handle stock increase", async () => {
      mockDocSnap.data.mockReturnValue({ stock: 50 });

      await updateProductStock("product123", 25);

      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1].stock).toBe(75);
    });

    it("should throw error if product not found", async () => {
      mockDocSnap.exists = false;

      await expect(updateProductStock("nonexistent", 10)).rejects.toThrow(
        "Product not found"
      );
    });

    it("should throw error if insufficient stock", async () => {
      mockDocSnap.data.mockReturnValue({ stock: 5 });

      await expect(updateProductStock("product123", -10)).rejects.toThrow(
        "Insufficient stock"
      );
    });

    it("should handle stock = 0", async () => {
      mockDocSnap.data.mockReturnValue({ stock: 10 });

      await updateProductStock("product123", -10);

      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1].stock).toBe(0);
    });

    it("should handle missing stock field (default to 0)", async () => {
      mockDocSnap.data.mockReturnValue({});

      await updateProductStock("product123", 5);

      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1].stock).toBe(5);
    });

    it("should add updated_at timestamp", async () => {
      await updateProductStock("product123", 5);

      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1]).toHaveProperty("updated_at");
    });
  });

  describe("placeBid", () => {
    it("should place bid atomically", async () => {
      mockDocSnap.data.mockReturnValue({ current_bid: 100, starting_bid: 50 });
      // First call returns auction doc, second call returns bids query
      mockTransaction.get
        .mockResolvedValueOnce(mockDocSnap)
        .mockResolvedValueOnce({
          docs: [],
          empty: true,
        });

      const bidId = await placeBid("auction123", "user456", 150);

      expect(bidId).toBeDefined();
      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should validate bid is higher than current bid", async () => {
      mockDocSnap.data.mockReturnValue({ current_bid: 100 });

      await expect(placeBid("auction123", "user456", 90)).rejects.toThrow(
        "Bid amount must be higher than current bid"
      );
    });

    it("should throw error if auction not found", async () => {
      mockDocSnap.exists = false;

      await expect(placeBid("nonexistent", "user456", 100)).rejects.toThrow(
        "Auction not found"
      );
    });

    it("should create bid with correct data", async () => {
      mockDocSnap.data.mockReturnValue({ current_bid: 100 });
      mockTransaction.get
        .mockResolvedValueOnce(mockDocSnap)
        .mockResolvedValueOnce({ docs: [], empty: true });

      await placeBid("auction123", "user456", 150);

      const setCall = mockTransaction.set.mock.calls[0];
      expect(setCall[1]).toMatchObject({
        auction_id: "auction123",
        user_id: "user456",
        amount: 150,
        is_winning: true,
      });
    });

    it("should update auction with new bid", async () => {
      mockDocSnap.data.mockReturnValue({ current_bid: 100 });
      mockTransaction.get
        .mockResolvedValueOnce(mockDocSnap)
        .mockResolvedValueOnce({ docs: [], empty: true });

      await placeBid("auction123", "user456", 150);

      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1]).toHaveProperty("current_bid", 150);
      expect(updateCall[1]).toHaveProperty("bid_count");
    });

    it("should mark previous winning bids as non-winning", async () => {
      mockDocSnap.data.mockReturnValue({ current_bid: 100 });
      const previousBids = {
        docs: [
          { ref: { id: "bid1" }, data: () => ({ is_winning: true }) },
          { ref: { id: "bid2" }, data: () => ({ is_winning: true }) },
        ],
        empty: false,
      };
      mockTransaction.get
        .mockResolvedValueOnce(mockDocSnap)
        .mockResolvedValueOnce(previousBids);

      await placeBid("auction123", "user456", 150);

      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should use starting_bid if no current_bid", async () => {
      mockDocSnap.data.mockReturnValue({ starting_bid: 50 });
      mockTransaction.get
        .mockResolvedValueOnce(mockDocSnap)
        .mockResolvedValueOnce({ docs: [], empty: true });

      await placeBid("auction123", "user456", 60);

      expect(mockTransaction.set).toHaveBeenCalled();
    });
  });

  describe("processRefund", () => {
    it("should process refund atomically", async () => {
      const refundId = await processRefund("return123", 50, {
        payment_method: "card",
      });

      expect(refundId).toBeDefined();
      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it("should throw error if return not found", async () => {
      mockDocSnap.exists = false;

      await expect(processRefund("nonexistent", 50, {})).rejects.toThrow(
        "Return not found"
      );
    });

    it("should create refund record", async () => {
      await processRefund("return123", 50, { payment_method: "card" });

      const setCall = mockTransaction.set.mock.calls[0];
      expect(setCall[1]).toMatchObject({
        return_id: "return123",
        amount: 50,
        status: "processing",
        payment_method: "card",
      });
    });

    it("should update return status", async () => {
      await processRefund("return123", 50, {});

      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1]).toMatchObject({
        status: "refund_processing",
        refund_amount: 50,
      });
    });

    it("should add timestamps", async () => {
      await processRefund("return123", 50, {});

      const setCall = mockTransaction.set.mock.calls[0];
      expect(setCall[1]).toHaveProperty("created_at");
      expect(setCall[1]).toHaveProperty("updated_at");
    });
  });

  describe("transferCartToOrder", () => {
    it("should transfer cart items to order", async () => {
      const cartItems = {
        docs: [
          {
            ref: { id: "cart1" },
            data: () => ({
              user_id: "user123",
              product_id: "p1",
              quantity: 2,
              price: 30,
              shop_id: "shop1",
            }),
          },
          {
            ref: { id: "cart2" },
            data: () => ({
              user_id: "user123",
              product_id: "p2",
              quantity: 1,
              price: 40,
              shop_id: "shop1",
            }),
          },
        ],
      };
      mockTransaction.get.mockResolvedValue(cartItems);

      await transferCartToOrder("user123", "order456");

      expect(mockTransaction.set).toHaveBeenCalledTimes(2);
      expect(mockTransaction.delete).toHaveBeenCalledTimes(2);
    });

    it("should create order items with correct data", async () => {
      const cartItems = {
        docs: [
          {
            ref: { id: "cart1" },
            data: () => ({
              product_id: "p1",
              quantity: 2,
              price: 30,
              shop_id: "shop1",
            }),
          },
        ],
      };
      mockTransaction.get.mockResolvedValue(cartItems);

      await transferCartToOrder("user123", "order456");

      const setCall = mockTransaction.set.mock.calls[0];
      expect(setCall[1]).toMatchObject({
        order_id: "order456",
        product_id: "p1",
        quantity: 2,
        price: 30,
        shop_id: "shop1",
      });
    });

    it("should handle empty cart", async () => {
      mockTransaction.get.mockResolvedValue({ docs: [] });

      await transferCartToOrder("user123", "order456");

      expect(mockTransaction.set).not.toHaveBeenCalled();
      expect(mockTransaction.delete).not.toHaveBeenCalled();
    });

    it("should delete all cart items", async () => {
      const cartItems = {
        docs: [
          { ref: { id: "cart1" }, data: () => ({ product_id: "p1" }) },
          { ref: { id: "cart2" }, data: () => ({ product_id: "p2" }) },
        ],
      };
      mockTransaction.get.mockResolvedValue(cartItems);

      await transferCartToOrder("user123", "order456");

      expect(mockTransaction.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large stock changes", async () => {
      mockDocSnap.data.mockReturnValue({ stock: 1000000 });

      await updateProductStock("product123", 500000);

      const updateCall = mockTransaction.update.mock.calls[0];
      expect(updateCall[1].stock).toBe(1500000);
    });

    it("should handle concurrent bid attempts", async () => {
      mockDocSnap.data.mockReturnValue({ current_bid: 100 });
      mockTransaction.get.mockResolvedValue(mockDocSnap);
      mockTransaction.get.mockImplementation((ref: any) => {
        // If it's a query (has docs property expected), return query result
        if (ref && ref.where) {
          return Promise.resolve({ docs: [], empty: true });
        }
        // Otherwise return auction doc
        return Promise.resolve(mockDocSnap);
      });

      const promises = [
        placeBid("auction123", "user1", 110),
        placeBid("auction123", "user2", 120),
      ];

      await Promise.all(promises);

      expect(mockTransaction.set).toHaveBeenCalledTimes(2);
    });

    it("should handle large order with many items", async () => {
      const items = Array(100).fill({ product_id: "p1", quantity: 1 });

      await createOrderWithItems({}, items);

      expect(mockTransaction.set).toHaveBeenCalledTimes(101);
    });

    it("should handle zero refund amount", async () => {
      await processRefund("return123", 0, {});

      const setCall = mockTransaction.set.mock.calls[0];
      expect(setCall[1].amount).toBe(0);
    });
  });
});
