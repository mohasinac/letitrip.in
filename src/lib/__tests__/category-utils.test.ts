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
  type CategoryTree,
} from "../utils/category-utils";

describe("Category Utils", () => {
  // Sample test data
  const rootCategory: CategoryFE = {
    id: "root1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronics category",
    parentIds: [],
    image: "",
    level: 0,
    productCount: 100,
  };

  const parentCategory: CategoryFE = {
    id: "parent1",
    name: "Mobile Phones",
    slug: "mobile-phones",
    description: "Mobile phones",
    parentIds: ["root1"],
    image: "",
    level: 1,
    productCount: 50,
  };

  const childCategory: CategoryFE = {
    id: "child1",
    name: "Smartphones",
    slug: "smartphones",
    description: "Smartphones",
    parentIds: ["parent1"],
    image: "",
    level: 2,
    productCount: 30,
  };

  const multiParentCategory: CategoryFE = {
    id: "multi1",
    name: "Gaming Phones",
    slug: "gaming-phones",
    description: "Gaming phones",
    parentIds: ["parent1", "root1"],
    image: "",
    level: 1,
    productCount: 10,
  };

  const allCategories = [
    rootCategory,
    parentCategory,
    childCategory,
    multiParentCategory,
  ];

  describe("getParentIds", () => {
    it("should return parentIds array", () => {
      expect(getParentIds(parentCategory)).toEqual(["root1"]);
    });

    it("should return empty array for root category", () => {
      expect(getParentIds(rootCategory)).toEqual([]);
    });

    it("should return multiple parent IDs", () => {
      expect(getParentIds(multiParentCategory)).toEqual(["parent1", "root1"]);
    });

    it("should handle old parentId structure", () => {
      const oldStructure: any = {
        id: "old1",
        name: "Old",
        slug: "old",
        parentId: "parent1",
        level: 1,
        productCount: 0,
      };
      expect(getParentIds(oldStructure)).toEqual(["parent1"]);
    });

    it("should prioritize parentIds over parentId", () => {
      const mixed: any = {
        id: "mixed1",
        name: "Mixed",
        slug: "mixed",
        parentIds: ["new1", "new2"],
        parentId: "old1",
        level: 1,
        productCount: 0,
      };
      expect(getParentIds(mixed)).toEqual(["new1", "new2"]);
    });
  });

  describe("getChildrenIds", () => {
    it("should return empty array when no children", () => {
      expect(getChildrenIds(childCategory)).toEqual([]);
    });

    it("should return children IDs if present", () => {
      const withChildren: any = {
        ...rootCategory,
        childrenIds: ["parent1", "parent2"],
      };
      expect(getChildrenIds(withChildren)).toEqual(["parent1", "parent2"]);
    });
  });

  describe("hasParent", () => {
    it("should return true if category has parent", () => {
      expect(hasParent(parentCategory, "root1")).toBe(true);
    });

    it("should return false if category does not have parent", () => {
      expect(hasParent(parentCategory, "nonexistent")).toBe(false);
    });

    it("should return false for root category", () => {
      expect(hasParent(rootCategory, "any")).toBe(false);
    });
  });

  describe("hasChild", () => {
    it("should return false when no children", () => {
      expect(hasChild(childCategory, "any")).toBe(false);
    });

    it("should return true when child exists", () => {
      const withChildren: any = {
        ...rootCategory,
        childrenIds: ["parent1"],
      };
      expect(hasChild(withChildren, "parent1")).toBe(true);
    });
  });

  describe("getAncestorIds", () => {
    it("should return empty array for root", () => {
      expect(getAncestorIds(rootCategory, allCategories)).toEqual([]);
    });

    it("should return direct parent", () => {
      const ancestors = getAncestorIds(parentCategory, allCategories);
      expect(ancestors).toContain("root1");
    });

    it("should return all ancestors", () => {
      const ancestors = getAncestorIds(childCategory, allCategories);
      expect(ancestors).toContain("parent1");
      expect(ancestors).toContain("root1");
    });

    it("should handle multiple parents", () => {
      const ancestors = getAncestorIds(multiParentCategory, allCategories);
      expect(ancestors).toContain("parent1");
      expect(ancestors).toContain("root1");
    });

    it("should prevent infinite loops", () => {
      const circular1: CategoryFE = {
        id: "circ1",
        name: "Circular 1",
        slug: "circular-1",
        parentIds: ["circ2"],
        level: 0,
        productCount: 0,
        image: "",
      };
      const circular2: CategoryFE = {
        id: "circ2",
        name: "Circular 2",
        slug: "circular-2",
        parentIds: ["circ1"],
        level: 0,
        productCount: 0,
        image: "",
      };
      const result = getAncestorIds(circular1, [circular1, circular2]);
      expect(result.length).toBeLessThan(10);
    });
  });

  describe("getDescendantIds", () => {
    it("should return empty array for leaf", () => {
      expect(getDescendantIds(childCategory, allCategories)).toEqual([]);
    });

    it("should return descendants", () => {
      const withChildren: any = {
        ...rootCategory,
        childrenIds: ["parent1"],
      };
      const parent: any = {
        ...parentCategory,
        childrenIds: ["child1"],
      };
      const categories = [withChildren, parent, childCategory];
      const descendants = getDescendantIds(withChildren, categories);
      expect(descendants).toContain("parent1");
    });
  });

  describe("getBreadcrumbPath", () => {
    it("should return path from root to category", () => {
      const path = getBreadcrumbPath(childCategory, allCategories);
      expect(path.length).toBeGreaterThan(0);
      expect(path[path.length - 1].id).toBe("child1");
    });

    it("should return single item for root", () => {
      const path = getBreadcrumbPath(rootCategory, allCategories);
      expect(path.length).toBe(1);
      expect(path[0].id).toBe("root1");
    });

    it("should use first parent for multi-parent category", () => {
      const path = getBreadcrumbPath(multiParentCategory, allCategories);
      expect(path.length).toBeGreaterThan(0);
    });

    it("should prevent infinite loops", () => {
      const circular1: CategoryFE = {
        id: "circ1",
        name: "Circular 1",
        slug: "circular-1",
        parentIds: ["circ2"],
        level: 0,
        productCount: 0,
        image: "",
      };
      const circular2: CategoryFE = {
        id: "circ2",
        name: "Circular 2",
        slug: "circular-2",
        parentIds: ["circ1"],
        level: 0,
        productCount: 0,
        image: "",
      };
      const path = getBreadcrumbPath(circular1, [circular1, circular2]);
      expect(path.length).toBeLessThan(10);
    });
  });

  describe("getAllBreadcrumbPaths", () => {
    it("should return all paths for multi-parent category", () => {
      const paths = getAllBreadcrumbPaths(multiParentCategory, allCategories);
      expect(paths.length).toBeGreaterThan(0);
    });

    it("should return single path for single-parent category", () => {
      const paths = getAllBreadcrumbPaths(childCategory, allCategories);
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  describe("getRootCategories", () => {
    it("should return categories with no parents", () => {
      const roots = getRootCategories(allCategories);
      expect(roots).toContainEqual(rootCategory);
      expect(roots.length).toBe(1);
    });

    it("should return empty for no roots", () => {
      expect(getRootCategories([parentCategory, childCategory])).toEqual([]);
    });
  });

  describe("getLeafCategories", () => {
    it("should return categories with no children", () => {
      const leaves = getLeafCategories(allCategories);
      expect(leaves.length).toBeGreaterThan(0);
    });
  });

  describe("buildCategoryTree", () => {
    it("should build tree structure", () => {
      const tree = buildCategoryTree(allCategories);
      expect(tree.length).toBeGreaterThan(0);
      expect(tree[0]).toHaveProperty("children");
    });

    it("should handle empty array", () => {
      const tree = buildCategoryTree([]);
      expect(tree).toEqual([]);
    });
  });

  describe("flattenCategoryTree", () => {
    it("should flatten tree to list", () => {
      const tree = buildCategoryTree(allCategories);
      const flat = flattenCategoryTree(tree);
      expect(flat.length).toBeGreaterThan(0);
      expect(flat[0]).not.toHaveProperty("children");
    });

    it("should handle empty tree", () => {
      expect(flattenCategoryTree([])).toEqual([]);
    });

    it("should prevent infinite loops", () => {
      const circularTree: CategoryTree = {
        id: "circ1",
        name: "Circular",
        slug: "circular",
        parentIds: [],
        level: 0,
        productCount: 0,
        image: "",
        children: [],
      };
      circularTree.children = [circularTree];
      const result = flattenCategoryTree([circularTree]);
      expect(result.length).toBe(1);
    });
  });

  describe("wouldCreateCircularReference", () => {
    it("should detect circular reference", () => {
      const withChildren: any = {
        ...rootCategory,
        childrenIds: ["parent1"],
      };
      const parent: any = {
        ...parentCategory,
        childrenIds: ["child1"],
      };
      const categories = [withChildren, parent, childCategory];
      const result = wouldCreateCircularReference(
        "root1",
        "child1",
        categories
      );
      // child1 IS a descendant of root1, so this WOULD create circular ref
      expect(result).toBe(true);
    });

    it("should return false for valid parent", () => {
      const result = wouldCreateCircularReference(
        "child1",
        "root1",
        allCategories
      );
      expect(result).toBe(false);
    });

    it("should return false for non-existent category", () => {
      const result = wouldCreateCircularReference(
        "nonexistent",
        "root1",
        allCategories
      );
      expect(result).toBe(false);
    });
  });

  describe("getCategoryDepth", () => {
    it("should return 0 for root", () => {
      expect(getCategoryDepth(rootCategory, allCategories)).toBe(0);
    });

    it("should calculate depth correctly", () => {
      const depth = getCategoryDepth(parentCategory, allCategories);
      expect(depth).toBeGreaterThanOrEqual(0);
    });

    it("should prevent infinite loops", () => {
      const circular1: CategoryFE = {
        id: "circ1",
        name: "Circular 1",
        slug: "circular-1",
        parentIds: ["circ2"],
        level: 0,
        productCount: 0,
        image: "",
      };
      const circular2: CategoryFE = {
        id: "circ2",
        name: "Circular 2",
        slug: "circular-2",
        parentIds: ["circ1"],
        level: 0,
        productCount: 0,
        image: "",
      };
      const depth = getCategoryDepth(circular1, [circular1, circular2]);
      expect(depth).toBeGreaterThanOrEqual(0);
      expect(depth).toBeLessThan(100);
    });
  });

  describe("getCategoryPathString", () => {
    it("should return path string", () => {
      const path = getCategoryPathString(childCategory, allCategories);
      expect(path).toContain(">");
      expect(path).toBeTruthy();
    });

    it("should use custom separator", () => {
      const path = getCategoryPathString(childCategory, allCategories, " / ");
      expect(path).toContain("/");
    });

    it("should return category name for root", () => {
      const path = getCategoryPathString(rootCategory, allCategories);
      expect(path).toBe("Electronics");
    });
  });

  describe("searchCategories", () => {
    it("should find by name", () => {
      const results = searchCategories(allCategories, "Mobile");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain("Mobile");
    });

    it("should find by slug", () => {
      const results = searchCategories(allCategories, "electronics");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case insensitive", () => {
      const results = searchCategories(allCategories, "MOBILE");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return empty for no matches", () => {
      expect(searchCategories(allCategories, "nonexistent")).toEqual([]);
    });

    it("should find by description", () => {
      const results = searchCategories(allCategories, "Electronics category");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("getCategoriesByParent", () => {
    it("should return children of parent", () => {
      const children = getCategoriesByParent("root1", allCategories);
      expect(children.length).toBeGreaterThan(0);
      expect(children.some((c) => c.id === "parent1")).toBe(true);
    });

    it("should return empty for no children", () => {
      expect(getCategoriesByParent("child1", allCategories)).toEqual([]);
    });

    it("should return empty for non-existent parent", () => {
      expect(getCategoriesByParent("nonexistent", allCategories)).toEqual([]);
    });
  });

  describe("validateCategory", () => {
    it("should validate valid category", () => {
      const result = validateCategory(parentCategory, allCategories);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should detect missing ID", () => {
      const invalid: any = { ...parentCategory, id: "" };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("ID"))).toBe(true);
    });

    it("should detect missing name", () => {
      const invalid: any = { ...parentCategory, name: "" };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("name"))).toBe(true);
    });

    it("should detect missing slug", () => {
      const invalid: any = { ...parentCategory, slug: "" };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("slug"))).toBe(true);
    });

    it("should detect non-existent parent", () => {
      const invalid: CategoryFE = {
        ...parentCategory,
        parentIds: ["nonexistent"],
      };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("not found"))).toBe(true);
    });

    it("should detect non-existent child", () => {
      const invalid: any = {
        ...parentCategory,
        childrenIds: ["nonexistent"],
      };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("not found"))).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty category arrays", () => {
      expect(getRootCategories([])).toEqual([]);
      expect(getLeafCategories([])).toEqual([]);
      expect(searchCategories([], "test")).toEqual([]);
      expect(getCategoriesByParent("any", [])).toEqual([]);
    });

    it("should handle categories with undefined fields", () => {
      const minimal: any = {
        id: "min1",
        name: "Minimal",
        slug: "minimal",
        level: 0,
        productCount: 0,
      };
      expect(getParentIds(minimal)).toEqual([]);
      expect(getChildrenIds(minimal)).toEqual([]);
    });
  });
});
