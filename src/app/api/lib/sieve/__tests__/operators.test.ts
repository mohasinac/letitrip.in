/**
 * Unit Tests for Sieve Operators Module
 * Comprehensive testing of filter evaluation and operators
 */

import {
  evaluateFilter,
  evaluateFilters,
  isFirestoreSupported,
} from "../operators";
import { FilterCondition } from "../types";

describe("Sieve Operators", () => {
  describe("evaluateFilter - Equality Operators", () => {
    it("should evaluate == operator for strings", () => {
      const condition: FilterCondition = {
        field: "status",
        operator: "==",
        value: "active",
      };

      expect(evaluateFilter(condition, "active")).toBe(true);
      expect(evaluateFilter(condition, "inactive")).toBe(false);
    });

    it("should evaluate == operator for numbers", () => {
      const condition: FilterCondition = {
        field: "price",
        operator: "==",
        value: 100,
      };

      expect(evaluateFilter(condition, 100)).toBe(true);
      expect(evaluateFilter(condition, 99)).toBe(false);
    });

    it("should evaluate == operator for booleans", () => {
      const condition: FilterCondition = {
        field: "featured",
        operator: "==",
        value: true,
      };

      expect(evaluateFilter(condition, true)).toBe(true);
      expect(evaluateFilter(condition, false)).toBe(false);
    });

    it("should evaluate ==* operator (case insensitive)", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "==*",
        value: "Product",
      };

      expect(evaluateFilter(condition, "product")).toBe(true);
      expect(evaluateFilter(condition, "PRODUCT")).toBe(true);
      expect(evaluateFilter(condition, "Product")).toBe(true);
      expect(evaluateFilter(condition, "different")).toBe(false);
    });

    it("should evaluate != operator", () => {
      const condition: FilterCondition = {
        field: "status",
        operator: "!=",
        value: "deleted",
      };

      expect(evaluateFilter(condition, "active")).toBe(true);
      expect(evaluateFilter(condition, "deleted")).toBe(false);
    });

    it("should handle null values with ==", () => {
      const condition: FilterCondition = {
        field: "optional",
        operator: "==",
        value: null,
      };

      expect(evaluateFilter(condition, null)).toBe(true);
      expect(evaluateFilter(condition, undefined)).toBe(true);
      expect(evaluateFilter(condition, "value")).toBe(false);
    });
  });

  describe("evaluateFilter - Comparison Operators", () => {
    it("should evaluate > operator for numbers", () => {
      const condition: FilterCondition = {
        field: "price",
        operator: ">",
        value: 100,
      };

      expect(evaluateFilter(condition, 150)).toBe(true);
      expect(evaluateFilter(condition, 100)).toBe(false);
      expect(evaluateFilter(condition, 50)).toBe(false);
    });

    it("should evaluate >= operator for numbers", () => {
      const condition: FilterCondition = {
        field: "price",
        operator: ">=",
        value: 100,
      };

      expect(evaluateFilter(condition, 150)).toBe(true);
      expect(evaluateFilter(condition, 100)).toBe(true);
      expect(evaluateFilter(condition, 50)).toBe(false);
    });

    it("should evaluate < operator for numbers", () => {
      const condition: FilterCondition = {
        field: "price",
        operator: "<",
        value: 100,
      };

      expect(evaluateFilter(condition, 50)).toBe(true);
      expect(evaluateFilter(condition, 100)).toBe(false);
      expect(evaluateFilter(condition, 150)).toBe(false);
    });

    it("should evaluate <= operator for numbers", () => {
      const condition: FilterCondition = {
        field: "price",
        operator: "<=",
        value: 100,
      };

      expect(evaluateFilter(condition, 50)).toBe(true);
      expect(evaluateFilter(condition, 100)).toBe(true);
      expect(evaluateFilter(condition, 150)).toBe(false);
    });

    it("should handle string comparison lexically", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: ">",
        value: "M",
      };

      expect(evaluateFilter(condition, "Z")).toBe(true);
      expect(evaluateFilter(condition, "A")).toBe(false);
    });

    it("should handle date comparison", () => {
      const condition: FilterCondition = {
        field: "createdAt",
        operator: ">",
        value: "2024-01-01",
      };

      const date1 = new Date("2024-06-01");
      const date2 = new Date("2023-06-01");

      expect(evaluateFilter(condition, date1)).toBe(true);
      expect(evaluateFilter(condition, date2)).toBe(false);
    });

    it("should return false for null values in comparisons", () => {
      const condition: FilterCondition = {
        field: "price",
        operator: ">",
        value: 100,
      };

      expect(evaluateFilter(condition, null)).toBe(false);
      expect(evaluateFilter(condition, undefined)).toBe(false);
    });
  });

  describe("evaluateFilter - String Operators", () => {
    it("should evaluate @= operator (contains)", () => {
      const condition: FilterCondition = {
        field: "description",
        operator: "@=",
        value: "laptop",
      };

      expect(evaluateFilter(condition, "Buy a laptop today")).toBe(true);
      expect(evaluateFilter(condition, "laptop")).toBe(true);
      expect(evaluateFilter(condition, "desktop")).toBe(false);
    });

    it("should evaluate @=* operator (contains case insensitive)", () => {
      const condition: FilterCondition = {
        field: "description",
        operator: "@=*",
        value: "laptop",
      };

      expect(evaluateFilter(condition, "LAPTOP for sale")).toBe(true);
      expect(evaluateFilter(condition, "Gaming Laptop")).toBe(true);
      expect(evaluateFilter(condition, "desktop")).toBe(false);
    });

    it("should evaluate _= operator (starts with case sensitive)", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "_=",
        value: "Pro",
      };

      expect(evaluateFilter(condition, "Pro Edition")).toBe(true);
      expect(evaluateFilter(condition, "pro edition")).toBe(false);
      // "Product Name" starts with "Pro" (first 3 chars match)
      expect(evaluateFilter(condition, "Product Name")).toBe(true);
    });

    it("should evaluate _=* operator (starts with case insensitive)", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "_=*",
        value: "Pro",
      };

      expect(evaluateFilter(condition, "pro edition")).toBe(true);
      expect(evaluateFilter(condition, "PRO EDITION")).toBe(true);
      expect(evaluateFilter(condition, "Best Pro")).toBe(false);
    });

    it("should evaluate _-= operator (ends with)", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "_-=",
        value: "Edition",
      };

      expect(evaluateFilter(condition, "Pro Edition")).toBe(true);
      expect(evaluateFilter(condition, "Pro edition")).toBe(false);
      expect(evaluateFilter(condition, "Edition Pro")).toBe(false);
    });

    it("should evaluate !@= operator (not contains)", () => {
      const condition: FilterCondition = {
        field: "description",
        operator: "!@=",
        value: "refurbished",
      };

      expect(evaluateFilter(condition, "Brand new laptop")).toBe(true);
      expect(evaluateFilter(condition, "Refurbished laptop")).toBe(false);
    });

    it("should evaluate !_= operator (not starts with)", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "!_=",
        value: "Used",
      };

      expect(evaluateFilter(condition, "New Product")).toBe(true);
      expect(evaluateFilter(condition, "Used Product")).toBe(false);
    });

    it("should evaluate !_-= operator (not ends with)", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "!_-=",
        value: "Damaged",
      };

      expect(evaluateFilter(condition, "Product New")).toBe(true);
      expect(evaluateFilter(condition, "Product Damaged")).toBe(false);
    });
  });

  describe("evaluateFilter - Null Operators", () => {
    it("should evaluate ==null operator", () => {
      const condition: FilterCondition = {
        field: "optional",
        operator: "==null",
        value: null,
      };

      expect(evaluateFilter(condition, null)).toBe(true);
      expect(evaluateFilter(condition, undefined)).toBe(true);
      expect(evaluateFilter(condition, "")).toBe(false);
      expect(evaluateFilter(condition, 0)).toBe(false);
      expect(evaluateFilter(condition, false)).toBe(false);
    });

    it("should evaluate !=null operator", () => {
      const condition: FilterCondition = {
        field: "required",
        operator: "!=null",
        value: null,
      };

      expect(evaluateFilter(condition, "value")).toBe(true);
      expect(evaluateFilter(condition, 0)).toBe(true);
      expect(evaluateFilter(condition, false)).toBe(true);
      expect(evaluateFilter(condition, null)).toBe(false);
      expect(evaluateFilter(condition, undefined)).toBe(false);
    });
  });

  describe("evaluateFilter - Edge Cases", () => {
    it("should handle unknown operators", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "unknown" as any,
        value: "test",
      };

      expect(evaluateFilter(condition, "test")).toBe(false);
    });

    it("should handle type coercion for string/number comparison", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "==",
        value: "100",
      };

      expect(evaluateFilter(condition, "100")).toBe(true);
      expect(evaluateFilter(condition, 100)).toBe(true);
    });

    it("should handle empty strings", () => {
      const containsCondition: FilterCondition = {
        field: "value",
        operator: "@=",
        value: "",
      };

      expect(evaluateFilter(containsCondition, "anything")).toBe(true);
      expect(evaluateFilter(containsCondition, "")).toBe(true);
    });

    it("should handle special characters in strings", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "@=",
        value: "$100.00",
      };

      expect(evaluateFilter(condition, "Price: $100.00")).toBe(true);
    });

    it("should handle very large numbers", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: ">",
        value: 1000000000,
      };

      expect(evaluateFilter(condition, 2000000000)).toBe(true);
      expect(evaluateFilter(condition, 500000000)).toBe(false);
    });

    it("should handle negative numbers", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "<",
        value: 0,
      };

      expect(evaluateFilter(condition, -10)).toBe(true);
      expect(evaluateFilter(condition, 10)).toBe(false);
    });

    it("should handle floating point numbers", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: ">",
        value: 10.5,
      };

      expect(evaluateFilter(condition, 10.6)).toBe(true);
      expect(evaluateFilter(condition, 10.5)).toBe(false);
      expect(evaluateFilter(condition, 10.4)).toBe(false);
    });
  });

  describe("evaluateFilters - Multiple Filters", () => {
    it("should evaluate multiple filters with AND logic", () => {
      const filters: FilterCondition[] = [
        { field: "price", operator: ">", value: 100 },
        { field: "status", operator: "==", value: "active" },
      ];

      const record1 = { price: 150, status: "active" };
      const record2 = { price: 150, status: "inactive" };
      const record3 = { price: 50, status: "active" };

      expect(evaluateFilters(filters, record1)).toBe(true);
      expect(evaluateFilters(filters, record2)).toBe(false);
      expect(evaluateFilters(filters, record3)).toBe(false);
    });

    it("should handle empty filters array", () => {
      const record = { price: 100, status: "active" };

      expect(evaluateFilters([], record)).toBe(true);
    });

    it("should handle nested field access", () => {
      const filters: FilterCondition[] = [
        { field: "metadata.priority", operator: "==", value: "high" },
      ];

      const record = {
        metadata: {
          priority: "high",
        },
      };

      expect(evaluateFilters(filters, record)).toBe(true);
    });

    it("should handle deeply nested fields", () => {
      const filters: FilterCondition[] = [
        { field: "user.profile.address.city", operator: "==", value: "Mumbai" },
      ];

      const record = {
        user: {
          profile: {
            address: {
              city: "Mumbai",
            },
          },
        },
      };

      expect(evaluateFilters(filters, record)).toBe(true);
    });

    it("should return false if nested field doesn't exist", () => {
      const filters: FilterCondition[] = [
        { field: "metadata.nonexistent", operator: "==", value: "value" },
      ];

      const record = {
        metadata: {},
      };

      expect(evaluateFilters(filters, record)).toBe(false);
    });

    it("should handle multiple complex filters", () => {
      const filters: FilterCondition[] = [
        { field: "price", operator: ">=", value: 100 },
        { field: "price", operator: "<=", value: 500 },
        { field: "name", operator: "@=*", value: "laptop" },
        { field: "status", operator: "!=", value: "deleted" },
      ];

      const record1 = {
        price: 300,
        name: "Gaming Laptop",
        status: "active",
      };

      const record2 = {
        price: 600,
        name: "Gaming Laptop",
        status: "active",
      };

      expect(evaluateFilters(filters, record1)).toBe(true);
      expect(evaluateFilters(filters, record2)).toBe(false);
    });
  });

  describe("isFirestoreSupported", () => {
    it("should return true for Firestore-supported operators", () => {
      expect(isFirestoreSupported("==")).toBe(true);
      expect(isFirestoreSupported("!=")).toBe(true);
      expect(isFirestoreSupported(">")).toBe(true);
      expect(isFirestoreSupported(">=")).toBe(true);
      expect(isFirestoreSupported("<")).toBe(true);
      expect(isFirestoreSupported("<=")).toBe(true);
    });

    it("should return false for custom operators", () => {
      expect(isFirestoreSupported("@=")).toBe(false);
      expect(isFirestoreSupported("@=*")).toBe(false);
      expect(isFirestoreSupported("_=")).toBe(false);
      expect(isFirestoreSupported("_=*")).toBe(false);
      expect(isFirestoreSupported("_-=")).toBe(false);
      expect(isFirestoreSupported("!@=")).toBe(false);
      expect(isFirestoreSupported("!_=")).toBe(false);
      expect(isFirestoreSupported("!_-=")).toBe(false);
      expect(isFirestoreSupported("==*")).toBe(false);
      expect(isFirestoreSupported("==null")).toBe(false);
      expect(isFirestoreSupported("!=null")).toBe(false);
    });

    it("should return false for unknown operators", () => {
      expect(isFirestoreSupported("unknown")).toBe(false);
      expect(isFirestoreSupported("")).toBe(false);
    });
  });

  describe("Real Code Issues Found", () => {
    it("PATTERN: Case-insensitive operators use lowercase conversion", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "==*",
        value: "TEST",
      };

      // Both values converted to lowercase for comparison
      expect(evaluateFilter(condition, "test")).toBe(true);
      expect(evaluateFilter(condition, "TEST")).toBe(true);
      expect(evaluateFilter(condition, "TeSt")).toBe(true);
    });

    it("PATTERN: Type coercion happens for mixed type comparisons", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "==",
        value: "100",
      };

      // Number 100 coerced to string for comparison
      expect(evaluateFilter(condition, 100)).toBe(true);
    });

    it("PATTERN: Null and undefined treated as equivalent", () => {
      const condition: FilterCondition = {
        field: "optional",
        operator: "==",
        value: null,
      };

      expect(evaluateFilter(condition, null)).toBe(true);
      expect(evaluateFilter(condition, undefined)).toBe(true);
    });

    it("PATTERN: Empty string in contains always matches", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "@=",
        value: "",
      };

      // Empty string is substring of everything
      expect(evaluateFilter(condition, "anything")).toBe(true);
      expect(evaluateFilter(condition, "")).toBe(true);
    });

    it("SAFETY: Unknown operators return false instead of throwing", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "invalid" as any,
        value: "test",
      };

      // No error thrown, returns false
      expect(evaluateFilter(condition, "test")).toBe(false);
    });

    it("SAFETY: Null comparisons don't throw errors", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: ">",
        value: 100,
      };

      // Null handling is safe
      expect(() => evaluateFilter(condition, null)).not.toThrow();
      expect(evaluateFilter(condition, null)).toBe(false);
    });

    it("FEATURE: Nested field access with dot notation", () => {
      const filters: FilterCondition[] = [
        { field: "a.b.c", operator: "==", value: "deep" },
      ];

      const record = {
        a: {
          b: {
            c: "deep",
          },
        },
      };

      expect(evaluateFilters(filters, record)).toBe(true);
    });

    it("LIMITATION: AND logic only - no OR support", () => {
      const filters: FilterCondition[] = [
        { field: "status", operator: "==", value: "active" },
        { field: "status", operator: "==", value: "pending" },
      ];

      const record = { status: "active" };

      // Both conditions must be true (impossible for same field)
      expect(evaluateFilters(filters, record)).toBe(false);
    });
  });

  describe("Edge Cases - Special Values", () => {
    it("should handle 0 as falsy but valid value", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "==",
        value: 0,
      };

      expect(evaluateFilter(condition, 0)).toBe(true);
      expect(evaluateFilter(condition, null)).toBe(false);
    });

    it("should handle false as falsy but valid value", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "==",
        value: false,
      };

      expect(evaluateFilter(condition, false)).toBe(true);
      expect(evaluateFilter(condition, null)).toBe(false);
    });

    it("should handle empty string as falsy but valid value", () => {
      const condition: FilterCondition = {
        field: "value",
        operator: "==",
        value: "",
      };

      expect(evaluateFilter(condition, "")).toBe(true);
      expect(evaluateFilter(condition, null)).toBe(false);
    });

    it("should handle arrays (converted to string)", () => {
      const condition: FilterCondition = {
        field: "tags",
        operator: "@=",
        value: "tag1",
      };

      // Arrays converted to string for comparison
      expect(evaluateFilter(condition, ["tag1", "tag2"])).toBe(true);
    });

    it("should handle objects (converted to string)", () => {
      const condition: FilterCondition = {
        field: "metadata",
        operator: "@=",
        value: "Object",
      };

      // Object converted to string "[object Object]" - only matches "Object" substring
      expect(evaluateFilter(condition, { key: "value" })).toBe(true);
    });

    it("should handle Unicode characters", () => {
      const condition: FilterCondition = {
        field: "name",
        operator: "@=",
        value: "日本語",
      };

      expect(evaluateFilter(condition, "製品名: 日本語")).toBe(true);
    });

    it("should handle emojis", () => {
      const condition: FilterCondition = {
        field: "description",
        operator: "@=",
        value: "🎉",
      };

      expect(evaluateFilter(condition, "Sale 🎉 Today!")).toBe(true);
    });

    it("should handle regex special characters literally", () => {
      const condition: FilterCondition = {
        field: "formula",
        operator: "@=",
        value: "a+b*c",
      };

      // Special regex chars treated as literals
      expect(evaluateFilter(condition, "Formula: a+b*c")).toBe(true);
    });
  });
});
