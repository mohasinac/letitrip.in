/**
 * Comprehensive Formatter Tests - Edge Cases & Bug Fixes
 *
 * This test suite covers:
 * - Edge cases not covered in basic tests
 * - Boundary conditions
 * - Type coercion scenarios
 * - Null/undefined handling
 * - Real-world usage patterns
 */

import {
  formatAddress,
  formatBankAccount,
  formatBoolean,
  formatCardNumber,
  formatCompactNumber,
  formatDateRange,
  formatDiscount,
  formatDuration,
  formatFileSize,
  formatList,
  formatNumber,
  formatOrderId,
  formatPercentage,
  formatPhoneNumber,
  formatPincode,
  formatRating,
  formatReviewCount,
  formatShopId,
  formatSKU,
  formatStockStatus,
  formatTimeRemaining,
  formatUPI,
  slugToTitle,
  truncateText,
} from "../formatters";

describe("formatNumber - Edge Cases", () => {
  it("should handle very large numbers", () => {
    const result = formatNumber(999999999999);
    // Indian numbering system: 9,99,99,99,99,999
    expect(result).toContain("9,99,99,99,99,999");
  });

  it("should handle very small decimals", () => {
    const result = formatNumber(0.00001, { maximumFractionDigits: 5 });
    expect(result).toBeTruthy();
  });

  it("should handle zero correctly", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("should handle negative numbers", () => {
    const result = formatNumber(-1234.56);
    expect(result).toContain("-");
    expect(result).toContain("1,234.56");
  });

  it("should respect minimum fraction digits", () => {
    const result = formatNumber(100, { minimumFractionDigits: 2 });
    expect(result).toBe("100.00");
  });

  it("should handle Infinity", () => {
    const result = formatNumber(Infinity);
    expect(result).toBeTruthy(); // Should not throw
  });

  it("should handle -Infinity", () => {
    const result = formatNumber(-Infinity);
    expect(result).toBeTruthy(); // Should not throw
  });
});

describe("formatCompactNumber - Comprehensive", () => {
  it("should format thousands", () => {
    expect(formatCompactNumber(1000)).toBe("1K");
    expect(formatCompactNumber(1500)).toBe("1.5K");
    expect(formatCompactNumber(9999)).toBe("10K");
  });

  it("should format millions", () => {
    expect(formatCompactNumber(1000000)).toBe("10L");
    expect(formatCompactNumber(1500000)).toBe("15L");
  });

  it("should format billions", () => {
    expect(formatCompactNumber(1000000000)).toBeTruthy();
  });

  it("should handle small numbers", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(99)).toBe("99");
  });

  it("should handle negative numbers", () => {
    const result = formatCompactNumber(-5000);
    expect(result).toBeTruthy();
  });
});

describe("formatPercentage - Edge Cases", () => {
  it("should format zero percent", () => {
    expect(formatPercentage(0)).toBe("0%");
  });

  it("should format negative percentages", () => {
    expect(formatPercentage(-15)).toBe("-15%");
  });

  it("should format with decimals", () => {
    expect(formatPercentage(12.5, { decimals: 1 })).toBe("12.5%");
    expect(formatPercentage(12.56, { decimals: 2 })).toBe("12.56%");
  });

  it("should show plus sign for positive values when requested", () => {
    expect(formatPercentage(10, { showSign: true })).toBe("+10%");
    expect(formatPercentage(-10, { showSign: true })).toBe("-10%");
    expect(formatPercentage(0, { showSign: true })).toBe("0%");
  });

  it("should handle very large percentages", () => {
    expect(formatPercentage(1000)).toBe("1000%");
  });

  it("should handle fractional percentages", () => {
    expect(formatPercentage(0.5, { decimals: 1 })).toBe("0.5%");
  });
});

