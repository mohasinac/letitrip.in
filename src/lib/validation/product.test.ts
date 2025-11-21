/**
 * Tests for validation/product.ts
 * Testing product validation schemas
 */

import { describe, it, expect } from "@jest/globals";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  bulkUpdateStatusSchema,
  bulkUpdatePriceSchema,
  featureProductSchema,
  updateStockSchema,
  ProductCondition,
  ProductStatus,
} from "./product";

describe("ProductCondition", () => {
  it("should accept valid conditions", () => {
    expect(ProductCondition.safeParse("new").success).toBe(true);
    expect(ProductCondition.safeParse("used").success).toBe(true);
    expect(ProductCondition.safeParse("refurbished").success).toBe(true);
  });

  it("should reject invalid conditions", () => {
    expect(ProductCondition.safeParse("broken").success).toBe(false);
  });
});

describe("ProductStatus", () => {
  it("should accept valid statuses", () => {
    expect(ProductStatus.safeParse("draft").success).toBe(true);
    expect(ProductStatus.safeParse("published").success).toBe(true);
    expect(ProductStatus.safeParse("archived").success).toBe(true);
    expect(ProductStatus.safeParse("out-of-stock").success).toBe(true);
  });

  it("should reject invalid statuses", () => {
    expect(ProductStatus.safeParse("invalid").success).toBe(false);
  });
});

describe("createProductSchema", () => {
  it("should validate valid product data", () => {
    const validProduct = {
      name: "Test Product Name That Is Long Enough",
      slug: "test-product-slug",
      description:
        "This is a detailed description of the product that meets the minimum length requirement for validation.",
      shopId: "shop123",
      categoryId: "category123",
      price: 1000,
      images: ["https://example.com/image1.jpg"],
      status: "draft" as const,
    };

    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("should reject product with short name", () => {
    const invalidProduct = {
      name: "Short",
      slug: "test-slug",
      description: "Valid description",
      shopId: "shop123",
      categoryId: "category123",
      price: 1000,
      images: ["https://example.com/image1.jpg"],
    };

    const result = createProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) =>
        issue.message.includes("at least 10 characters")
      )
    ).toBe(true);
  });

  it("should reject product with invalid slug", () => {
    const invalidProduct = {
      name: "Valid Product Name",
      slug: "Invalid Slug With Spaces",
      description: "Valid description",
      shopId: "shop123",
      categoryId: "category123",
      price: 1000,
      images: ["https://example.com/image1.jpg"],
    };

    const result = createProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) =>
        issue.message.includes("only lowercase letters")
      )
    ).toBe(true);
  });

  it("should reject product with negative price", () => {
    const invalidProduct = {
      name: "Valid Product Name",
      slug: "valid-slug",
      description: "Valid description",
      shopId: "shop123",
      categoryId: "category123",
      price: -100,
      images: ["https://example.com/image1.jpg"],
    };

    const result = createProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.message.includes("positive"))
    ).toBe(true);
  });

  it("should reject product without required images", () => {
    const invalidProduct = {
      name: "Valid Product Name",
      slug: "valid-slug",
      description: "Valid description",
      shopId: "shop123",
      categoryId: "category123",
      price: 1000,
      // images not provided
    };

    const result = createProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (issue) =>
          issue.message.includes("at least one image") ||
          issue.path.includes("images")
      )
    ).toBe(true);
  });

  it("should validate product with all optional fields", () => {
    const fullProduct = {
      name: "Test Product Name That Is Long Enough",
      slug: "test-product-slug",
      description:
        "This is a detailed description of the product that meets the minimum length requirement for validation.",
      shortDescription: "Short description",
      shopId: "shop123",
      categoryId: "category123",
      price: 1000,
      originalPrice: 1200,
      costPrice: 800,
      stockCount: 50,
      lowStockThreshold: 5,
      sku: "TEST-SKU-123",
      condition: "new" as const,
      brand: "Test Brand",
      manufacturer: "Test Manufacturer",
      countryOfOrigin: "Japan",
      images: [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
      videos: ["https://example.com/video1.mp4"],
      specifications: [
        { name: "Weight", value: "1.5kg" },
        { name: "Dimensions", value: "10x20x5 cm" },
      ],
      variants: [
        { name: "Size", value: "Large", priceAdjustment: 100, stockCount: 10 },
      ],
      dimensions: {
        length: 20,
        width: 10,
        height: 5,
        unit: "cm" as const,
        weight: 1.5,
        weightUnit: "kg" as const,
      },
      shippingClass: "standard" as const,
      tags: ["electronics", "gadgets"],
      isReturnable: true,
      returnWindowDays: 7,
      warranty: "1 year manufacturer warranty",
      metaTitle: "Test Product - Best Electronics",
      metaDescription: "Buy the best test product with great features",
      publishDate: new Date(),
      status: "published" as const,
      featured: true,
    };

    const result = createProductSchema.safeParse(fullProduct);
    expect(result.success).toBe(true);
  });
});

describe("updateProductSchema", () => {
  it("should allow partial updates", () => {
    const partialUpdate = {
      name: "Updated Product Name",
      price: 1500,
    };

    const result = updateProductSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it("should validate partial data", () => {
    const invalidUpdate = {
      price: -500,
    };

    const result = updateProductSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});

describe("productQuerySchema", () => {
  it("should validate valid query params", () => {
    const validQuery = {
      page: 1,
      limit: 20,
      sortBy: "price" as const,
      sortOrder: "desc" as const,
      minPrice: 100,
      maxPrice: 1000,
      inStock: true,
      search: "laptop",
    };

    const result = productQuerySchema.safeParse(validQuery);
    expect(result.success).toBe(true);
  });

  it("should reject invalid page number", () => {
    const invalidQuery = {
      page: 0,
    };

    const result = productQuerySchema.safeParse(invalidQuery);
    expect(result.success).toBe(false);
  });

  it("should reject invalid limit", () => {
    const invalidQuery = {
      limit: 150,
    };

    const result = productQuerySchema.safeParse(invalidQuery);
    expect(result.success).toBe(false);
  });
});

describe("bulkUpdateStatusSchema", () => {
  it("should validate valid bulk status update", () => {
    const validUpdate = {
      productIds: ["prod1", "prod2", "prod3"],
      status: "published" as const,
    };

    const result = bulkUpdateStatusSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("should reject empty product IDs", () => {
    const invalidUpdate = {
      productIds: [],
      status: "published" as const,
    };

    const result = bulkUpdateStatusSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});

describe("bulkUpdatePriceSchema", () => {
  it("should validate valid bulk price update", () => {
    const validUpdate = {
      productIds: ["prod1", "prod2"],
      priceAdjustment: 100,
      adjustmentType: "fixed" as const,
    };

    const result = bulkUpdatePriceSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("should validate percentage adjustment", () => {
    const validUpdate = {
      productIds: ["prod1"],
      priceAdjustment: -10,
      adjustmentType: "percentage" as const,
    };

    const result = bulkUpdatePriceSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });
});

describe("featureProductSchema", () => {
  it("should validate feature product input", () => {
    const validInput = {
      featured: true,
      featuredPriority: 50,
    };

    const result = featureProductSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should reject invalid priority", () => {
    const invalidInput = {
      featured: true,
      featuredPriority: 150,
    };

    const result = featureProductSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});

describe("updateStockSchema", () => {
  it("should validate valid stock update", () => {
    const validUpdate = {
      stockCount: 100,
      reason: "Restocked from supplier",
    };

    const result = updateStockSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("should reject negative stock", () => {
    const invalidUpdate = {
      stockCount: -10,
    };

    const result = updateStockSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});
