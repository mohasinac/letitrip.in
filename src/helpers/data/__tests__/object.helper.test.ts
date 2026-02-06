/**
 * @jest-environment jsdom
 */

import {
  deepMerge,
  pick,
  omit,
  isEmptyObject,
  getNestedValue,
  setNestedValue,
  deepCloneObject,
  isEqual,
  cleanObject,
  invertObject,
} from "../object.helper";

describe("Object Helper", () => {
  describe("deepMerge", () => {
    it("should merge two objects", () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it("should deep merge nested objects", () => {
      const target = { a: { b: 1, c: 2 } };
      const source = { a: { c: 3, d: 4 } };
      expect(deepMerge(target as any, source as any)).toEqual({
        a: { b: 1, c: 3, d: 4 },
      });
    });

    it("should not mutate target", () => {
      const target = { a: 1 };
      const source = { b: 2 };
      deepMerge(target as any, source as any);
      expect(target).toEqual({ a: 1 });
    });

    it("should handle arrays as values", () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4] };
      expect(deepMerge(target, source)).toEqual({ a: [3, 4] });
    });

    it("should handle empty objects", () => {
      expect(deepMerge({}, { a: 1 })).toEqual({ a: 1 });
      expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
    });
  });

  describe("pick", () => {
    it("should pick specified keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
    });

    it("should ignore non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, ["a", "c" as any])).toEqual({ a: 1 });
    });

    it("should handle empty keys array", () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, [])).toEqual({});
    });

    it("should handle empty object", () => {
      expect(pick({} as any, ["a"])).toEqual({});
    });
  });

  describe("omit", () => {
    it("should omit specified keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      expect(omit(obj, ["b", "d"])).toEqual({ a: 1, c: 3 });
    });

    it("should ignore non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, ["c" as any])).toEqual({ a: 1, b: 2 });
    });

    it("should handle empty keys array", () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 });
    });

    it("should handle empty object", () => {
      expect(omit({} as any, ["a"])).toEqual({});
    });
  });

  describe("isEmptyObject", () => {
    it("should detect empty objects", () => {
      expect(isEmptyObject({})).toBe(true);
    });

    it("should detect non-empty objects", () => {
      expect(isEmptyObject({ a: 1 })).toBe(false);
      expect(isEmptyObject({ a: undefined })).toBe(false);
      expect(isEmptyObject({ a: null })).toBe(false);
    });
  });

  describe("getNestedValue", () => {
    it("should get nested property value", () => {
      const obj = { a: { b: { c: 42 } } };
      expect(getNestedValue(obj, "a.b.c")).toBe(42);
    });

    it("should handle single level path", () => {
      const obj = { a: 1 };
      expect(getNestedValue(obj, "a")).toBe(1);
    });

    it("should return undefined for non-existent path", () => {
      const obj = { a: { b: 1 } };
      expect(getNestedValue(obj, "a.c.d")).toBeUndefined();
    });

    it("should handle arrays", () => {
      const obj = { a: [1, 2, 3] };
      expect(getNestedValue(obj, "a.1")).toBe(2);
    });

    it("should handle null values in path", () => {
      const obj = { a: { b: null } };
      expect(getNestedValue(obj, "a.b.c")).toBeUndefined();
    });
  });

  describe("setNestedValue", () => {
    it("should set nested property value", () => {
      const obj: any = {};
      setNestedValue(obj, "a.b.c", 42);
      expect(obj.a.b.c).toBe(42);
    });

    it("should create intermediate objects", () => {
      const obj: any = {};
      setNestedValue(obj, "x.y.z", "value");
      expect(obj.x).toBeDefined();
      expect(obj.x.y).toBeDefined();
      expect(obj.x.y.z).toBe("value");
    });

    it("should overwrite existing values", () => {
      const obj: any = { a: { b: 1 } };
      setNestedValue(obj, "a.b", 2);
      expect(obj.a.b).toBe(2);
    });

    it("should handle single level path", () => {
      const obj: any = {};
      setNestedValue(obj, "a", 1);
      expect(obj.a).toBe(1);
    });
  });

  describe("deepCloneObject", () => {
    it("should create a deep clone", () => {
      const obj = { a: 1, b: { c: 2 } };
      const clone = deepCloneObject(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.b).not.toBe(obj.b);
    });

    it("should clone arrays", () => {
      const obj = { a: [1, 2, { b: 3 }] };
      const clone = deepCloneObject(obj);
      expect(clone.a).toEqual(obj.a);
      expect(clone.a).not.toBe(obj.a);
      expect(clone.a[2]).not.toBe(obj.a[2]);
    });

    it("should handle primitives", () => {
      expect(deepCloneObject(42)).toBe(42);
      expect(deepCloneObject("test")).toBe("test");
      expect(deepCloneObject(true)).toBe(true);
      expect(deepCloneObject(null)).toBe(null);
    });

    it("should handle nested structures", () => {
      const obj = { a: { b: { c: [1, 2, 3] } } };
      const clone = deepCloneObject(obj);
      expect(clone).toEqual(obj);
      expect(clone.a.b.c).not.toBe(obj.a.b.c);
    });
  });

  describe("isEqual", () => {
    it("should compare primitive values", () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual("a", "a")).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(1, 2)).toBe(false);
    });

    it("should compare objects", () => {
      expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("should compare nested objects", () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it("should handle null and undefined", () => {
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, undefined)).toBe(false);
    });

    it("should handle arrays", () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it("should compare object reference", () => {
      const obj = { a: 1 };
      expect(isEqual(obj, obj)).toBe(true);
    });
  });

  describe("cleanObject", () => {
    it("should remove null, undefined, and empty strings by default", () => {
      const obj = { a: 1, b: null, c: undefined, d: "", e: "value" };
      expect(cleanObject(obj)).toEqual({ a: 1, e: "value" });
    });

    it("should respect removeNull option", () => {
      const obj = { a: 1, b: null, c: undefined };
      expect(cleanObject(obj, { removeNull: false })).toEqual({
        a: 1,
        b: null,
      });
    });

    it("should respect removeUndefined option", () => {
      const obj = { a: 1, b: null, c: undefined };
      expect(cleanObject(obj, { removeUndefined: false })).toEqual({
        a: 1,
        c: undefined,
      });
    });

    it("should respect removeEmpty option", () => {
      const obj = { a: 1, b: "", c: "value" };
      expect(cleanObject(obj, { removeEmpty: false })).toEqual({
        a: 1,
        b: "",
        c: "value",
      });
    });

    it("should handle empty object", () => {
      expect(cleanObject({})).toEqual({});
    });

    it("should keep falsy values that are not null/undefined/empty", () => {
      const obj = { a: 0, b: false, c: null };
      const result = cleanObject(obj);
      expect(result.a).toBe(0);
      expect(result.b).toBe(false);
    });
  });

  describe("invertObject", () => {
    it("should swap keys and values", () => {
      const obj = { a: "1", b: "2", c: "3" };
      expect(invertObject(obj)).toEqual({ "1": "a", "2": "b", "3": "c" });
    });

    it("should handle empty object", () => {
      expect(invertObject({})).toEqual({});
    });

    it("should handle duplicate values", () => {
      const obj = { a: "1", b: "1" };
      const result = invertObject(obj);
      expect(result["1"]).toBeDefined();
      expect(["a", "b"]).toContain(result["1"]);
    });

    it("should work with single entry", () => {
      expect(invertObject({ key: "value" })).toEqual({ value: "key" });
    });
  });
});
