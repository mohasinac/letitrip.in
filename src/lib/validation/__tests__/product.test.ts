/**
 * Tests for Product Validation Schemas
 */

import {
  bulkUpdatePriceSchema,
  bulkUpdateStatusSchema,
  createProductSchema,
  featureProductSchema,
  ProductCondition,
  productDimensionsSchema,
  productQuerySchema,
  productSpecificationSchema,
  ProductStatus,
  productVariantSchema,
  updateProductSchema,
  updateStockSchema,
} from "../product";

describe("Product Validation Schemas", () => {
  describe("ProductCondition", () => {
    it("should accept valid conditions", () => {
      expect(ProductCondition.parse("new")).toBe("new");
      expect(ProductCondition.parse("used")).toBe("used");
      expect(ProductCondition.parse("refurbished")).toBe("refurbished");
    });

    it("should reject invalid conditions", () => {
      expect(() => ProductCondition.parse("excellent")).toThrow();
    });
  });

  describe("ProductStatus", () => {
    it("should accept valid statuses", () => {
      expect(ProductStatus.parse("draft")).toBe("draft");
      expect(ProductStatus.parse("published")).toBe("published");
      expect(ProductStatus.parse("archived")).toBe("archived");
      expect(ProductStatus.parse("out-of-stock")).toBe("out-of-stock");
    });

    it("should reject invalid statuses", () => {
      expect(() => ProductStatus.parse("active")).toThrow();
    });
  });

  describe("productSpecificationSchema", () => {
    it("should validate valid specification", () => {
      const spec = {
        name: "Color",
        value: "Red",
      };

      const result = productSpecificationSchema.parse(spec);

      expect(result.name).toBe("Color");
      expect(result.value).toBe("Red");
    });

    it("should reject empty name", () => {
      const spec = {
        name: "",
        value: "Red",
      };

      expect(() => productSpecificationSchema.parse(spec)).toThrow();
    });

    it("should reject empty value", () => {
      const spec = {
        name: "Color",
        value: "",
      };

      expect(() => productSpecificationSchema.parse(spec)).toThrow();
    });

    it("should reject name exceeding 100 chars", () => {
      const spec = {
        name: "a".repeat(101),
        value: "Red",
      };

      expect(() => productSpecificationSchema.parse(spec)).toThrow();
    });

    it("should reject value exceeding 500 chars", () => {
      const spec = {
        name: "Description",
        value: "a".repeat(501),
      };

      expect(() => productSpecificationSchema.parse(spec)).toThrow();
    });
  });

  describe("productVariantSchema", () => {
    it("should validate valid variant", () => {
      const variant = {
        name: "Size",
        value: "Large",
      };

      const result = productVariantSchema.parse(variant);

      expect(result.name).toBe("Size");
      expect(result.value).toBe("Large");
    });

    it("should handle optional fields", () => {
      const variant = {
        name: "Size",
        value: "Large",
        priceAdjustment: 100,
        stockCount: 50,
        sku: "PROD-L",
      };

      const result = productVariantSchema.parse(variant);

      expect(result.priceAdjustment).toBe(100);
      expect(result.stockCount).toBe(50);
      expect(result.sku).toBe("PROD-L");
    });

    it("should default priceAdjustment to 0", () => {
      const variant = {
        name: "Size",
        value: "Large",
      };

      const result = productVariantSchema.parse(variant);

      expect(result.priceAdjustment).toBe(0);
    });
  });

  describe("productDimensionsSchema", () => {
    it("should validate valid dimensions", () => {
      const dimensions = {
        length: 10,
        width: 20,
        height: 30,
        weight: 5,
      };

      const result = productDimensionsSchema.parse(dimensions);

      expect(result.length).toBe(10);
      expect(result.unit).toBe("cm");
      expect(result.weightUnit).toBe("kg");
    });

    it("should reject negative dimensions", () => {
      const dimensions = {
        length: -10,
        width: 20,
        height: 30,
        weight: 5,
      };

      expect(() => productDimensionsSchema.parse(dimensions)).toThrow();
    });

    it("should accept valid units", () => {
      const dimensions = {
        length: 10,
        width: 20,
        height: 30,
        unit: "inch",
        weight: 5,
        weightUnit: "lb",
      };

      const result = productDimensionsSchema.parse(dimensions);

      expect(result.unit).toBe("inch");
      expect(result.weightUnit).toBe("lb");
    });
  });

  describe("createProductSchema", () => {
    const validProduct = {
      name: "Test Product Name",
      slug: "test-product",
      description: "A".repeat(50),
      shopId: "shop123",
      categoryId: "cat123",
      price: 1000,
      stockCount: 10,
      images: ["https://example.com/image.jpg"],
    };

    it("should validate valid product", () => {
      const result = createProductSchema.parse(validProduct);

      expect(result.name).toBe(validProduct.name);
      expect(result.slug).toBe(validProduct.slug);
    });

    it("should reject name less than 10 chars", () => {
      const product = { ...validProduct, name: "Short" };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should reject name exceeding 200 chars", () => {
      const product = { ...validProduct, name: "a".repeat(201) };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should validate slug pattern", () => {
      const validSlugs = ["test-product", "product123", "test-123-product"];

      validSlugs.forEach((slug) => {
        const product = { ...validProduct, slug };
        expect(() => createProductSchema.parse(product)).not.toThrow();
      });
    });

    it("should reject invalid slug patterns", () => {
      const invalidSlugs = [
        "Test Product",
        "test_product",
        "test.product",
        "TEST-PRODUCT",
      ];

      invalidSlugs.forEach((slug) => {
        const product = { ...validProduct, slug };
        expect(() => createProductSchema.parse(product)).toThrow();
      });
    });

    it("should reject description less than 50 chars", () => {
      const product = { ...validProduct, description: "Short" };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should reject description exceeding 5000 chars", () => {
      const product = { ...validProduct, description: "a".repeat(5001) };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should reject price less than 1", () => {
      const product = { ...validProduct, price: 0 };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should reject price exceeding 1 Crore", () => {
      const product = { ...validProduct, price: 10000001 };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should reject negative stock count", () => {
      const product = { ...validProduct, stockCount: -1 };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should require at least one image", () => {
      const product = { ...validProduct, images: [] };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should reject more than 10 images", () => {
      const product = {
        ...validProduct,
        images: Array(11).fill("https://example.com/image.jpg"),
      };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should reject more than 3 videos", () => {
      const product = {
        ...validProduct,
        videos: Array(4).fill("https://example.com/video.mp4"),
      };

      expect(() => createProductSchema.parse(product)).toThrow();
    });

    it("should default status to draft", () => {
      const result = createProductSchema.parse(validProduct);

      expect(result.status).toBe("draft");
    });

    it("should default condition to new", () => {
      const result = createProductSchema.parse(validProduct);

      expect(result.condition).toBe("new");
    });

    it("should handle optional fields", () => {
      const product = {
        ...validProduct,
        shortDescription: "Short desc",
        originalPrice: 1500,
        brand: "Test Brand",
        tags: ["tag1", "tag2"],
        featured: true,
      };

      const result = createProductSchema.parse(product);

      expect(result.shortDescription).toBe("Short desc");
      expect(result.originalPrice).toBe(1500);
      expect(result.brand).toBe("Test Brand");
      expect(result.featured).toBe(true);
    });
  });

  describe("updateProductSchema", () => {
    it("should allow partial updates", () => {
      const update = { name: "Updated Name" };

      const result = updateProductSchema.parse(update);

      expect(result.name).toBe("Updated Name");
    });

    it("should allow empty updates with defaults", () => {
      const result = updateProductSchema.parse({});

      // Schema has default values even when partial
      expect(result).toBeDefined();
    });
  });

  describe("productQuerySchema", () => {
    it("should validate query with defaults", () => {
      const result = productQuerySchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe("createdAt");
      expect(result.sortOrder).toBe("desc");
    });

    it("should parse string numbers", () => {
      const query = { page: "2", limit: "50" };

      const result = productQuerySchema.parse(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("should reject invalid page number", () => {
      const query = { page: "0" };

      expect(() => productQuerySchema.parse(query)).toThrow();
    });

    it("should reject limit exceeding 100", () => {
      const query = { limit: "101" };

      expect(() => productQuerySchema.parse(query)).toThrow();
    });

    it("should handle filter options", () => {
      const query = {
        shopId: "shop123",
        categoryId: "cat123",
        condition: "new",
        status: "published",
        inStock: "true",
        featured: "true",
        minPrice: "100",
        maxPrice: "5000",
      };

      const result = productQuerySchema.parse(query);

      expect(result.shopId).toBe("shop123");
      expect(result.condition).toBe("new");
      expect(result.inStock).toBe(true);
      expect(result.minPrice).toBe(100);
    });
  });

  describe("bulkUpdateStatusSchema", () => {
    it("should validate bulk status update", () => {
      const update = {
        productIds: ["prod1", "prod2"],
        status: "published",
      };

      const result = bulkUpdateStatusSchema.parse(update);

      expect(result.productIds).toHaveLength(2);
      expect(result.status).toBe("published");
    });

    it("should require at least one product ID", () => {
      const update = {
        productIds: [],
        status: "published",
      };

      expect(() => bulkUpdateStatusSchema.parse(update)).toThrow();
    });
  });

  describe("bulkUpdatePriceSchema", () => {
    it("should validate bulk price update", () => {
      const update = {
        productIds: ["prod1", "prod2"],
        priceAdjustment: 100,
        adjustmentType: "fixed",
      };

      const result = bulkUpdatePriceSchema.parse(update);

      expect(result.priceAdjustment).toBe(100);
      expect(result.adjustmentType).toBe("fixed");
    });

    it("should accept negative adjustments", () => {
      const update = {
        productIds: ["prod1"],
        priceAdjustment: -50,
        adjustmentType: "fixed",
      };

      const result = bulkUpdatePriceSchema.parse(update);

      expect(result.priceAdjustment).toBe(-50);
    });

    it("should accept percentage adjustments", () => {
      const update = {
        productIds: ["prod1"],
        priceAdjustment: 10,
        adjustmentType: "percentage",
      };

      const result = bulkUpdatePriceSchema.parse(update);

      expect(result.adjustmentType).toBe("percentage");
    });
  });

  describe("featureProductSchema", () => {
    it("should validate feature product data", () => {
      const data = {
        featured: true,
        featuredPriority: 50,
      };

      const result = featureProductSchema.parse(data);

      expect(result.featured).toBe(true);
      expect(result.featuredPriority).toBe(50);
    });

    it("should reject priority exceeding 100", () => {
      const data = {
        featured: true,
        featuredPriority: 101,
      };

      expect(() => featureProductSchema.parse(data)).toThrow();
    });

    it("should reject negative priority", () => {
      const data = {
        featured: true,
        featuredPriority: -1,
      };

      expect(() => featureProductSchema.parse(data)).toThrow();
    });
  });

  describe("updateStockSchema", () => {
    it("should validate stock update", () => {
      const update = {
        stockCount: 50,
        reason: "Restock from supplier",
      };

      const result = updateStockSchema.parse(update);

      expect(result.stockCount).toBe(50);
      expect(result.reason).toBe("Restock from supplier");
    });

    it("should reject negative stock", () => {
      const update = {
        stockCount: -5,
      };

      expect(() => updateStockSchema.parse(update)).toThrow();
    });

    it("should allow zero stock", () => {
      const update = {
        stockCount: 0,
      };

      const result = updateStockSchema.parse(update);

      expect(result.stockCount).toBe(0);
    });
  });
});