describe("formatPhoneNumber - Indian Numbers", () => {
  it("should format 10-digit numbers", () => {
    expect(formatPhoneNumber("9876543210")).toBe("+91 98765 43210");
  });

  it("should format numbers with country code", () => {
    expect(formatPhoneNumber("919876543210")).toBe("+91 98765 43210");
  });

  it("should handle numbers with spaces", () => {
    expect(formatPhoneNumber("98765 43210")).toBe("+91 98765 43210");
  });

  it("should handle numbers with dashes", () => {
    expect(formatPhoneNumber("9876-543-210")).toBe("+91 98765 43210");
  });

  it("should handle numbers with parentheses", () => {
    expect(formatPhoneNumber("(987) 654-3210")).toBe("+91 98765 43210");
  });

  it("should handle numbers with +91 prefix", () => {
    expect(formatPhoneNumber("+91-9876543210")).toBe("+91 98765 43210");
  });

  it("should return original for invalid lengths", () => {
    expect(formatPhoneNumber("123")).toBe("123");
    expect(formatPhoneNumber("98765432101234")).toBe("98765432101234");
  });

  it("should handle empty string", () => {
    expect(formatPhoneNumber("")).toBe("");
  });
});

describe("formatPincode - Edge Cases", () => {
  it("should extract 6 digits", () => {
    expect(formatPincode("400001")).toBe("400001");
  });

  it("should remove non-digits", () => {
    expect(formatPincode("400-001")).toBe("400001");
    expect(formatPincode("PIN: 400001")).toBe("400001");
  });

  it("should truncate to 6 digits", () => {
    expect(formatPincode("40000123456")).toBe("400001");
  });

  it("should handle short inputs", () => {
    expect(formatPincode("400")).toBe("400");
  });

  it("should handle empty string", () => {
    expect(formatPincode("")).toBe("");
  });

  it("should handle all letters", () => {
    expect(formatPincode("ABCDEF")).toBe("");
  });
});

describe("formatFileSize - Comprehensive", () => {
  it("should format bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(100)).toBe("100 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("should format kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(102400)).toBe("100.0 KB");
  });

  it("should format megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(5242880)).toBe("5.0 MB");
  });

  it("should format gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1.0 GB");
    expect(formatFileSize(5368709120)).toBe("5.0 GB");
  });

  it("should format terabytes", () => {
    expect(formatFileSize(1099511627776)).toBe("1.0 TB");
  });

  it("should not exceed TB unit", () => {
    // Very large file size should still be in TB
    const result = formatFileSize(1099511627776 * 1000);
    expect(result).toContain("TB");
  });
});

describe("formatDuration - Edge Cases", () => {
  it("should format zero seconds", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("should format only seconds", () => {
    expect(formatDuration(30)).toBe("30s");
    expect(formatDuration(59)).toBe("59s");
  });

  it("should format minutes and seconds", () => {
    // Implementation omits zero values for cleaner display
    expect(formatDuration(60)).toBe("1m");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(3599)).toBe("59m 59s");
  });

  it("should format hours, minutes, and seconds", () => {
    // Implementation omits zero values for cleaner display
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(3661)).toBe("1h 1m 1s");
    expect(formatDuration(7322)).toBe("2h 2m 2s");
  });

  it("should omit zero minutes when hours and seconds present", () => {
    // Implementation correctly omits zero minutes
    expect(formatDuration(3601)).toBe("1h 1s");
  });

  it("should handle large durations", () => {
    // Implementation omits zero values for cleaner display
    expect(formatDuration(86400)).toBe("24h"); // 1 day
    expect(formatDuration(90061)).toBe("25h 1m 1s"); // 25+ hours
  });

  it("should handle fractional seconds", () => {
    expect(formatDuration(30.7)).toBe("30s"); // Should floor
  });
});

