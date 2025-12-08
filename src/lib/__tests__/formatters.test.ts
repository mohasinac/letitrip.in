import {
  formatCompactCurrency,
  formatDate,
  formatRelativeTime,
} from "../formatters";

describe("formatCompactCurrency", () => {
  it("formats amounts in crores", () => {
    expect(formatCompactCurrency(10000000)).toBe("₹1.0Cr");
    expect(formatCompactCurrency(25000000)).toBe("₹2.5Cr");
    expect(formatCompactCurrency(100000000)).toBe("₹10.0Cr");
  });

  it("formats amounts in lakhs", () => {
    expect(formatCompactCurrency(100000)).toBe("₹1.0L");
    expect(formatCompactCurrency(550000)).toBe("₹5.5L");
    expect(formatCompactCurrency(9999999)).toBe("₹100.0L");
  });

  it("formats amounts in thousands", () => {
    expect(formatCompactCurrency(1000)).toBe("₹1.0K");
    expect(formatCompactCurrency(50000)).toBe("₹50.0K");
    expect(formatCompactCurrency(99999)).toBe("₹100.0K");
  });

  it("formats small amounts without abbreviation", () => {
    expect(formatCompactCurrency(500)).toBe("₹500");
    expect(formatCompactCurrency(999)).toBe("₹999");
  });

  it("rounds small amounts", () => {
    expect(formatCompactCurrency(123.45)).toBe("₹123");
  });

  it("handles zero", () => {
    expect(formatCompactCurrency(0)).toBe("₹0");
  });

  it("handles negative amounts", () => {
    expect(formatCompactCurrency(-5000)).toBe("₹-5,000");
  });
});

describe("formatDate", () => {
  const testDate = new Date("2024-01-15T10:30:00Z");

  it("formats date with default options", () => {
    const result = formatDate(testDate);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("formats date with short format", () => {
    const result = formatDate(testDate, { format: "short" });
    expect(result).toBeTruthy();
  });

  it("formats date with long format", () => {
    const result = formatDate(testDate, { format: "long" });
    expect(result).toBeTruthy();
  });

  it("includes time when requested", () => {
    const result = formatDate(testDate, { includeTime: true });
    expect(result).toBeTruthy();
  });

  it("handles string dates", () => {
    const result = formatDate("2024-01-15T10:30:00Z");
    expect(result).toBeTruthy();
  });

  it("handles timestamp numbers", () => {
    const result = formatDate(testDate.getTime());
    expect(result).toBeTruthy();
  });

  it("returns fallback for null", () => {
    expect(formatDate(null)).toBe("N/A");
  });

  it("returns fallback for undefined", () => {
    expect(formatDate(undefined)).toBe("N/A");
  });

  it("returns custom fallback", () => {
    expect(formatDate(null, { fallback: "Unknown" })).toBe("Unknown");
  });

  it("handles invalid date strings", () => {
    expect(formatDate("invalid-date")).toBe("N/A");
  });

  it("handles Invalid Date objects", () => {
    expect(formatDate(new Date("invalid"))).toBe("N/A");
  });

  it("uses custom locale", () => {
    const result = formatDate(testDate, { locale: "en-US" });
    expect(result).toBeTruthy();
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("formats seconds ago", () => {
    const date = new Date("2024-01-15T11:59:30Z");
    const result = formatRelativeTime(date);
    expect(result).toContain("30");
    expect(result.toLowerCase()).toContain("second");
  });

  it("formats minutes ago", () => {
    const date = new Date("2024-01-15T11:55:00Z");
    const result = formatRelativeTime(date);
    expect(result).toContain("5");
    expect(result.toLowerCase()).toContain("minute");
  });

  it("formats hours ago", () => {
    const date = new Date("2024-01-15T10:00:00Z");
    const result = formatRelativeTime(date);
    expect(result).toContain("2");
    expect(result.toLowerCase()).toContain("hour");
  });

  it("formats days ago", () => {
    const date = new Date("2024-01-13T12:00:00Z");
    const result = formatRelativeTime(date);
    expect(result).toContain("2");
    expect(result.toLowerCase()).toContain("day");
  });

  it("formats weeks ago", () => {
    const date = new Date("2024-01-01T12:00:00Z");
    const result = formatRelativeTime(date);
    expect(result).toContain("2");
    expect(result.toLowerCase()).toContain("week");
  });

  it("handles string dates", () => {
    const result = formatRelativeTime("2024-01-15T11:00:00Z");
    expect(result).toBeTruthy();
  });

  it("handles timestamp numbers", () => {
    const timestamp = new Date("2024-01-15T11:00:00Z").getTime();
    const result = formatRelativeTime(timestamp);
    expect(result).toBeTruthy();
  });

  it("uses short style", () => {
    const date = new Date("2024-01-15T11:00:00Z");
    const result = formatRelativeTime(date, { style: "short" });
    expect(result).toBeTruthy();
  });

  it("uses narrow style", () => {
    const date = new Date("2024-01-15T11:00:00Z");
    const result = formatRelativeTime(date, { style: "narrow" });
    expect(result).toBeTruthy();
  });
});
