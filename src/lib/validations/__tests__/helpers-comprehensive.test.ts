/**
 * Comprehensive Validation Helpers Tests
 *
 * Testing helpers.ts validation utility functions
 * Coverage: field validation, form validation, error handling, debounce
 */

import { z } from "zod";
import {
  debounce,
  getFieldError,
  getInputClassName,
  hasErrors,
  validateField,
  validateForm,
  validateStep,
} from "../helpers";

// Test schemas
const testSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18 years old").optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
});

const productSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
});

describe("Validation Helpers - validateField", () => {
  test("should return null for valid field", () => {
    const error = validateField(testSchema, "name", "John Doe");
    expect(error).toBeNull();
  });

  test("should return error message for invalid field (too short)", () => {
    const error = validateField(testSchema, "name", "Jo");
    expect(error).toBe("Name must be at least 3 characters");
  });

  test("should return error message for invalid field (too long)", () => {
    const error = validateField(testSchema, "name", "A".repeat(51));
    expect(error).toBe("Name must not exceed 50 characters");
  });

  test("should validate email field correctly", () => {
    expect(validateField(testSchema, "email", "test@example.com")).toBeNull();
    expect(validateField(testSchema, "email", "invalid-email")).toBe(
      "Invalid email address"
    );
  });

  test("should validate optional fields", () => {
    expect(validateField(testSchema, "age", undefined)).toBeNull();
    expect(validateField(testSchema, "age", 25)).toBeNull();
    expect(validateField(testSchema, "age", 17)).toBe(
      "Must be at least 18 years old"
    );
  });

  test("should validate boolean fields with refinement", () => {
    expect(validateField(testSchema, "terms", true)).toBeNull();
    expect(validateField(testSchema, "terms", false)).toBe(
      "You must accept the terms"
    );
  });

  test("should handle empty string", () => {
    const error = validateField(testSchema, "name", "");
    expect(error).toBe("Name must be at least 3 characters");
  });

  test("should handle null values", () => {
    const error = validateField(testSchema, "name", null);
    expect(error).not.toBeNull();
  });

  test("should handle undefined field name", () => {
    const error = validateField(testSchema, "nonexistent", "value");
    expect(error).toBeNull(); // Schema doesn't have this field, so no validation
  });

  test("should not throw on invalid schema operations", () => {
    expect(() => validateField(testSchema, "name", Symbol())).not.toThrow();
  });
});

describe("Validation Helpers - validateStep", () => {
  test("should return empty object for valid data", () => {
    const data = {
      name: "John Doe",
      email: "test@example.com",
      terms: true,
    };
    const errors = validateStep(testSchema, data);
    expect(errors).toEqual({});
  });

  test("should return errors for invalid data", () => {
    const data = {
      name: "Jo",
      email: "invalid-email",
      terms: false,
    };
    const errors = validateStep(testSchema, data);

    expect(errors.name).toBe("Name must be at least 3 characters");
    expect(errors.email).toBe("Invalid email address");
    expect(errors.terms).toBe("You must accept the terms");
  });

  test("should return first error per field", () => {
    const data = {
      name: "",
      email: "test@example.com",
      terms: true,
    };
    const errors = validateStep(testSchema, data);

    expect(errors.name).toBe("Name must be at least 3 characters");
    expect(Object.keys(errors)).toHaveLength(1);
  });

  test("should handle partial data", () => {
    const data = {
      name: "John Doe",
      // email missing
      terms: true,
    };
    const errors = validateStep(testSchema, data);

    expect(errors.email).toBeTruthy();
  });

  test("should handle empty object", () => {
    const errors = validateStep(testSchema, {});

    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.terms).toBeTruthy();
  });

  test("should handle extra fields gracefully", () => {
    const data = {
      name: "John Doe",
      email: "test@example.com",
      terms: true,
      extraField: "value",
    };
    const errors = validateStep(testSchema, data);

    expect(errors).toEqual({});
  });

  test("should validate multiple fields at once", () => {
    const data = {
      title: "Short",
      price: -10,
      category: "",
    };
    const errors = validateStep(productSchema, data);

    expect(errors.title).toBe("Title must be at least 10 characters");
    expect(errors.price).toBe("Price must be positive");
    expect(errors.category).toBe("Category is required");
  });

  test("should handle null data gracefully", () => {
    const errors = validateStep(testSchema, null);
    expect(errors).toBeDefined();
  });

  test("should not throw on invalid input", () => {
    expect(() => validateStep(testSchema, "invalid")).not.toThrow();
  });
});