describe("formatOrderId - Pattern Validation", () => {
  it("should format standard order ID", () => {
    const orderId = "ord_1234567890abcdef";
    const result = formatOrderId(orderId);
    expect(result).toMatch(/^#ORD-[A-Z0-9]{8}$/);
    expect(result).toBe("#ORD-90ABCDEF");
  });

  it("should handle short IDs", () => {
    const result = formatOrderId("123");
    expect(result).toBe("#ORD-123");
  });

  it("should uppercase letters", () => {
    const result = formatOrderId("abcdefgh");
    expect(result).toBe("#ORD-ABCDEFGH");
  });

  it("should take last 8 characters", () => {
    const result = formatOrderId("1234567890ABCDEF");
    expect(result).toBe("#ORD-90ABCDEF");
  });
});

describe("formatShopId - Pattern Validation", () => {
  it("should format standard shop ID", () => {
    const shopId = "shp_1234567890abcdef";
    const result = formatShopId(shopId);
    expect(result).toMatch(/^SHP-[A-Z0-9]{8}$/);
    expect(result).toBe("SHP-90ABCDEF");
  });

  it("should handle short IDs", () => {
    const result = formatShopId("xyz");
    expect(result).toBe("SHP-XYZ");
  });

  it("should uppercase letters", () => {
    const result = formatShopId("abcdefgh");
    expect(result).toBe("SHP-ABCDEFGH");
  });
});

describe("formatSKU - Edge Cases", () => {
  it("should uppercase SKU", () => {
    expect(formatSKU("abc123")).toBe("ABC123");
  });

  it("should handle already uppercase", () => {
    expect(formatSKU("ABC123")).toBe("ABC123");
  });

  it("should handle mixed case", () => {
    expect(formatSKU("AbC-123-XyZ")).toBe("ABC-123-XYZ");
  });

  it("should handle empty string", () => {
    expect(formatSKU("")).toBe("");
  });
});

describe("truncateText - Comprehensive", () => {
  it("should not truncate short text", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  it("should truncate long text", () => {
    expect(truncateText("Hello World", 8)).toBe("Hello...");
  });

  it("should handle maxLength less than 3", () => {
    // Edge case: if maxLength < 3, return just "..."
    // After fix, function properly handles this case
    expect(truncateText("Hello", 2)).toBe("...");
  });

  it("should handle empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("should handle unicode characters with edge case truncation", () => {
    // Unicode emoji may be split when truncating, resulting in broken character (�)
    // This is expected behavior with simple string slicing
    const result = truncateText("Hello 👋 World", 10);
    expect(result.includes("...")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(13); // 10 + "..."
  });
});

describe("slugToTitle - Edge Cases", () => {
  it("should convert basic slug", () => {
    expect(slugToTitle("hello-world")).toBe("Hello World");
  });

  it("should handle single word", () => {
    expect(slugToTitle("hello")).toBe("Hello");
  });

  it("should handle multiple hyphens", () => {
    expect(slugToTitle("this-is-a-test")).toBe("This Is A Test");
  });

  it("should handle trailing hyphen", () => {
    expect(slugToTitle("hello-world-")).toBe("Hello World ");
  });

  it("should handle leading hyphen", () => {
    expect(slugToTitle("-hello-world")).toBe(" Hello World");
  });

  it("should handle empty string", () => {
    expect(slugToTitle("")).toBe("");
  });

  it("should preserve numbers", () => {
    expect(slugToTitle("product-123")).toBe("Product 123");
  });
});

describe("formatDiscount - Edge Cases", () => {
  it("should calculate discount percentage", () => {
    expect(formatDiscount(100, 80)).toBe("20%");
    expect(formatDiscount(200, 150)).toBe("25%");
  });

  it("should return 0% when no discount", () => {
    expect(formatDiscount(100, 100)).toBe("0%");
  });

  it("should return 0% when current price is higher (no discount)", () => {
    expect(formatDiscount(100, 120)).toBe("0%");
  });

  it("should handle 100% discount", () => {
    expect(formatDiscount(100, 0)).toBe("100%");
  });

  it("should handle fractional discounts", () => {
    expect(formatDiscount(100, 66.67)).toBe("33%");
  });

  it("should round to nearest integer", () => {
    expect(formatDiscount(100, 67.5)).toBe("33%"); // 32.5 rounds to 33
  });
});

describe("formatRating - Edge Cases", () => {
  it("should format standard rating", () => {
    expect(formatRating(4.5)).toBe("4.5 out of 5");
  });

  it("should format zero rating", () => {
    expect(formatRating(0)).toBe("0.0 out of 5");
  });

  it("should format perfect rating", () => {
    expect(formatRating(5)).toBe("5.0 out of 5");
  });

  it("should handle custom max rating", () => {
    expect(formatRating(8, 10)).toBe("8.0 out of 10");
  });

  it("should round to one decimal place", () => {
    expect(formatRating(4.567)).toBe("4.6 out of 5");
  });

  it("should handle ratings above max", () => {
    // Edge case: shouldn't happen but should handle gracefully
    expect(formatRating(6, 5)).toBe("6.0 out of 5");
  });
});

describe("formatReviewCount - Comprehensive", () => {
  it("should handle zero reviews", () => {
    expect(formatReviewCount(0)).toBe("No reviews");
  });

  it("should handle one review", () => {
    expect(formatReviewCount(1)).toBe("1 review");
  });

  it("should handle small counts", () => {
    expect(formatReviewCount(5)).toBe("5 reviews");
    expect(formatReviewCount(99)).toBe("99 reviews");
  });

  it("should format thousands", () => {
    expect(formatReviewCount(1000)).toContain("reviews");
    expect(formatReviewCount(1500)).toContain("1"); // Compact format
  });

  it("should format large numbers", () => {
    expect(formatReviewCount(10000)).toContain("reviews");
    expect(formatReviewCount(1000000)).toContain("reviews");
  });
});

describe("formatStockStatus - Edge Cases", () => {
  it("should indicate out of stock", () => {
    expect(formatStockStatus(0)).toBe("Out of Stock");
  });

  it("should indicate low stock", () => {
    expect(formatStockStatus(1)).toBe("Only 1 left");
    expect(formatStockStatus(5)).toBe("Only 5 left");
  });

  it("should indicate in stock", () => {
    expect(formatStockStatus(6)).toBe("In Stock");
    expect(formatStockStatus(100)).toBe("In Stock");
    expect(formatStockStatus(1000)).toBe("In Stock");
  });

  it("should handle negative stock (data error)", () => {
    // BUG FIXED: formatStockStatus now handles negative numbers properly
    // Negative stock is treated as out of stock (data integrity issue)
    expect(formatStockStatus(-1)).toBe("Out of Stock");
    expect(formatStockStatus(-100)).toBe("Out of Stock");
  });
});

describe("formatTimeRemaining - Comprehensive", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-12-10T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should handle null/undefined", () => {
    expect(formatTimeRemaining(null)).toBe("Auction ended");
    expect(formatTimeRemaining(undefined)).toBe("Auction ended");
  });

  it("should handle past dates", () => {
    const pastDate = new Date("2024-12-09T12:00:00Z");
    expect(formatTimeRemaining(pastDate)).toBe("Auction ended");
  });

  it("should format minutes remaining", () => {
    const endTime = new Date("2024-12-10T12:30:00Z"); // 30 minutes from now
    expect(formatTimeRemaining(endTime)).toBe("30m");
  });

  it("should format hours and minutes", () => {
    const endTime = new Date("2024-12-10T14:45:00Z"); // 2h 45m from now
    expect(formatTimeRemaining(endTime)).toBe("2h 45m");
  });

  it("should format days and hours", () => {
    const endTime = new Date("2024-12-12T15:00:00Z"); // 2d 3h from now
    expect(formatTimeRemaining(endTime)).toBe("2d 3h");
  });

  it("should handle string dates", () => {
    const endTime = "2024-12-10T13:00:00Z";
    expect(formatTimeRemaining(endTime)).toBe("1h 0m");
  });

  it("should handle invalid date strings", () => {
    expect(formatTimeRemaining("invalid-date")).toBe("Auction ended");
  });

  it("should handle exactly zero time remaining", () => {
    const endTime = new Date("2024-12-10T12:00:00Z");
    expect(formatTimeRemaining(endTime)).toBe("Auction ended");
  });
});

