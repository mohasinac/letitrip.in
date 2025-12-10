/**
 * Unit Tests for Batch Fetch Utilities
 * Tests batch document fetching to prevent N+1 query problems
 *
 * TESTS COVER:
 * - batchFetchDocuments generic functionality
 * - All collection-specific batch fetch functions
 * - Batch size limiting (Firestore 'in' query max 10)
 * - Duplicate ID handling
 * - Error handling and partial results
 * - Empty array handling
 * - Helper functions (mapToOrderedArray, chunkArray)
 * - Edge cases
 *
 * CODE ISSUES FOUND:
 * 1. No validation for invalid collection names
 * 2. Silent batch failures - continues even if batches fail
 * 3. No retry logic for failed batches
 * 4. Error logging could be more detailed for debugging
 * 5. No performance monitoring for slow queries
 * 6. Map results don't indicate which IDs failed
 */

import {
  batchFetchDocuments,
  batchGetAuctions,
  batchGetByCollection,
  batchGetCategories,
  batchGetCoupons,
  batchGetOrders,
  batchGetProducts,
  batchGetShops,
  batchGetUsers,
  chunkArray,
  mapToOrderedArray,
} from "@/app/api/lib/batch-fetch";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

// Mock dependencies
jest.mock("@/app/api/lib/firebase/admin");

const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<
  typeof getFirestoreAdmin
>;

