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

  // BUG FIX #32: Comprehensive input validation edge case tests
  describe("BUG FIX #32: Input Validation Edge Cases", () => {
    describe("getParentIds validation", () => {
      it("should throw error for null category", () => {
        expect(() => getParentIds(null as any)).toThrow("Category is required");
      });

      it("should throw error for undefined category", () => {
        expect(() => getParentIds(undefined as any)).toThrow(
          "Category is required"
        );
      });

      it("should handle category with empty parentIds array", () => {
        const cat = { ...electronics, parentIds: [] };
        expect(getParentIds(cat)).toEqual([]);
      });

      it("should handle category with no parentId or parentIds", () => {
        const cat = { ...electronics };
        delete (cat as any).parentIds;
        delete (cat as any).parentId;
        expect(getParentIds(cat)).toEqual([]);
      });
    });

    describe("getChildrenIds validation", () => {
      it("should throw error for null category", () => {
        expect(() => getChildrenIds(null as any)).toThrow(
          "Category is required"
        );
      });

      it("should throw error for undefined category", () => {
        expect(() => getChildrenIds(undefined as any)).toThrow(
          "Category is required"
        );
      });

      it("should return empty array when no childrenIds", () => {
        const cat = { ...electronics };
        expect(getChildrenIds(cat)).toEqual([]);
      });
    });

    describe("getAncestorIds validation", () => {
      it("should throw error for null category", () => {
        expect(() => getAncestorIds(null as any, allCategories)).toThrow(
          "Category is required"
        );
      });

      it("should throw error for undefined category", () => {
        expect(() => getAncestorIds(undefined as any, allCategories)).toThrow(
          "Category is required"
        );
      });

      it("should throw error for null allCategories", () => {
        expect(() => getAncestorIds(laptops, null as any)).toThrow(
          "allCategories must be an array"
        );
      });

      it("should throw error for undefined allCategories", () => {
        expect(() => getAncestorIds(laptops, undefined as any)).toThrow(
          "allCategories must be an array"
        );
      });

      it("should throw error for non-array allCategories", () => {
        expect(() => getAncestorIds(laptops, {} as any)).toThrow(
          "allCategories must be an array"
        );
      });

      it("should handle empty allCategories array", () => {
        // When allCategories is empty, it can still find parentIds from the category
        // but cannot traverse further
        const ancestors = getAncestorIds(laptops, []);
        expect(ancestors).toEqual(["computers"]); // Parent ID exists but parent not in array
      });

      it("should handle category with no parents", () => {
        expect(getAncestorIds(electronics, allCategories)).toEqual([]);
      });
    });

    describe("getDescendantIds validation", () => {
      it("should throw error for null category", () => {
        expect(() => getDescendantIds(null as any, allCategories)).toThrow(
          "Category is required"
        );
      });

      it("should throw error for undefined category", () => {
        expect(() => getDescendantIds(undefined as any, allCategories)).toThrow(
          "Category is required"
        );
      });

      it("should throw error for null allCategories", () => {
        expect(() => getDescendantIds(electronics, null as any)).toThrow(
          "allCategories must be an array"
        );
      });

      it("should throw error for undefined allCategories", () => {
        expect(() => getDescendantIds(electronics, undefined as any)).toThrow(
          "allCategories must be an array"
        );
      });

      it("should handle empty allCategories array", () => {
        expect(getDescendantIds(electronics, [])).toEqual([]);
      });

      it("should handle category with no children", () => {
        expect(getDescendantIds(laptops, allCategories)).toEqual([]);
      });
    });

    describe("getBreadcrumbPath validation", () => {
      it("should throw error for null category", () => {
        expect(() => getBreadcrumbPath(null as any, allCategories)).toThrow(
          "Category is required"
        );
      });

      it("should throw error for undefined category", () => {
        expect(() =>
          getBreadcrumbPath(undefined as any, allCategories)
        ).toThrow("Category is required");
      });

      it("should throw error for null allCategories", () => {
        expect(() => getBreadcrumbPath(laptops, null as any)).toThrow(
          "allCategories must be an array"
        );
      });

      it("should throw error for undefined allCategories", () => {
        expect(() => getBreadcrumbPath(laptops, undefined as any)).toThrow(
          "allCategories must be an array"
        );
      });

      it("should handle empty allCategories array", () => {
        const path = getBreadcrumbPath(laptops, []);
        expect(path).toEqual([laptops]);
      });

      it("should handle root category", () => {
        const path = getBreadcrumbPath(electronics, allCategories);
        expect(path).toEqual([electronics]);
      });
    });

    describe("searchCategories validation", () => {
      it("should throw error for null categories", () => {
        expect(() => searchCategories(null as any, "test")).toThrow(
          "categories must be an array"
        );
      });

      it("should throw error for undefined categories", () => {
        expect(() => searchCategories(undefined as any, "test")).toThrow(
          "categories must be an array"
        );
      });

      it("should throw error for non-array categories", () => {
        expect(() => searchCategories({} as any, "test")).toThrow(
          "categories must be an array"
        );
      });

      it("should throw error for non-string query", () => {
        expect(() => searchCategories(allCategories, 123 as any)).toThrow(
          "query must be a string"
        );
      });

      it("should throw error for null query", () => {
        expect(() => searchCategories(allCategories, null as any)).toThrow(
          "query must be a string"
        );
      });

      it("should handle empty query string", () => {
        const results = searchCategories(allCategories, "");
        expect(results).toHaveLength(allCategories.length);
      });

      it("should handle empty categories array", () => {
        expect(searchCategories([], "test")).toEqual([]);
      });

      it("should handle query with special characters", () => {
        expect(() => searchCategories(allCategories, "test@#$%")).not.toThrow();
      });
    });

    describe("buildCategoryTree validation", () => {
      it("should throw error for null categories", () => {
        expect(() => buildCategoryTree(null as any)).toThrow(
          "categories must be an array"
        );
      });

      it("should throw error for undefined categories", () => {
        expect(() => buildCategoryTree(undefined as any)).toThrow(
          "categories must be an array"
        );
      });

      it("should throw error for non-array categories", () => {
        expect(() => buildCategoryTree({} as any)).toThrow(
          "categories must be an array"
        );
      });

      it("should handle empty categories array", () => {
        const tree = buildCategoryTree([]);
        expect(tree).toEqual([]);
      });

      it("should handle single category", () => {
        const tree = buildCategoryTree([electronics]);
        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe("electronics");
      });
    });

    describe("Circular reference edge cases", () => {
      it("should detect circular references in getAncestorIds", () => {
        // Create circular reference
        const cat1: CategoryFE = {
          ...electronics,
          id: "cat1",
          parentIds: ["cat2"],
        };
        const cat2: CategoryFE = {
          ...computers,
          id: "cat2",
          parentIds: ["cat1"],
        };
        const circular = [cat1, cat2];

        // Should not crash due to infinite loop
        const ancestors = getAncestorIds(cat1, circular);
        expect(ancestors).toContain("cat2");
        expect(ancestors.length).toBeLessThan(10); // Bounded by visited set
      });

      it("should detect circular references in getDescendantIds", () => {
        const cat1: CategoryFE = {
          ...electronics,
          id: "cat1",
          parentIds: [],
        };
        const cat2: CategoryFE = {
          ...computers,
          id: "cat2",
          parentIds: ["cat1"],
        };

        // Add circular childrenIds
        (cat1 as any).childrenIds = ["cat2"];
        (cat2 as any).childrenIds = ["cat1"];

        const circular = [cat1, cat2];

        // Should not crash due to infinite loop
        const descendants = getDescendantIds(cat1, circular);
        expect(descendants.length).toBeLessThan(10); // Bounded by visited set
      });

      it("should prevent infinite loop in getBreadcrumbPath", () => {
        const cat1: CategoryFE = {
          ...electronics,
          id: "cat1",
          parentIds: ["cat2"],
        };
        const cat2: CategoryFE = {
          ...computers,
          id: "cat2",
          parentIds: ["cat1"],
        };
        const circular = [cat1, cat2];

        // Should not crash
        const path = getBreadcrumbPath(cat1, circular);
        expect(path.length).toBeGreaterThanOrEqual(1);
        expect(path.length).toBeLessThan(10); // Bounded by visited set
      });
    });

    describe("Missing reference edge cases", () => {
      it("should handle missing parent reference in getAncestorIds", () => {
        const cat = { ...laptops, parentIds: ["nonexistent"] };
        const ancestors = getAncestorIds(cat, allCategories);
        expect(ancestors).toEqual(["nonexistent"]);
      });

      it("should handle missing child reference in getDescendantIds", () => {
        const cat = { ...electronics };
        (cat as any).childrenIds = ["nonexistent"];
        const descendants = getDescendantIds(cat, allCategories);
        expect(descendants).toEqual(["nonexistent"]);
      });

      it("should handle missing parent in breadcrumb path", () => {
        const cat = { ...laptops, parentIds: ["missing"] };
        const path = getBreadcrumbPath(cat, allCategories);
        expect(path).toEqual([cat]);
      });
    });

    describe("Boundary value testing", () => {
      it("should handle category with many parents", () => {
        const manyParents = {
          ...laptops,
          parentIds: ["p1", "p2", "p3", "p4", "p5"],
        };
        expect(getParentIds(manyParents)).toHaveLength(5);
      });

      it("should handle category with many children", () => {
        const manyChildren = { ...electronics };
        (manyChildren as any).childrenIds = ["c1", "c2", "c3", "c4", "c5"];
        expect(getChildrenIds(manyChildren)).toHaveLength(5);
      });

      it("should handle deep category hierarchy", () => {
        const level1: CategoryFE = { ...electronics, id: "l1", parentIds: [] };
        const level2: CategoryFE = {
          ...computers,
          id: "l2",
          parentIds: ["l1"],
        };
        const level3: CategoryFE = { ...laptops, id: "l3", parentIds: ["l2"] };
        const level4: CategoryFE = { ...shirts, id: "l4", parentIds: ["l3"] };
        const level5: CategoryFE = { ...clothing, id: "l5", parentIds: ["l4"] };

        const deep = [level1, level2, level3, level4, level5];
        const ancestors = getAncestorIds(level5, deep);
        expect(ancestors).toHaveLength(4);
      });

      it("should handle very large categories array", () => {
        const large = Array.from({ length: 1000 }, (_, i) => ({
          ...electronics,
          id: `cat-${i}`,
          name: `Category ${i}`,
          slug: `category-${i}`,
        }));

        expect(() => getRootCategories(large)).not.toThrow();
        expect(() => searchCategories(large, "Category 50")).not.toThrow();
      });
    });

    describe("Type safety edge cases", () => {
      it("should handle category with missing optional fields", () => {
        const minimal: CategoryFE = {
          id: "minimal",
          name: "Minimal",
          slug: "minimal",
          parentIds: [],
          productCount: 0,
          isActive: true,
          isFeatured: false,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => getParentIds(minimal)).not.toThrow();
        expect(() => getChildrenIds(minimal)).not.toThrow();
      });

      it("should handle category with null description", () => {
        const noDesc = { ...electronics, description: null as any };
        expect(searchCategories([noDesc], "test")).toEqual([]);
      });

      it("should handle category with undefined description", () => {
        const noDesc = { ...electronics };
        delete (noDesc as any).description;
        expect(() => searchCategories([noDesc], "Electronics")).not.toThrow();
      });
    });

    describe("Combined validation scenarios", () => {
      it("should validate all inputs in complex operations", () => {
        // Should fail on null category
        expect(() => getAncestorIds(null as any, allCategories)).toThrow();

        // Should fail on null array
        expect(() => getAncestorIds(laptops, null as any)).toThrow();

        // Should succeed with valid inputs
        expect(() => getAncestorIds(laptops, allCategories)).not.toThrow();
      });

      it("should handle edge cases in tree building", () => {
        // Empty array
        expect(buildCategoryTree([])).toEqual([]);

        // Single root
        expect(buildCategoryTree([electronics])).toHaveLength(1);

        // Multiple roots
        expect(buildCategoryTree([electronics, clothing])).toHaveLength(2);
      });

      it("should handle edge cases in search", () => {
        // Empty array
        expect(searchCategories([], "test")).toEqual([]);

        // Empty query
        expect(searchCategories(allCategories, "")).toHaveLength(5);

        // Case insensitive
        expect(searchCategories(allCategories, "ELECTRONICS")).toHaveLength(1);
      });
    });
  });
});
