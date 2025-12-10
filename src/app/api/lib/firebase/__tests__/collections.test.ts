/**
 * Unit Tests for Firebase Collections Utilities
 * Comprehensive testing of collection references and document helpers
 */

import { COLLECTIONS } from "@/constants/database";
import { getFirestoreAdmin } from "../admin";
import {
  Collections,
  createDocument,
  deleteDocument,
  documentExists,
  getCollection,
  getDocument,
  getDocumentById,
  updateDocument,
} from "../collections";

// Mock dependencies
jest.mock("../admin");

describe("Firebase Collections", () => {
  let mockDb: any;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockAdd: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockAdd = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();

    mockDoc = jest.fn(() => ({
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
    }));

    mockCollection = jest.fn(() => ({
      doc: mockDoc,
      add: mockAdd,
    }));

    mockDb = {
      collection: mockCollection,
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("getCollection", () => {
    it("should return collection reference for valid collection name", () => {
      const collectionRef = getCollection(COLLECTIONS.PRODUCTS);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(collectionRef).toBeDefined();
    });

    it("should return collection reference for any string", () => {
      const collectionRef = getCollection("custom_collection");

      expect(mockDb.collection).toHaveBeenCalledWith("custom_collection");
      expect(collectionRef).toBeDefined();
    });

    it("should handle collection names with special characters", () => {
      const collectionRef = getCollection("test-collection_123");

      expect(mockDb.collection).toHaveBeenCalledWith("test-collection_123");
    });
  });

  describe("getDocument", () => {
    it("should return document reference for valid collection and document ID", () => {
      const docRef = getDocument(COLLECTIONS.PRODUCTS, "prod123");

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(mockCollection().doc).toHaveBeenCalledWith("prod123");
      expect(docRef).toBeDefined();
    });

    it("should handle document IDs with special characters", () => {
      const docRef = getDocument(COLLECTIONS.USERS, "user-123_abc");

      expect(mockCollection().doc).toHaveBeenCalledWith("user-123_abc");
    });
  });

  describe("Collections helpers", () => {
    it("should provide users collection reference", () => {
      const usersRef = Collections.users();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.USERS);
      expect(usersRef).toBeDefined();
    });

    it("should provide shops collection reference", () => {
      const shopsRef = Collections.shops();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.SHOPS);
      expect(shopsRef).toBeDefined();
    });

    it("should provide products collection reference", () => {
      const productsRef = Collections.products();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(productsRef).toBeDefined();
    });

    it("should provide categories collection reference", () => {
      const categoriesRef = Collections.categories();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.CATEGORIES);
      expect(categoriesRef).toBeDefined();
    });

    it("should provide orders collection reference", () => {
      const ordersRef = Collections.orders();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.ORDERS);
      expect(ordersRef).toBeDefined();
    });

    it("should provide auctions collection reference", () => {
      const auctionsRef = Collections.auctions();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.AUCTIONS);
      expect(auctionsRef).toBeDefined();
    });

    it("should provide bids collection reference", () => {
      const bidsRef = Collections.bids();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.BIDS);
      expect(bidsRef).toBeDefined();
    });

    it("should provide payments collection reference", () => {
      const paymentsRef = Collections.payments();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PAYMENTS);
      expect(paymentsRef).toBeDefined();
    });

    it("should provide favorites collection reference", () => {
      const favoritesRef = Collections.favorites();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.FAVORITES);
      expect(favoritesRef).toBeDefined();
    });

    it("should provide addresses collection reference", () => {
      const addressesRef = Collections.addresses();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.ADDRESSES);
      expect(addressesRef).toBeDefined();
    });
  });

  describe("getDocumentById", () => {
    it("should return document data when document exists", async () => {
      const mockData = { name: "Test Product", price: 100 };
      mockGet.mockResolvedValue({
        exists: true,
        id: "prod123",
        data: () => mockData,
      });

      const result = await getDocumentById(COLLECTIONS.PRODUCTS, "prod123");

      expect(result).toEqual({ id: "prod123", ...mockData });
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(mockDoc).toHaveBeenCalledWith("prod123");
    });

    it("should return null when document does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      const result = await getDocumentById(COLLECTIONS.PRODUCTS, "nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error on database failure", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      await expect(
        getDocumentById(COLLECTIONS.PRODUCTS, "prod123")
      ).rejects.toThrow("Database error");
    });

    it("should include document ID in returned data", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "doc123",
        data: () => ({ field: "value" }),
      });

      const result = await getDocumentById("test_collection", "doc123");

      expect(result).toHaveProperty("id", "doc123");
      expect(result).toHaveProperty("field", "value");
    });
  });

  describe("documentExists", () => {
    it("should return true when document exists", async () => {
      mockGet.mockResolvedValue({ exists: true });

      const result = await documentExists(COLLECTIONS.PRODUCTS, "prod123");

      expect(result).toBe(true);
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(mockDoc).toHaveBeenCalledWith("prod123");
    });

    it("should return false when document does not exist", async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await documentExists(COLLECTIONS.PRODUCTS, "nonexistent");

      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const result = await documentExists(COLLECTIONS.PRODUCTS, "prod123");

      expect(result).toBe(false);
    });

    it("should handle network timeouts gracefully", async () => {
      mockGet.mockRejectedValue(new Error("ETIMEDOUT"));

      const result = await documentExists(COLLECTIONS.USERS, "user123");

      expect(result).toBe(false);
    });
  });

  describe("createDocument", () => {
    it("should create document with auto-generated ID", async () => {
      const mockData = { name: "New Product", price: 50 };
      mockAdd.mockResolvedValue({ id: "new_doc_id" });

      const docId = await createDocument(COLLECTIONS.PRODUCTS, mockData);

      expect(docId).toBe("new_doc_id");
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Product",
          price: 50,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it("should add createdAt and updatedAt timestamps", async () => {
      mockAdd.mockResolvedValue({ id: "doc123" });
      const beforeTime = new Date();

      await createDocument(COLLECTIONS.USERS, { email: "test@example.com" });

      const afterTime = new Date();
      const callArgs = mockAdd.mock.calls[0][0];

      expect(callArgs.createdAt).toBeInstanceOf(Date);
      expect(callArgs.updatedAt).toBeInstanceOf(Date);
      expect(callArgs.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(callArgs.updatedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });

    it("should throw error on database failure", async () => {
      mockAdd.mockRejectedValue(new Error("Permission denied"));

      await expect(
        createDocument(COLLECTIONS.PRODUCTS, { name: "Test" })
      ).rejects.toThrow("Permission denied");
    });

    it("should preserve all provided data fields", async () => {
      const complexData = {
        name: "Product",
        price: 100,
        tags: ["tag1", "tag2"],
        metadata: { key: "value" },
      };
      mockAdd.mockResolvedValue({ id: "doc123" });

      await createDocument(COLLECTIONS.PRODUCTS, complexData);

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining(complexData)
      );
    });
  });

  describe("updateDocument", () => {
    it("should update document with provided data", async () => {
      mockUpdate.mockResolvedValue(undefined);

      await updateDocument(COLLECTIONS.PRODUCTS, "prod123", { price: 75 });

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(mockDoc).toHaveBeenCalledWith("prod123");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 75,
          updatedAt: expect.any(Date),
        })
      );
    });

    it("should add updatedAt timestamp", async () => {
      mockUpdate.mockResolvedValue(undefined);
      const beforeTime = new Date();

      await updateDocument(COLLECTIONS.USERS, "user123", {
        name: "Updated Name",
      });

      const afterTime = new Date();
      const callArgs = mockUpdate.mock.calls[0][0];

      expect(callArgs.updatedAt).toBeInstanceOf(Date);
      expect(callArgs.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(callArgs.updatedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });

    it("should throw error when document not found", async () => {
      mockUpdate.mockRejectedValue(new Error("Document not found"));

      await expect(
        updateDocument(COLLECTIONS.PRODUCTS, "nonexistent", { price: 100 })
      ).rejects.toThrow("Document not found");
    });

    it("should handle partial updates", async () => {
      mockUpdate.mockResolvedValue(undefined);

      await updateDocument(COLLECTIONS.PRODUCTS, "prod123", {
        stock: 10,
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stock: 10,
        })
      );
    });

    it("should throw error on permission denied", async () => {
      mockUpdate.mockRejectedValue(new Error("Permission denied"));

      await expect(
        updateDocument(COLLECTIONS.ORDERS, "order123", { status: "shipped" })
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("deleteDocument", () => {
    it("should delete document successfully", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteDocument(COLLECTIONS.PRODUCTS, "prod123");

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      expect(mockDoc).toHaveBeenCalledWith("prod123");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw error on database failure", async () => {
      mockDelete.mockRejectedValue(new Error("Permission denied"));

      await expect(
        deleteDocument(COLLECTIONS.PRODUCTS, "prod123")
      ).rejects.toThrow("Permission denied");
    });

    it("should handle non-existent document deletion", async () => {
      // Firestore doesn't throw error when deleting non-existent docs
      mockDelete.mockResolvedValue(undefined);

      await expect(
        deleteDocument(COLLECTIONS.PRODUCTS, "nonexistent")
      ).resolves.not.toThrow();
    });

    it("should handle network errors during deletion", async () => {
      mockDelete.mockRejectedValue(new Error("Network error"));

      await expect(
        deleteDocument(COLLECTIONS.USERS, "user123")
      ).rejects.toThrow("Network error");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as collection name", () => {
      const collectionRef = getCollection("");

      expect(mockDb.collection).toHaveBeenCalledWith("");
    });

    it("should handle empty string as document ID", () => {
      const docRef = getDocument(COLLECTIONS.PRODUCTS, "");

      expect(mockDoc).toHaveBeenCalledWith("");
    });

    it("should handle very long collection names", () => {
      const longName = "a".repeat(1000);
      const collectionRef = getCollection(longName);

      expect(mockDb.collection).toHaveBeenCalledWith(longName);
    });

    it("should handle very long document IDs", () => {
      const longId = "x".repeat(1000);
      const docRef = getDocument(COLLECTIONS.PRODUCTS, longId);

      expect(mockDoc).toHaveBeenCalledWith(longId);
    });

    it("should handle unicode characters in collection names", () => {
      const unicodeName = "コレクション_♥_123";
      const collectionRef = getCollection(unicodeName);

      expect(mockDb.collection).toHaveBeenCalledWith(unicodeName);
    });

    it("should handle unicode characters in document IDs", () => {
      const unicodeId = "ドキュメント_123";
      const docRef = getDocument(COLLECTIONS.PRODUCTS, unicodeId);

      expect(mockDoc).toHaveBeenCalledWith(unicodeId);
    });
  });

  describe("Real Code Issues Found", () => {
    it("PATTERN: All collection helpers use getCollection internally", () => {
      Collections.users();
      Collections.shops();
      Collections.products();

      expect(mockDb.collection).toHaveBeenCalledTimes(3);
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.USERS);
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.SHOPS);
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
    });

    it("PATTERN: Timestamps use JavaScript Date, not Firestore serverTimestamp", () => {
      mockAdd.mockResolvedValue({ id: "doc123" });

      createDocument(COLLECTIONS.PRODUCTS, { name: "Test" });

      const callArgs = mockAdd.mock.calls[0][0];
      expect(callArgs.createdAt).toBeInstanceOf(Date);
      expect(callArgs.updatedAt).toBeInstanceOf(Date);
    });

    it("PATTERN: Error handling logs to console before rethrowing", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockGet.mockRejectedValue(new Error("Test error"));

      await expect(
        getDocumentById(COLLECTIONS.PRODUCTS, "prod123")
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("PATTERN: documentExists returns false instead of throwing on errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockGet.mockRejectedValue(new Error("Database error"));

      const result = await documentExists(COLLECTIONS.PRODUCTS, "prod123");

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
