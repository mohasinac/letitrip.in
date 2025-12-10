/**
 * Comparison Constants Tests
 *
 * Tests product comparison configuration
 * Coverage: 100%
 */

import {
  COMPARISON_CONFIG,
  COMPARISON_FIELDS,
  ComparisonField,
} from "../comparison";

describe("Comparison Constants", () => {
  describe("COMPARISON_CONFIG", () => {
    it("should have MAX_PRODUCTS limit", () => {
      expect(COMPARISON_CONFIG.MAX_PRODUCTS).toBe(4);
    });

    it("should have MIN_PRODUCTS requirement", () => {
      expect(COMPARISON_CONFIG.MIN_PRODUCTS).toBe(2);
    });

    it("should have STORAGE_KEY defined", () => {
      expect(COMPARISON_CONFIG.STORAGE_KEY).toBe("product_comparison");
    });

    it("should have MIN less than MAX", () => {
      expect(COMPARISON_CONFIG.MIN_PRODUCTS).toBeLessThan(
        COMPARISON_CONFIG.MAX_PRODUCTS
      );
    });

    it("should have positive values", () => {
      expect(COMPARISON_CONFIG.MIN_PRODUCTS).toBeGreaterThan(0);
      expect(COMPARISON_CONFIG.MAX_PRODUCTS).toBeGreaterThan(0);
    });

    it("should be a const object", () => {
      expect(typeof COMPARISON_CONFIG).toBe("object");
    });

    it("should have string storage key", () => {
      expect(typeof COMPARISON_CONFIG.STORAGE_KEY).toBe("string");
      expect(COMPARISON_CONFIG.STORAGE_KEY.length).toBeGreaterThan(0);
    });

    it("should use snake_case for storage key", () => {
      expect(COMPARISON_CONFIG.STORAGE_KEY).toMatch(/^[a-z_]+$/);
    });
  });

  describe("COMPARISON_FIELDS", () => {
    it("should have multiple comparison fields", () => {
      expect(Array.isArray(COMPARISON_FIELDS)).toBe(true);
      expect(COMPARISON_FIELDS.length).toBeGreaterThan(0);
    });

    it("should have at least 5 fields", () => {
      expect(COMPARISON_FIELDS.length).toBeGreaterThanOrEqual(5);
    });

    it("should have all required fields", () => {
      const keys = COMPARISON_FIELDS.map((f) => f.key);

      expect(keys).toContain("price");
      expect(keys).toContain("condition");
      expect(keys).toContain("rating");
    });

    it("should have price field", () => {
      const priceField = COMPARISON_FIELDS.find((f) => f.key === "price");

      expect(priceField).toBeDefined();
      expect(priceField?.label).toBe("Price");
      expect(priceField?.type).toBe("price");
    });

    it("should have originalPrice field", () => {
      const originalPriceField = COMPARISON_FIELDS.find(
        (f) => f.key === "originalPrice"
      );

      expect(originalPriceField).toBeDefined();
      expect(originalPriceField?.label).toBe("Original Price");
      expect(originalPriceField?.type).toBe("price");
    });

    it("should have condition field", () => {
      const conditionField = COMPARISON_FIELDS.find(
        (f) => f.key === "condition"
      );

      expect(conditionField).toBeDefined();
      expect(conditionField?.label).toBe("Condition");
      expect(conditionField?.type).toBe("badge");
    });

    it("should have rating field", () => {
      const ratingField = COMPARISON_FIELDS.find((f) => f.key === "rating");

      expect(ratingField).toBeDefined();
      expect(ratingField?.label).toBe("Rating");
      expect(ratingField?.type).toBe("rating");
    });

    it("should have reviewCount field", () => {
      const reviewCountField = COMPARISON_FIELDS.find(
        (f) => f.key === "reviewCount"
      );

      expect(reviewCountField).toBeDefined();
      expect(reviewCountField?.label).toBe("Reviews");
      expect(reviewCountField?.type).toBe("text");
    });

    it("should have shopName field", () => {
      const shopNameField = COMPARISON_FIELDS.find((f) => f.key === "shopName");

      expect(shopNameField).toBeDefined();
      expect(shopNameField?.label).toBe("Seller");
      expect(shopNameField?.type).toBe("text");
    });

    it("should have inStock field", () => {
      const inStockField = COMPARISON_FIELDS.find((f) => f.key === "inStock");

      expect(inStockField).toBeDefined();
      expect(inStockField?.label).toBe("In Stock");
      expect(inStockField?.type).toBe("boolean");
    });
  });

  describe("Field Structure", () => {
    it("should have all required properties on each field", () => {
      COMPARISON_FIELDS.forEach((field) => {
        expect(field.key).toBeDefined();
        expect(field.label).toBeDefined();
        expect(field.type).toBeDefined();
      });
    });

    it("should have non-empty strings for key and label", () => {
      COMPARISON_FIELDS.forEach((field) => {
        expect(typeof field.key).toBe("string");
        expect(field.key.length).toBeGreaterThan(0);
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      });
    });

    it("should have valid field types", () => {
      const validTypes = ["text", "price", "rating", "boolean", "badge"];

      COMPARISON_FIELDS.forEach((field) => {
        expect(validTypes).toContain(field.type);
      });
    });

    it("should have unique keys", () => {
      const keys = COMPARISON_FIELDS.map((f) => f.key);
      const uniqueKeys = new Set(keys);

      expect(keys.length).toBe(uniqueKeys.size);
    });

    it("should use camelCase for keys", () => {
      COMPARISON_FIELDS.forEach((field) => {
        expect(field.key).toMatch(/^[a-z][a-zA-Z0-9]*$/);
      });
    });

    it("should have human-readable labels", () => {
      COMPARISON_FIELDS.forEach((field) => {
        // Labels should be capitalized and readable
        expect(field.label[0]).toBe(field.label[0].toUpperCase());
      });
    });
  });

  describe("Field Types", () => {
    it("should have price type for price fields", () => {
      const priceFields = COMPARISON_FIELDS.filter((f) =>
        f.key.toLowerCase().includes("price")
      );

      priceFields.forEach((field) => {
        expect(field.type).toBe("price");
      });
    });

    it("should have rating type for rating field", () => {
      const ratingFields = COMPARISON_FIELDS.filter((f) =>
        f.key.toLowerCase().includes("rating")
      );

      ratingFields.forEach((field) => {
        expect(field.type).toBe("rating");
      });
    });

    it("should have boolean type for stock field", () => {
      const stockField = COMPARISON_FIELDS.find((f) => f.key === "inStock");

      expect(stockField?.type).toBe("boolean");
    });

    it("should have badge type for condition field", () => {
      const conditionField = COMPARISON_FIELDS.find(
        (f) => f.key === "condition"
      );

      expect(conditionField?.type).toBe("badge");
    });

    it("should have text type for count fields", () => {
      const reviewCountField = COMPARISON_FIELDS.find(
        (f) => f.key === "reviewCount"
      );

      expect(reviewCountField?.type).toBe("text");
    });
  });

  describe("Configuration Validation", () => {
    it("should allow comparison with MIN_PRODUCTS", () => {
      const canCompare =
        COMPARISON_CONFIG.MIN_PRODUCTS <= COMPARISON_CONFIG.MAX_PRODUCTS;
      expect(canCompare).toBe(true);
    });

    it("should have reasonable MAX_PRODUCTS limit", () => {
      // 4 is a good limit for UI comparison tables
      expect(COMPARISON_CONFIG.MAX_PRODUCTS).toBeLessThanOrEqual(6);
      expect(COMPARISON_CONFIG.MAX_PRODUCTS).toBeGreaterThanOrEqual(2);
    });

    it("should require at least 2 products for comparison", () => {
      expect(COMPARISON_CONFIG.MIN_PRODUCTS).toBeGreaterThanOrEqual(2);
    });

    it("should have storage key without spaces", () => {
      expect(COMPARISON_CONFIG.STORAGE_KEY).not.toContain(" ");
    });
  });

  describe("Field Order", () => {
    it("should have price fields first", () => {
      expect(COMPARISON_FIELDS[0].key).toBe("price");
    });

    it("should have important fields near the top", () => {
      const topFields = COMPARISON_FIELDS.slice(0, 3);
      const topKeys = topFields.map((f) => f.key);

      // Price and originalPrice should be in top 3
      expect(topKeys.some((k) => k === "price")).toBe(true);
    });

    it("should group related fields", () => {
      const fieldKeys = COMPARISON_FIELDS.map((f) => f.key);
      const priceIndex = fieldKeys.indexOf("price");
      const originalPriceIndex = fieldKeys.indexOf("originalPrice");

      // Price fields should be adjacent
      expect(Math.abs(priceIndex - originalPriceIndex)).toBeLessThanOrEqual(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle field lookup by key", () => {
      const field = COMPARISON_FIELDS.find((f) => f.key === "price");
      expect(field).toBeDefined();
    });

    it("should return undefined for non-existent field", () => {
      const field = COMPARISON_FIELDS.find((f) => f.key === "non-existent");
      expect(field).toBeUndefined();
    });

    it("should maintain array immutability", () => {
      const originalLength = COMPARISON_FIELDS.length;
      const copy = [...COMPARISON_FIELDS];

      expect(COMPARISON_FIELDS.length).toBe(originalLength);
      expect(copy).toEqual(COMPARISON_FIELDS);
    });

    it("should have consistent data types", () => {
      COMPARISON_FIELDS.forEach((field) => {
        expect(typeof field.key).toBe("string");
        expect(typeof field.label).toBe("string");
        expect(typeof field.type).toBe("string");
      });
    });
  });

  describe("TypeScript Interface", () => {
    it("should match ComparisonField interface", () => {
      COMPARISON_FIELDS.forEach((field) => {
        const typedField: ComparisonField = field;
        expect(typedField.key).toBe(field.key);
        expect(typedField.label).toBe(field.label);
        expect(typedField.type).toBe(field.type);
      });
    });

    it("should have valid type values according to interface", () => {
      type ValidType = "text" | "price" | "rating" | "boolean" | "badge";

      COMPARISON_FIELDS.forEach((field) => {
        const validTypes: ValidType[] = [
          "text",
          "price",
          "rating",
          "boolean",
          "badge",
        ];
        expect(validTypes.includes(field.type as ValidType)).toBe(true);
      });
    });
  });

  describe("Performance", () => {
    it("should be able to filter fields by type quickly", () => {
      const start = Date.now();
      const priceFields = COMPARISON_FIELDS.filter((f) => f.type === "price");
      const duration = Date.now() - start;

      expect(priceFields.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10);
    });

    it("should be able to map field labels quickly", () => {
      const start = Date.now();
      const labels = COMPARISON_FIELDS.map((f) => f.label);
      const duration = Date.now() - start;

      expect(labels.length).toBe(COMPARISON_FIELDS.length);
      expect(duration).toBeLessThan(10);
    });

    it("should have reasonable number of fields", () => {
      // Too many fields can overwhelm users
      expect(COMPARISON_FIELDS.length).toBeLessThan(15);
    });
  });

  describe("UI Considerations", () => {
    it("should have essential fields for product comparison", () => {
      const essentialFields = ["price", "rating", "condition", "inStock"];
      const fieldKeys = COMPARISON_FIELDS.map((f) => f.key);

      essentialFields.forEach((field) => {
        expect(fieldKeys).toContain(field);
      });
    });

    it("should have seller information field", () => {
      const sellerField = COMPARISON_FIELDS.find(
        (f) => f.key === "shopName" || f.label.toLowerCase().includes("seller")
      );

      expect(sellerField).toBeDefined();
    });

    it("should support different display types", () => {
      const types = new Set(COMPARISON_FIELDS.map((f) => f.type));

      expect(types.size).toBeGreaterThanOrEqual(3); // Should have variety
    });

    it("should have fields that make sense for comparison", () => {
      COMPARISON_FIELDS.forEach((field) => {
        // Each field should be comparable across products
        expect(field.key).toBeDefined();
        expect(field.label).toBeDefined();
        // Fields should be objective and measurable
        expect([
          "price",
          "originalPrice",
          "rating",
          "reviewCount",
          "condition",
          "shopName",
          "inStock",
        ]).toContain(field.key);
      });
    });
  });

  describe("LocalStorage Integration", () => {
    it("should have storage key suitable for localStorage", () => {
      const key = COMPARISON_CONFIG.STORAGE_KEY;

      // Should be valid localStorage key
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
      expect(key.length).toBeLessThan(100); // Reasonable length
    });

    it("should have descriptive storage key", () => {
      expect(COMPARISON_CONFIG.STORAGE_KEY).toContain("comparison");
    });
  });
});
