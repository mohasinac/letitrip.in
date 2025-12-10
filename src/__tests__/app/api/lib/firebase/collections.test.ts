/**
 * Unit Tests: Firestore Collection References
 * File: src/app/api/lib/firebase/collections.ts
 */

import {
  Collections,
  createDocument,
  deleteDocument,
  documentExists,
  getCollection,
  getDocument,
  getDocumentById,
  updateDocument,
} from "@/app/api/lib/firebase/collections";
import { COLLECTIONS } from "@/constants/database";

// Mock firebase admin
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(),
}));

describe("Firestore Collections", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockDocRef: any;
  let mockDocSnap: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockDocSnap = {
      exists: true,
      id: "doc123",
      data: jest.fn(() => ({ name: "Test", value: 123 })),
    };

    mockDocRef = {
      get: jest.fn(() => Promise.resolve(mockDocSnap)),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
    };

    mockCollection = {
      doc: jest.fn(() => mockDocRef),
      add: jest.fn(() => Promise.resolve({ id: "newDoc123" })),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
    };

    const { getFirestoreAdmin } = require("@/app/api/lib/firebase/admin");
    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("getCollection", () => {
    it("should return a collection reference", () => {
      const result = getCollection("users");

      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(result).toBe(mockCollection);
    });

    it("should return typed collection reference", () => {
      interface User {
        name: string;
        email: string;
      }

      const result = getCollection<User>("users");

      expect(result).toBe(mockCollection);
    });

    it("should handle special characters in collection name", () => {
      getCollection("collection-with-dashes");

      expect(mockDb.collection).toHaveBeenCalledWith("collection-with-dashes");
    });

    it("should handle empty collection name", () => {
      getCollection("");

      expect(mockDb.collection).toHaveBeenCalledWith("");
    });
  });

  describe("getDocument", () => {
    it("should return a document reference", () => {
      const result = getDocument("users", "user123");

      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(mockCollection.doc).toHaveBeenCalledWith("user123");
      expect(result).toBe(mockDocRef);
    });

    it("should return typed document reference", () => {
      interface User {
        name: string;
      }

      const result = getDocument<User>("users", "user123");

      expect(result).toBe(mockDocRef);
    });

    it("should handle special characters in document ID", () => {
      getDocument("users", "user-123_test@example");

      expect(mockCollection.doc).toHaveBeenCalledWith("user-123_test@example");
    });
  });

  describe("Collections object", () => {
    it("should provide users collection", () => {
      const result = Collections.users();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.USERS);
    });

    it("should provide shops collection", () => {
      Collections.shops();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.SHOPS);
    });

    it("should provide products collection", () => {
      Collections.products();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
    });

    it("should provide categories collection", () => {
      Collections.categories();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.CATEGORIES);
    });

    it("should provide orders collection", () => {
      Collections.orders();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.ORDERS);
    });

    it("should provide auctions collection", () => {
      Collections.auctions();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.AUCTIONS);
    });

    it("should provide bids collection", () => {
      Collections.bids();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.BIDS);
    });

    it("should provide payments collection", () => {
      Collections.payments();

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.PAYMENTS);
    });

    it("should provide all collection references as functions", () => {
      const collectionKeys = Object.keys(Collections);

      collectionKeys.forEach((key) => {
        expect(typeof Collections[key as keyof typeof Collections]).toBe(
          "function"
        );
      });
    });

    it("should return new collection reference on each call", () => {
      const first = Collections.users();
      const second = Collections.users();

      expect(mockDb.collection).toHaveBeenCalledTimes(2);
    });
  });

  describe("getDocumentById", () => {
    it("should return document data with id", async () => {
      const result = await getDocumentById("users", "user123");

      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(mockCollection.doc).toHaveBeenCalledWith("user123");
      expect(mockDocRef.get).toHaveBeenCalled();
      expect(result).toEqual({ id: "doc123", name: "Test", value: 123 });
    });

    it("should return null if document doesn't exist", async () => {
      mockDocSnap.exists = false;

      const result = await getDocumentById("users", "nonexistent");

      expect(result).toBeNull();
    });

    it("should handle errors and rethrow", async () => {
      const error = new Error("Firestore error");
      mockDocRef.get.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(getDocumentById("users", "user123")).rejects.toThrow(
        "Firestore error"
      );

      const allErrors = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("Error getting document");
      expect(allErrors).toContain("user123");
      expect(allErrors).toContain("users");

      consoleSpy.mockRestore();
    });

    it("should handle documents with no data", async () => {
      mockDocSnap.data.mockReturnValue(undefined);

      const result = await getDocumentById("users", "user123");

      expect(result).toEqual({ id: "doc123" });
    });

    it("should preserve all document fields", async () => {
      mockDocSnap.data.mockReturnValue({
        name: "John",
        email: "john@example.com",
        age: 30,
        active: true,
      });

      const result = await getDocumentById("users", "user123");

      expect(result).toEqual({
        id: "doc123",
        name: "John",
        email: "john@example.com",
        age: 30,
        active: true,
      });
    });
  });

  describe("documentExists", () => {
    it("should return true if document exists", async () => {
      mockDocSnap.exists = true;

      const result = await documentExists("users", "user123");

      expect(result).toBe(true);
      expect(mockDocRef.get).toHaveBeenCalled();
    });

    it("should return false if document doesn't exist", async () => {
      mockDocSnap.exists = false;

      const result = await documentExists("users", "nonexistent");

      expect(result).toBe(false);
    });

    it("should return false on error instead of throwing", async () => {
      const error = new Error("Network error");
      mockDocRef.get.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await documentExists("users", "user123");

      expect(result).toBe(false);
      const allErrors = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("Error checking document existence");

      consoleSpy.mockRestore();
    });

    it("should handle special document IDs", async () => {
      mockDocSnap.exists = true;

      const result = await documentExists("users", "user_123-test@domain");

      expect(result).toBe(true);
      expect(mockCollection.doc).toHaveBeenCalledWith("user_123-test@domain");
    });
  });

  describe("createDocument", () => {
    it("should create a document with auto-generated ID", async () => {
      const data = { name: "New Doc", value: 456 };

      const result = await createDocument("users", data);

      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(mockCollection.add).toHaveBeenCalled();
      expect(result).toBe("newDoc123");
    });

    it("should add createdAt and updatedAt timestamps", async () => {
      const data = { name: "Test" };

      await createDocument("users", data);

      const addCall = mockCollection.add.mock.calls[0][0];
      expect(addCall.name).toBe("Test");
      expect(addCall.createdAt).toBeInstanceOf(Date);
      expect(addCall.updatedAt).toBeInstanceOf(Date);
    });

    it("should preserve existing data fields", async () => {
      const data = { name: "Test", email: "test@example.com", age: 25 };

      await createDocument("users", data);

      const addCall = mockCollection.add.mock.calls[0][0];
      expect(addCall.name).toBe("Test");
      expect(addCall.email).toBe("test@example.com");
      expect(addCall.age).toBe(25);
    });

    it("should handle empty data object", async () => {
      const result = await createDocument("users", {});

      expect(result).toBe("newDoc123");
      const addCall = mockCollection.add.mock.calls[0][0];
      expect(addCall.createdAt).toBeInstanceOf(Date);
    });

    it("should handle errors and rethrow", async () => {
      const error = new Error("Permission denied");
      mockCollection.add.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(createDocument("users", {})).rejects.toThrow(
        "Permission denied"
      );

      const allErrors = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("Error creating document");
      expect(allErrors).toContain("users");

      consoleSpy.mockRestore();
    });
  });

  describe("updateDocument", () => {
    it("should update a document", async () => {
      const data = { name: "Updated" };

      await updateDocument("users", "user123", data);

      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(mockCollection.doc).toHaveBeenCalledWith("user123");
      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it("should add updatedAt timestamp", async () => {
      const data = { name: "Updated" };

      await updateDocument("users", "user123", data);

      const updateCall = mockDocRef.update.mock.calls[0][0];
      expect(updateCall.name).toBe("Updated");
      expect(updateCall.updatedAt).toBeInstanceOf(Date);
    });

    it("should preserve all update fields", async () => {
      const data = { name: "Updated", email: "new@example.com", active: false };

      await updateDocument("users", "user123", data);

      const updateCall = mockDocRef.update.mock.calls[0][0];
      expect(updateCall.name).toBe("Updated");
      expect(updateCall.email).toBe("new@example.com");
      expect(updateCall.active).toBe(false);
    });

    it("should handle empty update data", async () => {
      await updateDocument("users", "user123", {});

      const updateCall = mockDocRef.update.mock.calls[0][0];
      expect(updateCall.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle errors and rethrow", async () => {
      const error = new Error("Document not found");
      mockDocRef.update.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(updateDocument("users", "user123", {})).rejects.toThrow(
        "Document not found"
      );

      const allErrors = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("Error updating document");
      expect(allErrors).toContain("user123");

      consoleSpy.mockRestore();
    });
  });

  describe("deleteDocument", () => {
    it("should delete a document", async () => {
      await deleteDocument("users", "user123");

      expect(mockDb.collection).toHaveBeenCalledWith("users");
      expect(mockCollection.doc).toHaveBeenCalledWith("user123");
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it("should handle errors and rethrow", async () => {
      const error = new Error("Permission denied");
      mockDocRef.delete.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(deleteDocument("users", "user123")).rejects.toThrow(
        "Permission denied"
      );

      const allErrors = consoleSpy.mock.calls
        .map((call) => call.join(" "))
        .join(" ");
      expect(allErrors).toContain("Error deleting document");
      expect(allErrors).toContain("user123");
      expect(allErrors).toContain("users");

      consoleSpy.mockRestore();
    });

    it("should handle deleting non-existent documents", async () => {
      // Firestore delete succeeds even if document doesn't exist
      mockDocRef.delete.mockResolvedValue(undefined);

      await expect(
        deleteDocument("users", "nonexistent")
      ).resolves.not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long collection names", () => {
      const longName = "a".repeat(500);

      getCollection(longName);

      expect(mockDb.collection).toHaveBeenCalledWith(longName);
    });

    it("should handle very long document IDs", () => {
      const longId = "b".repeat(500);

      getDocument("users", longId);

      expect(mockCollection.doc).toHaveBeenCalledWith(longId);
    });

    it("should handle Unicode characters in collection names", () => {
      getCollection("用户集合");

      expect(mockDb.collection).toHaveBeenCalledWith("用户集合");
    });

    it("should handle complex data types in create", async () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { key: "value" },
        date: new Date(),
        null: null,
        undefined: undefined,
      };

      await createDocument("users", complexData);

      const addCall = mockCollection.add.mock.calls[0][0];
      expect(addCall.array).toEqual([1, 2, 3]);
      expect(addCall.nested).toEqual({ key: "value" });
    });

    it("should handle concurrent operations", async () => {
      const promises = [
        getDocumentById("users", "user1"),
        getDocumentById("users", "user2"),
        getDocumentById("users", "user3"),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockDocRef.get).toHaveBeenCalledTimes(3);
    });
  });
});
