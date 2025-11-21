/**
 * Tests for price.utils.ts
 * Testing price formatting utilities
 */

import { describe, it, expect } from "@jest/globals";
import {
  formatPrice,
  safeToLocaleString,
  formatPriceRange,
  formatDiscount,
  formatINR,
  parsePrice,
} from "./price.utils";

describe("formatPrice", () => {
  it("should format valid INR price", () => {
    const result = formatPrice(1234.56);
    expect(result).toBe("₹1,234.56");
  });

  it("should format USD price", () => {
    const result = formatPrice(1234.56, "USD");
    expect(result).toBe("$1,234.56");
  });

  it("should format EUR price", () => {
    const result = formatPrice(1234.56, "EUR");
    expect(result).toContain("1.234,56");
    expect(result).toContain("€");
  });

  it("should return N/A for null", () => {
    const result = formatPrice(null);
    expect(result).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    const result = formatPrice(undefined);
    expect(result).toBe("N/A");
  });

  it("should return N/A for NaN", () => {
    const result = formatPrice(NaN);
    expect(result).toBe("N/A");
  });

  it("should format without symbol", () => {
    const result = formatPrice(1234.56, "INR", false);
    expect(result).toBe("1,234.56");
  });
});

describe("safeToLocaleString", () => {
  it("should format valid number", () => {
    const result = safeToLocaleString(1234.56);
    expect(result).toBe("1,234.56");
  });

  it("should return 0 for null", () => {
    const result = safeToLocaleString(null);
    expect(result).toBe("0");
  });

  it("should return 0 for NaN", () => {
    const result = safeToLocaleString(NaN);
    expect(result).toBe("0");
  });

  it("should handle different locales", () => {
    const result = safeToLocaleString(1234.56, "en-US");
    expect(result).toBe("1,234.56");
  });
});

describe("formatPriceRange", () => {
  it("should format price range", () => {
    const result = formatPriceRange(100, 500);
    expect(result).toBe("₹100 - ₹500");
  });

  it("should format same prices", () => {
    const result = formatPriceRange(100, 100);
    expect(result).toBe("₹100");
  });

  it("should return N/A for invalid range", () => {
    const result = formatPriceRange(null, 500);
    expect(result).toBe("N/A");
  });

  it("should return N/A for NaN values", () => {
    const result = formatPriceRange(NaN, 500);
    expect(result).toBe("N/A");
  });
});

describe("formatDiscount", () => {
  it("should calculate discount percentage", () => {
    const result = formatDiscount(200, 150);
    expect(result).toBe("-25%");
  });

  it("should round to nearest integer", () => {
    const result = formatDiscount(100, 67);
    expect(result).toBe("-33%");
  });

  it("should return null for no discount", () => {
    const result = formatDiscount(100, 100);
    expect(result).toBe(null);
  });

  it("should return null for higher current price", () => {
    const result = formatDiscount(100, 150);
    expect(result).toBe(null);
  });

  it("should return null for invalid inputs", () => {
    expect(formatDiscount(null, 100)).toBe(null);
    expect(formatDiscount(100, null)).toBe(null);
    expect(formatDiscount(NaN, 100)).toBe(null);
    expect(formatDiscount(100, NaN)).toBe(null);
  });
});

describe("formatINR", () => {
  it("should format INR price", () => {
    const result = formatINR(1234.56);
    expect(result).toBe("₹1,234.56");
  });

  it("should return N/A for invalid input", () => {
    const result = formatINR(null);
    expect(result).toBe("N/A");
  });
});

describe("parsePrice", () => {
  it("should parse valid number string", () => {
    const result = parsePrice("123.45");
    expect(result).toBe(123.45);
  });

  it("should parse string with currency symbols", () => {
    const result = parsePrice("₹123.45");
    expect(result).toBe(123.45);
  });

  it("should parse string with commas", () => {
    const result = parsePrice("1,234.56");
    expect(result).toBe(1234.56);
  });

  it("should return 0 for null", () => {
    const result = parsePrice(null);
    expect(result).toBe(0);
  });

  it("should return 0 for empty string", () => {
    const result = parsePrice("");
    expect(result).toBe(0);
  });

  it("should return 0 for invalid string", () => {
    const result = parsePrice("not-a-number");
    expect(result).toBe(0);
  });
});