describe("batch-fetch", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Firestore
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
  });

  describe("batchFetchDocuments - Core Functionality", () => {
    it("should fetch documents successfully", async () => {
      const mockDocs = [
        { id: "doc1", data: () => ({ name: "Doc 1" }) },
        { id: "doc2", data: () => ({ name: "Doc 2" }) },
      ];

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", [
        "doc1",
        "doc2",
      ]);

      expect(result.size).toBe(2);
      expect(result.get("doc1")).toEqual({ id: "doc1", name: "Doc 1" });
      expect(result.get("doc2")).toEqual({ id: "doc2", name: "Doc 2" });
    });

    it("should return empty map for empty ID array", async () => {
      const result = await batchFetchDocuments("test-collection", []);

      expect(result.size).toBe(0);
      expect(mockDb.collection).not.toHaveBeenCalled();
    });

    it("should use correct Firestore query", async () => {
      mockDb.get.mockResolvedValue({ docs: [] });

      await batchFetchDocuments("test-collection", ["doc1", "doc2"]);

      expect(mockDb.collection).toHaveBeenCalledWith("test-collection");
      expect(mockDb.where).toHaveBeenCalledWith("__name__", "in", [
        "doc1",
        "doc2",
      ]);
      expect(mockDb.get).toHaveBeenCalled();
    });

    it("should remove duplicate IDs", async () => {
      const mockDocs = [{ id: "doc1", data: () => ({ name: "Doc 1" }) }];

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", [
        "doc1",
        "doc1",
        "doc1",
      ]);

      expect(result.size).toBe(1);
      expect(mockDb.where).toHaveBeenCalledWith("__name__", "in", ["doc1"]);
    });

    it("should handle documents with id field included", async () => {
      const mockDocs = [
        { id: "doc1", data: () => ({ name: "Doc 1", id: "old-id" }) },
      ];

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", ["doc1"]);

      // Document ID should override data id field
      expect(result.get("doc1")?.id).toBe("doc1");
      expect(result.get("doc1")?.name).toBe("Doc 1");
    });
  });

  describe("batchFetchDocuments - Batching Logic", () => {
    it("should split large arrays into batches of 10", async () => {
      const ids = Array.from({ length: 25 }, (_, i) => `doc${i + 1}`);
      const mockDocs = ids.map((id) => ({ id, data: () => ({ name: id }) }));

      let batchCount = 0;
      mockDb.get.mockImplementation(() => {
        const start = batchCount * 10;
        const end = Math.min(start + 10, mockDocs.length);
        batchCount++;
        return Promise.resolve({ docs: mockDocs.slice(start, end) });
      });

      const result = await batchFetchDocuments("test-collection", ids);

      expect(result.size).toBe(25);
      expect(mockDb.where).toHaveBeenCalledTimes(3); // 25 ids / 10 = 3 batches
    });

    it("should handle exactly 10 IDs in one batch", async () => {
      const ids = Array.from({ length: 10 }, (_, i) => `doc${i + 1}`);
      const mockDocs = ids.map((id) => ({ id, data: () => ({ name: id }) }));

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", ids);

      expect(result.size).toBe(10);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });

    it("should handle 11 IDs in two batches", async () => {
      const ids = Array.from({ length: 11 }, (_, i) => `doc${i + 1}`);
      const mockDocs = ids.map((id) => ({ id, data: () => ({ name: id }) }));

      let callCount = 0;
      mockDb.get.mockImplementation(() => {
        const batch =
          callCount === 0 ? mockDocs.slice(0, 10) : mockDocs.slice(10);
        callCount++;
        return Promise.resolve({ docs: batch });
      });

      const result = await batchFetchDocuments("test-collection", ids);

      expect(result.size).toBe(11);
      expect(mockDb.where).toHaveBeenCalledTimes(2);
    });

    it("should batch exactly at multiples of 10", async () => {
      const ids = Array.from({ length: 30 }, (_, i) => `doc${i + 1}`);

      mockDb.get.mockResolvedValue({ docs: [] });

      await batchFetchDocuments("test-collection", ids);

      expect(mockDb.where).toHaveBeenCalledTimes(3); // 30 / 10 = 3
    });
  });

  describe("batchFetchDocuments - Error Handling", () => {
    it("should continue with remaining batches if one batch fails", async () => {
      const ids = Array.from({ length: 25 }, (_, i) => `doc${i + 1}`);
      const mockDocs = ids.map((id) => ({ id, data: () => ({ name: id }) }));

      let callCount = 0;
      mockDb.get.mockImplementation(() => {
        const start = callCount * 10;
        const end = Math.min(start + 10, mockDocs.length);
        callCount++;

        if (callCount === 2) {
          // Fail the second batch
          return Promise.reject(new Error("Batch 2 error"));
        }

        return Promise.resolve({ docs: mockDocs.slice(start, end) });
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await batchFetchDocuments("test-collection", ids);

      // Should have results from batches 1 and 3 (not batch 2)
      // 25 ids = 3 batches (10, 10, 5). Batch 2 fails, so we get 10 + 5 = 15
      expect(result.size).toBe(15); // 10 from batch 1 + 5 from batch 3
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching batch 2"),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should return partial results on database error", async () => {
      mockDb.get.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await batchFetchDocuments("test-collection", ["doc1"]);

      expect(result.size).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching batch"),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle empty snapshot results", async () => {
      mockDb.get.mockResolvedValue({ docs: [] });

      const result = await batchFetchDocuments("test-collection", [
        "doc1",
        "doc2",
      ]);

      expect(result.size).toBe(0);
    });

    it("should handle documents with malformed data", async () => {
      const mockDocs = [
        { id: "doc1", data: () => null },
        { id: "doc2", data: () => undefined },
        { id: "doc3", data: () => ({ name: "Doc 3" }) },
      ];

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", [
        "doc1",
        "doc2",
        "doc3",
      ]);

      expect(result.size).toBe(3);
      expect(result.get("doc1")).toEqual({ id: "doc1" });
      expect(result.get("doc2")).toEqual({ id: "doc2" });
      expect(result.get("doc3")).toEqual({ id: "doc3", name: "Doc 3" });
    });
  });

  describe("Collection-Specific Functions", () => {
    beforeEach(() => {
      mockDb.get.mockResolvedValue({ docs: [] });
    });

    it("batchGetProducts should fetch from PRODUCTS collection", async () => {
      await batchGetProducts(["prod1", "prod2"]);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
    });

    it("batchGetShops should fetch from SHOPS collection", async () => {
      await batchGetShops(["shop1", "shop2"]);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.SHOPS);
    });

    it("batchGetCategories should fetch from CATEGORIES collection", async () => {
      await batchGetCategories(["cat1", "cat2"]);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.CATEGORIES);
    });

    it("batchGetUsers should fetch from USERS collection", async () => {
      await batchGetUsers(["user1", "user2"]);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.USERS);
    });

    it("batchGetOrders should fetch from ORDERS collection", async () => {
      await batchGetOrders(["order1", "order2"]);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.ORDERS);
    });

    it("batchGetAuctions should fetch from AUCTIONS collection", async () => {
      await batchGetAuctions(["auction1", "auction2"]);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.AUCTIONS);
    });

    it("batchGetCoupons should fetch from COUPONS collection", async () => {
      await batchGetCoupons(["coupon1", "coupon2"]);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.COUPONS);
    });

    it("batchGetByCollection should fetch from custom collection", async () => {
      await batchGetByCollection("custom-collection", ["id1", "id2"]);

      expect(mockDb.collection).toHaveBeenCalledWith("custom-collection");
    });

    it("all functions should return Map instances", async () => {
      const productResult = await batchGetProducts([]);
      const shopResult = await batchGetShops([]);
      const categoryResult = await batchGetCategories([]);
      const userResult = await batchGetUsers([]);

      expect(productResult).toBeInstanceOf(Map);
      expect(shopResult).toBeInstanceOf(Map);
      expect(categoryResult).toBeInstanceOf(Map);
      expect(userResult).toBeInstanceOf(Map);
    });
  });

  describe("mapToOrderedArray", () => {
    it("should convert map to ordered array", () => {
      const map = new Map([
        ["id1", { name: "Item 1" }],
        ["id2", { name: "Item 2" }],
        ["id3", { name: "Item 3" }],
      ]);

      const result = mapToOrderedArray(map, ["id2", "id1", "id3"]);

      expect(result).toEqual([
        { name: "Item 2" },
        { name: "Item 1" },
        { name: "Item 3" },
      ]);
    });

    it("should return null for missing IDs", () => {
      const map = new Map([
        ["id1", { name: "Item 1" }],
        ["id3", { name: "Item 3" }],
      ]);

      const result = mapToOrderedArray(map, ["id1", "id2", "id3"]);

      expect(result).toEqual([{ name: "Item 1" }, null, { name: "Item 3" }]);
    });

    it("should handle empty map", () => {
      const map = new Map();

      const result = mapToOrderedArray(map, ["id1", "id2"]);

      expect(result).toEqual([null, null]);
    });

    it("should handle empty ID array", () => {
      const map = new Map([["id1", { name: "Item 1" }]]);

      const result = mapToOrderedArray(map, []);

      expect(result).toEqual([]);
    });

    it("should preserve order exactly as specified", () => {
      const map = new Map([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);

      const result = mapToOrderedArray(map, ["c", "a", "b", "c"]);

      expect(result).toEqual([3, 1, 2, 3]);
    });

    it("should handle duplicate IDs in order array", () => {
      const map = new Map([["id1", { name: "Item 1" }]]);

      const result = mapToOrderedArray(map, ["id1", "id1", "id1"]);

      expect(result).toEqual([
        { name: "Item 1" },
        { name: "Item 1" },
        { name: "Item 1" },
      ]);
    });

    it("should work with different data types", () => {
      const map = new Map([
        ["id1", "string"],
        ["id2", 123],
        ["id3", { obj: true }],
        ["id4", null],
      ]);

      const result = mapToOrderedArray(map, ["id1", "id2", "id3", "id4"]);

      expect(result).toEqual(["string", 123, { obj: true }, null]);
    });
  });

  describe("chunkArray", () => {
    it("should chunk array into specified size", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const result = chunkArray(array, 3);

      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    });

    it("should handle array size equal to chunk size", () => {
      const array = [1, 2, 3, 4, 5];

      const result = chunkArray(array, 5);

      expect(result).toEqual([[1, 2, 3, 4, 5]]);
    });

    it("should handle array size less than chunk size", () => {
      const array = [1, 2, 3];

      const result = chunkArray(array, 10);

      expect(result).toEqual([[1, 2, 3]]);
    });

    it("should handle empty array", () => {
      const array: number[] = [];

      const result = chunkArray(array, 5);

      expect(result).toEqual([]);
    });

    it("should handle chunk size of 1", () => {
      const array = [1, 2, 3];

      const result = chunkArray(array, 1);

      expect(result).toEqual([[1], [2], [3]]);
    });

    it("should chunk exactly at multiples", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const result = chunkArray(array, 5);

      expect(result).toEqual([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ]);
    });

    it("should work with strings", () => {
      const array = ["a", "b", "c", "d", "e"];

      const result = chunkArray(array, 2);

      expect(result).toEqual([["a", "b"], ["c", "d"], ["e"]]);
    });

    it("should work with objects", () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const result = chunkArray(array, 2);

      expect(result).toEqual([[{ id: 1 }, { id: 2 }], [{ id: 3 }]]);
    });

    it("should not modify original array", () => {
      const array = [1, 2, 3, 4, 5];
      const originalArray = [...array];

      chunkArray(array, 2);

      expect(array).toEqual(originalArray);
    });
  });

  describe("Integration Tests", () => {
    it("should handle full workflow with batching and ordering", async () => {
      const ids = Array.from({ length: 15 }, (_, i) => `doc${i + 1}`);
      const mockDocs = ids.map((id) => ({ id, data: () => ({ name: id }) }));

      let callCount = 0;
      mockDb.get.mockImplementation(() => {
        const start = callCount * 10;
        const end = Math.min(start + 10, mockDocs.length);
        callCount++;
        return Promise.resolve({ docs: mockDocs.slice(start, end) });
      });

      const resultMap = await batchFetchDocuments("test-collection", ids);
      const orderedArray = mapToOrderedArray(resultMap, ids);

      expect(orderedArray.length).toBe(15);
      expect(orderedArray[0]).toEqual({ id: "doc1", name: "doc1" });
      expect(orderedArray[14]).toEqual({ id: "doc15", name: "doc15" });
      expect(orderedArray.filter((item) => item !== null).length).toBe(15);
    });

    it("should handle chunking large ID arrays for processing", async () => {
      const ids = Array.from({ length: 50 }, (_, i) => `doc${i + 1}`);
      const chunks = chunkArray(ids, 10);

      expect(chunks.length).toBe(5);
      expect(chunks[0].length).toBe(10);
      expect(chunks[4].length).toBe(10);
    });

    it("should handle mixed success and failure in batches", async () => {
      const ids = Array.from({ length: 30 }, (_, i) => `doc${i + 1}`);
      const mockDocs = ids.map((id) => ({ id, data: () => ({ name: id }) }));

      let callCount = 0;
      mockDb.get.mockImplementation(() => {
        const start = callCount * 10;
        const end = Math.min(start + 10, mockDocs.length);
        callCount++;

        if (callCount === 2) {
          return Promise.reject(new Error("Batch 2 failed"));
        }

        return Promise.resolve({ docs: mockDocs.slice(start, end) });
      });

      jest.spyOn(console, "error").mockImplementation();
      const resultMap = await batchFetchDocuments("test-collection", ids);

      // Should have results from batches 1 and 3
      expect(resultMap.size).toBe(20);
      expect(resultMap.has("doc1")).toBe(true);
      expect(resultMap.has("doc11")).toBe(false); // Batch 2 failed
      expect(resultMap.has("doc21")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large number of IDs", async () => {
      const ids = Array.from({ length: 1000 }, (_, i) => `doc${i + 1}`);

      mockDb.get.mockResolvedValue({ docs: [] });

      const result = await batchFetchDocuments("test-collection", ids);

      expect(mockDb.where).toHaveBeenCalledTimes(100); // 1000 / 10 = 100 batches
      expect(result.size).toBe(0);
    });

    it("should handle single ID", async () => {
      const mockDocs = [{ id: "doc1", data: () => ({ name: "Doc 1" }) }];

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", ["doc1"]);

      expect(result.size).toBe(1);
      expect(mockDb.where).toHaveBeenCalledTimes(1);
    });

    it("should handle IDs with special characters", async () => {
      const specialIds = ["doc-1", "doc_2", "doc.3", "doc@4"];
      const mockDocs = specialIds.map((id) => ({
        id,
        data: () => ({ name: id }),
      }));

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", specialIds);

      expect(result.size).toBe(4);
      specialIds.forEach((id) => {
        expect(result.has(id)).toBe(true);
      });
    });

    it("should handle very long ID strings", async () => {
      const longId = "a".repeat(1000);
      const mockDocs = [{ id: longId, data: () => ({ name: "Long ID" }) }];

      mockDb.get.mockResolvedValue({ docs: mockDocs });

      const result = await batchFetchDocuments("test-collection", [longId]);

      expect(result.size).toBe(1);
      expect(result.get(longId)?.name).toBe("Long ID");
    });

    it("should handle null and undefined in chunk array", () => {
      const array = [1, null, undefined, 2, null, 3];

      const result = chunkArray(array, 2);

      expect(result).toEqual([
        [1, null],
        [undefined, 2],
        [null, 3],
      ]);
    });

    it("should handle very large chunk size", () => {
      const array = [1, 2, 3];

      const result = chunkArray(array, 1000000);

      expect(result).toEqual([[1, 2, 3]]);
    });
  });
});
