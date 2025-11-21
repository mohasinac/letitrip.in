/**
 * Tests for date-utils.ts
 * Testing safe date conversion utilities
 */

import { describe, it, expect } from "@jest/globals";
import {
  safeToISOString,
  toISOStringOrDefault,
  isValidDate,
  safeToDate,
  toDateInputValue,
  getTodayDateInputValue,
} from "./date-utils";

describe("safeToISOString", () => {
  it("should convert valid Date object to ISO string", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = safeToISOString(date);
    expect(result).toBe("2024-01-15T12:00:00.000Z");
  });

  it("should convert valid date string to ISO string", () => {
    const result = safeToISOString("2024-01-15");
    expect(result).toMatch(/^2024-01-15/);
  });

  it("should convert timestamp number to ISO string", () => {
    const timestamp = 1705320000000; // 2024-01-15T12:00:00.000Z
    const result = safeToISOString(timestamp);
    expect(result).toBe("2024-01-15T12:00:00.000Z");
  });

  it("should handle Firestore Timestamp object", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    const result = safeToISOString(firestoreTimestamp);
    expect(result).toBe("2024-01-15T12:00:00.000Z");
  });

  it("should return null for null input", () => {
    const result = safeToISOString(null);
    expect(result).toBe(null);
  });

  it("should return null for undefined input", () => {
    const result = safeToISOString(undefined);
    expect(result).toBe(null);
  });

  it("should return null for empty string", () => {
    const result = safeToISOString("");
    expect(result).toBe(null);
  });

  it("should return null for invalid date string", () => {
    const result = safeToISOString("not-a-date");
    expect(result).toBe(null);
  });

  it("should return null for invalid object", () => {
    const result = safeToISOString({ invalid: "object" });
    expect(result).toBe(null);
  });

  it("should return null for NaN", () => {
    const result = safeToISOString(NaN);
    expect(result).toBe(null);
  });

  it("should handle edge case: Invalid Date object", () => {
    const invalidDate = new Date("invalid");
    const result = safeToISOString(invalidDate);
    expect(result).toBe(null);
  });
});

describe("toISOStringOrDefault", () => {
  it("should return ISO string for valid date", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = toISOStringOrDefault(date);
    expect(result).toBe("2024-01-15T12:00:00.000Z");
  });

  it("should return current date ISO string for invalid date", () => {
    const result = toISOStringOrDefault(null);
    expect(result).toBeDefined(); // Should return a valid ISO string
    expect(new Date(result).getTime()).toBeGreaterThan(0);
  });

  it("should use custom fallback date", () => {
    const fallback = new Date("2025-01-01T00:00:00.000Z");
    const result = toISOStringOrDefault(null, fallback);
    expect(result).toBe("2025-01-01T00:00:00.000Z");
  });

  it("should prefer valid date over fallback", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const fallback = new Date("2025-01-01T00:00:00.000Z");
    const result = toISOStringOrDefault(date, fallback);
    expect(result).toBe("2024-01-15T12:00:00.000Z");
  });
});

describe("isValidDate", () => {
  it("should return true for valid Date object", () => {
    const date = new Date("2024-01-15");
    expect(isValidDate(date)).toBe(true);
  });

  it("should return true for valid date string", () => {
    expect(isValidDate("2024-01-15")).toBe(true);
  });

  it("should return true for valid timestamp", () => {
    expect(isValidDate(1705320000000)).toBe(true);
  });

  it("should return true for Firestore Timestamp", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    expect(isValidDate(firestoreTimestamp)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isValidDate(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isValidDate(undefined)).toBe(false);
  });

  it("should return false for invalid date string", () => {
    expect(isValidDate("not-a-date")).toBe(false);
  });

  it("should return false for NaN", () => {
    expect(isValidDate(NaN)).toBe(false);
  });

  it("should return false for Invalid Date object", () => {
    const invalidDate = new Date("invalid");
    expect(isValidDate(invalidDate)).toBe(false);
  });
});

describe("safeToDate", () => {
  it("should convert valid date string to Date object", () => {
    const result = safeToDate("2024-01-15T12:00:00.000Z");
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2024-01-15T12:00:00.000Z");
  });

  it("should convert timestamp to Date object", () => {
    const timestamp = 1705320000000;
    const result = safeToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(timestamp);
  });

  it("should handle Firestore Timestamp", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    const result = safeToDate(firestoreTimestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2024-01-15T12:00:00.000Z");
  });

  it("should return null for invalid input", () => {
    expect(safeToDate(null)).toBe(null);
    expect(safeToDate(undefined)).toBe(null);
    expect(safeToDate("invalid")).toBe(null);
    expect(safeToDate(NaN)).toBe(null);
  });

  it("should pass through valid Date object", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = safeToDate(date);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2024-01-15T12:00:00.000Z");
  });
});

describe("toDateInputValue", () => {
  it("should format date for HTML input", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = toDateInputValue(date);
    expect(result).toBe("2024-01-15");
  });

  it("should handle date string", () => {
    const result = toDateInputValue("2024-01-15T12:00:00.000Z");
    expect(result).toBe("2024-01-15");
  });

  it("should handle Firestore Timestamp", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    const result = toDateInputValue(firestoreTimestamp);
    expect(result).toBe("2024-01-15");
  });

  it("should return empty string for invalid date", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue(undefined)).toBe("");
    expect(toDateInputValue("invalid")).toBe("");
  });
});

describe("getTodayDateInputValue", () => {
  it("should return today's date in YYYY-MM-DD format", () => {
    const result = getTodayDateInputValue();
    const today = new Date().toISOString().split("T")[0];
    expect(result).toBe(today);
  });

  it("should return valid date format", () => {
    const result = getTodayDateInputValue();
    expect(/^\d{4}-\d{2}-\d{2}$/.test(result)).toBe(true);
  });

  it("should be parseable as date", () => {
    const result = getTodayDateInputValue();
    const parsed = new Date(result);
    expect(isNaN(parsed.getTime())).toBe(false);
  });
});

// Edge cases and integration tests
describe("Date Utils Integration", () => {
  it("should handle chain of conversions", () => {
    const originalDate = "2024-01-15T12:00:00.000Z";
    const isoString = safeToISOString(originalDate);
    const dateObj = safeToDate(isoString);
    const inputValue = toDateInputValue(dateObj);

    expect(isoString).toBe("2024-01-15T12:00:00.000Z");
    expect(dateObj).toBeInstanceOf(Date);
    expect(inputValue).toBe("2024-01-15");
  });

  it("should handle Firestore Timestamp throughout flow", () => {
    const firestoreTs = { seconds: 1705320000, nanoseconds: 0 };

    expect(isValidDate(firestoreTs)).toBe(true);
    expect(safeToISOString(firestoreTs)).toBe("2024-01-15T12:00:00.000Z");
    expect(toDateInputValue(firestoreTs)).toBe("2024-01-15");

    const dateObj = safeToDate(firestoreTs);
    expect(dateObj).toBeInstanceOf(Date);
    expect(dateObj?.getTime()).toBe(1705320000000);
  });

  it("should safely handle null throughout all functions", () => {
    expect(safeToISOString(null)).toBe(null);
    expect(isValidDate(null)).toBe(false);
    expect(safeToDate(null)).toBe(null);
    expect(toDateInputValue(null)).toBe("");

    // toISOStringOrDefault should not return null
    const fallbackResult = toISOStringOrDefault(null);
    expect(fallbackResult).not.toBeNull();
  });
});
