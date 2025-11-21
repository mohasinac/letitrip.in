/**
 * Tests for filter-helpers.ts
 * Testing filter utility functions
 */

import { describe, it, expect } from "@jest/globals";
import {
  buildQueryFromFilters,
  filtersToSearchParams,
  searchParamsToFilters,
  persistFilters,
  loadPersistedFilters,
  clearPersistedFilters,
  mergeFilters,
  getActiveFilterCount,
  hasActiveFilters,
  filtersToSummary,
  validateFilters,
} from "./filter-helpers";

describe("buildQueryFromFilters", () => {
  it("should build query from valid filters", () => {
    const filters = {
      category: "electronics",
      price: 100,
      inStock: true,
      tags: [],
      empty: "",
      nullValue: null,
      undefinedValue: undefined,
    };
    const result = buildQueryFromFilters(filters);
    expect(result).toEqual({
      category: "electronics",
      price: 100,
      inStock: true,
    });
  });

  it("should handle empty arrays", () => {
    const filters = { tags: [] };
    const result = buildQueryFromFilters(filters);
    expect(result).toEqual({});
  });
});

describe("filtersToSearchParams", () => {
  it("should convert filters to search params", () => {
    const filters = {
      category: "electronics",
      price: 100,
      tags: ["laptop", "gaming"],
    };
    const result = filtersToSearchParams(filters);
    expect(result).toBeInstanceOf(URLSearchParams);
    expect(result.get("category")).toBe("electronics");
    expect(result.get("price")).toBe("100");
    expect(result.get("tags")).toBe('["laptop","gaming"]');
  });

  it("should skip empty values", () => {
    const filters = { category: "", price: null };
    const result = filtersToSearchParams(filters);
    expect(result.toString()).toBe("");
  });
});

describe("searchParamsToFilters", () => {
  it("should parse search params to filters", () => {
    const params = new URLSearchParams(
      'category=electronics&price=100&tags=["laptop"]'
    );
    const initial = { category: "", price: 0, tags: [] };
    const result = searchParamsToFilters(params, initial);
    expect(result.category).toBe("electronics");
    expect(result.price).toBe(100);
    expect(result.tags).toEqual(["laptop"]);
  });

  it("should handle non-JSON values", () => {
    const params = new URLSearchParams("category=electronics&search=laptop");
    const initial = { category: "", search: "" };
    const result = searchParamsToFilters(params, initial);
    expect(result.category).toBe("electronics");
    expect(result.search).toBe("laptop");
  });
});

describe("mergeFilters", () => {
  it("should merge multiple filter objects", () => {
    const result = mergeFilters(
      { category: "electronics" },
      { price: 100 },
      { inStock: true }
    );
    expect(result).toEqual({
      category: "electronics",
      price: 100,
      inStock: true,
    });
  });

  it("should override with later values", () => {
    const result = mergeFilters(
      { category: "electronics" },
      { category: "books" }
    );
    expect(result.category).toBe("books");
  });
});

describe("getActiveFilterCount", () => {
  it("should count active filters", () => {
    const filters = {
      category: "electronics",
      price: 100,
      inStock: true,
      tags: ["laptop"],
      empty: "",
      nullValue: null,
    };
    const result = getActiveFilterCount(filters);
    expect(result).toBe(4);
  });

  it("should handle empty arrays", () => {
    const filters = { tags: [] };
    const result = getActiveFilterCount(filters);
    expect(result).toBe(0);
  });
});

describe("hasActiveFilters", () => {
  it("should return true when filters are active", () => {
    const filters = { category: "electronics" };
    const result = hasActiveFilters(filters);
    expect(result).toBe(true);
  });

  it("should return false when no filters are active", () => {
    const filters = { category: "", price: null };
    const result = hasActiveFilters(filters);
    expect(result).toBe(false);
  });
});

describe("filtersToSummary", () => {
  it("should create summary from filters", () => {
    const filters = {
      category: "electronics",
      inStock: true,
      tags: ["laptop", "gaming"],
    };
    const labels = {
      category: "Category",
      inStock: "In Stock",
      tags: "Tags",
    };
    const result = filtersToSummary(filters, labels);
    expect(result).toEqual([
      "Category: electronics",
      "In Stock",
      "Tags: laptop, gaming",
    ]);
  });

  it("should skip empty values", () => {
    const filters = { category: "", inStock: false };
    const labels = { category: "Category", inStock: "In Stock" };
    const result = filtersToSummary(filters, labels);
    expect(result).toEqual([]);
  });
});

describe("validateFilters", () => {
  it("should validate valid filters", () => {
    const filters = { price: 100, category: "electronics" };
    const schema = {
      price: { type: "number" as const, required: true, min: 0 },
      category: { type: "string" as const },
    };
    const result = validateFilters(filters, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should detect validation errors", () => {
    const filters = { price: -10, category: 123 };
    const schema = {
      price: { type: "number" as const, min: 0 },
      category: { type: "string" as const },
    };
    const result = validateFilters(filters, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should check required fields", () => {
    const filters = { category: "electronics" };
    const schema = {
      price: { type: "number" as const, required: true },
      category: { type: "string" as const },
    };
    const result = validateFilters(filters, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("price is required");
  });

  it("should validate array types", () => {
    const filters = { tags: "not-an-array" };
    const schema = {
      tags: { type: "array" as const },
    };
    const result = validateFilters(filters, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("tags must be an array");
  });

  it("should validate options", () => {
    const filters = { category: "invalid" };
    const schema = {
      category: { type: "string" as const, options: ["electronics", "books"] },
    };
    const result = validateFilters(filters, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "category must be one of: electronics, books"
    );
  });
});

// Note: persistFilters, loadPersistedFilters, clearPersistedFilters tests would require mocking localStorage
// These functions check for window object, so they would need browser environment or mocking