describe("formatAddress - Edge Cases", () => {
  it("should format complete address", () => {
    const address = {
      line1: "123 Main St",
      line2: "Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    };
    expect(formatAddress(address)).toBe(
      "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001, India"
    );
  });

  it("should handle missing line2", () => {
    const address = {
      line1: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    };
    expect(formatAddress(address)).toBe(
      "123 Main St, Mumbai, Maharashtra, 400001, India"
    );
  });

  it("should use custom country", () => {
    const address = {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      pincode: "10001",
      country: "USA",
    };
    expect(formatAddress(address)).toContain("USA");
  });

  it("should handle empty line2", () => {
    const address = {
      line1: "123 Main St",
      line2: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    };
    // Empty string should be filtered out by filter(Boolean)
    const result = formatAddress(address);
    expect(result).not.toContain(",,");
  });
});

describe("formatCardNumber - Security", () => {
  it("should mask card number", () => {
    expect(formatCardNumber("4111111111111111")).toBe("**** **** **** 1111");
  });

  it("should handle spaces in input", () => {
    expect(formatCardNumber("4111 1111 1111 1111")).toBe("**** **** **** 1111");
  });

  it("should handle short numbers", () => {
    expect(formatCardNumber("1234")).toBe("**** **** **** 1234");
  });

  it("should handle various card lengths", () => {
    // Amex (15 digits)
    expect(formatCardNumber("378282246310005")).toBe("**** **** **** 0005");
  });
});

describe("formatUPI - Edge Cases", () => {
  it("should lowercase UPI ID", () => {
    expect(formatUPI("USER@PAYTM")).toBe("user@paytm");
  });

  it("should handle already lowercase", () => {
    expect(formatUPI("user@paytm")).toBe("user@paytm");
  });

  it("should handle mixed case", () => {
    expect(formatUPI("UsEr@PayTM")).toBe("user@paytm");
  });

  it("should handle numbers", () => {
    expect(formatUPI("9876543210@UPI")).toBe("9876543210@upi");
  });
});

describe("formatBankAccount - Security", () => {
  it("should mask account number", () => {
    expect(formatBankAccount("1234567890")).toBe("******7890");
  });

  it("should handle short account numbers", () => {
    expect(formatBankAccount("123")).toBe("123");
  });

  it("should handle exactly 4 digits", () => {
    expect(formatBankAccount("1234")).toBe("1234");
  });

  it("should handle long account numbers", () => {
    expect(formatBankAccount("12345678901234")).toBe("**********1234");
  });
});

describe("formatDateRange - Integration", () => {
  it("should format date range", () => {
    const start = new Date("2024-01-01T00:00:00Z");
    const end = new Date("2024-01-31T23:59:59Z");
    const result = formatDateRange(start, end);
    expect(result).toContain("-");
    expect(result).toBeTruthy();
  });

  it("should handle string dates", () => {
    const result = formatDateRange(
      "2024-01-01T00:00:00Z",
      "2024-01-31T23:59:59Z"
    );
    expect(result).toContain("-");
    expect(result).toBeTruthy();
  });

  it("should handle same day range", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const result = formatDateRange(date, date);
    expect(result).toBeTruthy();
  });
});

describe("formatBoolean - Simple Cases", () => {
  it("should format true as Yes", () => {
    expect(formatBoolean(true)).toBe("Yes");
  });

  it("should format false as No", () => {
    expect(formatBoolean(false)).toBe("No");
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
    const result = formatList(["Apple", "Banana", "Cherry"]);
    expect(result).toContain("Apple");
    expect(result).toContain("Banana");
    expect(result).toContain("Cherry");
    expect(result).toContain("and");
  });

  it("should handle many items", () => {
    const items = ["A", "B", "C", "D", "E"];
    const result = formatList(items);
    expect(result).toContain("A");
    expect(result).toContain("E");
  });
});
