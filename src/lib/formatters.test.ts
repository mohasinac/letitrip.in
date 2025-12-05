/**
 * Tests for formatters.ts
 * Testing formatting utility functions
 */

import { describe, expect, it } from "@jest/globals";
import {
  formatAddress,
  formatBankAccount,
  formatBoolean,
  formatCardNumber,
  formatCompactCurrency,
  formatCompactNumber,
  formatDate,
  formatDateRange,
  formatDiscount,
  formatDuration,
  formatFileSize,
  formatList,
  formatNumber,
  formatOrderId,
  formatPercentage,
  formatPhoneNumber,
  formatRating,
  formatRelativeTime,
  formatReviewCount,
  formatShopId,
  formatSKU,
  formatStockStatus,
  formatTimeRemaining,
  formatUPI,
  slugToTitle,
  truncateText,
} from "./formatters";
import { formatPrice } from "./price.utils";

describe("formatPrice", () => {
  it("should format INR currency correctly", () => {
    const result = formatPrice(1234.56);
    expect(result).toContain("₹");
    expect(result).toContain("1,234.56");
  });

  it("should format without decimals", () => {
    const result = formatPrice(1234.56, { showDecimals: false });
    expect(result).toContain("₹");
    expect(result).toContain("1,235"); // Rounded
  });

  it("should handle zero", () => {
    const result = formatPrice(0);
    expect(result).toContain("₹");
    expect(result).toContain("0");
  });

  it("should handle null/undefined", () => {
    const result = formatPrice(null);
    expect(result).toBe("N/A");
  });

  it("should handle negative numbers", () => {
    const result = formatPrice(-123.45);
    expect(result).toContain("-");
    expect(result).toContain("123");
  });
});

describe("formatCompactCurrency", () => {
  it("should format compact currency for small amounts", () => {
    const result = formatCompactCurrency(500);
    expect(result).toBe("₹500");
  });

  it("should format thousands", () => {
    const result = formatCompactCurrency(1500);
    expect(result).toBe("₹1.5K");
  });

  it("should format lakhs", () => {
    const result = formatCompactCurrency(150000);
    expect(result).toBe("₹1.5L");
  });

  it("should format crores", () => {
    const result = formatCompactCurrency(15000000);
    expect(result).toBe("₹1.5Cr");
  });
});

