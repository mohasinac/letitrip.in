/**
 * Tests for Category Validation Schemas
 */

import {
  buildCategoryPath,
  bulkUpdateCategoriesSchema,
  categoryQuerySchema,
  createCategorySchema,
  getCategoryLevel,
  getCategoryPathSchema,
  getCategoryTreeSchema,
  getSimilarCategoriesSchema,
  isLeafCategory,
  moveCategorySchema,
  parseCategoryPath,
  reorderCategoriesSchema,
  updateCategorySchema,
  validateLeafCategorySchema,
} from "../category";

describe("Category Validation Schemas", () => {
  describe("createCategorySchema", () => {
    const baseCategory = {
      name: "Electronics",
      slug: "electronics",
    };

    it("should validate valid category", () => {
      const result = createCategorySchema.parse(baseCategory);

      expect(result.name).toBe("Electronics");
      expect(result.slug).toBe("electronics");
    });

    it("should reject name less than 2 chars", () => {
      const category = { ...baseCategory, name: "A" };

      expect(() => createCategorySchema.parse(category)).toThrow();
    });

    it("should reject name exceeding 100 chars", () => {
      const category = { ...baseCategory, name: "a".repeat(101) };

      expect(() => createCategorySchema.parse(category)).toThrow();
    });

    it("should validate slug pattern", () => {
      const validSlugs = ["electronics", "home-garden", "cat-123"];

      validSlugs.forEach((slug) => {
        const category = { ...baseCategory, slug };
        expect(() => createCategorySchema.parse(category)).not.toThrow();
      });
    });

    it("should reject invalid slug patterns", () => {
      const invalidSlugs = ["Electronics", "home_garden", "Cat 123"];

      invalidSlugs.forEach((slug) => {
        const category = { ...baseCategory, slug };
        expect(() => createCategorySchema.parse(category)).toThrow();
      });
    });

    it("should handle multi-parent hierarchy", () => {
      const category = {
        ...baseCategory,
        parentIds: ["parent1", "parent2"],
      };

      const result = createCategorySchema.parse(category);

      expect(result.parentIds).toEqual(["parent1", "parent2"]);
    });

    it("should default parentIds to empty array", () => {
      const result = createCategorySchema.parse(baseCategory);

      expect(result.parentIds).toEqual([]);
    });

    it("should validate hex color", () => {
      const category = {
        ...baseCategory,
        color: "#FF5733",
      };

      const result = createCategorySchema.parse(category);

      expect(result.color).toBe("#FF5733");
    });

    it("should reject invalid color format", () => {
      const category = {
        ...baseCategory,
        color: "FF5733",
      };

      expect(() => createCategorySchema.parse(category)).toThrow();
    });

    it("should default sortOrder to 0", () => {
      const result = createCategorySchema.parse(baseCategory);

      expect(result.sortOrder).toBe(0);
    });

    it("should default featured to false", () => {
      const result = createCategorySchema.parse(baseCategory);

      expect(result.featured).toBe(false);
    });

    it("should default isActive to true", () => {
      const result = createCategorySchema.parse(baseCategory);

      expect(result.isActive).toBe(true);
    });

    it("should reject metaTitle exceeding 60 chars", () => {
      const category = {
        ...baseCategory,
        metaTitle: "a".repeat(61),
      };

      expect(() => createCategorySchema.parse(category)).toThrow();
    });

    it("should reject metaDescription exceeding 160 chars", () => {
      const category = {
        ...baseCategory,
        metaDescription: "a".repeat(161),
      };

      expect(() => createCategorySchema.parse(category)).toThrow();
    });
  });

  describe("updateCategorySchema", () => {
    it("should allow partial updates", () => {
      const update = { name: "Updated Category" };

      const result = updateCategorySchema.parse(update);

      expect(result.name).toBe("Updated Category");
    });
  });

  describe("moveCategorySchema", () => {
    it("should validate move with newParentIds", () => {
      const move = {
        newParentIds: ["parent1", "parent2"],
      };

      const result = moveCategorySchema.parse(move);

      expect(result.newParentIds).toEqual(["parent1", "parent2"]);
    });

    it("should validate move with newParentId", () => {
      const move = {
        newParentId: "parent1",
      };

      const result = moveCategorySchema.parse(move);

      expect(result.newParentId).toBe("parent1");
    });

    it("should validate move with sortOrder", () => {
      const move = {
        sortOrder: 5,
      };

      const result = moveCategorySchema.parse(move);

      expect(result.sortOrder).toBe(5);
    });

    it("should require at least one field", () => {
      const move = {};

      expect(() => moveCategorySchema.parse(move)).toThrow(
        /newParentIds, newParentId, or sortOrder must be provided/
      );
    });
  });

  describe("reorderCategoriesSchema", () => {
    it("should validate reorder", () => {
      const reorder = {
        categoryOrders: [
          { categoryId: "cat1", sortOrder: 0 },
          { categoryId: "cat2", sortOrder: 1 },
        ],
      };

      const result = reorderCategoriesSchema.parse(reorder);

      expect(result.categoryOrders).toHaveLength(2);
    });

    it("should require at least one category", () => {
      const reorder = {
        categoryOrders: [],
      };

      expect(() => reorderCategoriesSchema.parse(reorder)).toThrow();
    });

    it("should reject negative sortOrder", () => {
      const reorder = {
        categoryOrders: [{ categoryId: "cat1", sortOrder: -1 }],
      };

      expect(() => reorderCategoriesSchema.parse(reorder)).toThrow();
    });
  });

  describe("categoryQuerySchema", () => {
    it("should validate query with defaults", () => {
      const result = categoryQuerySchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
      expect(result.sortBy).toBe("sortOrder");
      expect(result.sortOrder).toBe("asc");
    });

    it("should parse string numbers", () => {
      const query = { page: "2", limit: "50" };

      const result = categoryQuerySchema.parse(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("should handle filter options", () => {
      const query = {
        parentId: "parent123",
        featured: "true",
        isActive: "true",
        rootOnly: "true",
        leafOnly: "false",
        level: "2",
        includeProductCount: "true",
      };

      const result = categoryQuerySchema.parse(query);

      expect(result.parentId).toBe("parent123");
      expect(result.featured).toBe(true);
      expect(result.rootOnly).toBe(true);
      expect(result.level).toBe(2);
      expect(result.includeProductCount).toBe(true);
    });
  });

  describe("getCategoryTreeSchema", () => {
    it("should validate tree request with defaults", () => {
      const result = getCategoryTreeSchema.parse({});

      expect(result.maxDepth).toBe(5);
      expect(result.includeProductCount).toBe(false);
      expect(result.includeInactive).toBe(false);
    });

    it("should reject maxDepth exceeding 10", () => {
      const request = { maxDepth: "11" };

      expect(() => getCategoryTreeSchema.parse(request)).toThrow();
    });

    it("should parse boolean flags", () => {
      const request = {
        includeProductCount: "true",
        includeInactive: "true",
        onlyFeatured: "true",
      };

      const result = getCategoryTreeSchema.parse(request);

      expect(result.includeProductCount).toBe(true);
      expect(result.includeInactive).toBe(true);
      expect(result.onlyFeatured).toBe(true);
    });
  });

  describe("validateLeafCategorySchema", () => {
    it("should validate leaf category", () => {
      const data = { categoryId: "cat123" };

      const result = validateLeafCategorySchema.parse(data);

      expect(result.categoryId).toBe("cat123");
    });

    it("should require categoryId", () => {
      const data = { categoryId: "" };

      expect(() => validateLeafCategorySchema.parse(data)).toThrow();
    });
  });

  describe("bulkUpdateCategoriesSchema", () => {
    it("should validate bulk update", () => {
      const update = {
        categoryIds: ["cat1", "cat2"],
        updates: {
          featured: true,
          isActive: false,
        },
      };

      const result = bulkUpdateCategoriesSchema.parse(update);

      expect(result.categoryIds).toHaveLength(2);
      expect(result.updates.featured).toBe(true);
    });

    it("should require at least one categoryId", () => {
      const update = {
        categoryIds: [],
        updates: { featured: true },
      };

      expect(() => bulkUpdateCategoriesSchema.parse(update)).toThrow();
    });
  });

  describe("getCategoryPathSchema", () => {
    it("should validate path request", () => {
      const request = {
        categoryId: "cat123",
        includeRoot: "true",
      };

      const result = getCategoryPathSchema.parse(request);

      expect(result.categoryId).toBe("cat123");
      expect(result.includeRoot).toBe(true);
    });

    it("should default includeRoot to false", () => {
      const request = { categoryId: "cat123" };

      const result = getCategoryPathSchema.parse(request);

      expect(result.includeRoot).toBe(false);
    });
  });

  describe("getSimilarCategoriesSchema", () => {
    it("should validate similar categories request", () => {
      const request = {
        categoryId: "cat123",
        limit: "10",
      };

      const result = getSimilarCategoriesSchema.parse(request);

      expect(result.categoryId).toBe("cat123");
      expect(result.limit).toBe(10);
    });

    it("should default limit to 5", () => {
      const request = { categoryId: "cat123" };

      const result = getSimilarCategoriesSchema.parse(request);

      expect(result.limit).toBe(5);
    });

    it("should reject limit exceeding 20", () => {
      const request = {
        categoryId: "cat123",
        limit: "21",
      };

      expect(() => getSimilarCategoriesSchema.parse(request)).toThrow();
    });
  });

  describe("Utility Functions", () => {
    describe("isLeafCategory", () => {
      it("should return true for category without children", () => {
        expect(isLeafCategory({ hasChildren: false, childCount: 0 })).toBe(
          true
        );
      });

      it("should return false for category with children", () => {
        expect(isLeafCategory({ hasChildren: true, childCount: 3 })).toBe(
          false
        );
      });

      it("should return true for category without childCount", () => {
        expect(isLeafCategory({ hasChildren: false })).toBe(true);
      });

      it("should return true when childCount is zero", () => {
        expect(isLeafCategory({ childCount: 0 })).toBe(true);
      });
    });

    describe("getCategoryLevel", () => {
      it("should return 0 for empty path", () => {
        expect(getCategoryLevel("")).toBe(0);
      });

      it("should return 0 for root category", () => {
        expect(getCategoryLevel("cat1")).toBe(0);
      });

      it("should return correct level for nested path", () => {
        expect(getCategoryLevel("cat1/cat2")).toBe(1);
        expect(getCategoryLevel("cat1/cat2/cat3")).toBe(2);
      });
    });

    describe("buildCategoryPath", () => {
      it("should build path for root category", () => {
        expect(buildCategoryPath(null, "cat1")).toBe("cat1");
      });

      it("should build path for nested category", () => {
        expect(buildCategoryPath("cat1", "cat2")).toBe("cat1/cat2");
        expect(buildCategoryPath("cat1/cat2", "cat3")).toBe("cat1/cat2/cat3");
      });
    });

    describe("parseCategoryPath", () => {
      it("should parse path to array", () => {
        expect(parseCategoryPath("cat1")).toEqual(["cat1"]);
        expect(parseCategoryPath("cat1/cat2")).toEqual(["cat1", "cat2"]);
        expect(parseCategoryPath("cat1/cat2/cat3")).toEqual([
          "cat1",
          "cat2",
          "cat3",
        ]);
      });

      it("should handle trailing slash", () => {
        expect(parseCategoryPath("cat1/cat2/")).toEqual(["cat1", "cat2"]);
      });

      it("should handle leading slash", () => {
        expect(parseCategoryPath("/cat1/cat2")).toEqual(["cat1", "cat2"]);
      });
    });
  });
});
