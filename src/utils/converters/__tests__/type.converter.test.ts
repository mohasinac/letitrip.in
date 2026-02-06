/**
 * @jest-environment jsdom
 */

import {
  stringToBoolean,
  booleanToString,
  arrayToObject,
  objectToArray,
  queryStringToObject,
  objectToQueryString,
  csvToArray,
  arrayToCsv,
  firestoreTimestampToDate,
  dateToISOString,
  deepClone,
  flattenObject,
  unflattenObject,
} from "../type.converter";

describe("Type Converter", () => {
  describe("stringToBoolean", () => {
    it("should convert truthy strings to true", () => {
      expect(stringToBoolean("true")).toBe(true);
      expect(stringToBoolean("TRUE")).toBe(true);
      expect(stringToBoolean("yes")).toBe(true);
      expect(stringToBoolean("YES")).toBe(true);
      expect(stringToBoolean("1")).toBe(true);
      expect(stringToBoolean("on")).toBe(true);
      expect(stringToBoolean("ON")).toBe(true);
    });

    it("should convert falsy strings to false", () => {
      expect(stringToBoolean("false")).toBe(false);
      expect(stringToBoolean("no")).toBe(false);
      expect(stringToBoolean("0")).toBe(false);
      expect(stringToBoolean("off")).toBe(false);
      expect(stringToBoolean("anything")).toBe(false);
    });
  });

  describe("booleanToString", () => {
    it("should convert with truefalse format", () => {
      expect(booleanToString(true, "truefalse")).toBe("True");
      expect(booleanToString(false, "truefalse")).toBe("False");
    });

    it("should convert with yesno format", () => {
      expect(booleanToString(true, "yesno")).toBe("Yes");
      expect(booleanToString(false, "yesno")).toBe("No");
    });

    it("should convert with onoff format", () => {
      expect(booleanToString(true, "onoff")).toBe("On");
      expect(booleanToString(false, "onoff")).toBe("Off");
    });

    it("should use default format", () => {
      expect(booleanToString(true)).toBe("True");
      expect(booleanToString(false)).toBe("False");
    });
  });

  describe("arrayToObject", () => {
    it("should convert array to object keyed by field", () => {
      const arr = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
        { id: "3", name: "Charlie" },
      ];
      const result = arrayToObject(arr, "id");
      expect(result).toEqual({
        "1": { id: "1", name: "Alice" },
        "2": { id: "2", name: "Bob" },
        "3": { id: "3", name: "Charlie" },
      });
    });

    it("should handle empty array", () => {
      expect(arrayToObject([], "id")).toEqual({});
    });

    it("should handle numeric keys", () => {
      const arr = [
        { index: 0, value: "zero" },
        { index: 1, value: "one" },
      ];
      const result = arrayToObject(arr, "index");
      expect(result).toEqual({
        "0": { index: 0, value: "zero" },
        "1": { index: 1, value: "one" },
      });
    });
  });

  describe("objectToArray", () => {
    it("should convert object to array of values", () => {
      const obj = {
        a: { id: "1", name: "Alice" },
        b: { id: "2", name: "Bob" },
        c: { id: "3", name: "Charlie" },
      };
      const result = objectToArray(obj);
      expect(result).toEqual([
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
        { id: "3", name: "Charlie" },
      ]);
    });

    it("should handle empty object", () => {
      expect(objectToArray({})).toEqual([]);
    });

    it("should preserve value types", () => {
      const obj = { a: 1, b: "two", c: true };
      expect(objectToArray(obj)).toEqual([1, "two", true]);
    });
  });

  describe("queryStringToObject", () => {
    it("should convert query string to object", () => {
      expect(queryStringToObject("foo=bar&baz=qux")).toEqual({
        foo: "bar",
        baz: "qux",
      });
    });

    it("should handle URL-encoded values", () => {
      expect(queryStringToObject("name=John%20Doe&age=30")).toEqual({
        name: "John Doe",
        age: "30",
      });
    });

    it("should handle empty query string", () => {
      expect(queryStringToObject("")).toEqual({});
    });

    it("should handle query string with question mark", () => {
      expect(queryStringToObject("?foo=bar&baz=qux")).toEqual({
        foo: "bar",
        baz: "qux",
      });
    });
  });

  describe("objectToQueryString", () => {
    it("should convert object to query string", () => {
      const result = objectToQueryString({ foo: "bar", baz: "qux" });
      expect(result).toBe("foo=bar&baz=qux");
    });

    it("should skip null and undefined values", () => {
      const result = objectToQueryString({
        foo: "bar",
        baz: null,
        qux: undefined,
      });
      expect(result).toBe("foo=bar");
    });

    it("should handle empty object", () => {
      expect(objectToQueryString({})).toBe("");
    });

    it("should URL-encode special characters", () => {
      const result = objectToQueryString({
        name: "John Doe",
        email: "test@example.com",
      });
      expect(result).toContain("John+Doe");
      expect(result).toContain("test%40example.com");
    });
  });

  describe("csvToArray", () => {
    it("should convert CSV to array of objects", () => {
      const csv = "name,age,city\nAlice,30,NYC\nBob,25,LA";
      const result = csvToArray(csv);
      expect(result).toEqual([
        { name: "Alice", age: "30", city: "NYC" },
        { name: "Bob", age: "25", city: "LA" },
      ]);
    });

    it("should handle custom delimiter", () => {
      const csv = "name;age;city\nAlice;30;NYC\nBob;25;LA";
      const result = csvToArray(csv, ";");
      expect(result).toEqual([
        { name: "Alice", age: "30", city: "NYC" },
        { name: "Bob", age: "25", city: "LA" },
      ]);
    });

    it("should handle missing values", () => {
      const csv = "name,age,city\nAlice,30,\nBob,,LA";
      const result = csvToArray(csv);
      expect(result).toEqual([
        { name: "Alice", age: "30", city: "" },
        { name: "Bob", age: "", city: "LA" },
      ]);
    });
  });

  describe("arrayToCsv", () => {
    it("should convert array to CSV string", () => {
      const data = [
        { name: "Alice", age: 30, city: "NYC" },
        { name: "Bob", age: 25, city: "LA" },
      ];
      const result = arrayToCsv(data);
      expect(result).toBe("name,age,city\nAlice,30,NYC\nBob,25,LA");
    });

    it("should handle empty array", () => {
      expect(arrayToCsv([])).toBe("");
    });

    it("should quote values with delimiters", () => {
      const data = [{ name: "Alice, Bob", age: 30 }];
      const result = arrayToCsv(data);
      expect(result).toContain('"Alice, Bob"');
    });

    it("should handle custom delimiter", () => {
      const data = [{ name: "Alice", age: 30 }];
      const result = arrayToCsv(data, ";");
      expect(result).toBe("name;age\nAlice;30");
    });
  });

  describe("firestoreTimestampToDate", () => {
    it("should convert Firestore timestamp with toDate method", () => {
      const mockTimestamp = {
        toDate: () => new Date("2024-01-01T00:00:00Z"),
      };
      const result = firestoreTimestampToDate(mockTimestamp);
      expect(result).toEqual(new Date("2024-01-01T00:00:00Z"));
    });

    it("should convert Firestore timestamp with seconds field", () => {
      const mockTimestamp = {
        seconds: 1704067200, // 2024-01-01T00:00:00Z
      };
      const result = firestoreTimestampToDate(mockTimestamp);
      expect(result).toEqual(new Date(1704067200000));
    });

    it("should handle regular timestamps", () => {
      const timestamp = 1704067200000;
      const result = firestoreTimestampToDate(timestamp);
      expect(result).toEqual(new Date(1704067200000));
    });

    it("should handle ISO strings", () => {
      const result = firestoreTimestampToDate("2024-01-01T00:00:00Z");
      expect(result).toEqual(new Date("2024-01-01T00:00:00Z"));
    });
  });

  describe("dateToISOString", () => {
    it("should convert Date to ISO string", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      expect(dateToISOString(date)).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should convert string to ISO string", () => {
      expect(dateToISOString("2024-01-01")).toMatch(
        /2024-01-01T\d{2}:00:00\.000Z/,
      );
    });
  });

  describe("deepClone", () => {
    it("should create a deep clone of object", () => {
      const obj = { a: 1, b: { c: 2, d: [3, 4] } };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.b).not.toBe(obj.b);
      expect(clone.b.d).not.toBe(obj.b.d);
    });

    it("should clone arrays", () => {
      const arr = [1, 2, { a: 3 }];
      const clone = deepClone(arr);
      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
      expect(clone[2]).not.toBe(arr[2]);
    });

    it("should handle primitives", () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone("test")).toBe("test");
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });
  });

  describe("flattenObject", () => {
    it("should flatten nested object", () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
          },
        },
      };
      expect(flattenObject(obj)).toEqual({
        a: 1,
        "b.c": 2,
        "b.d.e": 3,
      });
    });

    it("should handle arrays", () => {
      const obj = { a: [1, 2, 3] };
      expect(flattenObject(obj)).toEqual({
        a: [1, 2, 3],
      });
    });

    it("should handle empty object", () => {
      expect(flattenObject({})).toEqual({});
    });
  });

  describe("unflattenObject", () => {
    it("should unflatten object", () => {
      const obj = {
        a: 1,
        "b.c": 2,
        "b.d.e": 3,
      };
      expect(unflattenObject(obj)).toEqual({
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
          },
        },
      });
    });

    it("should handle single-level keys", () => {
      const obj = { a: 1, b: 2 };
      expect(unflattenObject(obj)).toEqual({ a: 1, b: 2 });
    });

    it("should handle empty object", () => {
      expect(unflattenObject({})).toEqual({});
    });
  });
});
