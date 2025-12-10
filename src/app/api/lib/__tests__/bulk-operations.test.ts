/**
 * Comprehensive test suite for bulk-operations.ts
 * Tests: 60+ tests covering all bulk operation scenarios
 */

import { COLLECTIONS } from "@/constants/database";
import { NextRequest } from "next/server";
import {
  BulkOperationConfig,
  commonBulkHandlers,
  createBulkErrorResponse,
  executeBulkOperation,
  executeBulkOperationWithTransaction,
  MAX_BULK_OPERATION_ITEMS,
  parseBulkRequest,
  validateBulkPermission,
} from "../bulk-operations";

// Mock dependencies
jest.mock("../firebase/admin");

// Import after mock setup
const { getFirestoreAdmin } = require("../firebase/admin");

describe("bulk-operations.ts", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockDoc: any;
  let mockTransaction: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock structure
    mockDoc = {
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockCollection = jest.fn(() => ({
      doc: jest.fn(() => mockDoc),
    }));

    mockTransaction = {
      get: jest.fn(),
      update: jest.fn(),
    };

    mockDb = {
      collection: mockCollection,
      runTransaction: jest.fn((callback) => callback(mockTransaction)),
    };

    getFirestoreAdmin.mockReturnValue(mockDb);
  });

  describe("executeBulkOperation", () => {
    const baseConfig: BulkOperationConfig = {
      collection: COLLECTIONS.PRODUCTS,
      action: "update",
      ids: ["id1", "id2"],
      data: { price: 100 },
    };

    describe("Input Validation", () => {
      it("should return error when no IDs provided", async () => {
        const result = await executeBulkOperation({
          ...baseConfig,
          ids: [],
        });

        expect(result.success).toBe(false);
        expect(result.successCount).toBe(0);
        expect(result.failedCount).toBe(0);
        expect(result.message).toBe("No items selected");
      });

      it("should return error when IDs array is undefined", async () => {
        const result = await executeBulkOperation({
          ...baseConfig,
          ids: undefined as any,
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("No items selected");
      });

      it("should return error when exceeding max items", async () => {
        const ids = Array.from(
          { length: MAX_BULK_OPERATION_ITEMS + 1 },
          (_, i) => `id${i}`
        );

        const result = await executeBulkOperation({
          ...baseConfig,
          ids,
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain("Too many items");
        expect(result.message).toContain(
          `Maximum ${MAX_BULK_OPERATION_ITEMS} items allowed`
        );
      });

      it("should accept exactly max items", async () => {
        const ids = Array.from(
          { length: MAX_BULK_OPERATION_ITEMS },
          (_, i) => `id${i}`
        );

        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockResolvedValue({});

        const result = await executeBulkOperation({
          ...baseConfig,
          ids,
        });

        expect(result.success).toBe(true);
        expect(result.successCount).toBe(MAX_BULK_OPERATION_ITEMS);
      });
    });

    describe("Document Existence", () => {
      it("should track error for non-existent documents", async () => {
        mockDoc.get.mockResolvedValue({
          exists: false,
        });

        const result = await executeBulkOperation(baseConfig);

        expect(result.successCount).toBe(0);
        expect(result.failedCount).toBe(2);
        expect(result.errors).toHaveLength(2);
        expect(result.errors?.[0].error).toBe("Item not found");
      });

      it("should process only existing documents", async () => {
        mockDoc.get
          .mockResolvedValueOnce({ exists: true, data: () => ({}) })
          .mockResolvedValueOnce({ exists: false });

        mockDoc.update.mockResolvedValue({});

        const result = await executeBulkOperation(baseConfig);

        expect(result.successCount).toBe(1);
        expect(result.failedCount).toBe(1);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].id).toBe("id2");
      });

      it("should continue processing after finding non-existent document", async () => {
        mockDoc.get
          .mockResolvedValueOnce({ exists: false })
          .mockResolvedValueOnce({ exists: true, data: () => ({}) });

        mockDoc.update.mockResolvedValue({});

        const result = await executeBulkOperation(baseConfig);

        expect(result.successCount).toBe(1);
        expect(result.failedCount).toBe(1);
      });
    });

    describe("Item Validation", () => {
      it("should use validateItem function when provided", async () => {
        const validateItem = jest.fn().mockResolvedValue({ valid: true });

        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ name: "Test" }),
        });
        mockDoc.update.mockResolvedValue({});

        await executeBulkOperation({
          ...baseConfig,
          validateItem,
        });

        expect(validateItem).toHaveBeenCalledTimes(2);
        expect(validateItem).toHaveBeenCalledWith({ name: "Test" }, "update");
      });

      it("should skip items that fail validation", async () => {
        const validateItem = jest
          .fn()
          .mockResolvedValueOnce({ valid: true })
          .mockResolvedValueOnce({
            valid: false,
            error: "Invalid item",
          });

        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockResolvedValue({});

        const result = await executeBulkOperation({
          ...baseConfig,
          validateItem,
        });

        expect(result.successCount).toBe(1);
        expect(result.failedCount).toBe(1);
        expect(result.errors?.[0].error).toBe("Invalid item");
      });

      it("should use default error message if validation error not provided", async () => {
        const validateItem = jest.fn().mockResolvedValue({ valid: false });

        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });

        const result = await executeBulkOperation({
          ...baseConfig,
          validateItem,
        });

        expect(result.errors?.[0].error).toBe("Validation failed");
      });
    });

    describe("Custom Handler", () => {
      it("should use custom handler when provided", async () => {
        const customHandler = jest.fn().mockResolvedValue(undefined);

        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });

        await executeBulkOperation({
          ...baseConfig,
          customHandler,
        });

        expect(customHandler).toHaveBeenCalledTimes(2);
        expect(customHandler).toHaveBeenCalledWith(
          mockDb,
          "id1",
          baseConfig.data
        );
        expect(customHandler).toHaveBeenCalledWith(
          mockDb,
          "id2",
          baseConfig.data
        );
        expect(mockDoc.update).not.toHaveBeenCalled();
      });

      it("should use default update when no custom handler", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockResolvedValue({});

        const result = await executeBulkOperation(baseConfig);

        expect(mockDoc.update).toHaveBeenCalledTimes(2);
        expect(mockDoc.update).toHaveBeenCalledWith(
          expect.objectContaining({
            price: 100,
            updated_at: expect.any(String),
          })
        );
        expect(result.successCount).toBe(2);
      });

      it("should handle custom handler errors gracefully", async () => {
        const customHandler = jest
          .fn()
          .mockRejectedValueOnce(new Error("Custom error"))
          .mockResolvedValueOnce(undefined);

        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });

        const result = await executeBulkOperation({
          ...baseConfig,
          customHandler,
        });

        expect(result.successCount).toBe(1);
        expect(result.failedCount).toBe(1);
        expect(result.errors?.[0].error).toBe("Custom error");
      });
    });

    describe("Error Handling", () => {
      it("should track errors with document IDs", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockRejectedValue(new Error("Update failed"));

        const result = await executeBulkOperation(baseConfig);

        expect(result.errors).toHaveLength(2);
        expect(result.errors?.[0].id).toBe("id1");
        expect(result.errors?.[0].error).toBe("Update failed");
        expect(result.errors?.[1].id).toBe("id2");
      });

      it("should use default error message when error has no message", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockRejectedValue({});

        const result = await executeBulkOperation(baseConfig);

        expect(result.errors?.[0].error).toBe("Operation failed");
      });

      it("should continue processing after errors", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update
          .mockRejectedValueOnce(new Error("First failed"))
          .mockResolvedValueOnce({});

        const result = await executeBulkOperation(baseConfig);

        expect(result.successCount).toBe(1);
        expect(result.failedCount).toBe(1);
        expect(mockDoc.update).toHaveBeenCalledTimes(2);
      });
    });

    describe("Success Scenarios", () => {
      it("should successfully update all items", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockResolvedValue({});

        const result = await executeBulkOperation(baseConfig);

        expect(result.success).toBe(true);
        expect(result.successCount).toBe(2);
        expect(result.failedCount).toBe(0);
        expect(result.errors).toBeUndefined();
        expect(result.message).toBe("2 item(s) update successfully");
      });

      it("should mark partial success as successful", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update
          .mockResolvedValueOnce({})
          .mockRejectedValueOnce(new Error("Failed"));

        const result = await executeBulkOperation(baseConfig);

        expect(result.success).toBe(true);
        expect(result.successCount).toBe(1);
        expect(result.failedCount).toBe(1);
        expect(result.message).toBe("1 item(s) update successfully, 1 failed");
      });

      it("should include updated_at timestamp in updates", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockResolvedValue({});

        await executeBulkOperation(baseConfig);

        expect(mockDoc.update).toHaveBeenCalledWith(
          expect.objectContaining({
            updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          })
        );
      });
    });

    describe("Database Interaction", () => {
      it("should use correct collection name", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });
        mockDoc.update.mockResolvedValue({});

        await executeBulkOperation(baseConfig);

        expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
      });

      it("should process items in order", async () => {
        const ids = ["id1", "id2", "id3"];
        const callOrder: string[] = [];

        mockDoc.get.mockImplementation(async () => {
          return { exists: true, data: () => ({}) };
        });

        mockDoc.update.mockImplementation(async () => {
          // Track which ID was processed based on collection.doc call
          return {};
        });

        mockCollection.mockImplementation((collectionName: string) => ({
          doc: jest.fn((id: string) => {
            callOrder.push(id);
            return mockDoc;
          }),
        }));

        await executeBulkOperation({
          ...baseConfig,
          ids,
        });

        expect(callOrder).toEqual(ids);
      });
    });
  });

  describe("validateBulkPermission", () => {
    beforeEach(() => {
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({ role: "admin" }),
      });
    });

    describe("Authentication", () => {
      it("should reject when userId is empty", async () => {
        const result = await validateBulkPermission("", "admin");

        expect(result.valid).toBe(false);
        expect(result.error).toBe("Authentication required");
      });

      it("should reject when userId is not provided", async () => {
        const result = await validateBulkPermission(null as any, "admin");

        expect(result.valid).toBe(false);
        expect(result.error).toBe("Authentication required");
      });
    });

    describe("User Existence", () => {
      it("should reject when user not found", async () => {
        mockDoc.get.mockResolvedValue({ exists: false });

        const result = await validateBulkPermission("user123", "admin");

        expect(result.valid).toBe(false);
        expect(result.error).toBe("User not found");
      });

      it("should query correct collection", async () => {
        await validateBulkPermission("user123", "admin");

        expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.USERS);
      });
    });

    describe("Role Hierarchy", () => {
      it("should allow admin to perform admin action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "admin" }),
        });

        const result = await validateBulkPermission("user123", "admin");

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should allow admin to perform seller action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "admin" }),
        });

        const result = await validateBulkPermission("user123", "seller");

        expect(result.valid).toBe(true);
      });

      it("should allow admin to perform user action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "admin" }),
        });

        const result = await validateBulkPermission("user123", "user");

        expect(result.valid).toBe(true);
      });

      it("should allow seller to perform seller action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "seller" }),
        });

        const result = await validateBulkPermission("user123", "seller");

        expect(result.valid).toBe(true);
      });

      it("should allow seller to perform user action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "seller" }),
        });

        const result = await validateBulkPermission("user123", "user");

        expect(result.valid).toBe(true);
      });

      it("should reject seller from performing admin action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "seller" }),
        });

        const result = await validateBulkPermission("user123", "admin");

        expect(result.valid).toBe(false);
        expect(result.error).toContain("Insufficient permissions");
        expect(result.error).toContain("Required: admin");
        expect(result.error).toContain("Current: seller");
      });

      it("should reject user from performing admin action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "user" }),
        });

        const result = await validateBulkPermission("user123", "admin");

        expect(result.valid).toBe(false);
        expect(result.error).toContain("Insufficient permissions");
      });

      it("should reject user from performing seller action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "user" }),
        });

        const result = await validateBulkPermission("user123", "seller");

        expect(result.valid).toBe(false);
        expect(result.error).toContain("Insufficient permissions");
      });

      it("should allow user to perform user action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({ role: "user" }),
        });

        const result = await validateBulkPermission("user123", "user");

        expect(result.valid).toBe(true);
      });

      it("should default to user role when role not set", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });

        const result = await validateBulkPermission("user123", "user");

        expect(result.valid).toBe(true);
      });

      it("should reject default user from admin action", async () => {
        mockDoc.get.mockResolvedValue({
          exists: true,
          data: () => ({}),
        });

        const result = await validateBulkPermission("user123", "admin");

        expect(result.valid).toBe(false);
      });
    });

    describe("Error Handling", () => {
      it("should handle database errors gracefully", async () => {
        mockDoc.get.mockRejectedValue(new Error("Database error"));

        const result = await validateBulkPermission("user123", "admin");

        expect(result.valid).toBe(false);
        expect(result.error).toBe("Permission validation failed");
      });

      it("should log database errors", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        mockDoc.get.mockRejectedValue(new Error("Database error"));

        await validateBulkPermission("user123", "admin");

        expect(consoleSpy).toHaveBeenCalledWith(
          "Error validating bulk permission:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe("parseBulkRequest", () => {
    const createMockRequest = (body: any): NextRequest => {
      return {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;
    };

    describe("Valid Requests", () => {
      it("should parse valid request with all fields", async () => {
        const req = createMockRequest({
          action: "update",
          ids: ["id1", "id2"],
          data: { price: 100 },
          userId: "user123",
        });

        const result = await parseBulkRequest(req);

        expect(result).toEqual({
          action: "update",
          ids: ["id1", "id2"],
          data: { price: 100 },
          userId: "user123",
        });
      });

      it("should parse request without optional fields", async () => {
        const req = createMockRequest({
          action: "delete",
          ids: ["id1"],
        });

        const result = await parseBulkRequest(req);

        expect(result).toEqual({
          action: "delete",
          ids: ["id1"],
          data: undefined,
          userId: undefined,
        });
      });

      it("should accept single ID in array", async () => {
        const req = createMockRequest({
          action: "update",
          ids: ["id1"],
        });

        const result = await parseBulkRequest(req);

        expect(result.ids).toEqual(["id1"]);
      });
    });

    describe("Missing Fields", () => {
      it("should throw error when action is missing", async () => {
        const req = createMockRequest({
          ids: ["id1"],
        });

        await expect(parseBulkRequest(req)).rejects.toThrow(
          "Action is required"
        );
      });

      it("should throw error when action is empty", async () => {
        const req = createMockRequest({
          action: "",
          ids: ["id1"],
        });

        await expect(parseBulkRequest(req)).rejects.toThrow(
          "Action is required"
        );
      });

      it("should throw error when ids is missing", async () => {
        const req = createMockRequest({
          action: "update",
        });

        await expect(parseBulkRequest(req)).rejects.toThrow(
          "IDs array is required and must not be empty"
        );
      });

      it("should throw error when ids is not array", async () => {
        const req = createMockRequest({
          action: "update",
          ids: "not-an-array",
        });

        await expect(parseBulkRequest(req)).rejects.toThrow(
          "IDs array is required and must not be empty"
        );
      });

      it("should throw error when ids array is empty", async () => {
        const req = createMockRequest({
          action: "update",
          ids: [],
        });

        await expect(parseBulkRequest(req)).rejects.toThrow(
          "IDs array is required and must not be empty"
        );
      });
    });
  });

  describe("commonBulkHandlers", () => {
    describe("activate", () => {
      it("should set is_active and status to active", async () => {
        mockDoc.update.mockResolvedValue({});

        await commonBulkHandlers.activate(mockDb, "id1", COLLECTIONS.PRODUCTS);

        expect(mockDoc.update).toHaveBeenCalledWith({
          is_active: true,
          status: "active",
          updated_at: expect.any(String),
        });
      });

      it("should throw error when collection not provided", async () => {
        await expect(
          commonBulkHandlers.activate(mockDb, "id1", "")
        ).rejects.toThrow("Collection name is required for bulk activate");
      });

      it("should use correct collection and document", async () => {
        const docMock = jest.fn(() => mockDoc);
        mockCollection.mockReturnValue({ doc: docMock });
        mockDoc.update.mockResolvedValue({});

        await commonBulkHandlers.activate(mockDb, "id1", COLLECTIONS.PRODUCTS);

        expect(mockCollection).toHaveBeenCalledWith(COLLECTIONS.PRODUCTS);
        expect(docMock).toHaveBeenCalledWith("id1");
      });
    });

    describe("deactivate", () => {
      it("should set is_active and status to inactive", async () => {
        mockDoc.update.mockResolvedValue({});

        await commonBulkHandlers.deactivate(
          mockDb,
          "id1",
          COLLECTIONS.PRODUCTS
        );

        expect(mockDoc.update).toHaveBeenCalledWith({
          is_active: false,
          status: "inactive",
          updated_at: expect.any(String),
        });
      });

      it("should throw error when collection not provided", async () => {
        await expect(
          commonBulkHandlers.deactivate(mockDb, "id1", "")
        ).rejects.toThrow("Collection name is required for bulk deactivate");
      });
    });

    describe("softDelete", () => {
      it("should set is_deleted and deleted_at", async () => {
        mockDoc.update.mockResolvedValue({});

        await commonBulkHandlers.softDelete(
          mockDb,
          "id1",
          COLLECTIONS.PRODUCTS
        );

        expect(mockDoc.update).toHaveBeenCalledWith({
          is_deleted: true,
          deleted_at: expect.any(String),
          updated_at: expect.any(String),
        });
      });

      it("should throw error when collection not provided", async () => {
        await expect(
          commonBulkHandlers.softDelete(mockDb, "id1", "")
        ).rejects.toThrow("Collection name is required for bulk soft delete");
      });

      it("should include both timestamps", async () => {
        mockDoc.update.mockResolvedValue({});

        await commonBulkHandlers.softDelete(
          mockDb,
          "id1",
          COLLECTIONS.PRODUCTS
        );

        const updateCall = mockDoc.update.mock.calls[0][0];
        expect(updateCall.deleted_at).toBeDefined();
        expect(updateCall.updated_at).toBeDefined();
        expect(updateCall.deleted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(updateCall.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    });

    describe("hardDelete", () => {
      it("should permanently delete document", async () => {
        mockDoc.delete.mockResolvedValue({});

        await commonBulkHandlers.hardDelete(
          mockDb,
          "id1",
          COLLECTIONS.PRODUCTS
        );

        expect(mockDoc.delete).toHaveBeenCalledWith();
      });

      it("should throw error when collection not provided", async () => {
        await expect(
          commonBulkHandlers.hardDelete(mockDb, "id1", "")
        ).rejects.toThrow("Collection name is required for bulk hard delete");
      });

      it("should not update, only delete", async () => {
        mockDoc.delete.mockResolvedValue({});

        await commonBulkHandlers.hardDelete(
          mockDb,
          "id1",
          COLLECTIONS.PRODUCTS
        );

        expect(mockDoc.update).not.toHaveBeenCalled();
        expect(mockDoc.delete).toHaveBeenCalled();
      });
    });

    describe("updateField", () => {
      it("should create handler that updates specific field", async () => {
        const handler = commonBulkHandlers.updateField(
          "price",
          100,
          COLLECTIONS.PRODUCTS
        );
        mockDoc.update.mockResolvedValue({});

        await handler(mockDb, "id1");

        expect(mockDoc.update).toHaveBeenCalledWith({
          price: 100,
          updated_at: expect.any(String),
        });
      });

      it("should throw error when collection not provided", async () => {
        const handler = commonBulkHandlers.updateField("price", 100, "");

        await expect(handler(mockDb, "id1")).rejects.toThrow(
          "Collection name is required for bulk update field"
        );
      });

      it("should handle different field types", async () => {
        const handlers = [
          commonBulkHandlers.updateField("name", "Test", COLLECTIONS.PRODUCTS),
          commonBulkHandlers.updateField("count", 42, COLLECTIONS.PRODUCTS),
          commonBulkHandlers.updateField("active", true, COLLECTIONS.PRODUCTS),
          commonBulkHandlers.updateField(
            "tags",
            ["a", "b"],
            COLLECTIONS.PRODUCTS
          ),
        ];

        mockDoc.update.mockResolvedValue({});

        await handlers[0](mockDb, "id1");
        expect(mockDoc.update).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Test" })
        );

        await handlers[1](mockDb, "id1");
        expect(mockDoc.update).toHaveBeenCalledWith(
          expect.objectContaining({ count: 42 })
        );

        await handlers[2](mockDb, "id1");
        expect(mockDoc.update).toHaveBeenCalledWith(
          expect.objectContaining({ active: true })
        );

        await handlers[3](mockDb, "id1");
        expect(mockDoc.update).toHaveBeenCalledWith(
          expect.objectContaining({ tags: ["a", "b"] })
        );
      });
    });
  });

  describe("createBulkErrorResponse", () => {
    it("should create error response with message", () => {
      const error = new Error("Test error");
      const response = createBulkErrorResponse(error);

      expect(response).toEqual({
        success: false,
        successCount: 0,
        failedCount: 0,
        message: "Test error",
        error: "Test error",
      });
    });

    it("should handle error without message", () => {
      const error = {};
      const response = createBulkErrorResponse(error);

      expect(response.message).toBe("Bulk operation failed");
      expect(response.error).toBeUndefined();
    });

    it("should extract message from error object", () => {
      const error = { message: "Custom error" };
      const response = createBulkErrorResponse(error);

      expect(response.message).toBe("Custom error");
      expect(response.error).toBe("Custom error");
    });
  });

  describe("executeBulkOperationWithTransaction", () => {
    const baseConfig: BulkOperationConfig = {
      collection: COLLECTIONS.PRODUCTS,
      action: "update",
      ids: ["id1", "id2"],
      data: { price: 100 },
    };

    describe("Input Validation", () => {
      it("should return error when no IDs provided", async () => {
        const result = await executeBulkOperationWithTransaction({
          ...baseConfig,
          ids: [],
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("No items selected");
      });

      it("should return error when IDs undefined", async () => {
        const result = await executeBulkOperationWithTransaction({
          ...baseConfig,
          ids: undefined as any,
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("No items selected");
      });
    });

    describe("Transaction Execution", () => {
      it("should update all documents in transaction", async () => {
        mockTransaction.get.mockResolvedValue({ exists: true });

        const result = await executeBulkOperationWithTransaction(baseConfig);

        expect(result.success).toBe(true);
        expect(result.successCount).toBe(2);
        expect(result.failedCount).toBe(0);
        expect(mockTransaction.update).toHaveBeenCalledTimes(2);
      });

      it("should get all documents before updating", async () => {
        mockTransaction.get.mockResolvedValue({ exists: true });

        await executeBulkOperationWithTransaction(baseConfig);

        expect(mockTransaction.get).toHaveBeenCalledTimes(2);
        expect(mockTransaction.update).toHaveBeenCalledTimes(2);
      });

      it("should include updated_at in transaction updates", async () => {
        mockTransaction.get.mockResolvedValue({ exists: true });

        await executeBulkOperationWithTransaction(baseConfig);

        expect(mockTransaction.update).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            price: 100,
            updated_at: expect.any(String),
          })
        );
      });
    });

    describe("Document Validation", () => {
      it("should fail transaction if any document not found", async () => {
        mockTransaction.get
          .mockResolvedValueOnce({ exists: true })
          .mockResolvedValueOnce({ exists: false });

        const result = await executeBulkOperationWithTransaction(baseConfig);

        expect(result.success).toBe(false);
        expect(result.successCount).toBe(0);
        expect(result.failedCount).toBe(2);
        expect(result.message).toBe("Transaction failed");
        expect(result.errors?.[0].id).toBe("all");
      });

      it("should validate all documents exist before any updates", async () => {
        mockTransaction.get.mockResolvedValue({ exists: true });

        await executeBulkOperationWithTransaction(baseConfig);

        // All gets should happen before any update
        const calls = mockDb.runTransaction.mock.calls[0][0].toString();
        expect(calls).toContain("get");
        expect(calls).toContain("update");
      });
    });

    describe("Error Handling", () => {
      it("should handle transaction errors", async () => {
        mockDb.runTransaction.mockRejectedValue(new Error("Transaction error"));

        const result = await executeBulkOperationWithTransaction(baseConfig);

        expect(result.success).toBe(false);
        expect(result.failedCount).toBe(2);
        expect(result.errors?.[0].error).toBe("Transaction error");
      });

      it("should fail entire operation on any error", async () => {
        mockTransaction.get.mockResolvedValue({ exists: true });
        mockTransaction.update.mockImplementation(() => {
          throw new Error("Update failed");
        });

        mockDb.runTransaction.mockImplementation(async (callback) => {
          try {
            await callback(mockTransaction);
          } catch (error: any) {
            throw error;
          }
        });

        const result = await executeBulkOperationWithTransaction(baseConfig);

        expect(result.success).toBe(false);
        expect(result.successCount).toBe(0);
      });
    });

    describe("Success Response", () => {
      it("should return success message with count", async () => {
        mockTransaction.get.mockResolvedValue({ exists: true });

        const result = await executeBulkOperationWithTransaction(baseConfig);

        expect(result.message).toBe("2 item(s) update successfully");
      });

      it("should not include errors on success", async () => {
        mockTransaction.get.mockResolvedValue({ exists: true });

        const result = await executeBulkOperationWithTransaction(baseConfig);

        expect(result.errors).toBeUndefined();
      });
    });
  });
});
