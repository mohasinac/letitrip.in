import {
  calculateCategoryLevel,
  countCategoryProducts,
  countLeafCategoryProducts,
  countParentCategoryProducts,
  getAllAncestorIds,
  getAllDescendantIds,
  getCategoryIdsForQuery,
  isCategoryLeaf,
  validateParentAssignments,
  wouldCreateCycle,
} from "../category-hierarchy";

// Mock Firebase Admin
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(),
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("Category Hierarchy", () => {
  let mockDb: any;

  beforeEach(() => {
    const { getFirestoreAdmin } = require("@/app/api/lib/firebase/admin");

    // Create mock Firestore structure
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      update: jest.fn(),
    };

    getFirestoreAdmin.mockReturnValue(mockDb);
  });

  describe("getAllDescendantIds", () => {
    it("should return empty array for leaf category", async () => {
      mockDb.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await getAllDescendantIds("leaf-category");
      expect(result).toEqual([]);
    });

    it("should return direct children", async () => {
      mockDb.get
        .mockResolvedValueOnce({
          empty: false,
          docs: [
            { id: "child1", data: () => ({}) },
            { id: "child2", data: () => ({}) },
          ],
        })
        .mockResolvedValue({ empty: true, docs: [] });

      const result = await getAllDescendantIds("parent");
      expect(result).toContain("child1");
      expect(result).toContain("child2");
    });

    it("should prevent infinite loops with circular references", async () => {
      let callCount = 0;
      mockDb.get.mockImplementation(() => {
        callCount++;
        if (callCount > 10) {
          return Promise.resolve({ empty: true, docs: [] });
        }
        return Promise.resolve({
          empty: false,
          docs: [{ id: "circular-child", data: () => ({}) }],
        });
      });

      const result = await getAllDescendantIds("circular-parent");
      expect(result.length).toBeLessThan(20);
    });
  });

  describe("getAllAncestorIds", () => {
    it("should return empty array for root category", async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({ parentIds: [] }),
      });

      const result = await getAllAncestorIds("root");
      expect(result).toEqual([]);
    });

    it("should return parent IDs", async () => {
      mockDb.get
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ parentIds: ["parent1"] }),
        })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ parentIds: [] }),
        });

      const result = await getAllAncestorIds("child");
      expect(result).toContain("parent1");
    });

    it("should return empty array for non-existent category", async () => {
      mockDb.get.mockResolvedValue({ exists: false });

      const result = await getAllAncestorIds("non-existent");
      expect(result).toEqual([]);
    });

    it("should prevent infinite loops", async () => {
      let callCount = 0;
      mockDb.get.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            exists: true,
            data: () => ({ parentIds: ["parent1"] }),
          });
        }
        if (callCount > 10) {
          return Promise.resolve({ exists: false });
        }
        return Promise.resolve({
          exists: true,
          data: () => ({ parentIds: ["parent1"] }),
        });
      });

      const result = await getAllAncestorIds("circular");
      expect(result.length).toBeLessThan(20);
    });
  });

  describe("wouldCreateCycle", () => {
    it("should return true for self-reference", async () => {
      const result = await wouldCreateCycle("cat1", "cat1");
      expect(result).toBe(true);
    });

    it("should return true if parent is descendant", async () => {
      mockDb.get
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ id: "child", data: () => ({}) }],
        })
        .mockResolvedValue({ empty: true, docs: [] });

      const result = await wouldCreateCycle("parent", "child");
      expect(result).toBe(true);
    });

    it("should return false for valid parent", async () => {
      mockDb.get.mockResolvedValue({ empty: true, docs: [] });

      const result = await wouldCreateCycle("child", "parent");
      expect(result).toBe(false);
    });
  });

  describe("countLeafCategoryProducts", () => {
    it("should count published non-deleted products", async () => {
      mockDb.get.mockResolvedValue({
        docs: [
          { data: () => ({ status: "published", is_deleted: false }) },
          { data: () => ({ status: "published" }) },
          { data: () => ({ status: "published", is_deleted: true }) },
        ],
      });

      const result = await countLeafCategoryProducts("category1");
      expect(result).toBe(2);
    });

    it("should return zero for empty category", async () => {
      mockDb.get.mockResolvedValue({ docs: [] });

      const result = await countLeafCategoryProducts("empty");
      expect(result).toBe(0);
    });

    it("should exclude deleted products", async () => {
      mockDb.get.mockResolvedValue({
        docs: [
          { data: () => ({ status: "published", is_deleted: true }) },
          { data: () => ({ status: "published", is_deleted: true }) },
        ],
      });

      const result = await countLeafCategoryProducts("category1");
      expect(result).toBe(0);
    });
  });

  describe("countParentCategoryProducts", () => {
    it("should sum children counts", async () => {
      mockDb.get.mockResolvedValue({
        empty: false,
        docs: [
          { data: () => ({ product_count: 10 }) },
          { data: () => ({ product_count: 20 }) },
        ],
      });

      const result = await countParentCategoryProducts("parent");
      expect(result).toBe(30);
    });

    it("should handle children without counts", async () => {
      mockDb.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({}) }, { data: () => ({ product_count: 10 }) }],
      });

      const result = await countParentCategoryProducts("parent");
      expect(result).toBe(10);
    });

    it("should count leaf products if no children", async () => {
      mockDb.get
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const result = await countParentCategoryProducts("leaf");
      expect(result).toBe(0);
    });
  });

  describe("countCategoryProducts", () => {
    it("should count leaf category products", async () => {
      mockDb.get
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const result = await countCategoryProducts("leaf");
      expect(result).toBe(0);
    });

    it("should sum parent category products", async () => {
      mockDb.get.mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ product_count: 15 }) }],
      });

      const result = await countCategoryProducts("parent");
      expect(result).toBe(15);
    });
  });

  describe("isCategoryLeaf", () => {
    it("should return true for leaf category", async () => {
      mockDb.get.mockResolvedValue({ empty: true, docs: [] });

      const result = await isCategoryLeaf("leaf");
      expect(result).toBe(true);
    });

    it("should return false for parent category", async () => {
      mockDb.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "child" }],
      });

      const result = await isCategoryLeaf("parent");
      expect(result).toBe(false);
    });
  });

  describe("getCategoryIdsForQuery", () => {
    it("should return category and descendants", async () => {
      mockDb.get
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ id: "child1" }],
        })
        .mockResolvedValue({ empty: true, docs: [] });

      const result = await getCategoryIdsForQuery("parent");
      expect(result).toContain("parent");
      expect(result).toContain("child1");
    });

    it("should return only category ID for leaf", async () => {
      mockDb.get.mockResolvedValue({ empty: true, docs: [] });

      const result = await getCategoryIdsForQuery("leaf");
      expect(result).toEqual(["leaf"]);
    });
  });

  describe("validateParentAssignments", () => {
    it("should reject self-reference", async () => {
      // Still need to mock since code checks all parents exist at the end
      mockDb.get
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({ exists: true, data: () => ({}) });

      const result = await validateParentAssignments("cat1", ["cat1"]);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("A category cannot be its own parent");
    });

    it("should reject circular references", async () => {
      // Mock wouldCreateCycle to return true (parent1 is descendant of child)
      mockDb.get
        .mockResolvedValueOnce({
          empty: false,
          docs: [{ id: "parent1" }],
        })
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({ exists: true, data: () => ({}) });

      const result = await validateParentAssignments("child", ["parent1"]);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject non-existent parents", async () => {
      mockDb.get
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({ exists: false, data: () => null });

      const result = await validateParentAssignments("child", ["non-existent"]);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("does not exist"))).toBe(
        true
      );
    });

    it("should accept valid parents", async () => {
      mockDb.get
        .mockResolvedValueOnce({ empty: true, docs: [] })
        .mockResolvedValueOnce({ exists: true, data: () => ({}) });

      const result = await validateParentAssignments("child", ["valid-parent"]);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should accept empty parent list", async () => {
      const result = await validateParentAssignments("root", []);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("calculateCategoryLevel", () => {
    it("should return 0 for root category", async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({ parentIds: [] }),
      });

      const result = await calculateCategoryLevel("root");
      expect(result).toBe(0);
    });

    it("should return 1 for first level", async () => {
      mockDb.get
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ parentIds: ["root"] }),
        })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ level: 0 }),
        });

      const result = await calculateCategoryLevel("level1");
      expect(result).toBe(1);
    });

    it("should return 0 for non-existent category", async () => {
      mockDb.get.mockResolvedValue({ exists: false });

      const result = await calculateCategoryLevel("non-existent");
      expect(result).toBe(0);
    });

    it("should calculate max level from multiple parents", async () => {
      mockDb.get
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ parentIds: ["parent1", "parent2"] }),
        })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ level: 2 }),
        })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({ level: 1 }),
        });

      const result = await calculateCategoryLevel("multi-parent");
      expect(result).toBe(3);
    });
  });

  describe("Edge cases", () => {
    it("should handle database errors gracefully", async () => {
      mockDb.get.mockRejectedValue(new Error("Database error"));

      await expect(getAllDescendantIds("test")).rejects.toThrow();
    });

    it("should handle missing data fields", async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({}),
      });

      const result = await getAllAncestorIds("test");
      expect(result).toEqual([]);
    });
  });
});
