/**
 * Unit Tests for Batch Fetch Utilities
 * Testing N+1 query prevention with batch fetching
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
} from "../batch-fetch";
import { getFirestoreAdmin } from "../firebase/admin";

// Mock dependencies
jest.mock("../firebase/admin");
jest.mock("../firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn().mockReturnValue({
    auth: jest.fn(),
    firestore: jest.fn(),
  }),
}));

describe("batchFetchDocuments", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = {
      get: jest.fn(),
    };

    mockCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("Empty Input", () => {
    it("should return empty map for empty array", async () => {
      const result = await batchFetchDocuments("products", []);

      expect(result.size).toBe(0);
      expect(mockDb.collection).not.toHaveBeenCalled();
    });

    it("should not make database calls with empty input", async () => {
      await batchFetchDocuments("products", []);

      expect(mockCollection.where).not.toHaveBeenCalled();
      expect(mockQuery.get).not.toHaveBeenCalled();
    });
  });

  describe("Single Batch", () => {
    it("should fetch documents with IDs <= 10", async () => {
      const ids = ["id1", "id2", "id3"];
      const mockDocs = ids.map((id) => ({
        id,
        data: () => ({ name: `Item ${id}` }),
      }));

      mockQuery.get.mockResolvedValue({
        docs: mockDocs,
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(3);
      expect(result.get("id1")).toEqual({ name: "Item id1", id: "id1" });
      expect(mockCollection.where).toHaveBeenCalledWith("__name__", "in", ids);
      expect(mockQuery.get).toHaveBeenCalledTimes(1);
    });

    it("should handle 10 items exactly (batch boundary)", async () => {
      const ids = Array.from({ length: 10 }, (_, i) => `id${i}`);
      const mockDocs = ids.map((id) => ({
        id,
        data: () => ({ value: id }),
      }));

      mockQuery.get.mockResolvedValue({
        docs: mockDocs,
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(10);
      expect(mockQuery.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Multiple Batches", () => {
    it("should split 11 items into 2 batches", async () => {
      const ids = Array.from({ length: 11 }, (_, i) => `id${i}`);

      mockQuery.get.mockImplementation(async () => {
        const lastCall =
          mockCollection.where.mock.calls[
            mockCollection.where.mock.calls.length - 1
          ];
        const batchIds = lastCall[2];
        return {
          docs: batchIds.map((id: string) => ({
            id,
            data: () => ({ value: id }),
          })),
        };
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(11);
      expect(mockQuery.get).toHaveBeenCalledTimes(2);
      expect(mockCollection.where).toHaveBeenNthCalledWith(
        1,
        "__name__",
        "in",
        ids.slice(0, 10)
      );
      expect(mockCollection.where).toHaveBeenNthCalledWith(
        2,
        "__name__",
        "in",
        ids.slice(10, 11)
      );
    });

    it("should handle 25 items in 3 batches", async () => {
      const ids = Array.from({ length: 25 }, (_, i) => `id${i}`);

      mockQuery.get.mockImplementation(async () => {
        const lastCall =
          mockCollection.where.mock.calls[
            mockCollection.where.mock.calls.length - 1
          ];
        const batchIds = lastCall[2];
        return {
          docs: batchIds.map((id: string) => ({
            id,
            data: () => ({ value: id }),
          })),
        };
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(25);
      expect(mockQuery.get).toHaveBeenCalledTimes(3);
    });

    it("should handle 100 items in 10 batches", async () => {
      const ids = Array.from({ length: 100 }, (_, i) => `id${i}`);

      mockQuery.get.mockImplementation(async () => {
        const lastCall =
          mockCollection.where.mock.calls[
            mockCollection.where.mock.calls.length - 1
          ];
        const batchIds = lastCall[2];
        return {
          docs: batchIds.map((id: string) => ({
            id,
            data: () => ({ value: id }),
          })),
        };
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(100);
      expect(mockQuery.get).toHaveBeenCalledTimes(10);
    });
  });

  describe("Duplicate Handling", () => {
    it("should remove duplicate IDs", async () => {
      const ids = ["id1", "id2", "id1", "id3", "id2"];
      const uniqueIds = ["id1", "id2", "id3"];

      mockQuery.get.mockResolvedValue({
        docs: uniqueIds.map((id) => ({
          id,
          data: () => ({ value: id }),
        })),
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(3);
      expect(mockCollection.where).toHaveBeenCalledWith(
        "__name__",
        "in",
        uniqueIds
      );
    });

    it("should handle all duplicate IDs", async () => {
      const ids = ["id1", "id1", "id1", "id1"];

      mockQuery.get.mockResolvedValue({
        docs: [
          {
            id: "id1",
            data: () => ({ value: "id1" }),
          },
        ],
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(1);
      expect(mockQuery.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Partial Results", () => {
    it("should handle some documents not found", async () => {
      const ids = ["id1", "id2", "id3"];

      // Only return 2 out of 3 documents
      mockQuery.get.mockResolvedValue({
        docs: [
          { id: "id1", data: () => ({ value: "id1" }) },
          { id: "id3", data: () => ({ value: "id3" }) },
        ],
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(2);
      expect(result.has("id1")).toBe(true);
      expect(result.has("id2")).toBe(false);
      expect(result.has("id3")).toBe(true);
    });

    it("should return empty map when no documents found", async () => {
      const ids = ["id1", "id2", "id3"];

      mockQuery.get.mockResolvedValue({
        docs: [],
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should continue with remaining batches on batch error", async () => {
      const ids = Array.from({ length: 25 }, (_, i) => `id${i}`);
      let callCount = 0;

      mockQuery.get.mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          throw new Error("Batch 2 failed");
        }
        const lastCall =
          mockCollection.where.mock.calls[
            mockCollection.where.mock.calls.length - 1
          ];
        const batchIds = lastCall[2];
        return {
          docs: batchIds.map((id: string) => ({
            id,
            data: () => ({ value: id }),
          })),
        };
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await batchFetchDocuments("products", ids);

      // Should have results from batches 1 and 3 (batch 2 failed)
      expect(result.size).toBe(15); // 10 from batch 1, 5 from batch 3
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching batch 2"),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should log error and return partial results on database error", async () => {
      const ids = ["id1", "id2"];

      mockQuery.get.mockRejectedValue(new Error("Database connection failed"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching batch"),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
    it("should return empty map on collection error", async () => {
      const ids = ["id1"];

      mockCollection.where.mockImplementation(() => {
        throw new Error("Invalid query");
      });

      const result = await batchFetchDocuments("products", ids);

      expect(result.size).toBe(0);
    });
  });

  describe("Data Transformation", () => {
    it("should merge doc.data() with id field", async () => {
      const ids = ["id1"];

      mockQuery.get.mockResolvedValue({
        docs: [
          {
            id: "id1",
            data: () => ({ name: "Product 1", price: 100 }),
          },
        ],
      });

      const result = await batchFetchDocuments("products", ids);
      const doc = result.get("id1");

      expect(doc).toEqual({
        id: "id1",
        name: "Product 1",
        price: 100,
      });
    });

    it("should handle documents with existing id field", async () => {
      const ids = ["id1"];

      mockQuery.get.mockResolvedValue({
        docs: [
          {
            id: "id1",
            data: () => ({ id: "old-id", name: "Product 1" }),
          },
        ],
      });

      const result = await batchFetchDocuments("products", ids);
      const doc = result.get("id1");

      // Should override with actual doc.id
      expect(doc.id).toBe("id1");
    });

    it("should preserve all document fields", async () => {
      const ids = ["id1"];

      mockQuery.get.mockResolvedValue({
        docs: [
          {
            id: "id1",
            data: () => ({
              name: "Product",
              nested: { field: "value" },
              array: [1, 2, 3],
              boolean: true,
              number: 42,
            }),
          },
        ],
      });

      const result = await batchFetchDocuments("products", ids);
      const doc = result.get("id1");

      expect(doc.nested).toEqual({ field: "value" });
      expect(doc.array).toEqual([1, 2, 3]);
      expect(doc.boolean).toBe(true);
      expect(doc.number).toBe(42);
    });
  });

  describe("Collection Names", () => {
    it("should use correct collection name", async () => {
      const ids = ["id1"];

      mockQuery.get.mockResolvedValue({ docs: [] });

      await batchFetchDocuments("custom_collection", ids);

      expect(mockDb.collection).toHaveBeenCalledWith("custom_collection");
    });

    it("should handle different collection names", async () => {
      const collections = ["products", "users", "orders", "shops"];

      mockQuery.get.mockResolvedValue({ docs: [] });

      for (const collectionName of collections) {
        await batchFetchDocuments(collectionName, ["id1"]);
        expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
      }
    });
  });
});

describe("Specific Collection Batch Fetchers", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockQuery = {
      get: jest.fn().mockResolvedValue({ docs: [] }),
    };

    const mockCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  it("batchGetProducts should use products collection", async () => {
    await batchGetProducts(["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("products");
  });

  it("batchGetShops should use shops collection", async () => {
    await batchGetShops(["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("shops");
  });

  it("batchGetCategories should use categories collection", async () => {
    await batchGetCategories(["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("categories");
  });

  it("batchGetUsers should use users collection", async () => {
    await batchGetUsers(["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("users");
  });

  it("batchGetOrders should use orders collection", async () => {
    await batchGetOrders(["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("orders");
  });

  it("batchGetAuctions should use auctions collection", async () => {
    await batchGetAuctions(["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("auctions");
  });

  it("batchGetCoupons should use coupons collection", async () => {
    await batchGetCoupons(["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("coupons");
  });

  it("batchGetByCollection should use custom collection", async () => {
    await batchGetByCollection("reviews", ["id1"]);
    expect(mockDb.collection).toHaveBeenCalledWith("reviews");
  });
});

describe("mapToOrderedArray", () => {
  it("should convert map to ordered array", () => {
    const map = new Map([
      ["id1", { name: "Item 1" }],
      ["id2", { name: "Item 2" }],
      ["id3", { name: "Item 3" }],
    ]);

    const orderedIds = ["id1", "id2", "id3"];
    const result = mapToOrderedArray(map, orderedIds);

    expect(result).toEqual([
      { name: "Item 1" },
      { name: "Item 2" },
      { name: "Item 3" },
    ]);
  });

  it("should preserve order from orderedIds array", () => {
    const map = new Map([
      ["id1", { name: "Item 1" }],
      ["id2", { name: "Item 2" }],
      ["id3", { name: "Item 3" }],
    ]);

    const orderedIds = ["id3", "id1", "id2"];
    const result = mapToOrderedArray(map, orderedIds);

    expect(result).toEqual([
      { name: "Item 3" },
      { name: "Item 1" },
      { name: "Item 2" },
    ]);
  });

  it("should use null for missing items", () => {
    const map = new Map([
      ["id1", { name: "Item 1" }],
      ["id3", { name: "Item 3" }],
    ]);

    const orderedIds = ["id1", "id2", "id3"];
    const result = mapToOrderedArray(map, orderedIds);

    expect(result).toEqual([{ name: "Item 1" }, null, { name: "Item 3" }]);
  });

  it("should handle empty map", () => {
    const map = new Map();
    const orderedIds = ["id1", "id2"];
    const result = mapToOrderedArray(map, orderedIds);

    expect(result).toEqual([null, null]);
  });

  it("should handle empty orderedIds", () => {
    const map = new Map([["id1", { name: "Item 1" }]]);
    const orderedIds: string[] = [];
    const result = mapToOrderedArray(map, orderedIds);

    expect(result).toEqual([]);
  });

  it("should preserve item references", () => {
    const item1 = { name: "Item 1" };
    const item2 = { name: "Item 2" };
    const map = new Map([
      ["id1", item1],
      ["id2", item2],
    ]);

    const orderedIds = ["id1", "id2"];
    const result = mapToOrderedArray(map, orderedIds);

    expect(result[0]).toBe(item1);
    expect(result[1]).toBe(item2);
  });
});

describe("chunkArray", () => {
  it("should split array into chunks of specified size", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = chunkArray(array, 3);

    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
  });

  it("should handle exact divisible chunks", () => {
    const array = [1, 2, 3, 4, 5, 6];
    const result = chunkArray(array, 2);

    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  it("should handle chunk size larger than array", () => {
    const array = [1, 2, 3];
    const result = chunkArray(array, 10);

    expect(result).toEqual([[1, 2, 3]]);
  });

  it("should handle empty array", () => {
    const array: number[] = [];
    const result = chunkArray(array, 3);

    expect(result).toEqual([]);
  });

  it("should handle chunk size of 1", () => {
    const array = [1, 2, 3];
    const result = chunkArray(array, 1);

    expect(result).toEqual([[1], [2], [3]]);
  });

  it("should handle array with single element", () => {
    const array = [1];
    const result = chunkArray(array, 5);

    expect(result).toEqual([[1]]);
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

  it("should preserve object references", () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const array = [obj1, obj2];
    const result = chunkArray(array, 1);

    expect(result[0][0]).toBe(obj1);
    expect(result[1][0]).toBe(obj2);
  });
});

describe("Integration Tests", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = {
      get: jest.fn(),
    };

    mockCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  it("should work with batchGetProducts and mapToOrderedArray", async () => {
    const ids = ["prod1", "prod2", "prod3"];

    mockQuery.get.mockResolvedValue({
      docs: ids.map((id) => ({
        id,
        data: () => ({ name: `Product ${id}`, price: 100 }),
      })),
    });

    const map = await batchGetProducts(ids);
    const orderedArray = mapToOrderedArray(map, ids);

    expect(orderedArray).toHaveLength(3);
    expect(orderedArray[0]).toEqual({
      id: "prod1",
      name: "Product prod1",
      price: 100,
    });
  });

  it("should handle missing items in ordered array", async () => {
    const ids = ["prod1", "prod2", "prod3"];

    // Only return prod1 and prod3
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: "prod1", data: () => ({ name: "Product 1" }) },
        { id: "prod3", data: () => ({ name: "Product 3" }) },
      ],
    });

    const map = await batchGetProducts(ids);
    const orderedArray = mapToOrderedArray(map, ids);

    expect(orderedArray[0]).toBeTruthy();
    expect(orderedArray[1]).toBeNull();
    expect(orderedArray[2]).toBeTruthy();
  });

  it("should handle large datasets efficiently", async () => {
    const ids = Array.from({ length: 50 }, (_, i) => `id${i}`);

    mockQuery.get.mockImplementation(async () => {
      const lastCall =
        mockCollection.where.mock.calls[
          mockCollection.where.mock.calls.length - 1
        ];
      const batchIds = lastCall[2];
      return {
        docs: batchIds.map((id: string) => ({
          id,
          data: () => ({ value: id }),
        })),
      };
    });

    const map = await batchGetProducts(ids);
    const orderedArray = mapToOrderedArray(map, ids);

    expect(map.size).toBe(50);
    expect(orderedArray).toHaveLength(50);
    expect(mockQuery.get).toHaveBeenCalledTimes(5); // 50 / 10 = 5 batches
  });
});
