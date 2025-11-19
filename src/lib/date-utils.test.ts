/**
 * Tests for date-utils.ts
 * Testing safe date conversion utilities
 */

import { describe, it } from "node:test";
import assert from "node:assert";
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
    assert.strictEqual(result, "2024-01-15T12:00:00.000Z");
  });

  it("should convert valid date string to ISO string", () => {
    const result = safeToISOString("2024-01-15");
    assert.ok(result?.startsWith("2024-01-15"));
  });

  it("should convert timestamp number to ISO string", () => {
    const timestamp = 1705320000000; // 2024-01-15T12:00:00.000Z
    const result = safeToISOString(timestamp);
    assert.strictEqual(result, "2024-01-15T12:00:00.000Z");
  });

  it("should handle Firestore Timestamp object", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    const result = safeToISOString(firestoreTimestamp);
    assert.strictEqual(result, "2024-01-15T12:00:00.000Z");
  });

  it("should return null for null input", () => {
    const result = safeToISOString(null);
    assert.strictEqual(result, null);
  });

  it("should return null for undefined input", () => {
    const result = safeToISOString(undefined);
    assert.strictEqual(result, null);
  });

  it("should return null for empty string", () => {
    const result = safeToISOString("");
    assert.strictEqual(result, null);
  });

  it("should return null for invalid date string", () => {
    const result = safeToISOString("not-a-date");
    assert.strictEqual(result, null);
  });

  it("should return null for invalid object", () => {
    const result = safeToISOString({ invalid: "object" });
    assert.strictEqual(result, null);
  });

  it("should return null for NaN", () => {
    const result = safeToISOString(NaN);
    assert.strictEqual(result, null);
  });

  it("should handle edge case: Invalid Date object", () => {
    const invalidDate = new Date("invalid");
    const result = safeToISOString(invalidDate);
    assert.strictEqual(result, null);
  });
});

describe("toISOStringOrDefault", () => {
  it("should return ISO string for valid date", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = toISOStringOrDefault(date);
    assert.strictEqual(result, "2024-01-15T12:00:00.000Z");
  });

  it("should return current date ISO string for invalid date", () => {
    const result = toISOStringOrDefault(null);
    assert.ok(result); // Should return a valid ISO string
    assert.ok(new Date(result).getTime() > 0);
  });

  it("should use custom fallback date", () => {
    const fallback = new Date("2025-01-01T00:00:00.000Z");
    const result = toISOStringOrDefault(null, fallback);
    assert.strictEqual(result, "2025-01-01T00:00:00.000Z");
  });

  it("should prefer valid date over fallback", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const fallback = new Date("2025-01-01T00:00:00.000Z");
    const result = toISOStringOrDefault(date, fallback);
    assert.strictEqual(result, "2024-01-15T12:00:00.000Z");
  });
});

describe("isValidDate", () => {
  it("should return true for valid Date object", () => {
    const date = new Date("2024-01-15");
    assert.strictEqual(isValidDate(date), true);
  });

  it("should return true for valid date string", () => {
    assert.strictEqual(isValidDate("2024-01-15"), true);
  });

  it("should return true for valid timestamp", () => {
    assert.strictEqual(isValidDate(1705320000000), true);
  });

  it("should return true for Firestore Timestamp", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    assert.strictEqual(isValidDate(firestoreTimestamp), true);
  });

  it("should return false for null", () => {
    assert.strictEqual(isValidDate(null), false);
  });

  it("should return false for undefined", () => {
    assert.strictEqual(isValidDate(undefined), false);
  });

  it("should return false for invalid date string", () => {
    assert.strictEqual(isValidDate("not-a-date"), false);
  });

  it("should return false for NaN", () => {
    assert.strictEqual(isValidDate(NaN), false);
  });

  it("should return false for Invalid Date object", () => {
    const invalidDate = new Date("invalid");
    assert.strictEqual(isValidDate(invalidDate), false);
  });
});

