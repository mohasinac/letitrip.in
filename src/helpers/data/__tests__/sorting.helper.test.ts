/**
 * @jest-environment jsdom
 */

import {
  sort,
  multiSort,
  sortByDate,
  sortByString,
  sortByNumber,
  toggleSortOrder,
  type SortOrder,
  type SortConfig,
} from "../sorting.helper";

describe("Sorting Helper", () => {
  describe("sort", () => {
    it("should sort numbers ascending by default", () => {
      const data = [{ id: 3 }, { id: 1 }, { id: 2 }];
      const result = sort(data, "id");
      expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
    });

    it("should sort numbers descending", () => {
      const data = [{ id: 1 }, { id: 3 }, { id: 2 }];
      const result = sort(data, "id", "desc");
      expect(result.map((item) => item.id)).toEqual([3, 2, 1]);
    });

    it("should sort strings ascending", () => {
      const data = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
      const result = sort(data, "name");
      expect(result.map((item) => item.name)).toEqual([
        "Alice",
        "Bob",
        "Charlie",
      ]);
    });

    it("should not mutate original array", () => {
      const data = [{ id: 3 }, { id: 1 }, { id: 2 }];
      const original = [...data];
      sort(data, "id");
      expect(data).toEqual(original);
    });

    it("should handle empty array", () => {
      const result = sort([], "id");
      expect(result).toEqual([]);
    });

    it("should handle single item", () => {
      const data = [{ id: 1 }];
      const result = sort(data, "id");
      expect(result).toEqual(data);
    });

    it("should handle equal values", () => {
      const data = [{ id: 1 }, { id: 1 }, { id: 1 }];
      const result = sort(data, "id");
      expect(result.length).toBe(3);
    });
  });

  describe("multiSort", () => {
    it("should sort by multiple keys", () => {
      const data = [
        { category: "A", priority: 2 },
        { category: "B", priority: 1 },
        { category: "A", priority: 1 },
      ];
      const configs: SortConfig<(typeof data)[0]>[] = [
        { key: "category", order: "asc" },
        { key: "priority", order: "asc" },
      ];
      const result = multiSort(data, configs);

      expect(result[0]).toEqual({ category: "A", priority: 1 });
      expect(result[1]).toEqual({ category: "A", priority: 2 });
      expect(result[2]).toEqual({ category: "B", priority: 1 });
    });

    it("should prioritize first sort config", () => {
      const data = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Alice", age: 25 },
      ];
      const configs: SortConfig<(typeof data)[0]>[] = [
        { key: "name", order: "asc" },
        { key: "age", order: "asc" },
      ];
      const result = multiSort(data, configs);

      expect(result[0].name).toBe("Alice");
      expect(result[0].age).toBe(25);
      expect(result[1].name).toBe("Alice");
      expect(result[1].age).toBe(30);
    });

    it("should handle desc order in multi-sort", () => {
      const data = [
        { priority: 1, score: 100 },
        { priority: 1, score: 90 },
        { priority: 2, score: 80 },
      ];
      const configs: SortConfig<(typeof data)[0]>[] = [
        { key: "priority", order: "asc" },
        { key: "score", order: "desc" },
      ];
      const result = multiSort(data, configs);

      expect(result[0].score).toBe(100);
      expect(result[1].score).toBe(90);
      expect(result[2].score).toBe(80);
    });

    it("should not mutate original array", () => {
      const data = [{ id: 2 }, { id: 1 }];
      const original = [...data];
      multiSort(data, [{ key: "id", order: "asc" }]);
      expect(data).toEqual(original);
    });

    it("should handle empty configs", () => {
      const data = [{ id: 2 }, { id: 1 }];
      const result = multiSort(data, []);
      expect(result).toEqual(data);
    });
  });

  describe("sortByDate", () => {
    it("should sort dates ascending", () => {
      const data = [
        { date: "2026-03-01" },
        { date: "2026-01-01" },
        { date: "2026-02-01" },
      ];
      const result = sortByDate(data, "date");

      expect(result[0].date).toBe("2026-01-01");
      expect(result[1].date).toBe("2026-02-01");
      expect(result[2].date).toBe("2026-03-01");
    });

    it("should sort dates descending", () => {
      const data = [
        { date: "2026-01-01" },
        { date: "2026-03-01" },
        { date: "2026-02-01" },
      ];
      const result = sortByDate(data, "date", "desc");

      expect(result[0].date).toBe("2026-03-01");
      expect(result[1].date).toBe("2026-02-01");
      expect(result[2].date).toBe("2026-01-01");
    });

    it("should handle Date objects", () => {
      const data = [
        { date: new Date("2026-03-01") },
        { date: new Date("2026-01-01") },
        { date: new Date("2026-02-01") },
      ];
      const result = sortByDate(data, "date");

      expect(result[0].date.getMonth()).toBe(0); // January
      expect(result[2].date.getMonth()).toBe(2); // March
    });

    it("should not mutate original array", () => {
      const data = [{ date: "2026-02-01" }, { date: "2026-01-01" }];
      const original = [...data];
      sortByDate(data, "date");
      expect(data).toEqual(original);
    });

    it("should handle timestamps", () => {
      const data = [
        { time: 1609459200000 }, // 2021-01-01
        { time: 1640995200000 }, // 2022-01-01
        { time: 1577836800000 }, // 2020-01-01
      ];
      const result = sortByDate(data, "time");

      expect(result[0].time).toBe(1577836800000);
      expect(result[2].time).toBe(1640995200000);
    });
  });

  describe("sortByString", () => {
    it("should sort strings case-insensitively", () => {
      const data = [{ name: "charlie" }, { name: "Alice" }, { name: "BOB" }];
      const result = sortByString(data, "name");

      expect(result.map((item) => item.name)).toEqual([
        "Alice",
        "BOB",
        "charlie",
      ]);
    });

    it("should sort descending", () => {
      const data = [{ name: "Alice" }, { name: "Charlie" }, { name: "Bob" }];
      const result = sortByString(data, "name", "desc");

      expect(result.map((item) => item.name)).toEqual([
        "Charlie",
        "Bob",
        "Alice",
      ]);
    });

    it("should handle mixed case consistently", () => {
      const data = [{ text: "aaa" }, { text: "AAA" }, { text: "Aaa" }];
      const result = sortByString(data, "text");

      // All should be treated equally (case-insensitive)
      expect(result.length).toBe(3);
    });

    it("should not mutate original array", () => {
      const data = [{ name: "Bob" }, { name: "Alice" }];
      const original = [...data];
      sortByString(data, "name");
      expect(data).toEqual(original);
    });

    it("should handle empty strings", () => {
      const data = [{ name: "Bob" }, { name: "" }, { name: "Alice" }];
      const result = sortByString(data, "name");

      expect(result[0].name).toBe("");
    });

    it("should handle special characters", () => {
      const data = [{ name: "123" }, { name: "abc" }, { name: "!@#" }];
      const result = sortByString(data, "name");

      expect(result.length).toBe(3);
      expect(result[0].name).toBe("!@#"); // Special chars come first
    });
  });

  describe("sortByNumber", () => {
    it("should sort numbers ascending", () => {
      const data = [{ value: 30 }, { value: 10 }, { value: 20 }];
      const result = sortByNumber(data, "value");

      expect(result.map((item) => item.value)).toEqual([10, 20, 30]);
    });

    it("should sort numbers descending", () => {
      const data = [{ value: 10 }, { value: 30 }, { value: 20 }];
      const result = sortByNumber(data, "value", "desc");

      expect(result.map((item) => item.value)).toEqual([30, 20, 10]);
    });

    it("should handle negative numbers", () => {
      const data = [{ value: -5 }, { value: 10 }, { value: -10 }];
      const result = sortByNumber(data, "value");

      expect(result.map((item) => item.value)).toEqual([-10, -5, 10]);
    });

    it("should handle decimal numbers", () => {
      const data = [{ value: 1.5 }, { value: 1.2 }, { value: 1.8 }];
      const result = sortByNumber(data, "value");

      expect(result.map((item) => item.value)).toEqual([1.2, 1.5, 1.8]);
    });

    it("should handle zero", () => {
      const data = [{ value: 0 }, { value: -1 }, { value: 1 }];
      const result = sortByNumber(data, "value");

      expect(result[1].value).toBe(0);
    });

    it("should not mutate original array", () => {
      const data = [{ value: 2 }, { value: 1 }];
      const original = [...data];
      sortByNumber(data, "value");
      expect(data).toEqual(original);
    });

    it("should handle string numbers", () => {
      const data = [{ value: "30" }, { value: "10" }, { value: "20" }];
      const result = sortByNumber(data, "value" as any);

      expect(result.map((item) => Number(item.value))).toEqual([10, 20, 30]);
    });
  });

  describe("toggleSortOrder", () => {
    it("should toggle from asc to desc", () => {
      expect(toggleSortOrder("asc")).toBe("desc");
    });

    it("should toggle from desc to asc", () => {
      expect(toggleSortOrder("desc")).toBe("asc");
    });

    it("should be reversible", () => {
      const order: SortOrder = "asc";
      const toggled = toggleSortOrder(order);
      const toggledBack = toggleSortOrder(toggled);
      expect(toggledBack).toBe(order);
    });
  });
});
