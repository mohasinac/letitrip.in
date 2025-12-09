/**
 * Formatters - Edge Cases and Boundary Tests
 * Tests edge cases, error conditions, and boundary scenarios for all formatter functions
 */

import {
  formatBankAccount,
  formatBoolean,
  formatCardNumber,
  formatCompactCurrency,
  formatDiscount,
  formatDuration,
  formatFileSize,
  formatList,
  formatNumber,
  formatOrderId,
  formatPhoneNumber,
  formatPincode,
  formatRating,
  formatReviewCount,
  formatShopId,
  formatSKU,
  formatStockStatus,
  formatTimeRemaining,
  slugToTitle,
  truncateText,
} from "../formatters";

describe("Formatters - Edge Cases", () => {
  describe("formatCompactCurrency - Edge Cases", () => {
    it("should handle very large numbers", () => {
      expect(formatCompactCurrency(1000000000000)).toBe("₹100000.0Cr");
    });

    it("should handle decimal crores", () => {
      expect(formatCompactCurrency(12345678)).toBe("₹1.2Cr");
    });

    it("should handle NaN", () => {
      const result = formatCompactCurrency(NaN);
      expect(result).toBeDefined();
    });

    it("should handle Infinity", () => {
      const result = formatCompactCurrency(Infinity);
      expect(result).toBeDefined();
    });

    it("should handle very small positive numbers", () => {
      expect(formatCompactCurrency(0.01)).toBe("₹0");
    });

    it("should handle negative lakhs", () => {
      expect(formatCompactCurrency(-500000)).toBe("₹-5.0L");
    });

    it("should handle boundary between K and L", () => {
      expect(formatCompactCurrency(99999)).toBe("₹100.0K");
      expect(formatCompactCurrency(100000)).toBe("₹1.0L");
    });

    it("should handle boundary between L and Cr", () => {
      expect(formatCompactCurrency(9999999)).toBe("₹100.0L");
      expect(formatCompactCurrency(10000000)).toBe("₹1.0Cr");
    });
  });

  describe("formatNumber - Edge Cases", () => {
    it("should handle very large numbers", () => {
      const result = formatNumber(9999999999999);
      expect(result).toBeDefined();
    });

    it("should handle very small decimals", () => {
      const result = formatNumber(0.000001, { maximumFractionDigits: 6 });
      expect(result).toBeDefined();
    });

    it("should handle zero with fraction digits", () => {
      expect(formatNumber(0, { minimumFractionDigits: 2 })).toBe("0.00");
    });

    it("should handle negative decimals", () => {
      const result = formatNumber(-123.456);
      expect(result).toContain("-");
    });

    it("should handle NaN", () => {
      const result = formatNumber(NaN);
      expect(result).toBeDefined();
    });
  });

  describe("formatPhoneNumber - Edge Cases", () => {
    it("should handle empty string", () => {
      expect(formatPhoneNumber("")).toBe("");
    });

    it("should handle phone with only digits", () => {
      expect(formatPhoneNumber("9876543210")).toBe("+91 98765 43210");
    });

    it("should handle phone with country code already", () => {
      expect(formatPhoneNumber("+919876543210")).toBe("+91 98765 43210");
    });

    it("should handle phone with spaces", () => {
      expect(formatPhoneNumber("98765 43210")).toBe("+91 98765 43210");
    });

    it("should handle phone with dashes", () => {
      expect(formatPhoneNumber("98765-43210")).toBe("+91 98765 43210");
    });

    it("should handle phone with parentheses", () => {
      expect(formatPhoneNumber("(987) 654-3210")).toBe("+91 98765 43210");
    });

    it("should handle too short phone", () => {
      expect(formatPhoneNumber("12345")).toBe("12345");
    });

    it("should handle too long phone", () => {
      expect(formatPhoneNumber("123456789012345")).toBe("123456789012345");
    });

    it("should handle phone with letters", () => {
      const result = formatPhoneNumber("98765ABC10");
      expect(result).toBeDefined();
    });
  });

  describe("formatPincode - Edge Cases", () => {
    it("should handle 6-digit pincode", () => {
      expect(formatPincode("110001")).toBe("110001");
    });

    it("should truncate longer pincode", () => {
      expect(formatPincode("11000123456")).toBe("110001");
    });

    it("should handle pincode with letters", () => {
      expect(formatPincode("110ABC")).toBe("110");
    });

    it("should handle empty string", () => {
      expect(formatPincode("")).toBe("");
    });

    it("should handle pincode with spaces", () => {
      expect(formatPincode("11 00 01")).toBe("110001");
    });

    it("should handle pincode with dashes", () => {
      expect(formatPincode("110-001")).toBe("110001");
    });
  });

  describe("formatFileSize - Edge Cases", () => {
    it("should handle 0 bytes", () => {
      expect(formatFileSize(0)).toBe("0 B");
    });

    it("should handle 1 byte", () => {
      expect(formatFileSize(1)).toBe("1 B");
    });

    it("should handle KB boundary", () => {
      expect(formatFileSize(1023)).toBe("1023 B");
      expect(formatFileSize(1024)).toBe("1.0 KB");
    });

    it("should handle MB boundary", () => {
      expect(formatFileSize(1048575)).toBe("1024.0 KB");
      expect(formatFileSize(1048576)).toBe("1.0 MB");
    });

    it("should handle GB boundary", () => {
      expect(formatFileSize(1073741823)).toBe("1024.0 MB");
      expect(formatFileSize(1073741824)).toBe("1.0 GB");
    });

    it("should handle very large files (TB)", () => {
      expect(formatFileSize(1099511627776)).toBe("1.0 TB");
    });

    it("should handle negative size", () => {
      const result = formatFileSize(-1024);
      expect(result).toBeDefined();
    });

    it("should handle decimal bytes", () => {
      expect(formatFileSize(1536.5)).toBe("1.5 KB");
    });
  });

  describe("formatDuration - Edge Cases", () => {
    it("should handle 0 seconds", () => {
      expect(formatDuration(0)).toBe("0s");
    });

    it("should handle only seconds", () => {
      expect(formatDuration(45)).toBe("45s");
    });

    it("should handle only minutes", () => {
      expect(formatDuration(120)).toBe("2m");
    });

    it("should handle only hours", () => {
      expect(formatDuration(3600)).toBe("1h");
    });

    it("should handle hours and minutes", () => {
      expect(formatDuration(3660)).toBe("1h 1m");
    });

    it("should handle all components", () => {
      expect(formatDuration(3661)).toBe("1h 1m 1s");
    });

    it("should handle very large durations", () => {
      expect(formatDuration(86400)).toBe("24h");
    });

    it("should handle negative duration", () => {
      const result = formatDuration(-60);
      expect(result).toBeDefined();
    });

    it("should handle decimal seconds", () => {
      expect(formatDuration(90.5)).toBe("1m 30s");
    });
  });

  describe("formatOrderId - Edge Cases", () => {
    it("should handle short ID", () => {
      expect(formatOrderId("123")).toBe("#ORD-123");
    });

    it("should handle long ID (take last 8)", () => {
      expect(formatOrderId("abcdefghijklmnop")).toBe("#ORD-IJKLMNOP");
    });

    it("should convert to uppercase", () => {
      expect(formatOrderId("abcdefgh")).toBe("#ORD-ABCDEFGH");
    });

    it("should handle empty string", () => {
      expect(formatOrderId("")).toBe("#ORD-");
    });

    it("should handle numbers", () => {
      expect(formatOrderId("12345678")).toBe("#ORD-12345678");
    });

    it("should handle mixed case", () => {
      expect(formatOrderId("AbCdEfGh")).toBe("#ORD-ABCDEFGH");
    });
  });

  describe("formatShopId - Edge Cases", () => {
    it("should handle short ID", () => {
      expect(formatShopId("123")).toBe("SHP-123");
    });

    it("should handle long ID", () => {
      expect(formatShopId("abcdefghijklmnop")).toBe("SHP-IJKLMNOP");
    });

    it("should convert to uppercase", () => {
      expect(formatShopId("abcdefgh")).toBe("SHP-ABCDEFGH");
    });
  });

  describe("formatSKU - Edge Cases", () => {
    it("should convert lowercase to uppercase", () => {
      expect(formatSKU("abc-123")).toBe("ABC-123");
    });

    it("should handle already uppercase", () => {
      expect(formatSKU("ABC-123")).toBe("ABC-123");
    });

    it("should handle mixed case", () => {
      expect(formatSKU("AbC-123")).toBe("ABC-123");
    });

    it("should handle special characters", () => {
      expect(formatSKU("abc_123-xyz")).toBe("ABC_123-XYZ");
    });

    it("should handle empty string", () => {
      expect(formatSKU("")).toBe("");
    });
  });

  describe("truncateText - Edge Cases", () => {
    it("should not truncate short text", () => {
      expect(truncateText("Hello", 10)).toBe("Hello");
    });

    it("should truncate long text", () => {
      expect(truncateText("Hello World!", 8)).toBe("Hello...");
    });

    it("should handle exact length", () => {
      expect(truncateText("Hello", 5)).toBe("Hello");
    });

    it("should handle maxLength less than 3", () => {
      expect(truncateText("Hello", 2)).toBe("...");
    });

    it("should handle empty string", () => {
      expect(truncateText("", 10)).toBe("");
    });

    it("should handle maxLength 0", () => {
      expect(truncateText("Hello", 0)).toBe("...");
    });

    it("should handle unicode characters", () => {
      const result = truncateText("Hello 👋 World", 10);
      expect(result).toBeDefined();
    });
  });

  describe("slugToTitle - Edge Cases", () => {
    it("should convert single word", () => {
      expect(slugToTitle("hello")).toBe("Hello");
    });

    it("should convert multi-word slug", () => {
      expect(slugToTitle("hello-world-test")).toBe("Hello World Test");
    });

    it("should handle already capitalized", () => {
      // Function converts dashes to spaces and capitalizes
      expect(slugToTitle("Hello-World")).toBe("Hello World");
    });

    it("should handle numbers", () => {
      expect(slugToTitle("test-123-item")).toBe("Test 123 Item");
    });

    it("should handle empty string", () => {
      expect(slugToTitle("")).toBe("");
    });

    it("should handle single dash", () => {
      expect(slugToTitle("-")).toBe(" ");
    });

    it("should handle multiple consecutive dashes", () => {
      expect(slugToTitle("hello---world")).toBe("Hello   World");
    });
  });

  describe("formatDiscount - Edge Cases", () => {
    it("should return 0% when no discount", () => {
      expect(formatDiscount(100, 100)).toBe("0%");
    });

    it("should return 0% when current price higher", () => {
      expect(formatDiscount(100, 150)).toBe("0%");
    });

    it("should calculate 50% discount", () => {
      expect(formatDiscount(100, 50)).toBe("50%");
    });

    it("should calculate 25% discount", () => {
      expect(formatDiscount(100, 75)).toBe("25%");
    });

    it("should round to nearest integer", () => {
      expect(formatDiscount(100, 66)).toBe("34%");
    });

    it("should handle very small discount", () => {
      expect(formatDiscount(100, 99.9)).toBe("0%");
    });

    it("should handle 100% discount", () => {
      expect(formatDiscount(100, 0)).toBe("100%");
    });
  });

  describe("formatRating - Edge Cases", () => {
    it("should format decimal rating", () => {
      expect(formatRating(4.5)).toBe("4.5 out of 5");
    });

    it("should format integer rating", () => {
      expect(formatRating(4)).toBe("4.0 out of 5");
    });

    it("should handle 0 rating", () => {
      expect(formatRating(0)).toBe("0.0 out of 5");
    });

    it("should handle max rating", () => {
      expect(formatRating(5)).toBe("5.0 out of 5");
    });

    it("should handle custom max rating", () => {
      expect(formatRating(8, 10)).toBe("8.0 out of 10");
    });

    it("should handle negative rating", () => {
      expect(formatRating(-1)).toBe("-1.0 out of 5");
    });

    it("should handle rating above max", () => {
      expect(formatRating(6)).toBe("6.0 out of 5");
    });
  });

  describe("formatReviewCount - Edge Cases", () => {
    it("should handle 0 reviews", () => {
      expect(formatReviewCount(0)).toBe("No reviews");
    });

    it("should handle 1 review", () => {
      expect(formatReviewCount(1)).toBe("1 review");
    });

    it("should handle 2 reviews", () => {
      expect(formatReviewCount(2)).toBe("2 reviews");
    });

    it("should handle large count with K", () => {
      const result = formatReviewCount(1500);
      expect(result).toContain("reviews");
    });

    it("should handle very large count", () => {
      const result = formatReviewCount(1000000);
      expect(result).toContain("reviews");
    });
  });

  describe("formatStockStatus - Edge Cases", () => {
    it("should return Out of Stock for 0", () => {
      expect(formatStockStatus(0)).toBe("Out of Stock");
    });

    it("should return Out of Stock for negative (data integrity bug)", () => {
      expect(formatStockStatus(-5)).toBe("Out of Stock");
    });

    it("should return low stock warning for 1-5", () => {
      expect(formatStockStatus(1)).toBe("Only 1 left");
      expect(formatStockStatus(3)).toBe("Only 3 left");
      expect(formatStockStatus(5)).toBe("Only 5 left");
    });

    it("should return In Stock for >5", () => {
      expect(formatStockStatus(6)).toBe("In Stock");
      expect(formatStockStatus(100)).toBe("In Stock");
    });
  });

  describe("formatTimeRemaining - Edge Cases", () => {
    it("should return ended for null", () => {
      expect(formatTimeRemaining(null)).toBe("Auction ended");
    });

    it("should return ended for undefined", () => {
      expect(formatTimeRemaining(undefined)).toBe("Auction ended");
    });

    it("should return ended for invalid date string", () => {
      expect(formatTimeRemaining("invalid")).toBe("Auction ended");
    });

    it("should return ended for past date", () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60);
      expect(formatTimeRemaining(pastDate)).toBe("Auction ended");
    });

    it("should format minutes only", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 30);
      const result = formatTimeRemaining(futureDate);
      expect(result).toContain("m");
      expect(result).not.toContain("h");
      expect(result).not.toContain("d");
    });

    it("should format hours and minutes", () => {
      const futureDate = new Date(
        Date.now() + 1000 * 60 * 60 * 2 + 1000 * 60 * 30
      );
      const result = formatTimeRemaining(futureDate);
      expect(result).toContain("h");
      expect(result).toContain("m");
    });

    it("should format days and hours", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
      const result = formatTimeRemaining(futureDate);
      expect(result).toContain("d");
      expect(result).toContain("h");
    });

    it("should handle string date", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      const result = formatTimeRemaining(futureDate);
      expect(result).not.toBe("Auction ended");
    });
  });

  describe("formatCardNumber - Edge Cases", () => {
    it("should mask card number", () => {
      expect(formatCardNumber("1234567890123456")).toBe("**** **** **** 3456");
    });

    it("should handle card with spaces", () => {
      expect(formatCardNumber("1234 5678 9012 3456")).toBe(
        "**** **** **** 3456"
      );
    });

    it("should handle short card", () => {
      expect(formatCardNumber("1234")).toBe("**** **** **** 1234");
    });

    it("should handle empty string", () => {
      expect(formatCardNumber("")).toBe("**** **** **** ");
    });
  });

  describe("formatBankAccount - Edge Cases", () => {
    it("should mask account number", () => {
      expect(formatBankAccount("1234567890")).toBe("******7890");
    });

    it("should handle short account (≤4 digits)", () => {
      expect(formatBankAccount("1234")).toBe("1234");
      expect(formatBankAccount("123")).toBe("123");
    });

    it("should handle empty string", () => {
      expect(formatBankAccount("")).toBe("");
    });

    it("should handle very long account", () => {
      expect(formatBankAccount("12345678901234567890")).toBe(
        "****************7890"
      );
    });
  });

  describe("formatBoolean - Edge Cases", () => {
    it("should return Yes for true", () => {
      expect(formatBoolean(true)).toBe("Yes");
    });

    it("should return No for false", () => {
      expect(formatBoolean(false)).toBe("No");
    });

    it("should handle truthy values", () => {
      expect(formatBoolean(1 as any)).toBe("Yes");
      expect(formatBoolean("true" as any)).toBe("Yes");
    });

    it("should handle falsy values", () => {
      expect(formatBoolean(0 as any)).toBe("No");
      expect(formatBoolean("" as any)).toBe("No");
      expect(formatBoolean(null as any)).toBe("No");
    });
  });

  describe("formatList - Edge Cases", () => {
    it("should handle empty array", () => {
      expect(formatList([])).toBe("");
    });

    it("should handle single item", () => {
      expect(formatList(["Apple"])).toBe("Apple");
    });

    it("should handle two items", () => {
      const result = formatList(["Apple", "Banana"]);
      expect(result).toContain("Apple");
      expect(result).toContain("Banana");
      expect(result).toContain("and");
    });

    it("should handle three items", () => {
      const result = formatList(["Apple", "Banana", "Orange"]);
      expect(result).toContain("Apple");
      expect(result).toContain("Banana");
      expect(result).toContain("Orange");
      expect(result).toContain("and");
    });

    it("should handle many items", () => {
      const result = formatList(["A", "B", "C", "D", "E"]);
      expect(result).toContain("A");
      expect(result).toContain("E");
    });
  });
});