describe("Validation Helpers - hasErrors", () => {
  test("should return true when errors exist", () => {
    const errors = { name: "Error", email: "Error" };
    expect(hasErrors(errors)).toBe(true);
  });

  test("should return false when no errors", () => {
    const errors = {};
    expect(hasErrors(errors)).toBe(false);
  });

  test("should return false for empty object", () => {
    expect(hasErrors({})).toBe(false);
  });

  test("should return true for single error", () => {
    expect(hasErrors({ field: "error" })).toBe(true);
  });

  test("should return true for multiple errors", () => {
    expect(
      hasErrors({ field1: "error1", field2: "error2", field3: "error3" })
    ).toBe(true);
  });

  test("should handle errors with empty string values", () => {
    expect(hasErrors({ field: "" })).toBe(true);
  });
});

describe("Validation Helpers - getFieldError", () => {
  const errors = {
    name: "Name error",
    email: "Email error",
    age: "Age error",
  };

  test("should return error for existing field", () => {
    expect(getFieldError(errors, "name")).toBe("Name error");
    expect(getFieldError(errors, "email")).toBe("Email error");
  });

  test("should return undefined for non-existing field", () => {
    expect(getFieldError(errors, "phone")).toBeUndefined();
  });

  test("should return undefined for empty object", () => {
    expect(getFieldError({}, "name")).toBeUndefined();
  });

  test("should handle empty string field name", () => {
    expect(getFieldError(errors, "")).toBeUndefined();
  });

  test("should handle special characters in field name", () => {
    const specialErrors = { "field.name": "Error" };
    expect(getFieldError(specialErrors, "field.name")).toBe("Error");
  });

  test("should return exact error message", () => {
    const longError = "This is a very long error message with details";
    expect(getFieldError({ field: longError }, "field")).toBe(longError);
  });
});

describe("Validation Helpers - validateForm", () => {
  test("should return success for valid data", async () => {
    const data = {
      name: "John Doe",
      email: "test@example.com",
      terms: true,
    };
    const result = await validateForm(testSchema, data);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual({});
  });

  test("should return errors for invalid data", async () => {
    const data = {
      name: "Jo",
      email: "invalid",
      terms: false,
    };
    const result = await validateForm(testSchema, data);

    expect(result.success).toBe(false);
    expect(result.errors.name).toBe("Name must be at least 3 characters");
    expect(result.errors.email).toBe("Invalid email address");
  });

  test("should handle schema with transforms", async () => {
    const transformSchema = z.object({
      price: z.string().transform((val) => parseFloat(val)),
    });

    const result = await validateForm(transformSchema, { price: "123.45" });
    expect(result.success).toBe(true);
  });

  test("should handle empty data", async () => {
    const result = await validateForm(testSchema, {});

    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  test("should handle null data", async () => {
    const result = await validateForm(testSchema, null);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  test("should return generic error for non-Zod errors", async () => {
    const badSchema = {
      parseAsync: () => {
        throw new Error("Non-Zod error");
      },
    } as any;

    const result = await validateForm(badSchema, {});
    expect(result.success).toBe(false);
    expect(result.errors._form).toBe("Validation failed");
  });

  test("should handle multiple validation errors", async () => {
    const data = {
      title: "Short",
      price: -10,
      category: "",
    };
    const result = await validateForm(productSchema, data);

    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBe(3);
  });

  test("should preserve first error per field", async () => {
    const multiErrorSchema = z.object({
      field: z
        .string()
        .min(5, "Too short")
        .max(10, "Too long")
        .regex(/^[a-z]+$/, "Invalid format"),
    });

    const result = await validateForm(multiErrorSchema, { field: "ABC" });
    expect(result.success).toBe(false);
    expect(result.errors.field).toBe("Too short");
  });
});

describe("Validation Helpers - getInputClassName", () => {
  const baseClass = "input border rounded px-3 py-2";

  test("should return base class when no error", () => {
    const result = getInputClassName(baseClass, false);
    expect(result).toBe(baseClass);
  });

  test("should add error classes when has error", () => {
    const result = getInputClassName(baseClass, true);
    expect(result).toContain(baseClass);
    expect(result).toContain("border-red-500");
    expect(result).toContain("focus:border-red-500");
    expect(result).toContain("focus:ring-red-500");
  });

  test("should handle empty base class", () => {
    const result = getInputClassName("", true);
    expect(result).toContain("border-red-500");
    expect(result.trim()).not.toBe("");
  });

  test("should trim extra whitespace", () => {
    const result = getInputClassName("input  ", false);
    expect(result).toBe("input");
  });

  test("should combine classes properly", () => {
    const result = getInputClassName("a b c", true);
    expect(result.split(" ")).toContain("a");
    expect(result.split(" ")).toContain("b");
    expect(result.split(" ")).toContain("c");
    expect(result.split(" ")).toContain("border-red-500");
  });

  test("should handle multiple base classes", () => {
    const multiClass = "input form-control mb-3";
    const result = getInputClassName(multiClass, false);
    expect(result).toBe(multiClass);
  });

  test("should not duplicate error classes", () => {
    const result = getInputClassName(baseClass, true);
    const classes = result.split(" ");
    const uniqueClasses = new Set(classes);
    expect(classes.length).toBe(uniqueClasses.size);
  });
});

describe("Validation Helpers - debounce", () => {
  jest.useFakeTimers();

  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should delay function execution", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn("test");
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledWith("test");
  });

  test("should only execute latest call", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("third");
  });

  test("should cancel previous timer", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn("first");
    jest.advanceTimersByTime(300);

    debouncedFn("second");
    jest.advanceTimersByTime(300);

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("second");
  });

  test("should work with different delay times", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn("test");
    jest.advanceTimersByTime(999);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalled();
  });

  test("should handle multiple arguments", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn("arg1", "arg2", "arg3");
    jest.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
  });

  test("should handle zero delay", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 0);

    debouncedFn("test");
    jest.advanceTimersByTime(0);

    expect(mockFn).toHaveBeenCalledWith("test");
  });

  test("should work with async functions", () => {
    const mockAsyncFn = jest.fn(async (val: string) => {
      return `processed-${val}`;
    });
    const debouncedFn = debounce(mockAsyncFn, 500);

    debouncedFn("test");
    jest.advanceTimersByTime(500);

    expect(mockAsyncFn).toHaveBeenCalledWith("test");
  });

  test("should allow multiple calls after delay", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn("first");
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);

    debouncedFn("second");
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test("should handle rapid successive calls", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    for (let i = 0; i < 100; i++) {
      debouncedFn(`call-${i}`);
    }

    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("call-99");
  });

  test("should work with function returning values", () => {
    const mockFn = jest.fn((x: number) => x * 2);
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn(5);
    jest.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledWith(5);
    expect(mockFn).toHaveReturnedWith(10);
  });
});

