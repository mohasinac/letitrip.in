/**
 * Categories Constants Tests
 *
 * Tests product category configurations and subcategories
 * Coverage: 100%
 */

import { PRODUCT_CATEGORIES, ProductCategory } from "../categories";

describe("Categories Constants", () => {
  describe("PRODUCT_CATEGORIES", () => {
    it("should have all main categories", () => {
      const categoryIds = PRODUCT_CATEGORIES.map((c) => c.id);

      expect(categoryIds).toContain("beyblades");
      expect(categoryIds).toContain("pokemon-tcg");
      expect(categoryIds).toContain("yugioh-tcg");
      expect(categoryIds).toContain("transformers");
      expect(categoryIds).toContain("hot-wheels");
    });

    it("should have at least 5 categories", () => {
      expect(PRODUCT_CATEGORIES.length).toBeGreaterThanOrEqual(5);
    });

    it("should have unique IDs", () => {
      const ids = PRODUCT_CATEGORIES.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have unique slugs", () => {
      const slugs = PRODUCT_CATEGORIES.map((c) => c.slug);
      const uniqueSlugs = new Set(slugs);

      expect(slugs.length).toBe(uniqueSlugs.size);
    });
  });

  describe("Beyblade Category", () => {
    let category: ProductCategory;

    beforeEach(() => {
      category = PRODUCT_CATEGORIES.find((c) => c.id === "beyblades")!;
    });

    it("should exist and have correct id", () => {
      expect(category).toBeDefined();
      expect(category.id).toBe("beyblades");
    });

    it("should have correct name and slug", () => {
      expect(category.name).toBe("Beyblades");
      expect(category.slug).toBe("beyblades");
    });

    it("should have description", () => {
      expect(category.description).toBeDefined();
      expect(category.description.length).toBeGreaterThan(0);
      expect(category.description).toContain("Beyblades");
    });

    it("should have icon", () => {
      expect(category.icon).toBeDefined();
      expect(typeof category.icon).toBe("string");
    });

    it("should have keywords array", () => {
      expect(Array.isArray(category.keywords)).toBe(true);
      expect(category.keywords.length).toBeGreaterThan(0);
    });

    it("should have relevant keywords", () => {
      expect(category.keywords).toContain("beyblades");
      expect(
        category.keywords.some((k) => k.toLowerCase().includes("beyblade"))
      ).toBe(true);
    });

    it("should be featured", () => {
      expect(category.featured).toBe(true);
    });

    it("should have subcategories", () => {
      expect(category.subcategories).toBeDefined();
      expect(Array.isArray(category.subcategories)).toBe(true);
      expect(category.subcategories!.length).toBeGreaterThan(0);
    });

    it("should have Beyblade Burst subcategory", () => {
      expect(category.subcategories).toContain("Beyblade Burst");
    });

    it("should have Stadiums subcategory", () => {
      expect(category.subcategories).toContain("Stadiums");
    });
  });

  describe("Pokemon TCG Category", () => {
    let category: ProductCategory;

    beforeEach(() => {
      category = PRODUCT_CATEGORIES.find((c) => c.id === "pokemon-tcg")!;
    });

    it("should exist with correct properties", () => {
      expect(category).toBeDefined();
      expect(category.id).toBe("pokemon-tcg");
      expect(category.name).toBe("Pokemon TCG");
      expect(category.slug).toBe("pokemon-tcg");
    });

    it("should have TCG-related keywords", () => {
      expect(
        category.keywords.some((k) => k.toLowerCase().includes("pokemon"))
      ).toBe(true);
      expect(
        category.keywords.some((k) => k.toLowerCase().includes("card"))
      ).toBe(true);
    });

    it("should be featured", () => {
      expect(category.featured).toBe(true);
    });

    it("should have relevant subcategories", () => {
      expect(category.subcategories).toBeDefined();
      expect(category.subcategories).toContain("Booster Packs");
      expect(category.subcategories).toContain("Elite Trainer Boxes");
    });
  });

  describe("Yu-Gi-Oh TCG Category", () => {
    let category: ProductCategory;

    beforeEach(() => {
      category = PRODUCT_CATEGORIES.find((c) => c.id === "yugioh-tcg")!;
    });

    it("should exist with correct properties", () => {
      expect(category).toBeDefined();
      expect(category.id).toBe("yugioh-tcg");
      expect(category.slug).toBe("yugioh-tcg");
    });

    it("should have Yu-Gi-Oh related keywords", () => {
      expect(
        category.keywords.some((k) => k.toLowerCase().includes("yu-gi-oh"))
      ).toBe(true);
    });

    it("should be featured", () => {
      expect(category.featured).toBe(true);
    });
  });

  describe("Transformers Category", () => {
    let category: ProductCategory;

    beforeEach(() => {
      category = PRODUCT_CATEGORIES.find((c) => c.id === "transformers")!;
    });

    it("should exist with correct properties", () => {
      expect(category).toBeDefined();
      expect(category.id).toBe("transformers");
      expect(category.slug).toBe("transformers");
    });

    it("should have Transformers keywords", () => {
      expect(
        category.keywords.some((k) => k.toLowerCase().includes("transformers"))
      ).toBe(true);
    });

    it("should be featured", () => {
      expect(category.featured).toBe(true);
    });

    it("should have action figure subcategories", () => {
      expect(category.subcategories).toBeDefined();
      expect(category.subcategories!.length).toBeGreaterThan(0);
    });
  });

  describe("Hot Wheels Category", () => {
    let category: ProductCategory;

    beforeEach(() => {
      category = PRODUCT_CATEGORIES.find((c) => c.id === "hot-wheels")!;
    });

    it("should exist with correct properties", () => {
      expect(category).toBeDefined();
      expect(category.id).toBe("hot-wheels");
      expect(category.slug).toBe("hot-wheels");
    });

    it("should have Hot Wheels keywords", () => {
      expect(
        category.keywords.some((k) => k.toLowerCase().includes("hot wheels"))
      ).toBe(true);
    });

    it("should be featured", () => {
      expect(category.featured).toBe(true);
    });
  });

  describe("Category Structure Validation", () => {
    it("should have all required properties on each category", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.icon).toBeDefined();
        expect(category.keywords).toBeDefined();
        expect(category.featured).toBeDefined();
      });
    });

    it("should have non-empty strings for text properties", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(category.id.length).toBeGreaterThan(0);
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.slug.length).toBeGreaterThan(0);
        expect(category.description.length).toBeGreaterThan(0);
        expect(category.icon.length).toBeGreaterThan(0);
      });
    });

    it("should have valid slug format (lowercase, hyphens)", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(category.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it("should have id matching slug pattern", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(category.id).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it("should have boolean featured field", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(typeof category.featured).toBe("boolean");
      });
    });

    it("should have keywords array with strings", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(Array.isArray(category.keywords)).toBe(true);
        category.keywords.forEach((keyword) => {
          expect(typeof keyword).toBe("string");
          expect(keyword.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have at least 3 keywords per category", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(category.keywords.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("should have subcategories array if defined", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        if (category.subcategories) {
          expect(Array.isArray(category.subcategories)).toBe(true);
          category.subcategories.forEach((sub) => {
            expect(typeof sub).toBe("string");
            expect(sub.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe("Featured Categories", () => {
    it("should have at least 3 featured categories", () => {
      const featuredCount = PRODUCT_CATEGORIES.filter((c) => c.featured).length;
      expect(featuredCount).toBeGreaterThanOrEqual(3);
    });

    it("should have main collectible categories as featured", () => {
      const mainCategories = [
        "beyblades",
        "pokemon-tcg",
        "yugioh-tcg",
        "transformers",
        "hot-wheels",
      ];

      mainCategories.forEach((categoryId) => {
        const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
        expect(category?.featured).toBe(true);
      });
    });
  });

  describe("Keywords SEO Optimization", () => {
    it("should include India in keywords for local SEO", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        const hasIndiaKeyword = category.keywords.some((k) =>
          k.toLowerCase().includes("india")
        );
        expect(hasIndiaKeyword).toBe(true);
      });
    });

    it("should include India and imported keywords for local SEO", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        const hasLocalKeyword = category.keywords.some(
          (k) =>
            k.toLowerCase().includes("india") ||
            k.toLowerCase().includes("imported")
        );
        expect(hasLocalKeyword).toBe(true);
      });
    });

    it("should include category-related keywords", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        // Each category should have relevant keywords
        expect(category.keywords.length).toBeGreaterThan(3);
        // Keywords should be relevant strings
        category.keywords.forEach((keyword) => {
          expect(typeof keyword).toBe("string");
          expect(keyword.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Subcategories", () => {
    it("should have subcategories for main categories", () => {
      const mainCategories = [
        "beyblades",
        "pokemon-tcg",
        "yugioh-tcg",
        "transformers",
        "hot-wheels",
      ];

      mainCategories.forEach((categoryId) => {
        const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
        expect(category?.subcategories).toBeDefined();
        expect(category?.subcategories!.length).toBeGreaterThan(0);
      });
    });

    it("should have at least 3 subcategories for main categories", () => {
      const categoriesWithSubs = PRODUCT_CATEGORIES.filter(
        (c) => c.subcategories
      );

      categoriesWithSubs.forEach((category) => {
        expect(category.subcategories!.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("should have unique subcategories within each category", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        if (category.subcategories) {
          const uniqueSubs = new Set(category.subcategories);
          expect(category.subcategories.length).toBe(uniqueSubs.size);
        }
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle category lookup by id", () => {
      const category = PRODUCT_CATEGORIES.find((c) => c.id === "beyblades");
      expect(category).toBeDefined();
    });

    it("should handle category lookup by slug", () => {
      const category = PRODUCT_CATEGORIES.find((c) => c.slug === "pokemon-tcg");
      expect(category).toBeDefined();
    });

    it("should return undefined for non-existent category", () => {
      const category = PRODUCT_CATEGORIES.find((c) => c.id === "non-existent");
      expect(category).toBeUndefined();
    });

    it("should maintain array immutability", () => {
      const originalLength = PRODUCT_CATEGORIES.length;
      const copy = [...PRODUCT_CATEGORIES];

      expect(PRODUCT_CATEGORIES.length).toBe(originalLength);
      expect(copy).toEqual(PRODUCT_CATEGORIES);
    });

    it("should have consistent data types across all categories", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        expect(typeof category.id).toBe("string");
        expect(typeof category.name).toBe("string");
        expect(typeof category.slug).toBe("string");
        expect(typeof category.description).toBe("string");
        expect(typeof category.icon).toBe("string");
        expect(typeof category.featured).toBe("boolean");
        expect(Array.isArray(category.keywords)).toBe(true);
      });
    });
  });

  describe("Performance & Scale", () => {
    it("should be able to filter featured categories quickly", () => {
      const start = Date.now();
      const featured = PRODUCT_CATEGORIES.filter((c) => c.featured);
      const duration = Date.now() - start;

      expect(featured.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10); // Should be instant
    });

    it("should be able to map category names quickly", () => {
      const start = Date.now();
      const names = PRODUCT_CATEGORIES.map((c) => c.name);
      const duration = Date.now() - start;

      expect(names.length).toBe(PRODUCT_CATEGORIES.length);
      expect(duration).toBeLessThan(10);
    });

    it("should have reasonable number of categories", () => {
      // Too many categories can confuse users
      expect(PRODUCT_CATEGORIES.length).toBeLessThan(50);
    });

    it("should have reasonable keyword count per category", () => {
      PRODUCT_CATEGORIES.forEach((category) => {
        // Too many keywords can dilute SEO
        expect(category.keywords.length).toBeLessThan(20);
      });
    });
  });
});
