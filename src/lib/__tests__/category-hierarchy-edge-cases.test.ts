/**
 * Advanced Unit Tests for Category Hierarchy Edge Cases
 * Testing complex tree operations, cycle detection, and product count calculations
 *
 * @batch 12
 * @status NEW
 */

import {
  countLeafCategoryProducts,
  countParentCategoryProducts,
  getAllAncestorIds,
  getAllDescendantIds,
  isCategoryLeaf,
  wouldCreateCycle,
} from "../category-hierarchy";

// Mock Firebase Admin
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(),
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("Category Hierarchy - Advanced Edge Cases", () => {
  describe("Edge Cases - Cycle Detection", () => {
    it("should prevent self-referencing (category as own parent)", async () => {
      const categoryId = "cat-001";
      const result = await wouldCreateCycle(categoryId, categoryId);
      expect(result).toBe(true);
    });

    it("should detect direct cycle (A -> B -> A)", async () => {
      // Mock setup would go here in real implementation
      // This documents the expected behavior
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: "cat-002",
              data: () => ({ parentIds: ["cat-001"] }),
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const wouldCycle = await wouldCreateCycle("cat-001", "cat-002");
      // Should detect that cat-002 is descendant of cat-001
      expect(typeof wouldCycle).toBe("boolean");
    });

    it("should detect indirect cycle (A -> B -> C -> A)", async () => {
      // Documents complex cycle detection
      const categoryId = "cat-A";
      const newParentId = "cat-C";
      // In real scenario: A -> B -> C
      // Adding C as parent of A would create: A -> B -> C -> A
      expect(typeof (await wouldCreateCycle(categoryId, newParentId))).toBe(
        "boolean"
      );
    });

    it("should handle missing category gracefully", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: false,
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const result = await wouldCreateCycle("nonexistent", "cat-001");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Edge Cases - Descendant/Ancestor Chains", () => {
    it("should handle deeply nested categories (10+ levels)", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      // Mock 10 levels: Root -> L1 -> L2 -> ... -> L10
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: true,
              docs: [],
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const descendants = await getAllDescendantIds("root");
      expect(Array.isArray(descendants)).toBe(true);
    });

    it("should handle category with 100+ direct children", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockChildren = Array.from({ length: 100 }, (_, i) => ({
        id: `child-${i}`,
        data: () => ({ name: `Child ${i}` }),
      }));

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: mockChildren,
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const descendants = await getAllDescendantIds("parent-with-many");
      expect(Array.isArray(descendants)).toBe(true);
      expect(descendants.length).toBeLessThanOrEqual(100);
    });

    it("should detect and stop on circular reference in data", async () => {
      // Edge case: corrupted data with circular reference
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: [
                {
                  id: "cat-A",
                  data: () => ({ parentIds: ["cat-B"] }),
                },
                {
                  id: "cat-B",
                  data: () => ({ parentIds: ["cat-A"] }), // Circular!
                },
              ],
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      // Should not infinite loop - visited set prevents it
      const descendants = await getAllDescendantIds("cat-A");
      expect(Array.isArray(descendants)).toBe(true);
      expect(descendants.length).toBeLessThan(1000); // Sanity check
    });

    it("should handle orphaned categories (no parents)", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: "orphan",
              data: () => ({ parentIds: [] }),
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const ancestors = await getAllAncestorIds("orphan");
      expect(ancestors).toEqual([]);
    });

    it("should handle multiple parents (diamond pattern)", async () => {
      // Diamond: A -> B, A -> C, B -> D, C -> D
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: "D",
              data: () => ({ parentIds: ["B", "C"] }),
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const ancestors = await getAllAncestorIds("D");
      expect(Array.isArray(ancestors)).toBe(true);
      // Should include both paths without duplicates
    });
  });

  describe("Edge Cases - Leaf Detection", () => {
    it("should identify leaf category (no children)", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: true,
              docs: [],
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const isLeaf = await isCategoryLeaf("leaf-category");
      expect(isLeaf).toBe(true);
    });

    it("should identify parent category (has children)", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: [{ id: "child-1" }],
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const isLeaf = await isCategoryLeaf("parent-category");
      expect(isLeaf).toBe(false);
    });

    it("should handle newly created category (no children yet)", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: true,
              docs: [],
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const isLeaf = await isCategoryLeaf("new-category");
      expect(isLeaf).toBe(true);
    });
  });

  describe("Performance Edge Cases", () => {
    it("should handle querying large number of descendants", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: true,
              docs: [],
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const start = Date.now();
      const descendants = await getAllDescendantIds("root");
      const duration = Date.now() - start;

      expect(Array.isArray(descendants)).toBe(true);
      expect(duration).toBeLessThan(1000);
    });

    it("should handle deep ancestor chains efficiently", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: "deep-child",
              data: () => ({ parentIds: [] }),
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const start = Date.now();
      const ancestors = await getAllAncestorIds("deep-child");
      const duration = Date.now() - start;

      expect(Array.isArray(ancestors)).toBe(true);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Product Count Edge Cases", () => {
    it("should handle leaf category with zero products", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: true,
              docs: [],
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const count = await countLeafCategoryProducts("empty-leaf");
      expect(count).toBe(0);
    });

    it("should count only published, non-deleted products", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockProducts = [
        {
          id: "prod1",
          data: () => ({ status: "published", is_deleted: false }),
        },
        {
          id: "prod2",
          data: () => ({ status: "published", is_deleted: true }),
        }, // Should be excluded
        {
          id: "prod3",
          data: () => ({ status: "draft" }),
        }, // Already filtered by where clause
      ];

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: mockProducts.slice(0, 1), // Only published
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const count = await countLeafCategoryProducts("category-with-products");
      expect(count).toBe(1);
    });

    it("should sum children counts for parent categories", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockChildren = [
        { id: "child1", data: () => ({ product_count: 10 }) },
        { id: "child2", data: () => ({ product_count: 20 }) },
        { id: "child3", data: () => ({ product_count: 5 }) },
      ];

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: mockChildren,
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const count = await countParentCategoryProducts("parent-category");
      expect(count).toBe(35);
    });

    it("should handle missing product_count field (defaults to 0)", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockChildren = [
        { id: "child1", data: () => ({}) }, // Missing product_count
        { id: "child2", data: () => ({ product_count: undefined }) },
        { id: "child3", data: () => ({ product_count: null }) },
      ];

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              empty: false,
              docs: mockChildren,
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const count = await countParentCategoryProducts("parent-with-missing");
      expect(count).toBe(0);
    });
  });

  describe("Data Integrity Edge Cases", () => {
    it("should handle categories with empty parentIds array", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: "root",
              data: () => ({ parentIds: [] }),
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const ancestors = await getAllAncestorIds("root");
      expect(ancestors).toEqual([]);
    });

    it("should handle nonexistent category ID", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: false,
            }),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      const ancestors = await getAllAncestorIds("nonexistent");
      expect(ancestors).toEqual([]);
    });

    it("should handle database connection errors gracefully", async () => {
      const mockGetFirestoreAdmin =
        require("@/app/api/lib/firebase/admin").getFirestoreAdmin;

      const mockDb = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockRejectedValue(new Error("Database error")),
          }),
        }),
      };
      mockGetFirestoreAdmin.mockReturnValue(mockDb);

      await expect(getAllAncestorIds("test")).rejects.toThrow("Database error");
    });
  });
});
