/**
 * Comprehensive Price Utilities Test Suite
 *
 * Tests edge cases, null safety, localization, and real-world price scenarios.
 * Focuses on Indian market requirements and international currency support.
 *
 * Testing Focus:
 * - Null safety across all functions
 * - Indian numbering system (लाख/crore notation)
 * - Currency symbol positioning
 * - Decimal handling and rounding
 * - Edge cases: Infinity, very large numbers, negative prices
 * - Locale-specific formatting differences
 */

import {
  formatDiscount,
  formatINR,
  formatPrice,
  formatPriceRange,
  parsePrice,
  safeToLocaleString,
} from "../price.utils";

describe("Price Utilities - Comprehensive Edge Cases", () => {
  describe("formatPrice - Core Functionality", () => {
    describe("INR (Indian Rupee) formatting", () => {
      it("formats INR with Indian numbering system (लाख notation)", () => {
        // Indian system: 1,00,000 (1 lakh) not 100,000
        expect(formatPrice(100000)).toBe("₹1,00,000.00");
        expect(formatPrice(1000000)).toBe("₹10,00,000.00"); // 10 lakh
        expect(formatPrice(10000000)).toBe("₹1,00,00,000.00"); // 1 crore
      });

      it("formats standard INR amounts", () => {
        expect(formatPrice(0)).toBe("₹0.00");
        expect(formatPrice(1)).toBe("₹1.00");
        expect(formatPrice(10)).toBe("₹10.00");
        expect(formatPrice(100)).toBe("₹100.00");
        expect(formatPrice(1000)).toBe("₹1,000.00");
        expect(formatPrice(10000)).toBe("₹10,000.00");
      });

      it("handles decimal amounts correctly", () => {
        expect(formatPrice(99.99)).toBe("₹99.99");
        expect(formatPrice(1234.56)).toBe("₹1,234.56");
        expect(formatPrice(0.01)).toBe("₹0.01");
        expect(formatPrice(0.99)).toBe("₹0.99");
      });

      it("rounds decimals to 2 places", () => {
        expect(formatPrice(1234.567)).toBe("₹1,234.57"); // Rounds up
        expect(formatPrice(1234.564)).toBe("₹1,234.56"); // Rounds down
        expect(formatPrice(1234.999)).toBe("₹1,235.00"); // Rounds to whole
      });

      it("formats without symbol when requested", () => {
        expect(formatPrice(1234.56, { showSymbol: false })).toBe("1,234.56");
        expect(formatPrice(100000, { showSymbol: false })).toBe("1,00,000.00");
      });

      it("formats without decimals when requested", () => {
        expect(formatPrice(1234.56, { showDecimals: false })).toBe("₹1,235");
        expect(formatPrice(1234.49, { showDecimals: false })).toBe("₹1,234");
        expect(formatPrice(100000, { showDecimals: false })).toBe("₹1,00,000");
      });

      it("formats without symbol and decimals", () => {
        expect(
          formatPrice(1234.56, { showSymbol: false, showDecimals: false })
        ).toBe("1,235");
        expect(
          formatPrice(100000, { showSymbol: false, showDecimals: false })
        ).toBe("1,00,000");
      });
    });

    describe("other currencies", () => {
      it("formats USD with US numbering system", () => {
        // US system: 100,000 (not Indian 1,00,000)
        expect(formatPrice(100000, { currency: "USD" })).toBe("$100,000.00");
        expect(formatPrice(1000000, { currency: "USD" })).toBe("$1,000,000.00");
        expect(formatPrice(1234.56, { currency: "USD" })).toBe("$1,234.56");
      });

      it("formats EUR with European formatting", () => {
        // European format: symbol after, different separators
        expect(formatPrice(1234.56, { currency: "EUR" })).toBe("1.234,56€");
        expect(formatPrice(100000, { currency: "EUR" })).toBe("100.000,00€");
      });

      it("formats GBP with British formatting", () => {
        expect(formatPrice(1234.56, { currency: "GBP" })).toBe("£1,234.56");
        expect(formatPrice(100000, { currency: "GBP" })).toBe("£100,000.00");
      });

      it("handles all currencies without symbol", () => {
        expect(
          formatPrice(1234.56, { currency: "USD", showSymbol: false })
        ).toBe("1,234.56");
        expect(
          formatPrice(1234.56, { currency: "EUR", showSymbol: false })
        ).toBe("1.234,56");
        expect(
          formatPrice(1234.56, { currency: "GBP", showSymbol: false })
        ).toBe("1,234.56");
      });

      it("handles all currencies without decimals", () => {
        expect(
          formatPrice(1234.56, { currency: "USD", showDecimals: false })
        ).toBe("$1,235");
        expect(
          formatPrice(1234.56, { currency: "EUR", showDecimals: false })
        ).toBe("1.235€");
        expect(
          formatPrice(1234.56, { currency: "GBP", showDecimals: false })
        ).toBe("£1,235");
      });
    });

    describe("null safety", () => {
      it("returns N/A for null", () => {
        expect(formatPrice(null)).toBe("N/A");
      });

      it("returns N/A for undefined", () => {
        expect(formatPrice(undefined)).toBe("N/A");
      });

      it("returns N/A for NaN", () => {
        expect(formatPrice(NaN)).toBe("N/A");
      });

      it("returns N/A for Infinity", () => {
        expect(formatPrice(Infinity)).toBe("N/A");
        expect(formatPrice(-Infinity)).toBe("N/A");
      });

      it("handles null/undefined with options", () => {
        expect(formatPrice(null, { currency: "USD" })).toBe("N/A");
        expect(formatPrice(undefined, { showSymbol: false })).toBe("N/A");
      });
    });

    describe("negative amounts", () => {
      it("formats negative amounts correctly", () => {
        expect(formatPrice(-1234.56)).toBe("₹-1,234.56");
        expect(formatPrice(-100000)).toBe("₹-1,00,000.00");
      });

      it("formats negative amounts in other currencies", () => {
        expect(formatPrice(-1234.56, { currency: "USD" })).toBe("$-1,234.56");
        expect(formatPrice(-1234.56, { currency: "EUR" })).toBe("-1.234,56€");
      });

      it("handles negative zero", () => {
        // ACTUAL BEHAVIOR: JavaScript -0 is displayed as -0 by toLocaleString
        expect(formatPrice(-0)).toBe("₹-0.00");
      });
    });

    describe("edge cases", () => {
      it("handles very large numbers", () => {
        expect(formatPrice(9999999999.99)).toBe("₹9,99,99,99,999.99");
        expect(formatPrice(1234567890123.45)).toBe("₹12,34,56,78,90,123.45");
      });

      it("handles very small decimals", () => {
        expect(formatPrice(0.001)).toBe("₹0.00"); // Rounds to 0.00
        expect(formatPrice(0.005)).toBe("₹0.01"); // Rounds to 0.01
        expect(formatPrice(0.01)).toBe("₹0.01");
      });

      it("handles zero", () => {
        expect(formatPrice(0)).toBe("₹0.00");
        expect(formatPrice(0, { showDecimals: false })).toBe("₹0");
        expect(formatPrice(0, { showSymbol: false })).toBe("0.00");
      });

      it("handles whole numbers", () => {
        expect(formatPrice(1000)).toBe("₹1,000.00");
        expect(formatPrice(1000, { showDecimals: false })).toBe("₹1,000");
      });
    });
  });

  describe("formatPriceRange - Range Formatting", () => {
    describe("valid ranges", () => {
      it("formats price ranges with default currency", () => {
        expect(formatPriceRange(100, 500)).toBe("₹100.00 - ₹500.00");
        expect(formatPriceRange(1000, 5000)).toBe("₹1,000.00 - ₹5,000.00");
      });

      it("formats price ranges with custom currency", () => {
        expect(formatPriceRange(100, 500, "USD")).toBe("$100.00 - $500.00");
        expect(formatPriceRange(100, 500, "EUR")).toBe("100,00€ - 500,00€");
        expect(formatPriceRange(100, 500, "GBP")).toBe("£100.00 - £500.00");
      });

      it("formats single price when min equals max", () => {
        expect(formatPriceRange(100, 100)).toBe("₹100.00");
        expect(formatPriceRange(500, 500, "USD")).toBe("$500.00");
      });

      it("formats large ranges", () => {
        expect(formatPriceRange(10000, 50000)).toBe("₹10,000.00 - ₹50,000.00");
        expect(formatPriceRange(100000, 500000)).toBe(
          "₹1,00,000.00 - ₹5,00,000.00"
        );
      });

      it("formats decimal ranges", () => {
        expect(formatPriceRange(99.99, 499.99)).toBe("₹99.99 - ₹499.99");
        expect(formatPriceRange(10.5, 20.75)).toBe("₹10.50 - ₹20.75");
      });

      it("formats ranges with zero", () => {
        expect(formatPriceRange(0, 100)).toBe("₹0.00 - ₹100.00");
        expect(formatPriceRange(0, 0)).toBe("₹0.00");
      });
    });

    describe("null safety", () => {
      it("returns N/A when min is null", () => {
        expect(formatPriceRange(null, 500)).toBe("N/A");
      });

      it("returns N/A when max is null", () => {
        expect(formatPriceRange(100, null)).toBe("N/A");
      });

      it("returns N/A when both are null", () => {
        expect(formatPriceRange(null, null)).toBe("N/A");
      });

      it("returns N/A when min is undefined", () => {
        expect(formatPriceRange(undefined, 500)).toBe("N/A");
      });

      it("returns N/A when max is undefined", () => {
        expect(formatPriceRange(100, undefined)).toBe("N/A");
      });

      it("returns N/A when min is NaN", () => {
        expect(formatPriceRange(NaN, 500)).toBe("N/A");
      });

      it("returns N/A when max is NaN", () => {
        expect(formatPriceRange(100, NaN)).toBe("N/A");
      });

      it("returns N/A with custom currency", () => {
        expect(formatPriceRange(null, 500, "USD")).toBe("N/A");
        expect(formatPriceRange(100, null, "EUR")).toBe("N/A");
      });
    });

    describe("edge cases", () => {
      it("handles negative ranges", () => {
        expect(formatPriceRange(-100, 100)).toBe("₹-100.00 - ₹100.00");
        expect(formatPriceRange(-500, -100)).toBe("₹-500.00 - ₹-100.00");
      });

      it("handles reversed ranges (min > max)", () => {
        // Current implementation doesn't validate order
        expect(formatPriceRange(500, 100)).toBe("₹500.00 - ₹100.00");
      });

      it("handles very small differences", () => {
        expect(formatPriceRange(100.0, 100.01)).toBe("₹100.00 - ₹100.01");
      });

      it("handles very large ranges", () => {
        expect(formatPriceRange(1, 1000000)).toBe("₹1.00 - ₹10,00,000.00");
      });
    });
  });

  describe("formatDiscount - Discount Calculation", () => {
    describe("valid discounts", () => {
      it("calculates and formats discount percentage", () => {
        expect(formatDiscount(100, 80)).toBe("-20%");
        expect(formatDiscount(200, 100)).toBe("-50%");
        expect(formatDiscount(1000, 750)).toBe("-25%");
      });

      it("rounds discount percentage", () => {
        expect(formatDiscount(100, 66)).toBe("-34%"); // 34% actual
        expect(formatDiscount(100, 67)).toBe("-33%"); // 33% actual
        expect(formatDiscount(100, 33.33)).toBe("-67%"); // 66.67% rounds to 67
      });

      it("handles small discounts", () => {
        expect(formatDiscount(100, 99)).toBe("-1%");
        expect(formatDiscount(1000, 995)).toBe("-1%"); // 0.5% rounds to 1
      });

      it("handles large discounts", () => {
        expect(formatDiscount(1000, 100)).toBe("-90%");
        expect(formatDiscount(100, 1)).toBe("-99%");
      });

      it("handles decimal prices", () => {
        expect(formatDiscount(99.99, 79.99)).toBe("-20%");
        expect(formatDiscount(199.99, 149.99)).toBe("-25%");
      });
    });

    describe("no discount scenarios", () => {
      it("returns null when prices are equal", () => {
        expect(formatDiscount(100, 100)).toBe(null);
      });

      it("returns null when current price is higher", () => {
        expect(formatDiscount(100, 150)).toBe(null);
      });

      it("returns null when current price equals original", () => {
        expect(formatDiscount(1000, 1000)).toBe(null);
      });
    });

    describe("null safety", () => {
      it("returns null when originalPrice is null", () => {
        expect(formatDiscount(null, 80)).toBe(null);
      });

      it("returns null when currentPrice is null", () => {
        expect(formatDiscount(100, null)).toBe(null);
      });

      it("returns null when both are null", () => {
        expect(formatDiscount(null, null)).toBe(null);
      });

      it("returns null when originalPrice is undefined", () => {
        expect(formatDiscount(undefined, 80)).toBe(null);
      });

      it("returns null when currentPrice is undefined", () => {
        expect(formatDiscount(100, undefined)).toBe(null);
      });

      it("returns null when originalPrice is NaN", () => {
        expect(formatDiscount(NaN, 80)).toBe(null);
      });

      it("returns null when currentPrice is NaN", () => {
        expect(formatDiscount(100, NaN)).toBe(null);
      });
    });

    describe("edge cases", () => {
      it("handles zero original price", () => {
        expect(formatDiscount(0, 0)).toBe(null);
        // Division by zero would cause Infinity
      });

      it("handles zero current price", () => {
        expect(formatDiscount(100, 0)).toBe("-100%");
      });

      it("handles very small discounts that round to 0", () => {
        expect(formatDiscount(10000, 9999)).toBe("-0%");
      });

      it("handles negative prices (though unlikely)", () => {
        // ACTUAL BEHAVIOR: formatDiscount calculates percentage regardless of sign
        // -80 > -100 so no discount (returns null)
        expect(formatDiscount(-100, -80)).toBe(null); // -80 > -100, no discount
        // 100 > -50 so discount is calculated: (100 - (-50)) / 100 = 150%
        expect(formatDiscount(100, -50)).toBe("-150%");
      });

      it("handles very large price differences", () => {
        expect(formatDiscount(1000000, 100000)).toBe("-90%");
      });
    });
  });

  describe("formatINR - INR Alias Function", () => {
    it("formats as INR by default", () => {
      expect(formatINR(1234.56)).toBe("₹1,234.56");
      expect(formatINR(100000)).toBe("₹1,00,000.00");
    });

    it("handles null safety", () => {
      expect(formatINR(null)).toBe("N/A");
      expect(formatINR(undefined)).toBe("N/A");
      expect(formatINR(NaN)).toBe("N/A");
    });

    it("handles edge cases", () => {
      expect(formatINR(0)).toBe("₹0.00");
      expect(formatINR(-1234.56)).toBe("₹-1,234.56");
      expect(formatINR(9999999999.99)).toBe("₹9,99,99,99,999.99");
    });

    it("always shows symbol and decimals", () => {
      expect(formatINR(1000)).toBe("₹1,000.00");
      // No options parameter in formatINR
    });
  });

  describe("safeToLocaleString - Locale String Conversion", () => {
    describe("basic formatting", () => {
      it("formats number with default locale (en-IN)", () => {
        expect(safeToLocaleString(1234.56)).toBe("1,234.56");
        expect(safeToLocaleString(100000)).toBe("1,00,000");
      });

      it("formats number with custom locale", () => {
        expect(safeToLocaleString(1234.56, "en-US")).toBe("1,234.56");
      });

      it("formats without unnecessary decimals", () => {
        expect(safeToLocaleString(1234)).toBe("1,234");
        expect(safeToLocaleString(1000)).toBe("1,000");
      });

      it("formats with up to 2 decimals", () => {
        expect(safeToLocaleString(1234.5)).toBe("1,234.5");
        expect(safeToLocaleString(1234.56)).toBe("1,234.56");
        expect(safeToLocaleString(1234.567)).toBe("1,234.57");
      });
    });

    describe("null safety", () => {
      it("returns 0 for null", () => {
        expect(safeToLocaleString(null)).toBe("0");
      });

      it("returns 0 for undefined", () => {
        expect(safeToLocaleString(undefined)).toBe("0");
      });

      it("returns 0 for NaN", () => {
        expect(safeToLocaleString(NaN)).toBe("0");
      });

      it("handles null/undefined with custom locale", () => {
        expect(safeToLocaleString(null, "en-US")).toBe("0");
        expect(safeToLocaleString(undefined, "de-DE")).toBe("0");
      });
    });

    describe("edge cases", () => {
      it("formats zero correctly", () => {
        expect(safeToLocaleString(0)).toBe("0");
      });

      it("formats negative values", () => {
        expect(safeToLocaleString(-1234.56)).toBe("-1,234.56");
      });

      it("formats large numbers", () => {
        expect(safeToLocaleString(1234567890)).toBe("1,23,45,67,890");
      });

      it("formats very small decimals", () => {
        expect(safeToLocaleString(0.01)).toBe("0.01");
        expect(safeToLocaleString(0.001)).toBe("0");
      });

      it("handles whole numbers", () => {
        expect(safeToLocaleString(1000)).toBe("1,000");
        expect(safeToLocaleString(1000000)).toBe("10,00,000");
      });

      it("doesn't format Infinity (would throw or return Infinity)", () => {
        // Note: Current implementation doesn't check for Infinity
        // This documents actual behavior
        const result = safeToLocaleString(Infinity);
        expect(result).toBe("∞"); // Browser-dependent
      });
    });
  });

  describe("parsePrice - String to Number Parsing", () => {
    describe("basic parsing", () => {
      it("parses numeric strings", () => {
        expect(parsePrice("123")).toBe(123);
        expect(parsePrice("1234.56")).toBe(1234.56);
        expect(parsePrice("0.99")).toBe(0.99);
      });

      it("parses strings with currency symbols", () => {
        expect(parsePrice("₹1234.56")).toBe(1234.56);
        expect(parsePrice("$1234.56")).toBe(1234.56);
        expect(parsePrice("£1234.56")).toBe(1234.56);
        expect(parsePrice("€1234.56")).toBe(1234.56);
      });

      it("parses strings with commas", () => {
        expect(parsePrice("1,234.56")).toBe(1234.56);
        expect(parsePrice("1,00,000")).toBe(100000);
        expect(parsePrice("10,00,000")).toBe(1000000);
      });

      it("parses strings with spaces", () => {
        expect(parsePrice("1 234.56")).toBe(1234.56);
        expect(parsePrice("₹ 1,234.56")).toBe(1234.56);
      });

      it("parses negative values", () => {
        expect(parsePrice("-1234.56")).toBe(-1234.56);
        expect(parsePrice("₹-1,234.56")).toBe(-1234.56);
      });
    });

    describe("null safety", () => {
      it("returns 0 for null", () => {
        expect(parsePrice(null)).toBe(0);
      });

      it("returns 0 for undefined", () => {
        expect(parsePrice(undefined)).toBe(0);
      });

      it("returns 0 for empty string", () => {
        expect(parsePrice("")).toBe(0);
      });

      it("returns 0 for whitespace-only string", () => {
        expect(parsePrice("   ")).toBe(0);
      });
    });

    describe("edge cases", () => {
      it("parses zero", () => {
        expect(parsePrice("0")).toBe(0);
        expect(parsePrice("0.00")).toBe(0);
        expect(parsePrice("₹0.00")).toBe(0);
      });

      it("returns 0 for non-numeric strings", () => {
        expect(parsePrice("abc")).toBe(0);
        expect(parsePrice("not a number")).toBe(0);
      });

      it("parses mixed valid/invalid characters", () => {
        expect(parsePrice("abc123def")).toBe(123);
        expect(parsePrice("Price: ₹1234.56")).toBe(1234.56);
      });

      it("handles multiple decimals", () => {
        // ACTUAL BEHAVIOR: parseFloat stops at first invalid character
        // "12.34.56" -> parseFloat gets "12.34" (stops at second dot)
        expect(parsePrice("12.34.56")).toBe(12.34);
      });

      it("parses very large numbers", () => {
        expect(parsePrice("1234567890.12")).toBe(1234567890.12);
      });

      it("handles strings with percentage signs", () => {
        expect(parsePrice("25%")).toBe(25);
      });

      it("handles strings with parentheses (accounting format)", () => {
        // ACTUAL BEHAVIOR: parsePrice strips non-digits, doesn't detect parentheses as negative
        // Would need special logic to handle accounting format
        expect(parsePrice("(1234.56)")).toBe(1234.56); // Parentheses ignored
      });
    });
  });

  describe("Integration Tests - Real-world Scenarios", () => {
    it("formats product price range with discount", () => {
      const minPrice = 999;
      const maxPrice = 4999;
      const originalPrice = 5999;
      const currentPrice = 4999;

      expect(formatPriceRange(minPrice, maxPrice)).toBe("₹999.00 - ₹4,999.00");
      expect(formatDiscount(originalPrice, currentPrice)).toBe("-17%");
    });

    it("handles e-commerce cart scenarios", () => {
      const itemPrice = 1299.99;
      const quantity = 3;
      const total = itemPrice * quantity;

      expect(formatPrice(itemPrice)).toBe("₹1,299.99");
      expect(formatPrice(total)).toBe("₹3,899.97");
    });

    it("handles subscription pricing", () => {
      const monthlyPrice = 499;
      const yearlyPrice = 4999;
      const discount = formatDiscount(monthlyPrice * 12, yearlyPrice);

      expect(formatPrice(monthlyPrice)).toBe("₹499.00");
      expect(formatPrice(yearlyPrice)).toBe("₹4,999.00");
      expect(discount).toBe("-17%");
    });

    it("handles auction bidding", () => {
      const currentBid = 15000;
      const nextMinBid = currentBid + 500;

      expect(formatPrice(currentBid)).toBe("₹15,000.00");
      expect(formatPrice(nextMinBid)).toBe("₹15,500.00");
    });

    it("handles price comparison across currencies", () => {
      const priceINR = 1000;
      const priceUSD = priceINR / 83; // Approx conversion rate
      const priceEUR = priceINR / 90;

      expect(formatPrice(priceINR, { currency: "INR" })).toBe("₹1,000.00");
      expect(formatPrice(priceUSD, { currency: "USD" })).toBe("$12.05");
      expect(formatPrice(priceEUR, { currency: "EUR" })).toBe("11,11€");
    });

    it("handles parsing user input and formatting", () => {
      const userInput = "₹1,234.56";
      const parsed = parsePrice(userInput);
      const formatted = formatPrice(parsed);

      expect(parsed).toBe(1234.56);
      expect(formatted).toBe("₹1,234.56");
    });

    it("handles bulk pricing calculations", () => {
      const unitPrice = 99.99;
      const bulkQuantity = 100;
      const bulkDiscount = 0.1; // 10%
      const bulkPrice = unitPrice * (1 - bulkDiscount);
      const total = bulkPrice * bulkQuantity;

      expect(formatPrice(bulkPrice)).toBe("₹89.99");
      // ACTUAL BEHAVIOR: 89.99 * 100 = 8999.10 (floating point precision)
      expect(formatPrice(total)).toBe("₹8,999.10");
      expect(formatDiscount(unitPrice, bulkPrice)).toBe("-10%");
    });
  });
});
