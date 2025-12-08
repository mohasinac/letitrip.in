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

describe("formatNumber", () => {
  it("formats numbers with Indian locale", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(100000)).toBe("1,00,000");
    expect(formatNumber(10000000)).toBe("1,00,00,000");
  });

  it("formats with fraction digits", () => {
    expect(formatNumber(123.456, { minimumFractionDigits: 2 })).toContain(
      "123"
    );
    expect(formatNumber(123.456, { maximumFractionDigits: 1 })).toContain(
      "123"
    );
  });

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("handles negative numbers", () => {
    expect(formatNumber(-1000)).toContain("-1");
  });
});

describe("formatCompactNumber", () => {
  it("formats thousands", () => {
    expect(formatCompactNumber(1000)).toBe("1K");
    expect(formatCompactNumber(5500)).toBe("5.5K");
  });

  it("formats lakhs", () => {
    expect(formatCompactNumber(100000)).toBe("1L");
    expect(formatCompactNumber(250000)).toBe("2.5L");
  });

  it("formats crores", () => {
    expect(formatCompactNumber(10000000)).toBe("1Cr");
  });

  it("handles small numbers", () => {
    expect(formatCompactNumber(500)).toBe("500");
  });
});

describe("formatPercentage", () => {
  it("formats percentage without decimals", () => {
    expect(formatPercentage(25.5)).toBe("26%");
    expect(formatPercentage(50)).toBe("50%");
  });

  it("formats with custom decimals", () => {
    expect(formatPercentage(25.567, { decimals: 2 })).toBe("25.57%");
    expect(formatPercentage(50.1, { decimals: 1 })).toBe("50.1%");
  });

  it("shows sign for positive values", () => {
    expect(formatPercentage(15, { showSign: true })).toBe("+15%");
  });

  it("does not show sign for negative values", () => {
    expect(formatPercentage(-15, { showSign: true })).toBe("-15%");
  });

  it("handles zero", () => {
    expect(formatPercentage(0)).toBe("0%");
  });
});

describe("formatPhoneNumber", () => {
  it("formats 10-digit Indian mobile number", () => {
    expect(formatPhoneNumber("9876543210")).toBe("+91 98765 43210");
  });

  it("formats 12-digit number with country code", () => {
    expect(formatPhoneNumber("919876543210")).toBe("+91 98765 43210");
  });

  it("removes non-digit characters", () => {
    expect(formatPhoneNumber("987-654-3210")).toBe("+91 98765 43210");
    expect(formatPhoneNumber("(987) 654-3210")).toBe("+91 98765 43210");
  });

  it("returns original for invalid lengths", () => {
    expect(formatPhoneNumber("123")).toBe("123");
  });

  it("handles empty string", () => {
    expect(formatPhoneNumber("")).toBe("");
  });
});

describe("formatPincode", () => {
  it("formats 6-digit pincode", () => {
    expect(formatPincode("560001")).toBe("560001");
  });

  it("removes non-digit characters", () => {
    expect(formatPincode("560-001")).toBe("560001");
  });

  it("limits to 6 digits", () => {
    expect(formatPincode("5600011234")).toBe("560001");
  });

  it("handles empty string", () => {
    expect(formatPincode("")).toBe("");
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(5120)).toBe("5.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
    expect(formatFileSize(5242880)).toBe("5.0 MB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1.0 GB");
  });

  it("formats terabytes", () => {
    expect(formatFileSize(1099511627776)).toBe("1.0 TB");
  });

  it("handles zero", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });
});