describe("safeToDate", () => {
  it("should convert valid date string to Date object", () => {
    const result = safeToDate("2024-01-15T12:00:00.000Z");
    assert.ok(result instanceof Date);
    assert.strictEqual(result?.toISOString(), "2024-01-15T12:00:00.000Z");
  });

  it("should convert timestamp to Date object", () => {
    const timestamp = 1705320000000;
    const result = safeToDate(timestamp);
    assert.ok(result instanceof Date);
    assert.strictEqual(result?.getTime(), timestamp);
  });

  it("should handle Firestore Timestamp", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    const result = safeToDate(firestoreTimestamp);
    assert.ok(result instanceof Date);
    assert.strictEqual(result?.toISOString(), "2024-01-15T12:00:00.000Z");
  });

  it("should return null for invalid input", () => {
    assert.strictEqual(safeToDate(null), null);
    assert.strictEqual(safeToDate(undefined), null);
    assert.strictEqual(safeToDate("invalid"), null);
    assert.strictEqual(safeToDate(NaN), null);
  });

  it("should pass through valid Date object", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = safeToDate(date);
    assert.ok(result instanceof Date);
    assert.strictEqual(result?.toISOString(), "2024-01-15T12:00:00.000Z");
  });
});

describe("toDateInputValue", () => {
  it("should format date for HTML input", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const result = toDateInputValue(date);
    assert.strictEqual(result, "2024-01-15");
  });

  it("should handle date string", () => {
    const result = toDateInputValue("2024-01-15T12:00:00.000Z");
    assert.strictEqual(result, "2024-01-15");
  });

  it("should handle Firestore Timestamp", () => {
    const firestoreTimestamp = {
      seconds: 1705320000,
      nanoseconds: 0,
    };
    const result = toDateInputValue(firestoreTimestamp);
    assert.strictEqual(result, "2024-01-15");
  });

  it("should return empty string for invalid date", () => {
    assert.strictEqual(toDateInputValue(null), "");
    assert.strictEqual(toDateInputValue(undefined), "");
    assert.strictEqual(toDateInputValue("invalid"), "");
  });
});

describe("getTodayDateInputValue", () => {
  it("should return today's date in YYYY-MM-DD format", () => {
    const result = getTodayDateInputValue();
    const today = new Date().toISOString().split("T")[0];
    assert.strictEqual(result, today);
  });

  it("should return valid date format", () => {
    const result = getTodayDateInputValue();
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(result));
  });

  it("should be parseable as date", () => {
    const result = getTodayDateInputValue();
    const parsed = new Date(result);
    assert.ok(!isNaN(parsed.getTime()));
  });
});

// Edge cases and integration tests
describe("Date Utils Integration", () => {
  it("should handle chain of conversions", () => {
    const originalDate = "2024-01-15T12:00:00.000Z";
    const isoString = safeToISOString(originalDate);
    const dateObj = safeToDate(isoString);
    const inputValue = toDateInputValue(dateObj);

    assert.strictEqual(isoString, "2024-01-15T12:00:00.000Z");
    assert.ok(dateObj instanceof Date);
    assert.strictEqual(inputValue, "2024-01-15");
  });

  it("should handle Firestore Timestamp throughout flow", () => {
    const firestoreTs = { seconds: 1705320000, nanoseconds: 0 };

    assert.strictEqual(isValidDate(firestoreTs), true);
    assert.strictEqual(
      safeToISOString(firestoreTs),
      "2024-01-15T12:00:00.000Z"
    );
    assert.strictEqual(toDateInputValue(firestoreTs), "2024-01-15");

    const dateObj = safeToDate(firestoreTs);
    assert.ok(dateObj instanceof Date);
    assert.strictEqual(dateObj?.getTime(), 1705320000000);
  });

  it("should safely handle null throughout all functions", () => {
    assert.strictEqual(safeToISOString(null), null);
    assert.strictEqual(isValidDate(null), false);
    assert.strictEqual(safeToDate(null), null);
    assert.strictEqual(toDateInputValue(null), "");

    // toISOStringOrDefault should not return null
    const fallbackResult = toISOStringOrDefault(null);
    assert.ok(fallbackResult !== null);
  });
});
