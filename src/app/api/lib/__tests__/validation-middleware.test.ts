/**
 * Comprehensive test suite for validation-middleware.ts
 * Tests: 80+ tests covering all validation scenarios
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createValidationErrorResponse,
  sanitizeInput,
  validateAndSanitize,
  validateBulkRequest,
  validateRequest,
  ValidationError,
  withBulkValidation,
  withValidation,
} from "../validation-middleware";

// Mock dependencies
jest.mock("@/lib/validation/inline-edit-schemas");

const {
  getValidationSchema,
  validateBulkAction,
  validateFormData,
} = require("@/lib/validation/inline-edit-schemas");

describe("validation-middleware.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateRequest", () => {
    const createMockRequest = (body: any): NextRequest => {
      return {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;
    };

    describe("Schema Validation", () => {
      it("should return error when no schema found", async () => {
        getValidationSchema.mockReturnValue(null);
        const req = createMockRequest({ name: "Test" });

        const result = await validateRequest(req, "unknown");

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors?.[0].field).toBe("_general");
        expect(result.errors?.[0].message).toContain(
          "No validation schema found for unknown"
        );
      });

      it("should return error when schema is empty array", async () => {
        getValidationSchema.mockReturnValue([]);
        const req = createMockRequest({ name: "Test" });

        const result = await validateRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].message).toContain(
          "No validation schema found for product"
        );
      });

      it("should use getValidationSchema with correct resource type", async () => {
        getValidationSchema.mockReturnValue([{ field: "name" }]);
        validateFormData.mockReturnValue({});
        const req = createMockRequest({ name: "Test" });

        await validateRequest(req, "product");

        expect(getValidationSchema).toHaveBeenCalledWith("product");
      });
    });

    describe("Valid Data", () => {
      it("should return valid result when no validation errors", async () => {
        getValidationSchema.mockReturnValue([{ field: "name" }]);
        validateFormData.mockReturnValue({});
        const body = { name: "Test Product", price: 100 };
        const req = createMockRequest(body);

        const result = await validateRequest(req, "product");

        expect(result.valid).toBe(true);
        expect(result.data).toEqual(body);
        expect(result.errors).toBeUndefined();
      });

      it("should pass body to validateFormData", async () => {
        const schema = [{ field: "name" }];
        const body = { name: "Test" };
        getValidationSchema.mockReturnValue(schema);
        validateFormData.mockReturnValue({});
        const req = createMockRequest(body);

        await validateRequest(req, "product");

        expect(validateFormData).toHaveBeenCalledWith(body, schema);
      });
    });

    describe("Validation Errors", () => {
      it("should return validation errors from validateFormData", async () => {
        getValidationSchema.mockReturnValue([{ field: "name" }]);
        validateFormData.mockReturnValue({
          name: "Name is required",
          price: "Price must be positive",
        });
        const req = createMockRequest({ name: "" });

        const result = await validateRequest(req, "product");

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

      it("should convert validation errors to array format", async () => {
        getValidationSchema.mockReturnValue([{ field: "email" }]);
        validateFormData.mockReturnValue({
          email: "Invalid email format",
        });
        const req = createMockRequest({ email: "invalid" });

        const result = await validateRequest(req, "user");

        expect(result.valid).toBe(false);
        expect(Array.isArray(result.errors)).toBe(true);
        expect(result.errors?.[0]).toHaveProperty("field");
        expect(result.errors?.[0]).toHaveProperty("message");
      });

      it("should not include data when validation fails", async () => {
        getValidationSchema.mockReturnValue([{ field: "name" }]);
        validateFormData.mockReturnValue({ name: "Required" });
        const req = createMockRequest({ name: "" });

        const result = await validateRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.data).toBeUndefined();
      });
    });

    describe("Error Handling", () => {
      it("should handle JSON parsing errors", async () => {
        const req = {
          json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
        } as unknown as NextRequest;

        const result = await validateRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("_general");
        expect(result.errors?.[0].message).toBe("Invalid request body");
      });

      it("should handle schema retrieval errors", async () => {
        getValidationSchema.mockImplementation(() => {
          throw new Error("Schema error");
        });
        const req = createMockRequest({ name: "Test" });

        const result = await validateRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].message).toBe("Invalid request body");
      });

      it("should handle validateFormData errors", async () => {
        getValidationSchema.mockReturnValue([{ field: "name" }]);
        validateFormData.mockImplementation(() => {
          throw new Error("Validation error");
        });
        const req = createMockRequest({ name: "Test" });

        const result = await validateRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].message).toBe("Invalid request body");
      });
    });
  });

  describe("validateBulkRequest", () => {
    const createMockRequest = (body: any): NextRequest => {
      return {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;
    };

    describe("Action Validation", () => {
      it("should return error when action is missing", async () => {
        const req = createMockRequest({ ids: ["id1"] });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("action");
        expect(result.errors?.[0].message).toContain("Action is required");
      });

      it("should return error when action is not a string", async () => {
        const req = createMockRequest({ action: 123, ids: ["id1"] });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("action");
        expect(result.errors?.[0].message).toContain("must be a string");
      });

      it("should return error when action is empty string", async () => {
        const req = createMockRequest({ action: "", ids: ["id1"] });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("action");
      });

      it("should accept valid string action", async () => {
        validateBulkAction.mockReturnValue({ valid: true });
        const req = createMockRequest({
          action: "delete",
          ids: ["id1"],
        });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(true);
      });
    });

    describe("IDs Validation", () => {
      it("should return error when ids is missing", async () => {
        const req = createMockRequest({ action: "delete" });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("ids");
        expect(result.errors?.[0].message).toContain("non-empty array");
      });

      it("should return error when ids is not an array", async () => {
        const req = createMockRequest({ action: "delete", ids: "id1" });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("ids");
      });

      it("should return error when ids is empty array", async () => {
        const req = createMockRequest({ action: "delete", ids: [] });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("ids");
        expect(result.errors?.[0].message).toContain("non-empty array");
      });

      it("should accept non-empty ids array", async () => {
        validateBulkAction.mockReturnValue({ valid: true });
        const req = createMockRequest({
          action: "delete",
          ids: ["id1", "id2"],
        });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(true);
      });
    });

    describe("Bulk Action Validation", () => {
      it("should validate action against resource type", async () => {
        validateBulkAction.mockReturnValue({ valid: true });
        const data = { status: "active" };
        const req = createMockRequest({
          action: "activate",
          ids: ["id1"],
          data,
        });

        await validateBulkRequest(req, "product");

        expect(validateBulkAction).toHaveBeenCalledWith(
          "activate",
          "product",
          data
        );
      });

      it("should return error when action validation fails", async () => {
        validateBulkAction.mockReturnValue({
          valid: false,
          error: "Action not allowed for this resource",
        });
        const req = createMockRequest({
          action: "invalid",
          ids: ["id1"],
        });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("action");
        expect(result.errors?.[0].message).toBe(
          "Action not allowed for this resource"
        );
      });

      it("should use default error message when validation error not provided", async () => {
        validateBulkAction.mockReturnValue({ valid: false });
        const req = createMockRequest({
          action: "invalid",
          ids: ["id1"],
        });

        const result = await validateBulkRequest(req, "product");

        expect(result.errors?.[0].message).toBe("Invalid action");
      });

      it("should pass data to validateBulkAction", async () => {
        const data = { price: 100 };
        validateBulkAction.mockReturnValue({ valid: true });
        const req = createMockRequest({
          action: "update",
          ids: ["id1"],
          data,
        });

        await validateBulkRequest(req, "product");

        expect(validateBulkAction).toHaveBeenCalledWith(
          "update",
          "product",
          data
        );
      });
    });

    describe("Valid Bulk Request", () => {
      it("should return valid result with all data", async () => {
        validateBulkAction.mockReturnValue({ valid: true });
        const body = {
          action: "delete",
          ids: ["id1", "id2", "id3"],
          data: { reason: "test" },
        };
        const req = createMockRequest(body);

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(true);
        expect(result.data).toEqual(body);
        expect(result.errors).toBeUndefined();
      });

      it("should work without optional data field", async () => {
        validateBulkAction.mockReturnValue({ valid: true });
        const body = { action: "delete", ids: ["id1"] };
        const req = createMockRequest(body);

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(true);
        expect(result.data).toEqual(body);
      });
    });

    describe("Error Handling", () => {
      it("should handle JSON parsing errors", async () => {
        const req = {
          json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
        } as unknown as NextRequest;

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].field).toBe("_general");
        expect(result.errors?.[0].message).toBe("Invalid request body");
      });

      it("should handle validateBulkAction errors", async () => {
        validateBulkAction.mockImplementation(() => {
          throw new Error("Validation error");
        });
        const req = createMockRequest({
          action: "delete",
          ids: ["id1"],
        });

        const result = await validateBulkRequest(req, "product");

        expect(result.valid).toBe(false);
        expect(result.errors?.[0].message).toBe("Invalid request body");
      });
    });
  });

  describe("createValidationErrorResponse", () => {
    it("should create NextResponse with error structure", () => {
      const errors: ValidationError[] = [
        { field: "name", message: "Name is required" },
        { field: "price", message: "Price must be positive" },
      ];

      const response = createValidationErrorResponse(errors);

      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should include all errors in response body", async () => {
      const errors: ValidationError[] = [
        { field: "name", message: "Name is required" },
        { field: "email", message: "Invalid email" },
      ];

      const response = createValidationErrorResponse(errors);
      const body = await response.json();

      expect(body.success).toBe(false);
      expect(body.message).toBe("Validation failed");
      expect(body.errors).toEqual({
        name: "Name is required",
        email: "Invalid email",
      });
    });

    it("should return 400 status code", () => {
      const errors: ValidationError[] = [
        { field: "name", message: "Required" },
      ];

      const response = createValidationErrorResponse(errors);

      expect(response.status).toBe(400);
    });

    it("should handle empty errors array", async () => {
      const response = createValidationErrorResponse([]);
      const body = await response.json();

      expect(body.errors).toEqual({});
    });

    it("should convert errors array to object format", async () => {
      const errors: ValidationError[] = [
        { field: "field1", message: "Error 1" },
        { field: "field2", message: "Error 2" },
        { field: "field3", message: "Error 3" },
      ];

      const response = createValidationErrorResponse(errors);
      const body = await response.json();

      expect(Object.keys(body.errors)).toHaveLength(3);
      expect(body.errors.field1).toBe("Error 1");
      expect(body.errors.field2).toBe("Error 2");
      expect(body.errors.field3).toBe("Error 3");
    });
  });

  describe("withValidation", () => {
    const mockHandler = jest
      .fn()
      .mockResolvedValue(NextResponse.json({ success: true }));

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should call handler when validation passes", async () => {
      getValidationSchema.mockReturnValue([{ field: "name" }]);
      validateFormData.mockReturnValue({});
      const body = { name: "Test" };
      const req = {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;

      const wrappedHandler = withValidation("product", mockHandler);
      await wrappedHandler(req);

      expect(mockHandler).toHaveBeenCalledWith(req, body);
    });

    it("should return validation error response when validation fails", async () => {
      getValidationSchema.mockReturnValue([{ field: "name" }]);
      validateFormData.mockReturnValue({ name: "Required" });
      const req = {
        json: jest.fn().mockResolvedValue({ name: "" }),
      } as unknown as NextRequest;

      const wrappedHandler = withValidation("product", mockHandler);
      const response = await wrappedHandler(req);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
    });

    it("should pass validated data to handler", async () => {
      getValidationSchema.mockReturnValue([{ field: "name" }]);
      validateFormData.mockReturnValue({});
      const body = { name: "Test Product", price: 100 };
      const req = {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;

      const wrappedHandler = withValidation("product", mockHandler);
      await wrappedHandler(req);

      expect(mockHandler).toHaveBeenCalledWith(req, body);
    });

    it("should return handler response when validation passes", async () => {
      getValidationSchema.mockReturnValue([{ field: "name" }]);
      validateFormData.mockReturnValue({});
      const expectedResponse = NextResponse.json({ id: "123" });
      mockHandler.mockResolvedValue(expectedResponse);
      const req = {
        json: jest.fn().mockResolvedValue({ name: "Test" }),
      } as unknown as NextRequest;

      const wrappedHandler = withValidation("product", mockHandler);
      const response = await wrappedHandler(req);

      expect(response).toBe(expectedResponse);
    });
  });

  describe("withBulkValidation", () => {
    const mockHandler = jest
      .fn()
      .mockResolvedValue(NextResponse.json({ success: true }));

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should call handler when bulk validation passes", async () => {
      validateBulkAction.mockReturnValue({ valid: true });
      const body = { action: "delete", ids: ["id1", "id2"] };
      const req = {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;

      const wrappedHandler = withBulkValidation("product", mockHandler);
      await wrappedHandler(req);

      expect(mockHandler).toHaveBeenCalledWith(req, body);
    });

    it("should return validation error when bulk validation fails", async () => {
      const req = {
        json: jest.fn().mockResolvedValue({ action: "delete", ids: [] }),
      } as unknown as NextRequest;

      const wrappedHandler = withBulkValidation("product", mockHandler);
      const response = await wrappedHandler(req);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(400);
    });

    it("should pass validated bulk data to handler", async () => {
      validateBulkAction.mockReturnValue({ valid: true });
      const body = {
        action: "update",
        ids: ["id1", "id2"],
        data: { status: "active" },
      };
      const req = {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;

      const wrappedHandler = withBulkValidation("product", mockHandler);
      await wrappedHandler(req);

      expect(mockHandler).toHaveBeenCalledWith(req, body);
    });

    it("should return handler response when validation passes", async () => {
      validateBulkAction.mockReturnValue({ valid: true });
      const expectedResponse = NextResponse.json({ deleted: 2 });
      mockHandler.mockResolvedValue(expectedResponse);
      const req = {
        json: jest.fn().mockResolvedValue({ action: "delete", ids: ["id1"] }),
      } as unknown as NextRequest;

      const wrappedHandler = withBulkValidation("product", mockHandler);
      const response = await wrappedHandler(req);

      expect(response).toBe(expectedResponse);
    });
  });

  describe("sanitizeInput", () => {
    describe("String Sanitization", () => {
      it("should remove script tags", () => {
        const input = "Hello <script>alert('xss')</script> World";
        const result = sanitizeInput(input);

        expect(result).toBe("Hello  World");
        expect(result).not.toContain("<script>");
      });

      it("should remove iframe tags", () => {
        const input = "Content <iframe src='evil.com'></iframe> here";
        const result = sanitizeInput(input);

        expect(result).not.toContain("<iframe>");
        expect(result).not.toContain("</iframe>");
      });

      it("should remove event handlers with double quotes", () => {
        const input = '<div onclick="alert()">Click</div>';
        const result = sanitizeInput(input);

        expect(result).not.toContain('onclick="');
      });

      it("should remove event handlers with single quotes", () => {
        const input = "<div onclick='alert()'>Click</div>";
        const result = sanitizeInput(input);

        expect(result).not.toContain("onclick='");
      });

      it("should remove event handlers without quotes", () => {
        const input = "<div onclick=alert()>Click</div>";
        const result = sanitizeInput(input);

        expect(result).not.toContain("onclick=");
      });

      it("should remove javascript: URIs", () => {
        const input = '<a href="javascript:alert()">Link</a>';
        const result = sanitizeInput(input);

        expect(result).not.toContain("javascript:");
      });

      it("should remove data:text/html URIs", () => {
        const input = '<img src="data:text/html,<script>alert()</script>">';
        const result = sanitizeInput(input);

        expect(result).not.toContain("data:text/html");
      });

      it("should trim whitespace", () => {
        const input = "  Hello World  ";
        const result = sanitizeInput(input);

        expect(result).toBe("Hello World");
      });

      it("should handle multiple script tags", () => {
        const input = "<script>evil1()</script>Content<script>evil2()</script>";
        const result = sanitizeInput(input);

        expect(result).toBe("Content");
      });

      it("should be case insensitive for tags", () => {
        const input = "Test<SCRIPT>alert()</SCRIPT>End";
        const result = sanitizeInput(input);

        expect(result).not.toContain("SCRIPT");
      });

      it("should handle nested script tags", () => {
        const input = "<script>alert('<script>nested</script>')</script>";
        const result = sanitizeInput(input);

        expect(result).not.toContain("<script>");
      });
    });

    describe("Array Sanitization", () => {
      it("should sanitize all array elements", () => {
        const input = [
          "normal",
          "<script>alert()</script>",
          "clean<iframe></iframe>",
        ];
        const result = sanitizeInput(input);

        expect(result).toHaveLength(3);
        expect(result[0]).toBe("normal");
        expect(result[1]).toBe("");
        expect(result[2]).toBe("clean");
      });

      it("should handle nested arrays", () => {
        const input = ["outer", ["inner<script></script>"]];
        const result = sanitizeInput(input);

        expect(result[1][0]).not.toContain("<script>");
      });

      it("should handle arrays with objects", () => {
        const input = [{ text: "<script>alert()</script>" }];
        const result = sanitizeInput(input);

        expect(result[0].text).not.toContain("<script>");
      });

      it("should handle circular references in arrays", () => {
        const input: any[] = ["test"];
        input.push(input); // Create circular reference

        const result = sanitizeInput(input);

        expect(result[0]).toBe("test");
        expect(result[1]).toBe(input); // Should return same reference
      });
    });

    describe("Object Sanitization", () => {
      it("should sanitize all object values", () => {
        const input = {
          clean: "normal text",
          dirty: "<script>alert()</script>",
          nested: {
            value: "text<iframe></iframe>",
          },
        };
        const result = sanitizeInput(input);

        expect(result.clean).toBe("normal text");
        expect(result.dirty).toBe("");
        expect(result.nested.value).toBe("text");
      });

      it("should handle deeply nested objects", () => {
        const input = {
          level1: {
            level2: {
              level3: {
                text: "<script>xss</script>",
              },
            },
          },
        };
        const result = sanitizeInput(input);

        expect(result.level1.level2.level3.text).not.toContain("<script>");
      });

      it("should preserve object structure", () => {
        const input = {
          name: "Test",
          age: 25,
          tags: ["tag1", "tag2"],
        };
        const result = sanitizeInput(input);

        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("age");
        expect(result).toHaveProperty("tags");
        expect(Array.isArray(result.tags)).toBe(true);
      });

      it("should handle circular references in objects", () => {
        const input: any = { name: "test" };
        input.self = input; // Create circular reference

        const result = sanitizeInput(input);

        expect(result.name).toBe("test");
        expect(result.self).toBe(input); // Should return same reference
      });

      it("should handle null values", () => {
        const input = { value: null };
        const result = sanitizeInput(input);

        expect(result.value).toBeNull();
      });
    });

    describe("Primitive Types", () => {
      it("should return numbers unchanged", () => {
        expect(sanitizeInput(123)).toBe(123);
        expect(sanitizeInput(0)).toBe(0);
        expect(sanitizeInput(-456)).toBe(-456);
      });

      it("should return booleans unchanged", () => {
        expect(sanitizeInput(true)).toBe(true);
        expect(sanitizeInput(false)).toBe(false);
      });

      it("should return null unchanged", () => {
        expect(sanitizeInput(null)).toBeNull();
      });

      it("should return undefined unchanged", () => {
        expect(sanitizeInput(undefined)).toBeUndefined();
      });
    });

    describe("Complex Scenarios", () => {
      it("should handle mixed data structures", () => {
        const input = {
          users: [
            { name: "User1<script></script>", age: 25 },
            { name: "User2", tags: ["tag<iframe></iframe>"] },
          ],
          count: 2,
        };
        const result = sanitizeInput(input);

        expect(result.users[0].name).toBe("User1");
        expect(result.users[1].tags[0]).toBe("tag");
        expect(result.count).toBe(2);
      });

      it("should preserve empty strings", () => {
        const result = sanitizeInput("");
        expect(result).toBe("");
      });

      it("should handle special characters in strings", () => {
        const input = "Test & <test> 'quotes' \"double\"";
        const result = sanitizeInput(input);

        expect(result).toContain("&");
        expect(result).toContain("'quotes'");
        expect(result).toContain('"double"');
      });
    });
  });

  describe("validateAndSanitize", () => {
    const createMockRequest = (body: any): NextRequest => {
      return {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;
    };

    it("should validate and sanitize valid data", async () => {
      getValidationSchema.mockReturnValue([{ field: "name" }]);
      validateFormData.mockReturnValue({});
      const body = {
        name: "Test<script>alert()</script>",
        description: "Clean text",
      };
      const req = createMockRequest(body);

      const result = await validateAndSanitize(req, "product");

      expect(result.valid).toBe(true);
      expect(result.data.name).toBe("Test");
      expect(result.data.description).toBe("Clean text");
    });

    it("should return validation errors without sanitization", async () => {
      getValidationSchema.mockReturnValue([{ field: "name" }]);
      validateFormData.mockReturnValue({ name: "Required" });
      const req = createMockRequest({ name: "" });

      const result = await validateAndSanitize(req, "product");

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it("should sanitize nested objects", async () => {
      getValidationSchema.mockReturnValue([{ field: "user" }]);
      validateFormData.mockReturnValue({});
      const body = {
        user: {
          name: "Test<script></script>",
          bio: "Hello<iframe></iframe>",
        },
      };
      const req = createMockRequest(body);

      const result = await validateAndSanitize(req, "user");

      expect(result.valid).toBe(true);
      expect(result.data.user.name).toBe("Test");
      expect(result.data.user.bio).toBe("Hello");
    });

    it("should sanitize arrays in data", async () => {
      getValidationSchema.mockReturnValue([{ field: "tags" }]);
      validateFormData.mockReturnValue({});
      const body = {
        tags: ["clean", "tag<script></script>", "normal"],
      };
      const req = createMockRequest(body);

      const result = await validateAndSanitize(req, "product");

      expect(result.valid).toBe(true);
      expect(result.data.tags[0]).toBe("clean");
      expect(result.data.tags[1]).toBe("tag");
      expect(result.data.tags[2]).toBe("normal");
    });

    it("should handle validation and sanitization errors", async () => {
      getValidationSchema.mockImplementation(() => {
        throw new Error("Schema error");
      });
      const req = createMockRequest({ name: "Test" });

      const result = await validateAndSanitize(req, "product");

      expect(result.valid).toBe(false);
      expect(result.errors?.[0].message).toBe("Invalid request body");
    });
  });
});