describe("formatDuration", () => {
  it("formats seconds only", () => {
    expect(formatDuration(45)).toBe("45s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(125)).toBe("2m 5s");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatDuration(3665)).toBe("1h 1m 5s");
  });

  it("formats hours and minutes without seconds", () => {
    expect(formatDuration(3600)).toBe("1h");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0s");
  });
});

describe("formatOrderId", () => {
  it("formats order ID with prefix", () => {
    const id = "abc123def456ghi789";
    expect(formatOrderId(id)).toBe("#ORD-56GHI789");
  });

  it("handles short IDs", () => {
    expect(formatOrderId("abc123")).toBe("#ORD-ABC123");
  });

  it("converts to uppercase", () => {
    expect(formatOrderId("abc123def456")).toBe("#ORD-23DEF456");
  });
});

describe("formatShopId", () => {
  it("formats shop ID with prefix", () => {
    const id = "abc123def456ghi789";
    expect(formatShopId(id)).toBe("SHP-56GHI789");
  });

  it("handles short IDs", () => {
    expect(formatShopId("abc123")).toBe("SHP-ABC123");
  });

  it("converts to uppercase", () => {
    expect(formatShopId("abc123def456")).toBe("SHP-23DEF456");
  });
});

describe("formatSKU", () => {
  it("converts to uppercase", () => {
    expect(formatSKU("prod-123")).toBe("PROD-123");
  });

  it("handles already uppercase", () => {
    expect(formatSKU("PROD-456")).toBe("PROD-456");
  });
});

describe("truncateText", () => {
  it("truncates long text", () => {
    expect(truncateText("This is a long text", 10)).toBe("This is...");
  });

  it("does not truncate short text", () => {
    expect(truncateText("Short", 10)).toBe("Short");
  });

  it("handles exact length", () => {
    expect(truncateText("Exactly", 7)).toBe("Exactly");
  });

  it("handles empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });
});

describe("slugToTitle", () => {
  it("converts slug to title case", () => {
    expect(slugToTitle("hello-world")).toBe("Hello World");
  });

  it("handles single word", () => {
    expect(slugToTitle("hello")).toBe("Hello");
  });

  it("handles multiple hyphens", () => {
    expect(slugToTitle("this-is-a-test")).toBe("This Is A Test");
  });

  it("handles empty string", () => {
    expect(slugToTitle("")).toBe("");
  });
});

describe("formatDiscount", () => {
  it("calculates discount percentage", () => {
    expect(formatDiscount(100, 80)).toBe("20%");
    expect(formatDiscount(200, 150)).toBe("25%");
  });

  it("returns 0% when no discount", () => {
    expect(formatDiscount(100, 100)).toBe("0%");
    expect(formatDiscount(100, 120)).toBe("0%");
  });

  it("handles large discounts", () => {
    expect(formatDiscount(1000, 100)).toBe("90%");
  });
});

describe("formatRating", () => {
  it("formats rating with default max", () => {
    expect(formatRating(4.5)).toBe("4.5 out of 5");
  });

  it("formats with custom max", () => {
    expect(formatRating(8.5, 10)).toBe("8.5 out of 10");
  });

  it("handles whole numbers", () => {
    expect(formatRating(4)).toBe("4.0 out of 5");
  });
});

describe("formatReviewCount", () => {
  it("handles zero reviews", () => {
    expect(formatReviewCount(0)).toBe("No reviews");
  });

  it("handles single review", () => {
    expect(formatReviewCount(1)).toBe("1 review");
  });

  it("formats multiple reviews", () => {
    expect(formatReviewCount(50)).toBe("50 reviews");
  });

  it("formats large counts", () => {
    expect(formatReviewCount(1500)).toContain("reviews");
  });
});

describe("formatStockStatus", () => {
  it("shows out of stock", () => {
    expect(formatStockStatus(0)).toBe("Out of Stock");
  });

  it("shows low stock", () => {
    expect(formatStockStatus(3)).toBe("Only 3 left");
    expect(formatStockStatus(5)).toBe("Only 5 left");
  });

  it("shows in stock", () => {
    expect(formatStockStatus(10)).toBe("In Stock");
    expect(formatStockStatus(100)).toBe("In Stock");
  });
});

describe("formatTimeRemaining", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("formats days and hours", () => {
    const endTime = new Date("2024-01-17T14:00:00Z");
    expect(formatTimeRemaining(endTime)).toMatch(/\d+d \d+h/);
  });

  it("formats hours and minutes", () => {
    const endTime = new Date("2024-01-15T14:30:00Z");
    expect(formatTimeRemaining(endTime)).toMatch(/\d+h \d+m/);
  });

  it("formats minutes only", () => {
    const endTime = new Date("2024-01-15T12:30:00Z");
    expect(formatTimeRemaining(endTime)).toMatch(/\d+m/);
  });

  it("shows auction ended for past time", () => {
    const endTime = new Date("2024-01-15T10:00:00Z");
    expect(formatTimeRemaining(endTime)).toBe("Auction ended");
  });

  it("handles null", () => {
    expect(formatTimeRemaining(null)).toBe("Auction ended");
  });

  it("handles undefined", () => {
    expect(formatTimeRemaining(undefined)).toBe("Auction ended");
  });

  it("handles string dates", () => {
    const result = formatTimeRemaining("2024-01-15T14:00:00Z");
    expect(result).toMatch(/\d+h \d+m/);
  });

  it("handles invalid dates", () => {
    expect(formatTimeRemaining("invalid")).toBe("Auction ended");
  });
});

describe("formatAddress", () => {
  it("formats full address", () => {
    const address = {
      line1: "123 Main St",
      line2: "Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India",
    };
    expect(formatAddress(address)).toBe(
      "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001, India"
    );
  });

  it("handles missing line2", () => {
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

  it("uses India as default country", () => {
    const address = {
      line1: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    };
    expect(formatAddress(address)).toContain("India");
  });
});

describe("formatCardNumber", () => {
  it("masks card number", () => {
    expect(formatCardNumber("1234567890123456")).toBe("**** **** **** 3456");
  });

  it("handles card number with spaces", () => {
    expect(formatCardNumber("1234 5678 9012 3456")).toBe("**** **** **** 3456");
  });
});

describe("formatUPI", () => {
  it("converts to lowercase", () => {
    expect(formatUPI("USER@BANK")).toBe("user@bank");
  });

  it("handles already lowercase", () => {
    expect(formatUPI("user@bank")).toBe("user@bank");
  });
});

describe("formatBankAccount", () => {
  it("masks account number", () => {
    expect(formatBankAccount("1234567890")).toBe("******7890");
  });

  it("handles short account numbers", () => {
    expect(formatBankAccount("1234")).toBe("1234");
  });

  it("handles very long account numbers", () => {
    expect(formatBankAccount("123456789012345")).toBe("***********2345");
  });
});

describe("formatDateRange", () => {
  it("formats date range", () => {
    const start = new Date("2024-01-01");
    const end = new Date("2024-01-31");
    const result = formatDateRange(start, end);
    expect(result).toContain("-");
    expect(result).toBeTruthy();
  });

  it("handles string dates", () => {
    const result = formatDateRange("2024-01-01", "2024-01-31");
    expect(result).toContain("-");
  });
});

describe("formatBoolean", () => {
  it("formats true as Yes", () => {
    expect(formatBoolean(true)).toBe("Yes");
  });

  it("formats false as No", () => {
    expect(formatBoolean(false)).toBe("No");
  });
});

describe("formatList", () => {
  it("formats single item", () => {
    expect(formatList(["Apple"])).toBe("Apple");
  });

  it("formats two items", () => {
    const result = formatList(["Apple", "Banana"]);
    expect(result).toContain("Apple");
    expect(result).toContain("Banana");
  });

  it("formats three items", () => {
    const result = formatList(["Apple", "Banana", "Cherry"]);
    expect(result).toContain("Apple");
    expect(result).toContain("Banana");
    expect(result).toContain("Cherry");
  });

  it("handles empty array", () => {
    expect(formatList([])).toBe("");
  });
});
