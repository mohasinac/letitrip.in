import {
  isValidDate,
  safeToDate,
  safeToISOString,
  toISOStringOrDefault,
} from "../date-utils";

describe("safeToISOString", () => {
  it("converts Date object to ISO string", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    expect(safeToISOString(date)).toBe("2024-01-15T10:30:00.000Z");
  });

  it("converts date string to ISO string", () => {
    const result = safeToISOString("2024-01-15T10:30:00Z");
    expect(result).toBe("2024-01-15T10:30:00.000Z");
  });

  it("converts timestamp number to ISO string", () => {
    const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
    const result = safeToISOString(timestamp);
    expect(result).toBe("2024-01-15T10:30:00.000Z");
  });

  it("handles Firestore Timestamp format", () => {
    const firestoreTimestamp = {
      seconds: 1705318200,
      nanoseconds: 0,
    };
    const result = safeToISOString(firestoreTimestamp);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns null for null input", () => {
    expect(safeToISOString(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(safeToISOString(undefined)).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(safeToISOString("invalid-date")).toBeNull();
  });

  it("returns null for Invalid Date object", () => {
    expect(safeToISOString(new Date("invalid"))).toBeNull();
  });

  it("returns null for NaN", () => {
    expect(safeToISOString(NaN)).toBeNull();
  });
});

describe("toISOStringOrDefault", () => {
  it("converts valid date to ISO string", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    expect(toISOStringOrDefault(date)).toBe("2024-01-15T10:30:00.000Z");
  });

  it("returns current date ISO string for null", () => {
    const result = toISOStringOrDefault(null);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    expect(() => new Date(result)).not.toThrow();
  });

  it("returns current date ISO string for invalid date", () => {
    const result = toISOStringOrDefault("invalid-date");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("uses custom fallback date", () => {
    const fallback = new Date("2023-01-01T00:00:00Z");
    const result = toISOStringOrDefault(null, fallback);
    expect(result).toBe("2023-01-01T00:00:00.000Z");
  });
});

describe("isValidDate", () => {
  it("returns true for valid Date object", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    expect(isValidDate(date)).toBe(true);
  });

  it("returns true for valid date string", () => {
    expect(isValidDate("2024-01-15T10:30:00Z")).toBe(true);
  });

  it("returns true for valid timestamp", () => {
    const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
    expect(isValidDate(timestamp)).toBe(true);
  });

  it("returns true for Firestore Timestamp", () => {
    const firestoreTimestamp = {
      seconds: 1705318200,
      nanoseconds: 0,
    };
    expect(isValidDate(firestoreTimestamp)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidDate(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidDate(undefined)).toBe(false);
  });

  it("returns false for invalid date string", () => {
    expect(isValidDate("invalid-date")).toBe(false);
  });

  it("returns false for Invalid Date object", () => {
    expect(isValidDate(new Date("invalid"))).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(isValidDate(NaN)).toBe(false);
  });
});

describe("safeToDate", () => {
  it("converts valid Date object", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const result = safeToDate(date);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(date.getTime());
  });

  it("converts date string to Date", () => {
    const result = safeToDate("2024-01-15T10:30:00Z");
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
  });

  it("converts timestamp number to Date", () => {
    const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
    const result = safeToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(timestamp);
  });

  it("converts Firestore Timestamp to Date", () => {
    const firestoreTimestamp = {
      seconds: 1705318200,
      nanoseconds: 0,
    };
    const result = safeToDate(firestoreTimestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(1705318200000);
  });

  it("returns null for null input", () => {
    expect(safeToDate(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(safeToDate(undefined)).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(safeToDate("invalid-date")).toBeNull();
  });

  it("returns null for Invalid Date object", () => {
    expect(safeToDate(new Date("invalid"))).toBeNull();
  });

  it("returns null for NaN", () => {
    expect(safeToDate(NaN)).toBeNull();
  });
});