describe("formatDate", () => {
  it("should format date in medium format", () => {
    const date = new Date("2024-01-15");
    const result = formatDate(date);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should include time when specified", () => {
    const date = new Date("2024-01-15T14:30:00");
    const result = formatDate(date, { includeTime: true });
    expect(result).toMatch(/2:30|14:30/);
  });

  it("should handle string dates", () => {
    const result = formatDate("2024-01-15");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatRelativeTime", () => {
  it("should format past dates", () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    const result = formatRelativeTime(pastDate);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should format future dates", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
    const result = formatRelativeTime(futureDate);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatNumber", () => {
  it("should format numbers with Indian locale", () => {
    const result = formatNumber(1234567.89);
    expect(result).toContain("12,34,567.89");
  });

  it("should handle decimals control", () => {
    const result = formatNumber(123.456, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(result).toContain("123.46");
  });
});

describe("formatCompactNumber", () => {
  it("should format large numbers compactly", () => {
    const result = formatCompactNumber(1500000);
    expect(result).toMatch(/L|M/);
  });
});

describe("formatPercentage", () => {
  it("should format percentage", () => {
    const result = formatPercentage(25);
    expect(result).toBe("25%");
  });

  it("should format with decimals", () => {
    const result = formatPercentage(25.5, { decimals: 1 });
    expect(result).toBe("25.5%");
  });

  it("should add sign for positive", () => {
    const result = formatPercentage(25, { showSign: true });
    expect(result).toBe("+25%");
  });
});

describe("formatPhoneNumber", () => {
  it("should format 10-digit Indian number", () => {
    const result = formatPhoneNumber("9876543210");
    expect(result).toBe("+91 98765 43210");
  });

  it("should format with country code", () => {
    const result = formatPhoneNumber("919876543210");
    expect(result).toBe("+91 98765 43210");
  });

  it("should return original for invalid", () => {
    const result = formatPhoneNumber("invalid");
    expect(result).toBe("invalid");
  });
});

describe("formatFileSize", () => {
  it("should format bytes", () => {
    const result = formatFileSize(512);
    expect(result).toBe("512 B");
  });

  it("should format KB", () => {
    const result = formatFileSize(1536);
    expect(result).toBe("1.5 KB");
  });

  it("should format MB", () => {
    const result = formatFileSize(1048576);
    expect(result).toBe("1.0 MB");
  });
});

describe("formatDuration", () => {
  it("should format seconds", () => {
    const result = formatDuration(65);
    expect(result).toBe("1m 5s");
  });

  it("should format hours", () => {
    const result = formatDuration(3665);
    expect(result).toBe("1h 1m 5s");
  });
});

describe("formatOrderId", () => {
  it("should format order ID", () => {
    const result = formatOrderId("abc123def");
    expect(result).toBe("#ORD-BC123DEF");
  });
});

describe("formatShopId", () => {
  it("should format shop ID", () => {
    const result = formatShopId("shop123");
    expect(result).toBe("SHP-SHOP123");
  });
});

describe("formatSKU", () => {
  it("should uppercase SKU", () => {
    const result = formatSKU("abc-123");
    expect(result).toBe("ABC-123");
  });
});

describe("truncateText", () => {
  it("should truncate long text", () => {
    const result = truncateText("This is a very long text", 10);
    expect(result).toBe("This is...");
  });

  it("should not truncate short text", () => {
    const result = truncateText("Short", 10);
    expect(result).toBe("Short");
  });
});

describe("slugToTitle", () => {
  it("should convert slug to title", () => {
    const result = slugToTitle("hello-world-test");
    expect(result).toBe("Hello World Test");
  });
});

describe("formatDiscount", () => {
  it("should calculate discount percentage", () => {
    const result = formatDiscount(100, 75);
    expect(result).toBe("25%");
  });

  it("should return 0% for no discount", () => {
    const result = formatDiscount(100, 100);
    expect(result).toBe("0%");
  });
});

describe("formatRating", () => {
  it("should format rating", () => {
    const result = formatRating(4.5);
    expect(result).toBe("4.5 out of 5");
  });
});

describe("formatReviewCount", () => {
  it("should format single review", () => {
    const result = formatReviewCount(1);
    expect(result).toBe("1 review");
  });

  it("should format multiple reviews", () => {
    const result = formatReviewCount(1500);
    expect(result).toMatch(/1.5K reviews/);
  });

  it("should handle zero reviews", () => {
    const result = formatReviewCount(0);
    expect(result).toBe("No reviews");
  });
});

describe("formatStockStatus", () => {
  it("should format out of stock", () => {
    const result = formatStockStatus(0);
    expect(result).toBe("Out of Stock");
  });

  it("should format low stock", () => {
    const result = formatStockStatus(3);
    expect(result).toBe("Only 3 left");
  });

  it("should format in stock", () => {
    const result = formatStockStatus(10);
    expect(result).toBe("In Stock");
  });
});

describe("formatTimeRemaining", () => {
  it("should format ended auction", () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60);
    const result = formatTimeRemaining(pastDate);
    expect(result).toBe("Auction ended");
  });

  it("should format remaining time", () => {
    const futureDate = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 3
    ); // 2d 3h
    const result = formatTimeRemaining(futureDate);
    expect(result).toMatch(/d|h/);
  });
});

describe("formatAddress", () => {
  it("should format address", () => {
    const address = {
      line1: "123 Main St",
      line2: "Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    };
    const result = formatAddress(address);
    expect(result).toContain("123 Main St");
    expect(result).toContain("Mumbai");
  });
});

describe("formatCardNumber", () => {
  it("should mask card number", () => {
    const result = formatCardNumber("1234567890123456");
    expect(result).toBe("**** **** **** 3456");
  });
});

describe("formatUPI", () => {
  it("should lowercase UPI", () => {
    const result = formatUPI("USER@PAYTM");
    expect(result).toBe("user@paytm");
  });
});

describe("formatBankAccount", () => {
  it("should mask account number", () => {
    const result = formatBankAccount("1234567890");
    expect(result).toBe("******7890");
  });
});

describe("formatDateRange", () => {
  it("should format date range", () => {
    const result = formatDateRange("2024-01-01", "2024-01-31");
    expect(result).toContain("2024");
  });
});

describe("formatBoolean", () => {
  it("should format true", () => {
    const result = formatBoolean(true);
    expect(result).toBe("Yes");
  });

  it("should format false", () => {
    const result = formatBoolean(false);
    expect(result).toBe("No");
  });
});

describe("formatList", () => {
  it("should format single item", () => {
    const result = formatList(["Apple"]);
    expect(result).toBe("Apple");
  });

  it("should format multiple items", () => {
    const result = formatList(["Apple", "Banana", "Cherry"]);
    expect(result).toContain("Apple");
    expect(result).toContain("Banana");
  });
});
