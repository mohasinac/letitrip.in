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

describe("Category Utils", () => {
  // Test data
  const electronics: CategoryFE = {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices",
    parentIds: [],
    productCount: 100,
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const computers: CategoryFE = {
    id: "computers",
    name: "Computers",
    slug: "computers",
    description: "Computer systems",
    parentIds: ["electronics"],
    productCount: 50,
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const laptops: CategoryFE = {
    id: "laptops",
    name: "Laptops",
    slug: "laptops",
    description: "Portable computers",
    parentIds: ["computers"],
    productCount: 25,
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const clothing: CategoryFE = {
    id: "clothing",
    name: "Clothing",
    slug: "clothing",
    description: "Apparel and fashion",
    parentIds: [],
    productCount: 200,
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const shirts: CategoryFE = {
    id: "shirts",
    name: "Shirts",
    slug: "shirts",
    description: "Various shirts",
    parentIds: ["clothing"],
    productCount: 50,
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const allCategories = [electronics, computers, laptops, clothing, shirts];

  describe("getParentIds", () => {
    it("should return parentIds array", () => {
      expect(getParentIds(laptops)).toEqual(["computers"]);
    });

    it("should return empty array for root category", () => {
      expect(getParentIds(electronics)).toEqual([]);
    });

    it("should handle legacy parentId field", () => {
      const legacy = { ...laptops, parentId: "computers" };
      delete (legacy as any).parentIds;
      expect(getParentIds(legacy)).toEqual(["computers"]);
    });

    it("should prefer parentIds over parentId", () => {
      const category = { ...laptops, parentId: "other" };
      expect(getParentIds(category)).toEqual(["computers"]);
    });
  });

  describe("getChildrenIds", () => {
    it("should return childrenIds array", () => {
      const withChildren = {
        ...electronics,
        childrenIds: ["computers", "phones"],
      };
      expect(getChildrenIds(withChildren as any)).toEqual([
        "computers",
        "phones",
      ]);
    });

    it("should return empty array when no children", () => {
      expect(getChildrenIds(laptops)).toEqual([]);
    });
  });

  describe("hasParent", () => {
    it("should return true when category has the parent", () => {
      expect(hasParent(laptops, "computers")).toBe(true);
    });

    it("should return false when category doesn't have the parent", () => {
      expect(hasParent(laptops, "electronics")).toBe(false);
    });

    it("should return false for root category", () => {
      expect(hasParent(electronics, "anything")).toBe(false);
    });
  });

  describe("hasChild", () => {
    it("should return true when category has the child", () => {
      const withChildren = { ...electronics, childrenIds: ["computers"] };
      expect(hasChild(withChildren as any, "computers")).toBe(true);
    });

    it("should return false when category doesn't have the child", () => {
      expect(hasChild(electronics, "laptops")).toBe(false);
    });
  });

  describe("getAncestorIds", () => {
    it("should get all ancestor IDs", () => {
      const ancestors = getAncestorIds(laptops, allCategories);
      expect(ancestors).toContain("computers");
      expect(ancestors).toContain("electronics");
      expect(ancestors.length).toBe(2);
    });

    it("should return empty array for root category", () => {
      const ancestors = getAncestorIds(electronics, allCategories);
      expect(ancestors).toEqual([]);
    });

    it("should handle direct children", () => {
      const ancestors = getAncestorIds(computers, allCategories);
      expect(ancestors).toEqual(["electronics"]);
    });

    it("should prevent infinite loops with circular references", () => {
      const circular1 = { ...electronics, parentIds: ["circular2"] };
      const circular2 = {
        ...computers,
        id: "circular2",
        parentIds: ["electronics"],
      };
      const circularCategories = [circular1, circular2];

      const ancestors = getAncestorIds(circular1, circularCategories);
      expect(ancestors.length).toBeLessThan(10);
    });
  });

  describe("getDescendantIds", () => {
    it("should get all descendant IDs", () => {
      const elecWithChildren = { ...electronics, childrenIds: ["computers"] };
      const compWithChildren = { ...computers, childrenIds: ["laptops"] };
      const categories = [elecWithChildren, compWithChildren, laptops];

      const descendants = getDescendantIds(
        elecWithChildren as any,
        categories as any
      );
      expect(descendants).toContain("computers");
      expect(descendants).toContain("laptops");
      expect(descendants.length).toBe(2);
    });

    it("should return empty array for leaf category", () => {
      const descendants = getDescendantIds(laptops, allCategories);
      expect(descendants).toEqual([]);
    });

    it("should handle direct children only", () => {
      const elecWithChildren = { ...electronics, childrenIds: ["computers"] };
      const categories = [elecWithChildren, computers];

      const descendants = getDescendantIds(
        elecWithChildren as any,
        categories as any
      );
      expect(descendants).toEqual(["computers"]);
    });
  });

  describe("getBreadcrumbPath", () => {
    it("should build breadcrumb path from root to category", () => {
      const path = getBreadcrumbPath(laptops, allCategories);
      expect(path.map((c) => c.id)).toEqual([
        "electronics",
        "computers",
        "laptops",
      ]);
    });

    it("should return single item for root category", () => {
      const path = getBreadcrumbPath(electronics, allCategories);
      expect(path).toEqual([electronics]);
    });

    it("should handle direct children", () => {
      const path = getBreadcrumbPath(computers, allCategories);
      expect(path.map((c) => c.id)).toEqual(["electronics", "computers"]);
    });

    it("should use first parent when multiple parents", () => {
      const multiParent = {
        ...laptops,
        parentIds: ["computers", "electronics"],
      };
      const path = getBreadcrumbPath(multiParent, allCategories);
      expect(path[path.length - 2].id).toBe("computers");
    });

    it("should prevent infinite loops", () => {
      const circular1 = { ...electronics, parentIds: ["circular2"] };
      const circular2 = {
        ...computers,
        id: "circular2",
        parentIds: ["electronics"],
      };
      const circularCategories = [circular1, circular2];

      const path = getBreadcrumbPath(circular1, circularCategories);
      expect(path.length).toBeLessThan(10);
    });
  });

  describe("getAllBreadcrumbPaths", () => {
    it("should return all possible breadcrumb paths", () => {
      const paths = getAllBreadcrumbPaths(laptops, allCategories);
      expect(paths.length).toBe(1);
      expect(paths[0].map((c) => c.id)).toEqual([
        "electronics",
        "computers",
        "laptops",
      ]);
    });

    it("should return single path for root category", () => {
      const paths = getAllBreadcrumbPaths(electronics, allCategories);
      expect(paths.length).toBe(1);
      expect(paths[0]).toEqual([electronics]);
    });

    it("should handle multiple parent paths", () => {
      const category = { ...laptops, parentIds: ["computers", "electronics"] };
      const paths = getAllBreadcrumbPaths(category, allCategories);
      expect(paths.length).toBeGreaterThan(1);
    });
  });

  describe("getRootCategories", () => {
    it("should get all root categories", () => {
      const roots = getRootCategories(allCategories);
      expect(roots).toContainEqual(electronics);
      expect(roots).toContainEqual(clothing);
      expect(roots.length).toBe(2);
    });

    it("should return empty array when no roots", () => {
      const roots = getRootCategories([laptops, computers]);
      expect(roots).toEqual([]);
    });

    it("should handle legacy parentId field", () => {
      const legacy = { ...laptops, parentId: "computers" };
      delete (legacy as any).parentIds;
      const roots = getRootCategories([legacy, electronics]);
      expect(roots).toEqual([electronics]);
    });
  });

  describe("getLeafCategories", () => {
    it("should get all leaf categories", () => {
      const leaves = getLeafCategories(allCategories);
      expect(leaves).toContainEqual(laptops);
      expect(leaves).toContainEqual(shirts);
    });

    it("should exclude categories with children", () => {
      const withChildren = {
        ...electronics,
        childrenIds: ["computers"],
        hasChildren: true,
      };
      const leaves = getLeafCategories([withChildren, laptops] as any);
      expect(leaves).not.toContainEqual(withChildren);
      expect(leaves).toContainEqual(laptops);
    });

    it("should return all when none have children", () => {
      const categories = [laptops, shirts];
      const leaves = getLeafCategories(categories);
      expect(leaves.length).toBe(2);
    });
  });

  describe("buildCategoryTree", () => {
    it("should build category tree structure", () => {
      const tree = buildCategoryTree(allCategories);
      expect(tree.length).toBe(2); // electronics and clothing

      const elecNode = tree.find((t) => t.id === "electronics");
      expect(elecNode?.children.length).toBe(1);
      expect(elecNode?.children[0].id).toBe("computers");
      expect(elecNode?.children[0].children[0].id).toBe("laptops");
    });

    it("should handle empty array", () => {
      const tree = buildCategoryTree([]);
      expect(tree).toEqual([]);
    });

    it("should handle only root categories", () => {
      const tree = buildCategoryTree([electronics, clothing]);
      expect(tree.length).toBe(2);
      expect(tree[0].children).toEqual([]);
    });

    it("should handle multiple parents", () => {
      const multiParent = {
        ...laptops,
        parentIds: ["computers", "electronics"],
      };
      const categories = [electronics, computers, multiParent];
      const tree = buildCategoryTree(categories);

      const elecNode = tree.find((t) => t.id === "electronics");
      expect(elecNode?.children.length).toBeGreaterThan(0);
    });
  });

  describe("flattenCategoryTree", () => {
    it("should flatten tree to list", () => {
      const tree = buildCategoryTree(allCategories);
      const flattened = flattenCategoryTree(tree);

      expect(flattened.length).toBeGreaterThan(0);
      expect(flattened.map((c) => c.id)).toContain("electronics");
      expect(flattened.map((c) => c.id)).toContain("laptops");
    });

    it("should handle empty tree", () => {
      const flattened = flattenCategoryTree([]);
      expect(flattened).toEqual([]);
    });

    it("should not include children property", () => {
      const tree = buildCategoryTree([electronics, computers]);
      const flattened = flattenCategoryTree(tree);

      flattened.forEach((cat) => {
        expect((cat as any).children).toBeUndefined();
      });
    });
  });

  describe("wouldCreateCircularReference", () => {
    it("should detect circular reference", () => {
      const elecWithChildren = { ...electronics, childrenIds: ["computers"] };
      const compWithChildren = { ...computers, childrenIds: ["laptops"] };
      const categories = [elecWithChildren, compWithChildren, laptops] as any;

      const isCircular = wouldCreateCircularReference(
        "electronics",
        "laptops",
        categories
      );
      expect(isCircular).toBe(true);
    });

    it("should return false for valid parent", () => {
      const isCircular = wouldCreateCircularReference(
        "laptops",
        "computers",
        allCategories
      );
      expect(isCircular).toBe(false);
    });

    it("should return false for non-existent category", () => {
      const isCircular = wouldCreateCircularReference(
        "nonexistent",
        "electronics",
        allCategories
      );
      expect(isCircular).toBe(false);
    });
  });

  describe("getCategoryDepth", () => {
    it("should calculate category depth", () => {
      expect(getCategoryDepth(electronics, allCategories)).toBe(0);
      expect(getCategoryDepth(computers, allCategories)).toBe(1);
      expect(getCategoryDepth(laptops, allCategories)).toBe(2);
    });

    it("should handle root category", () => {
      expect(getCategoryDepth(clothing, allCategories)).toBe(0);
    });

    it("should return minimum depth with multiple parents", () => {
      const multiParent = {
        ...laptops,
        parentIds: ["computers", "electronics"],
      };
      const categories = [electronics, computers, multiParent];

      const depth = getCategoryDepth(multiParent, categories);
      expect(depth).toBeLessThanOrEqual(2);
    });
  });

  describe("getCategoryPathString", () => {
    it("should build path string with default separator", () => {
      const path = getCategoryPathString(laptops, allCategories);
      expect(path).toBe("Electronics > Computers > Laptops");
    });

    it("should use custom separator", () => {
      const path = getCategoryPathString(laptops, allCategories, " / ");
      expect(path).toBe("Electronics / Computers / Laptops");
    });

    it("should handle root category", () => {
      const path = getCategoryPathString(electronics, allCategories);
      expect(path).toBe("Electronics");
    });
  });

  describe("searchCategories", () => {
    it("should search by name", () => {
      const results = searchCategories(allCategories, "laptop");
      expect(results).toContainEqual(laptops);
      expect(results.length).toBe(1);
    });

    it("should search by slug", () => {
      const results = searchCategories(allCategories, "clothing");
      expect(results).toContainEqual(clothing);
    });

    it("should search by description", () => {
      const results = searchCategories(allCategories, "portable");
      expect(results).toContainEqual(laptops);
    });

    it("should be case insensitive", () => {
      const results = searchCategories(allCategories, "LAPTOP");
      expect(results).toContainEqual(laptops);
    });

    it("should return empty array when no match", () => {
      const results = searchCategories(allCategories, "nonexistent");
      expect(results).toEqual([]);
    });

    it("should return multiple matches", () => {
      const results = searchCategories(allCategories, "e");
      expect(results.length).toBeGreaterThan(1);
    });
  });

  describe("getCategoriesByParent", () => {
    it("should get categories by parent", () => {
      const children = getCategoriesByParent("electronics", allCategories);
      expect(children).toContainEqual(computers);
      expect(children.length).toBe(1);
    });

    it("should return empty array for leaf category", () => {
      const children = getCategoriesByParent("laptops", allCategories);
      expect(children).toEqual([]);
    });

    it("should return multiple children", () => {
      const children = getCategoriesByParent("clothing", allCategories);
      expect(children).toContainEqual(shirts);
    });
  });

  describe("validateCategory", () => {
    it("should validate valid category", () => {
      const result = validateCategory(laptops, allCategories);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should detect missing ID", () => {
      const invalid = { ...laptops, id: "" };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Category ID is required");
    });

    it("should detect missing name", () => {
      const invalid = { ...laptops, name: "" };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Category name is required");
    });

    it("should detect missing slug", () => {
      const invalid = { ...laptops, slug: "" };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Category slug is required");
    });

    it("should detect invalid parent reference", () => {
      const invalid = { ...laptops, parentIds: ["nonexistent"] };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Parent category"))).toBe(
        true
      );
    });

    it("should detect invalid children reference", () => {
      const invalid = { ...electronics, childrenIds: ["nonexistent"] } as any;
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Child category"))).toBe(
        true
      );
    });

    it("should detect circular references", () => {
      const elecWithChildren = { ...electronics, childrenIds: ["computers"] };
      const compWithChildren = { ...computers, childrenIds: ["laptops"] };
      const circularLaptop = {
        ...laptops,
        parentIds: ["computers", "electronics"],
      };
      const categories = [
        elecWithChildren,
        compWithChildren,
        circularLaptop,
      ] as any;

      const circularElec = { ...elecWithChildren, parentIds: ["laptops"] };
      const result = validateCategory(circularElec as any, categories);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Circular reference"))).toBe(
        true
      );
    });

    it("should return multiple errors", () => {
      const invalid = { ...laptops, id: "", name: "", slug: "" };
      const result = validateCategory(invalid, allCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
