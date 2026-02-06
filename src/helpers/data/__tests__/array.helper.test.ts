/**
 * @jest-environment jsdom
 */

import {
  groupBy,
  unique,
  uniqueBy,
  sortBy,
  chunk,
  flatten,
  randomItem,
  shuffle,
  paginate,
  difference,
  intersection,
  moveItem,
} from "../array.helper";

describe("Array Helper", () => {
  describe("groupBy", () => {
    it("should group array items by key", () => {
      const data = [
        { id: 1, category: "A", name: "Item1" },
        { id: 2, category: "B", name: "Item2" },
        { id: 3, category: "A", name: "Item3" },
      ];
      const result = groupBy(data, "category");
      expect(result).toEqual({
        A: [
          { id: 1, category: "A", name: "Item1" },
          { id: 3, category: "A", name: "Item3" },
        ],
        B: [{ id: 2, category: "B", name: "Item2" }],
      });
    });

    it("should handle empty array", () => {
      expect(groupBy([], "key")).toEqual({});
    });

    it("should handle numeric keys", () => {
      const data = [
        { id: 1, count: 10 },
        { id: 2, count: 10 },
        { id: 3, count: 20 },
      ];
      const result = groupBy(data, "count");
      expect(result["10"]).toHaveLength(2);
      expect(result["20"]).toHaveLength(1);
    });
  });

  describe("unique", () => {
    it("should remove duplicate primitives", () => {
      expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
    });

    it("should handle empty array", () => {
      expect(unique([])).toEqual([]);
    });

    it("should preserve order of first occurrence", () => {
      expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
    });
  });

  describe("uniqueBy", () => {
    it("should remove duplicates by key", () => {
      const data = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 1, name: "Charlie" },
      ];
      const result = uniqueBy(data, "id");
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Bob");
    });

    it("should handle empty array", () => {
      expect(uniqueBy([], "key")).toEqual([]);
    });
  });

  describe("sortBy", () => {
    it("should sort ascending by default", () => {
      const data = [
        { id: 3, name: "C" },
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ];
      const result = sortBy(data, "id");
      expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
    });

    it("should sort descending", () => {
      const data = [
        { id: 1, name: "A" },
        { id: 3, name: "C" },
        { id: 2, name: "B" },
      ];
      const result = sortBy(data, "id", "desc");
      expect(result.map((item) => item.id)).toEqual([3, 2, 1]);
    });

    it("should not mutate original array", () => {
      const data = [{ id: 2 }, { id: 1 }];
      const original = [...data];
      sortBy(data, "id");
      expect(data).toEqual(original);
    });

    it("should sort strings", () => {
      const data = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
      const result = sortBy(data, "name");
      expect(result.map((item) => item.name)).toEqual([
        "Alice",
        "Bob",
        "Charlie",
      ]);
    });
  });

  describe("chunk", () => {
    it("should chunk array into specified size", () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
    });

    it("should handle empty array", () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it("should handle size larger than array", () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it("should handle size of 1", () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
  });

  describe("flatten", () => {
    it("should flatten nested arrays", () => {
      expect(flatten([1, [2, 3], [4, [5, 6]]])).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should handle empty array", () => {
      expect(flatten([])).toEqual([]);
    });

    it("should handle already flat array", () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("should handle deeply nested arrays", () => {
      expect(flatten([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("randomItem", () => {
    it("should return an item from array", () => {
      const array = [1, 2, 3, 4, 5];
      const item = randomItem(array);
      expect(array).toContain(item);
    });

    it("should return different items on multiple calls", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const items = new Set();
      for (let i = 0; i < 50; i++) {
        items.add(randomItem(array));
      }
      expect(items.size).toBeGreaterThan(1);
    });

    it("should work with single item array", () => {
      expect(randomItem([42])).toBe(42);
    });
  });

  describe("shuffle", () => {
    it("should return array with same length", () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffle(array);
      expect(shuffled).toHaveLength(array.length);
    });

    it("should contain all original items", () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffle(array);
      array.forEach((item) => {
        expect(shuffled).toContain(item);
      });
    });

    it("should not mutate original array", () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      shuffle(array);
      expect(array).toEqual(original);
    });

    it("should produce different orders", () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(shuffle(array).join(","));
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("paginate", () => {
    it("should paginate array correctly", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(data, 1, 3);
      expect(result).toEqual({
        data: [1, 2, 3],
        total: 10,
        page: 1,
        perPage: 3,
        totalPages: 4,
      });
    });

    it("should handle second page", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(data, 2, 3);
      expect(result.data).toEqual([4, 5, 6]);
      expect(result.page).toBe(2);
    });

    it("should handle last page with partial data", () => {
      const data = [1, 2, 3, 4, 5];
      const result = paginate(data, 2, 3);
      expect(result.data).toEqual([4, 5]);
      expect(result.totalPages).toBe(2);
    });

    it("should handle empty array", () => {
      const result = paginate([], 1, 10);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("should handle page beyond total pages", () => {
      const data = [1, 2, 3];
      const result = paginate(data, 5, 10);
      expect(result.data).toEqual([]);
    });
  });

  describe("difference", () => {
    it("should find items in first array not in second", () => {
      expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
      expect(difference([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3]);
    });

    it("should handle empty arrays", () => {
      expect(difference([], [1, 2])).toEqual([]);
      expect(difference([1, 2], [])).toEqual([1, 2]);
    });

    it("should handle identical arrays", () => {
      expect(difference([1, 2, 3], [1, 2, 3])).toEqual([]);
    });
  });

  describe("intersection", () => {
    it("should find common items", () => {
      expect(intersection([1, 2, 3, 4], [2, 3, 5])).toEqual([2, 3]);
      expect(intersection([1, 2, 3], [3, 4, 5])).toEqual([3]);
    });

    it("should handle no common items", () => {
      expect(intersection([1, 2], [3, 4])).toEqual([]);
    });

    it("should handle empty arrays", () => {
      expect(intersection([], [1, 2])).toEqual([]);
      expect(intersection([1, 2], [])).toEqual([]);
    });
  });

  describe("moveItem", () => {
    it("should move item forward", () => {
      expect(moveItem([1, 2, 3, 4, 5], 0, 2)).toEqual([2, 3, 1, 4, 5]);
    });

    it("should move item backward", () => {
      expect(moveItem([1, 2, 3, 4, 5], 4, 1)).toEqual([1, 5, 2, 3, 4]);
    });

    it("should not mutate original array", () => {
      const array = [1, 2, 3];
      const original = [...array];
      moveItem(array, 0, 2);
      expect(array).toEqual(original);
    });

    it("should handle moving to same position", () => {
      expect(moveItem([1, 2, 3], 1, 1)).toEqual([1, 2, 3]);
    });
  });
});
