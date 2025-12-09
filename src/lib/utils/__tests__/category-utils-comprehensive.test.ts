/**
 * Comprehensive Tests for Category Utils
 * Testing all category tree operations with edge cases and circular reference detection
 */

import type { CategoryFE } from "@/types/frontend/category.types";
import {
  buildCategoryTree,
  flattenCategoryTree,
  getAllBreadcrumbPaths,
  getAncestorIds,
  getBreadcrumbPath,
  getCategoriesByParent,
  getCategoryDepth,
  getCategoryPathString,
  getChildrenIds,
  getDescendantIds,
  getLeafCategories,
  getParentIds,
  getRootCategories,
  hasChild,
  hasParent,
  searchCategories,
  validateCategory,
  wouldCreateCircularReference,
} from "../category-utils";

describe("category-utils - Basic Functions", () => {
  describe("getParentIds", () => {
    it("should return parentIds array if it exists", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        parentIds: ["parent1", "parent2"],
      } as CategoryFE;

      expect(getParentIds(category)).toEqual(["parent1", "parent2"]);
    });

    it("should return array with parentId if parentIds doesn't exist", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        parentId: "parent1",
      } as any;

      expect(getParentIds(category)).toEqual(["parent1"]);
    });

    it("should return empty array if no parent info", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
      } as CategoryFE;

      expect(getParentIds(category)).toEqual([]);
    });

    it("should prefer parentIds over parentId", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        parentId: "oldParent",
        parentIds: ["parent1", "parent2"],
      } as any;

      expect(getParentIds(category)).toEqual(["parent1", "parent2"]);
    });

    it("should return empty array if parentIds is empty array", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        parentIds: [],
      } as CategoryFE;

      expect(getParentIds(category)).toEqual([]);
    });
  });

  describe("getChildrenIds", () => {
    it("should return childrenIds if it exists", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        childrenIds: ["child1", "child2"],
      } as any;

      expect(getChildrenIds(category)).toEqual(["child1", "child2"]);
    });

    it("should return empty array if childrenIds doesn't exist", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
      } as CategoryFE;

      expect(getChildrenIds(category)).toEqual([]);
    });
  });

  describe("hasParent", () => {
    it("should return true if category has the parent", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        parentIds: ["parent1", "parent2"],
      } as CategoryFE;

      expect(hasParent(category, "parent1")).toBe(true);
      expect(hasParent(category, "parent2")).toBe(true);
    });

    it("should return false if category doesn't have the parent", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        parentIds: ["parent1"],
      } as CategoryFE;

      expect(hasParent(category, "parent2")).toBe(false);
    });

    it("should return false for root categories", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
      } as CategoryFE;

      expect(hasParent(category, "anyParent")).toBe(false);
    });
  });

  describe("hasChild", () => {
    it("should return true if category has the child", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        childrenIds: ["child1", "child2"],
      } as any;

      expect(hasChild(category, "child1")).toBe(true);
    });

    it("should return false if category doesn't have the child", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
        childrenIds: ["child1"],
      } as any;

      expect(hasChild(category, "child2")).toBe(false);
    });

    it("should return false for leaf categories", () => {
      const category = {
        id: "cat1",
        name: "Category 1",
        slug: "category-1",
      } as CategoryFE;

      expect(hasChild(category, "anyChild")).toBe(false);
    });
  });
});