describe("Validation Helpers - Edge Cases & Integration", () => {
  test("should handle schema with nested objects", () => {
    const nestedSchema = z.object({
      user: z.object({
        name: z.string().min(3),
        email: z.string().email(),
      }),
    });

    const errors = validateStep(nestedSchema, {
      user: { name: "Jo", email: "invalid" },
    });

    expect(errors.user).toBeDefined();
  });

  test("should handle schema with arrays", () => {
    const arraySchema = z.object({
      tags: z.array(z.string().min(2)).min(1),
    });

    const errors = validateStep(arraySchema, { tags: ["a"] });
    expect(errors.tags).toBeDefined();
  });

  test("should handle schema with refinements", () => {
    const refinedSchema = z
      .object({
        password: z.string().min(8),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords must match",
        path: ["confirmPassword"],
      });

    const errors = validateStep(refinedSchema, {
      password: "password123",
      confirmPassword: "different",
    });

    expect(errors.confirmPassword).toBe("Passwords must match");
  });

  test("should handle union types", () => {
    const unionSchema = z.object({
      value: z.union([z.string(), z.number()]),
    });

    expect(validateStep(unionSchema, { value: "test" })).toEqual({});
    expect(validateStep(unionSchema, { value: 123 })).toEqual({});
    expect(validateStep(unionSchema, { value: true })).not.toEqual({});
  });

  test("should handle discriminated unions", () => {
    const discSchema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("email"), email: z.string().email() }),
      z.object({ type: z.literal("phone"), phone: z.string().min(10) }),
    ]);

    expect(
      validateStep(discSchema, { type: "email", email: "test@example.com" })
    ).toEqual({});
    expect(
      validateStep(discSchema, { type: "email", email: "invalid" })
    ).not.toEqual({});
  });

  test("should handle optional chaining in error paths", () => {
    const errors = { "user.name": "Error" };
    expect(getFieldError(errors, "user.name")).toBe("Error");
  });

  test("should work with custom error messages", () => {
    const customSchema = z.object({
      code: z.string().length(6, "Code must be exactly 6 characters"),
    });

    const error = validateField(customSchema, "code", "12345");
    expect(error).toBe("Code must be exactly 6 characters");
  });

  test("should handle extremely large inputs", () => {
    const largeString = "a".repeat(100000);
    const schema = z.object({ text: z.string().max(50) });

    const error = validateField(schema, "text", largeString);
    expect(error).toBeTruthy();
  });

  test("should handle special characters in validation", () => {
    const schema = z.object({
      special: z.string().regex(/^[!@#$%^&*()]+$/),
    });

    expect(validateField(schema, "special", "!@#$")).toBeNull();
    expect(validateField(schema, "special", "abc")).toBeTruthy();
  });
});
