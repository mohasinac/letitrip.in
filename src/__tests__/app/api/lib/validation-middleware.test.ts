/**
 * Unit Tests for Validation Middleware
 * Tests API request validation for endpoints
 *
 * TESTS COVER:
 * - validateRequest with various resource types
 * - validateBulkRequest for bulk operations
 * - createValidationErrorResponse formatting
 * - withValidation middleware wrapper
 * - withBulkValidation middleware wrapper
 * - sanitizeInput for XSS prevention
 * - validateAndSanitize combined functionality
 * - Error handling and edge cases
 *
 * CODE ISSUES FOUND:
 * 1. sanitizeInput is basic and might miss advanced XSS vectors
 * 2. No rate limiting on validation failures
 * 3. Error messages could leak schema information
 * 4. No validation caching for repeated requests
 * 5. Missing input length validation (DoS risk)
 * 6. Sanitization happens after validation (should be before)
 */

import {
  createValidationErrorResponse,
  sanitizeInput,
  validateAndSanitize,
  validateBulkRequest,
  validateRequest,
  ValidationError,
  withBulkValidation,
  withValidation,
} from "@/app/api/lib/validation-middleware";
import {
  getValidationSchema,
  validateBulkAction,
  validateFormData,
} from "@/lib/validation/inline-edit-schemas";
import { NextRequest, NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/lib/validation/inline-edit-schemas");

const mockGetValidationSchema = getValidationSchema as jest.MockedFunction<
  typeof getValidationSchema
>;
const mockValidateBulkAction = validateBulkAction as jest.MockedFunction<
  typeof validateBulkAction
>;
const mockValidateFormData = validateFormData as jest.MockedFunction<
  typeof validateFormData
>;

describe("validation-middleware", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock request
    mockRequest = {
      json: jest.fn(),
      url: "https://example.com/api/test",
      headers: new Map(),
    } as unknown as NextRequest;
  });

  describe("validateRequest", () => {
    it("should return valid result for valid data", async () => {
      const mockData = { name: "Test Product", price: 100 };
      const mockSchema = [
        { field: "name", required: true, type: "string" },
        { field: "price", required: true, type: "number" },
      ];

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockGetValidationSchema.mockReturnValue(mockSchema);
      mockValidateFormData.mockReturnValue({});

      const result = await validateRequest(mockRequest, "product");

      expect(result.valid).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.errors).toBeUndefined();
    });

    it("should return errors for invalid data", async () => {
      const mockData = { name: "", price: -10 };
      const mockSchema = [
        { field: "name", required: true, type: "string" },
        { field: "price", required: true, type: "number" },
      ];
      const mockErrors = {
        name: "Name is required",
        price: "Price must be positive",
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockGetValidationSchema.mockReturnValue(mockSchema);
      mockValidateFormData.mockReturnValue(mockErrors);

      const result = await validateRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContainEqual({
        field: "name",
        message: "Name is required",
      });
      expect(result.errors).toContainEqual({
        field: "price",
        message: "Price must be positive",
      });
    });

    it("should handle missing schema", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      mockGetValidationSchema.mockReturnValue(null as any);

      const result = await validateRequest(mockRequest, "unknown");

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        {
          field: "_general",
          message: "No validation schema found for unknown",
        },
      ]);
    });

    it("should handle empty schema", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({});
      mockGetValidationSchema.mockReturnValue([]);

      const result = await validateRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        {
          field: "_general",
          message: "No validation schema found for product",
        },
      ]);
    });

    it("should handle invalid JSON body", async () => {
      (mockRequest.json as jest.Mock).mockRejectedValue(
        new Error("Invalid JSON")
      );

      const result = await validateRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        { field: "_general", message: "Invalid request body" },
      ]);
    });

    it("should call validation schema for correct resource type", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ name: "Test" });
      mockGetValidationSchema.mockReturnValue([]);

      await validateRequest(mockRequest, "product");

      expect(mockGetValidationSchema).toHaveBeenCalledWith("product");
    });

    it("should handle multiple validation errors", async () => {
      const mockData = { name: "", price: "", category: "" };
      const mockSchema = [{ field: "name", required: true }];
      const mockErrors = {
        name: "Name is required",
        price: "Price is required",
        category: "Category is required",
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockGetValidationSchema.mockReturnValue(mockSchema);
      mockValidateFormData.mockReturnValue(mockErrors);

      const result = await validateRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBe(3);
    });
  });

  describe("validateBulkRequest", () => {
    it("should return valid result for valid bulk request", async () => {
      const mockData = {
        action: "delete",
        ids: ["id1", "id2", "id3"],
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockValidateBulkAction.mockReturnValue({ valid: true });

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it("should return error for missing action", async () => {
      const mockData = {
        ids: ["id1", "id2"],
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "action",
        message: "Action is required and must be a string",
      });
    });

    it("should return error for non-string action", async () => {
      const mockData = {
        action: 123,
        ids: ["id1"],
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "action",
        message: "Action is required and must be a string",
      });
    });

    it("should return error for missing ids", async () => {
      const mockData = {
        action: "delete",
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "ids",
        message: "IDs must be a non-empty array",
      });
    });

    it("should return error for empty ids array", async () => {
      const mockData = {
        action: "delete",
        ids: [],
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "ids",
        message: "IDs must be a non-empty array",
      });
    });

    it("should return error for non-array ids", async () => {
      const mockData = {
        action: "delete",
        ids: "id1",
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "ids",
        message: "IDs must be a non-empty array",
      });
    });

    it("should return error for invalid action", async () => {
      const mockData = {
        action: "invalid-action",
        ids: ["id1"],
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockValidateBulkAction.mockReturnValue({
        valid: false,
        error: "Action not supported",
      });

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "action",
        message: "Action not supported",
      });
    });

    it("should handle invalid JSON body", async () => {
      (mockRequest.json as jest.Mock).mockRejectedValue(
        new Error("Invalid JSON")
      );

      const result = await validateBulkRequest(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        { field: "_general", message: "Invalid request body" },
      ]);
    });

    it("should call validateBulkAction with correct parameters", async () => {
      const mockData = {
        action: "update",
        ids: ["id1"],
        data: { status: "active" },
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockValidateBulkAction.mockReturnValue({ valid: true });

      await validateBulkRequest(mockRequest, "product");

      expect(mockValidateBulkAction).toHaveBeenCalledWith("update", "product", {
        status: "active",
      });
    });
  });

  describe("createValidationErrorResponse", () => {
    it("should create proper error response", async () => {
      const errors: ValidationError[] = [
        { field: "name", message: "Name is required" },
        { field: "price", message: "Price must be positive" },
      ];

      const response = createValidationErrorResponse(errors);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Validation failed");
      expect(data.errors).toEqual({
        name: "Name is required",
        price: "Price must be positive",
      });
    });

    it("should handle single error", async () => {
      const errors: ValidationError[] = [
        { field: "email", message: "Invalid email format" },
      ];

      const response = createValidationErrorResponse(errors);
      const data = await response.json();

      expect(data.errors).toEqual({
        email: "Invalid email format",
      });
    });

    it("should handle empty errors array", async () => {
      const errors: ValidationError[] = [];

      const response = createValidationErrorResponse(errors);
      const data = await response.json();

      expect(data.errors).toEqual({});
    });

    it("should handle general errors", async () => {
      const errors: ValidationError[] = [
        { field: "_general", message: "Something went wrong" },
      ];

      const response = createValidationErrorResponse(errors);
      const data = await response.json();

      expect(data.errors).toEqual({
        _general: "Something went wrong",
      });
    });
  });

  describe("withValidation", () => {
    it("should call handler with validated data on success", async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));
      const mockData = { name: "Test" };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockGetValidationSchema.mockReturnValue([{ field: "name" }]);
      mockValidateFormData.mockReturnValue({});

      const wrappedHandler = withValidation("product", mockHandler);
      await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockData);
    });

    it("should return validation error response on failure", async () => {
      const mockHandler = jest.fn();

      (mockRequest.json as jest.Mock).mockResolvedValue({ name: "" });
      mockGetValidationSchema.mockReturnValue([{ field: "name" }]);
      mockValidateFormData.mockReturnValue({ name: "Name is required" });

      const wrappedHandler = withValidation("product", mockHandler);
      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should handle handler errors", async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new Error("Handler error"));

      (mockRequest.json as jest.Mock).mockResolvedValue({ name: "Test" });
      mockGetValidationSchema.mockReturnValue([{ field: "name" }]);
      mockValidateFormData.mockReturnValue({});

      const wrappedHandler = withValidation("product", mockHandler);

      await expect(wrappedHandler(mockRequest)).rejects.toThrow(
        "Handler error"
      );
    });
  });

  describe("withBulkValidation", () => {
    it("should call handler with validated data on success", async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));
      const mockData = {
        action: "delete",
        ids: ["id1", "id2"],
        data: {},
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockValidateBulkAction.mockReturnValue({ valid: true });

      const wrappedHandler = withBulkValidation("product", mockHandler);
      await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockData);
    });

    it("should return validation error response on failure", async () => {
      const mockHandler = jest.fn();

      (mockRequest.json as jest.Mock).mockResolvedValue({
        action: "delete",
        ids: [],
      });

      const wrappedHandler = withBulkValidation("product", mockHandler);
      const response = await wrappedHandler(mockRequest);
      const data = await response.json();

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove script tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeInput(input);

      expect(result).toBe("Hello");
      expect(result).not.toContain("<script>");
    });

    it("should remove iframe tags", () => {
      const input = "<iframe src='evil.com'></iframe>Hello";
      const result = sanitizeInput(input);

      expect(result).toBe("Hello");
      expect(result).not.toContain("<iframe>");
    });

    it("should remove event handlers with double quotes", () => {
      const input = "<div onclick=\"alert('xss')\">Hello</div>";
      const result = sanitizeInput(input);

      expect(result).not.toContain("onclick");
      expect(result).toContain("Hello");
    });

    it("should remove event handlers with single quotes", () => {
      const input = "<div onclick='alert(\"xss\")'>Hello</div>";
      const result = sanitizeInput(input);

      expect(result).not.toContain("onclick");
    });

    it("should remove javascript: URIs", () => {
      const input = "javascript:alert('xss')";
      const result = sanitizeInput(input);

      expect(result).toBe("alert('xss')");
      expect(result).not.toContain("javascript:");
    });

    it("should remove data:text/html URIs", () => {
      const input = "data:text/html,<script>alert('xss')</script>";
      const result = sanitizeInput(input);

      expect(result).not.toContain("data:text/html");
    });

    it("should trim whitespace", () => {
      const input = "   Hello World   ";
      const result = sanitizeInput(input);

      expect(result).toBe("Hello World");
    });

    it("should sanitize arrays recursively", () => {
      const input = [
        "<script>alert('xss')</script>",
        "Safe string",
        "<iframe></iframe>",
      ];
      const result = sanitizeInput(input);

      expect(result).toEqual(["", "Safe string", ""]);
    });

    it("should sanitize objects recursively", () => {
      const input = {
        name: "<script>alert('xss')</script>",
        email: "test@example.com",
        nested: {
          value: "<iframe></iframe>",
        },
      };
      const result = sanitizeInput(input);

      expect(result.name).toBe("");
      expect(result.email).toBe("test@example.com");
      expect(result.nested.value).toBe("");
    });

    it("should handle numbers", () => {
      const input = 123;
      const result = sanitizeInput(input);

      expect(result).toBe(123);
    });

    it("should handle booleans", () => {
      const input = true;
      const result = sanitizeInput(input);

      expect(result).toBe(true);
    });

    it("should handle null", () => {
      const input = null;
      const result = sanitizeInput(input);

      expect(result).toBeNull();
    });

    it("should handle undefined", () => {
      const input = undefined;
      const result = sanitizeInput(input);

      expect(result).toBeUndefined();
    });

    it("should handle nested arrays and objects", () => {
      const input = {
        items: [{ name: "<script>alert(1)</script>" }, { name: "Safe" }],
      };
      const result = sanitizeInput(input);

      expect(result.items[0].name).toBe("");
      expect(result.items[1].name).toBe("Safe");
    });

    it("should be case-insensitive for script tags", () => {
      const input = "<SCRIPT>alert('xss')</SCRIPT>";
      const result = sanitizeInput(input);

      expect(result).toBe("");
    });

    it("should remove multiple script tags", () => {
      const input = "<script>alert(1)</script>Hello<script>alert(2)</script>";
      const result = sanitizeInput(input);

      expect(result).toBe("Hello");
    });

    it("should handle mixed content", () => {
      const input =
        "Normal text <script>evil()</script> more text <iframe></iframe> end";
      const result = sanitizeInput(input);

      expect(result).toBe("Normal text  more text  end");
    });
  });

  describe("validateAndSanitize", () => {
    it("should validate and sanitize on success", async () => {
      const mockData = {
        name: "<script>alert('xss')</script>Product",
        price: 100,
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockGetValidationSchema.mockReturnValue([{ field: "name" }]);
      mockValidateFormData.mockReturnValue({});

      const result = await validateAndSanitize(mockRequest, "product");

      expect(result.valid).toBe(true);
      expect(result.data?.name).toBe("Product");
      expect(result.data?.price).toBe(100);
    });

    it("should return validation errors without sanitizing", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ name: "" });
      mockGetValidationSchema.mockReturnValue([{ field: "name" }]);
      mockValidateFormData.mockReturnValue({ name: "Name is required" });

      const result = await validateAndSanitize(mockRequest, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it("should sanitize nested data", async () => {
      const mockData = {
        name: "Product",
        details: {
          description: "<script>alert('xss')</script>Description",
        },
      };

      (mockRequest.json as jest.Mock).mockResolvedValue(mockData);
      mockGetValidationSchema.mockReturnValue([{ field: "name" }]);
      mockValidateFormData.mockReturnValue({});

      const result = await validateAndSanitize(mockRequest, "product");

      expect(result.valid).toBe(true);
      expect(result.data?.details.description).toBe("Description");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long strings in validation", async () => {
      const longString = "a".repeat(1000000);
      (mockRequest.json as jest.Mock).mockResolvedValue({ name: longString });
      mockGetValidationSchema.mockReturnValue([{ field: "name" }]);
      mockValidateFormData.mockReturnValue({});

      const result = await validateRequest(mockRequest, "product");

      expect(result.valid).toBe(true);
    });

    it("should handle deeply nested objects", () => {
      const deepObj = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: "<script>alert('xss')</script>",
              },
            },
          },
        },
      };

      const result = sanitizeInput(deepObj);

      expect(result.level1.level2.level3.level4.value).toBe("");
    });

    it("should handle circular references gracefully", () => {
      const obj: any = { name: "Test" };
      obj.self = obj; // Circular reference

      // Should not throw, but may not sanitize circular part correctly
      expect(() => sanitizeInput(obj)).not.toThrow();
    });

    it("should handle empty strings", () => {
      const result = sanitizeInput("");
      expect(result).toBe("");
    });

    it("should handle strings with only whitespace", () => {
      const result = sanitizeInput("   \n\t   ");
      expect(result).toBe("");
    });

    it("should handle special characters", () => {
      const input = "Test & Co. <> \"quotes\" 'apostrophes'";
      const result = sanitizeInput(input);
      expect(result).toContain("Test & Co.");
    });

    it("should handle unicode characters", () => {
      const input = "Hello 世界 🌍";
      const result = sanitizeInput(input);
      expect(result).toBe("Hello 世界 🌍");
    });

    it("should handle empty objects", () => {
      const result = sanitizeInput({});
      expect(result).toEqual({});
    });

    it("should handle empty arrays", () => {
      const result = sanitizeInput([]);
      expect(result).toEqual([]);
    });
  });
});