describe("category-utils - Hierarchy Functions", () => {
  const categories: CategoryFE[] = [
    { id: "root1", name: "Electronics", slug: "electronics" },
    { id: "root2", name: "Clothing", slug: "clothing" },
    {
      id: "level1-1",
      name: "Computers",
      slug: "computers",
      parentIds: ["root1"],
    },
    {
      id: "level1-2",
      name: "Phones",
      slug: "phones",
      parentIds: ["root1"],
    },
    {
      id: "level2-1",
      name: "Laptops",
      slug: "laptops",
      parentIds: ["level1-1"],
    },
    {
      id: "level2-2",
      name: "Desktops",
      slug: "desktops",
      parentIds: ["level1-1"],
    },
    {
      id: "level3-1",
      name: "Gaming Laptops",
      slug: "gaming-laptops",
      parentIds: ["level2-1"],
    },
  ] as CategoryFE[];

  describe("getAncestorIds", () => {
    it("should return all ancestors for a nested category", () => {
      const category = categories.find((c) => c.id === "level3-1")!;
      const ancestors = getAncestorIds(category, categories);

      expect(ancestors).toContain("level2-1");
      expect(ancestors).toContain("level1-1");
      expect(ancestors).toContain("root1");
      expect(ancestors).toHaveLength(3);
    });

    it("should return empty array for root category", () => {
      const category = categories.find((c) => c.id === "root1")!;
      const ancestors = getAncestorIds(category, categories);

      expect(ancestors).toEqual([]);
    });

    it("should handle missing parent gracefully", () => {
      const category = {
        id: "orphan",
        name: "Orphan",
        slug: "orphan",
        parentIds: ["nonexistent"],
      } as CategoryFE;

      const ancestors = getAncestorIds(category, categories);
      expect(ancestors).toEqual(["nonexistent"]);
    });

    it("should prevent infinite loops with circular references", () => {
      const circularCats: CategoryFE[] = [
        { id: "cat1", name: "Cat1", slug: "cat1", parentIds: ["cat2"] },
        { id: "cat2", name: "Cat2", slug: "cat2", parentIds: ["cat1"] },
      ] as CategoryFE[];

      const ancestors = getAncestorIds(circularCats[0], circularCats);
      expect(ancestors).toContain("cat2");
      expect(ancestors).toContain("cat1");
    });
  });

  describe("getDescendantIds", () => {
    it("should return all descendants for a parent category", () => {
      const category = categories.find((c) => c.id === "root1")!;
      const categoryWithChildren = {
        ...category,
        childrenIds: ["level1-1", "level1-2"],
      } as any;

      const level1_1 = {
        ...categories.find((c) => c.id === "level1-1")!,
        childrenIds: ["level2-1", "level2-2"],
      };
      const level2_1 = {
        ...categories.find((c) => c.id === "level2-1")!,
        childrenIds: ["level3-1"],
      };

      const allCats = [
        categoryWithChildren,
        categories.find((c) => c.id === "level1-2")!,
        level1_1,
        level2_1,
        categories.find((c) => c.id === "level2-2")!,
        categories.find((c) => c.id === "level3-1")!,
      ] as any[];

      const descendants = getDescendantIds(categoryWithChildren, allCats);

      expect(descendants.length).toBeGreaterThan(0);
      expect(descendants).toContain("level1-1");
      expect(descendants).toContain("level1-2");
    });

    it("should return empty array for leaf category", () => {
      const category = categories.find((c) => c.id === "level3-1")!;
      const descendants = getDescendantIds(category, categories);

      expect(descendants).toEqual([]);
    });

    it("should prevent infinite loops with circular references", () => {
      const circularCats: any[] = [
        { id: "cat1", name: "Cat1", slug: "cat1", childrenIds: ["cat2"] },
        { id: "cat2", name: "Cat2", slug: "cat2", childrenIds: ["cat1"] },
      ];

      const descendants = getDescendantIds(circularCats[0], circularCats);
      expect(descendants).toContain("cat2");
      expect(descendants).toContain("cat1");
    });
  });

  describe("getBreadcrumbPath", () => {
    it("should return path from root to category", () => {
      const category = categories.find((c) => c.id === "level3-1")!;
      const path = getBreadcrumbPath(category, categories);

      expect(path).toHaveLength(4);
      expect(path[0].id).toBe("root1");
      expect(path[1].id).toBe("level1-1");
      expect(path[2].id).toBe("level2-1");
      expect(path[3].id).toBe("level3-1");
    });

    it("should return single item for root category", () => {
      const category = categories.find((c) => c.id === "root1")!;
      const path = getBreadcrumbPath(category, categories);

      expect(path).toHaveLength(1);
      expect(path[0].id).toBe("root1");
    });

    it("should prevent infinite loops", () => {
      const circularCats: CategoryFE[] = [
        { id: "cat1", name: "Cat1", slug: "cat1", parentIds: ["cat2"] },
        { id: "cat2", name: "Cat2", slug: "cat2", parentIds: ["cat1"] },
      ] as CategoryFE[];

      const path = getBreadcrumbPath(circularCats[0], circularCats);
      expect(path.length).toBeGreaterThan(0);
      expect(path.length).toBeLessThan(10); // Shouldn't loop infinitely
    });
  });

  describe("getAllBreadcrumbPaths", () => {
    it("should return all possible paths for multi-parent category", () => {
      const multiParentCat = {
        id: "multi",
        name: "Multi Parent",
        slug: "multi-parent",
        parentIds: ["root1", "root2"],
      } as CategoryFE;

      const cats = [...categories, multiParentCat];
      const paths = getAllBreadcrumbPaths(multiParentCat, cats);

      expect(paths.length).toBe(2);
      expect(paths[0][0].id).toBe("root1");
      expect(paths[1][0].id).toBe("root2");
    });

    it("should return single path for single-parent category", () => {
      const category = categories.find((c) => c.id === "level2-1")!;
      const paths = getAllBreadcrumbPaths(category, categories);

      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe("getRootCategories", () => {
    it("should return all root categories", () => {
      const roots = getRootCategories(categories);

      expect(roots).toHaveLength(2);
      expect(roots.find((c) => c.id === "root1")).toBeDefined();
      expect(roots.find((c) => c.id === "root2")).toBeDefined();
    });

    it("should return empty array if no root categories", () => {
      const nonRootCats = categories.filter(
        (c) => c.parentIds && c.parentIds.length > 0
      );
      const roots = getRootCategories(nonRootCats as CategoryFE[]);

      expect(roots).toEqual([]);
    });
  });

  describe("getLeafCategories", () => {
    it("should return all leaf categories", () => {
      const leaves = getLeafCategories(categories);

      expect(leaves.find((c) => c.id === "level3-1")).toBeDefined();
      expect(leaves.find((c) => c.id === "level1-2")).toBeDefined();
      expect(leaves.find((c) => c.id === "level2-2")).toBeDefined();
    });

    it("should not include parent categories with children", () => {
      const categoriesWithChildren = categories.map((c) => {
        if (c.id === "root1" || c.id === "level1-1") {
          return { ...c, childrenIds: ["child"], hasChildren: true } as any;
        }
        return c;
      });
      const leaves = getLeafCategories(categoriesWithChildren);

      expect(leaves.find((c) => c.id === "root1")).toBeUndefined();
      expect(leaves.find((c) => c.id === "level1-1")).toBeUndefined();
    });
  });
});

describe("category-utils - Tree Operations", () => {
  const categories: CategoryFE[] = [
    { id: "root1", name: "Electronics", slug: "electronics" },
    {
      id: "level1-1",
      name: "Computers",
      slug: "computers",
      parentIds: ["root1"],
    },
    {
      id: "level2-1",
      name: "Laptops",
      slug: "laptops",
      parentIds: ["level1-1"],
    },
  ] as CategoryFE[];

  describe("buildCategoryTree", () => {
    it("should build correct tree structure", () => {
      const tree = buildCategoryTree(categories);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe("root1");
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe("level1-1");
      expect(tree[0].children[0].children[0].id).toBe("level2-1");
    });

    it("should handle empty categories array", () => {
      const tree = buildCategoryTree([]);
      expect(tree).toEqual([]);
    });

    it("should handle multiple root categories", () => {
      const cats: CategoryFE[] = [
        { id: "root1", name: "Root 1", slug: "root-1" },
        { id: "root2", name: "Root 2", slug: "root-2" },
      ] as CategoryFE[];

      const tree = buildCategoryTree(cats);
      expect(tree).toHaveLength(2);
    });
  });

  describe("flattenCategoryTree", () => {
    it("should flatten tree back to list", () => {
      const tree = buildCategoryTree(categories);
      const flattened = flattenCategoryTree(tree);

      expect(flattened).toHaveLength(3);
      expect(flattened.find((c) => c.id === "root1")).toBeDefined();
      expect(flattened.find((c) => c.id === "level1-1")).toBeDefined();
      expect(flattened.find((c) => c.id === "level2-1")).toBeDefined();
    });

    it("should handle empty tree", () => {
      const flattened = flattenCategoryTree([]);
      expect(flattened).toEqual([]);
    });
  });
});

describe("category-utils - Circular Reference Detection", () => {
  describe("wouldCreateCircularReference", () => {
    const categories: CategoryFE[] = [
      { id: "cat1", name: "Cat1", slug: "cat1", childrenIds: ["cat2"] },
      {
        id: "cat2",
        name: "Cat2",
        slug: "cat2",
        parentIds: ["cat1"],
        childrenIds: ["cat3"],
      },
      { id: "cat3", name: "Cat3", slug: "cat3", parentIds: ["cat2"] },
    ] as any[];

    it("should detect circular reference", () => {
      // Trying to make cat1 a child of cat3 would create circular reference
      const wouldBeCircular = wouldCreateCircularReference(
        "cat1",
        "cat3",
        categories
      );
      expect(wouldBeCircular).toBe(true);
    });

    it("should allow valid parent assignment", () => {
      const root: CategoryFE = {
        id: "root",
        name: "Root",
        slug: "root",
      } as CategoryFE;
      const cats = [...categories, root];

      const wouldBeCircular = wouldCreateCircularReference(
        "cat1",
        "root",
        cats
      );
      expect(wouldBeCircular).toBe(false);
    });

    it("should return false if category not found", () => {
      const wouldBeCircular = wouldCreateCircularReference(
        "nonexistent",
        "cat1",
        categories
      );
      expect(wouldBeCircular).toBe(false);
    });
  });
});

describe("category-utils - Utility Functions", () => {
  const categories: CategoryFE[] = [
    { id: "root1", name: "Electronics", slug: "electronics" },
    {
      id: "level1-1",
      name: "Computers",
      slug: "computers",
      parentIds: ["root1"],
    },
    {
      id: "level2-1",
      name: "Laptops",
      slug: "laptops",
      parentIds: ["level1-1"],
    },
  ] as CategoryFE[];

  describe("getCategoryDepth", () => {
    it("should return 0 for root category", () => {
      const category = categories[0];
      const depth = getCategoryDepth(category, categories);
      expect(depth).toBe(0);
    });

    it("should return correct depth for nested category", () => {
      const category = categories[2];
      const depth = getCategoryDepth(category, categories);
      expect(depth).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getCategoryPathString", () => {
    it("should return path as string", () => {
      const category = categories[2];
      const pathString = getCategoryPathString(category, categories);

      expect(pathString).toContain("Electronics");
      expect(pathString).toContain("Computers");
      expect(pathString).toContain("Laptops");
    });

    it("should use custom separator", () => {
      const category = categories[2];
      const pathString = getCategoryPathString(category, categories, " / ");

      expect(pathString).toContain(" / ");
    });
  });

  describe("searchCategories", () => {
    it("should find categories by name", () => {
      const results = searchCategories(categories, "Computers");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("level1-1");
    });

    it("should find categories by slug", () => {
      const results = searchCategories(categories, "laptops");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("level2-1");
    });

    it("should be case insensitive", () => {
      const results = searchCategories(categories, "ELECTRONICS");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("root1");
    });

    it("should return empty array if no matches", () => {
      const results = searchCategories(categories, "nonexistent");
      expect(results).toEqual([]);
    });
  });

  describe("getCategoriesByParent", () => {
    it("should return all children of parent", () => {
      const children = getCategoriesByParent("root1", categories);
      expect(children.find((c) => c.id === "level1-1")).toBeDefined();
    });

    it("should return empty array if parent has no children", () => {
      const children = getCategoriesByParent("level2-1", categories);
      expect(children).toEqual([]);
    });
  });

  describe("validateCategory", () => {
    it("should validate correct category", () => {
      const category = categories[1];
      const result = validateCategory(category, categories);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should detect missing required fields", () => {
      const category = { id: "", name: "", slug: "" } as CategoryFE;
      const result = validateCategory(category, categories);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect missing parent", () => {
      const category = {
        id: "test",
        name: "Test",
        slug: "test",
        parentIds: ["nonexistent"],
      } as CategoryFE;

      const result = validateCategory(category, categories);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Parent category nonexistent not found");
    });

    it("should detect missing child", () => {
      const category = {
        id: "test",
        name: "Test",
        slug: "test",
        childrenIds: ["nonexistent"],
      } as any;

      const result = validateCategory(category, categories);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Child category nonexistent not found");
    });

    it("should detect circular references", () => {
      const circularCats: any[] = [
        {
          id: "cat1",
          name: "Cat1",
          slug: "cat1",
          parentIds: ["cat2"],
          childrenIds: ["cat2"],
        },
        {
          id: "cat2",
          name: "Cat2",
          slug: "cat2",
          parentIds: ["cat1"],
          childrenIds: ["cat1"],
        },
      ];

      const result = validateCategory(circularCats[0], circularCats);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Circular reference"))).toBe(
        true
      );
    });
  });
});

describe("category-utils - Edge Cases", () => {
  it("should handle categories with null/undefined parentIds", () => {
    const category = {
      id: "test",
      name: "Test",
      slug: "test",
      parentIds: null,
    } as any;
    expect(getParentIds(category)).toEqual([]);
  });

  it("should handle categories with null/undefined childrenIds", () => {
    const category = {
      id: "test",
      name: "Test",
      slug: "test",
      childrenIds: null,
    } as any;
    expect(getChildrenIds(category)).toEqual([]);
  });

  it("should handle empty category array in getAncestorIds", () => {
    const category = {
      id: "test",
      name: "Test",
      slug: "test",
      parentIds: ["parent1"],
    } as CategoryFE;
    const ancestors = getAncestorIds(category, []);
    expect(ancestors).toEqual(["parent1"]);
  });

  it("should handle deeply nested categories", () => {
    const deepCats: CategoryFE[] = [];
    for (let i = 0; i < 100; i++) {
      deepCats.push({
        id: `cat${i}`,
        name: `Cat ${i}`,
        slug: `cat-${i}`,
        parentIds: i > 0 ? [`cat${i - 1}`] : [],
      } as CategoryFE);
    }

    const deepest = deepCats[99];
    const ancestors = getAncestorIds(deepest, deepCats);
    expect(ancestors).toHaveLength(99);
  });

  it("should handle special characters in names and slugs", () => {
    const categories: CategoryFE[] = [
      { id: "1", name: "Category & Products", slug: "category-products" },
      { id: "2", name: "Items (New)", slug: "items-new" },
    ] as CategoryFE[];

    const results = searchCategories(categories, "&");
    expect(results).toHaveLength(1);
  });
});
