import {
  formatDiscount,
  formatINR,
  formatPrice,
  formatPriceRange,
  parsePrice,
  safeToLocaleString,
  type Currency,
  type FormatPriceOptions,
} from "../price.utils";

describe("Price Utils", () => {
  describe("formatPrice", () => {
    it("should format INR price with symbol", () => {
      expect(formatPrice(1000)).toBe("₹1,000.00");
      expect(formatPrice(100000)).toBe("₹1,00,000.00");
    });

    it("should format price without decimals", () => {
      expect(formatPrice(1000, { showDecimals: false })).toBe("₹1,000");
    });

    it("should format price without symbol", () => {
      expect(formatPrice(1000, { showSymbol: false })).toBe("1,000.00");
    });

    it("should format USD price", () => {
      const result = formatPrice(1000, { currency: "USD" });
      expect(result).toContain("$");
      expect(result).toContain("1,000");
    });

    it("should format EUR price", () => {
      const result = formatPrice(1000, { currency: "EUR" });
      expect(result).toContain("€");
    });

    it("should format GBP price", () => {
      const result = formatPrice(1000, { currency: "GBP" });
      expect(result).toContain("£");
    });

    it("should return N/A for null", () => {
      expect(formatPrice(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatPrice(undefined)).toBe("N/A");
    });

    it("should return N/A for NaN", () => {
      expect(formatPrice(NaN)).toBe("N/A");
    });

    it("should handle zero", () => {
      expect(formatPrice(0)).toBe("₹0.00");
    });

    it("should handle negative prices", () => {
      expect(formatPrice(-100)).toBe("₹-100.00");
    });

    it("should handle decimal values", () => {
      expect(formatPrice(99.99)).toBe("₹99.99");
    });

    it("should round to 2 decimal places", () => {
      expect(formatPrice(99.999)).toBe("₹100.00");
    });

    it("should format large numbers", () => {
      expect(formatPrice(1234567.89)).toContain("12,34,567.89");
    });
  });

  describe("safeToLocaleString", () => {
    it("should format number to locale string", () => {
      expect(safeToLocaleString(1000)).toContain("1,000");
    });

    it("should return 0 for null", () => {
      expect(safeToLocaleString(null)).toBe("0");
    });

    it("should return 0 for undefined", () => {
      expect(safeToLocaleString(undefined)).toBe("0");
    });

    it("should return 0 for NaN", () => {
      expect(safeToLocaleString(NaN)).toBe("0");
    });

    it("should use custom locale", () => {
      const result = safeToLocaleString(1000, "en-US");
      expect(result).toBeTruthy();
    });

    it("should handle decimals", () => {
      expect(safeToLocaleString(1234.56)).toContain("1,234");
    });

    it("should not show decimals for whole numbers", () => {
      const result = safeToLocaleString(1000);
      expect(result).not.toContain(".00");
    });
  });

  describe("formatPriceRange", () => {
    it("should format price range", () => {
      expect(formatPriceRange(100, 500)).toBe("₹100.00 - ₹500.00");
    });

    it("should format single price when min equals max", () => {
      expect(formatPriceRange(100, 100)).toBe("₹100.00");
    });

    it("should return N/A for null min", () => {
      expect(formatPriceRange(null, 500)).toBe("N/A");
    });

    it("should return N/A for null max", () => {
      expect(formatPriceRange(100, null)).toBe("N/A");
    });

    it("should return N/A for undefined values", () => {
      expect(formatPriceRange(undefined, undefined)).toBe("N/A");
    });

    it("should return N/A for NaN values", () => {
      expect(formatPriceRange(NaN, 500)).toBe("N/A");
      expect(formatPriceRange(100, NaN)).toBe("N/A");
    });

    it("should format with custom currency", () => {
      const result = formatPriceRange(100, 500, "USD");
      expect(result).toContain("$");
    });

    it("should handle zero values", () => {
      expect(formatPriceRange(0, 100)).toContain("₹0.00");
    });

    it("should handle decimal values", () => {
      expect(formatPriceRange(99.99, 199.99)).toContain("99.99");
    });
  });

  describe("formatDiscount", () => {
    it("should calculate and format discount", () => {
      expect(formatDiscount(100, 80)).toBe("-20%");
      expect(formatDiscount(200, 150)).toBe("-25%");
    });

    it("should round discount percentage", () => {
      expect(formatDiscount(100, 66.666)).toBe("-33%");
    });

    it("should return null for no discount", () => {
      expect(formatDiscount(100, 100)).toBeNull();
      expect(formatDiscount(100, 120)).toBeNull();
    });

    it("should return null for null original price", () => {
      expect(formatDiscount(null, 80)).toBeNull();
    });

    it("should return null for null current price", () => {
      expect(formatDiscount(100, null)).toBeNull();
    });

    it("should return null for undefined values", () => {
      expect(formatDiscount(undefined, 80)).toBeNull();
      expect(formatDiscount(100, undefined)).toBeNull();
    });

    it("should return null for NaN values", () => {
      expect(formatDiscount(NaN, 80)).toBeNull();
      expect(formatDiscount(100, NaN)).toBeNull();
    });

    it("should handle large discounts", () => {
      expect(formatDiscount(1000, 100)).toBe("-90%");
    });

    it("should handle small discounts", () => {
      expect(formatDiscount(100, 99)).toBe("-1%");
    });

    it("should return null when current price is higher", () => {
      expect(formatDiscount(100, 150)).toBeNull();
    });
  });

  describe("formatINR", () => {
    it("should format as INR with symbol", () => {
      expect(formatINR(1000)).toBe("₹1,000.00");
    });

    it("should return N/A for null", () => {
      expect(formatINR(null)).toBe("N/A");
    });

    it("should return N/A for undefined", () => {
      expect(formatINR(undefined)).toBe("N/A");
    });

    it("should handle zero", () => {
      expect(formatINR(0)).toBe("₹0.00");
    });

    it("should handle negative values", () => {
      expect(formatINR(-100)).toBe("₹-100.00");
    });
  });

  describe("parsePrice", () => {
    it("should parse valid price string", () => {
      expect(parsePrice("100")).toBe(100);
      expect(parsePrice("1000.50")).toBe(1000.5);
    });

    it("should remove currency symbols", () => {
      expect(parsePrice("₹1,000")).toBe(1000);
      expect(parsePrice("$100.50")).toBe(100.5);
    });

    it("should remove commas", () => {
      expect(parsePrice("1,000,000")).toBe(1000000);
    });

    it("should handle negative numbers", () => {
      expect(parsePrice("-100")).toBe(-100);
    });

    it("should handle decimal numbers", () => {
      expect(parsePrice("99.99")).toBe(99.99);
    });

    it("should return 0 for null", () => {
      expect(parsePrice(null)).toBe(0);
    });

    it("should return 0 for undefined", () => {
      expect(parsePrice(undefined)).toBe(0);
    });

    it("should return 0 for empty string", () => {
      expect(parsePrice("")).toBe(0);
    });

    it("should return 0 for invalid string", () => {
      expect(parsePrice("abc")).toBe(0);
      expect(parsePrice("not a number")).toBe(0);
    });

    it("should handle strings with spaces", () => {
      expect(parsePrice("1 000")).toBe(1000);
    });

    it("should handle mixed formats", () => {
      expect(parsePrice("₹ 1,234.56")).toBe(1234.56);
    });

    it("should keep only numbers, dots, and hyphens", () => {
      expect(parsePrice("abc123.45xyz")).toBe(123.45);
    });

    it("should handle multiple dots (parse first valid number)", () => {
      const result = parsePrice("12.34.56");
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("Currency configurations", () => {
    it("should use correct symbol for INR", () => {
      expect(formatPrice(100, { currency: "INR" })).toContain("₹");
    });

    it("should use correct symbol for USD", () => {
      expect(formatPrice(100, { currency: "USD" })).toContain("$");
    });

    it("should use correct symbol for EUR", () => {
      expect(formatPrice(100, { currency: "EUR" })).toContain("€");
    });

    it("should use correct symbol for GBP", () => {
      expect(formatPrice(100, { currency: "GBP" })).toContain("£");
    });

    it("should position symbol before for INR", () => {
      const result = formatPrice(100, { currency: "INR" });
      expect(result.indexOf("₹")).toBeLessThan(result.indexOf("100"));
    });

    it("should position symbol before for USD", () => {
      const result = formatPrice(100, { currency: "USD" });
      expect(result.indexOf("$")).toBeLessThan(result.indexOf("100"));
    });

    it("should position symbol after for EUR", () => {
      const result = formatPrice(100, { currency: "EUR" });
      expect(result.indexOf("€")).toBeGreaterThan(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large numbers", () => {
      expect(formatPrice(999999999)).toBeTruthy();
    });

    it("should handle very small numbers", () => {
      expect(formatPrice(0.01)).toBe("₹0.01");
    });

    it("should handle infinity", () => {
      expect(formatPrice(Infinity)).toBe("N/A");
      expect(formatPrice(-Infinity)).toBe("N/A");
    });

    it("should handle scientific notation strings", () => {
      // parsePrice removes non-digits except . and -, so "1e3" becomes "13"
      expect(parsePrice("1e3")).toBe(13);
    });

    it("should format options combinations", () => {
      expect(
        formatPrice(1000, { showSymbol: false, showDecimals: false })
      ).toBe("1,000");
    });

    it("should handle null in range with both null", () => {
      expect(formatPriceRange(null, null)).toBe("N/A");
    });
  });

  describe("Type safety", () => {
    it("should accept all currency types", () => {
      const currencies: Currency[] = ["INR", "USD", "EUR", "GBP"];
      currencies.forEach((currency) => {
        expect(formatPrice(100, { currency })).toBeTruthy();
      });
    });

    it("should accept format options", () => {
      const options: FormatPriceOptions = {
        currency: "INR",
        showSymbol: true,
        showDecimals: true,
      };
      expect(formatPrice(100, options)).toBeTruthy();
    });
  });
});
