/**
 * PRODUCT VALIDATION SCHEMA TESTS
 *
 * Tests for Zod product validation schemas
 */

import {
  ProductFormData,
  productSchema,
  productStep1Schema,
  productStep2Schema,
  productStep3Schema,
  productStep4Schema,
  productStep5Schema,
  productStep6Schema,
  productUpdateSchema,
} from "../product.schema";

describe("Product Validation Schema", () => {
  const validProductData: ProductFormData = {
    // Step 1: Basic Info
    name: "Test Product",
    slug: "test-product",
    categoryId: "cat_123",
    brand: "Test Brand",
    sku: "SKU-12345",

    // Step 2: Pricing & Stock
    price: 999.99,
    compareAtPrice: 1299.99,
    stockCount: 50,
    lowStockThreshold: 10,
    weight: 1.5,

    // Step 3: Product Details
    description:
      "This is a detailed product description that meets the minimum length requirements.",
    condition: "new",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    specifications: { Color: "Red", Size: "Large" },

    // Step 4: Media
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
    videos: ["https://example.com/video1.mp4"],

    // Step 5: Shipping & Policies
    shippingClass: "standard",
    returnPolicy: "30-day return policy",
    warrantyInfo: "1-year warranty",

    // Step 6: SEO & Publish
    metaTitle: "Test Product - Buy Now",
    metaDescription: "Buy our amazing test product with great features",
    featured: false,
    status: "published",

    // System fields
    shopId: "shop_123",
  };

  describe("Full Product Schema", () => {
    it("should validate complete valid product data", () => {
      const result = productSchema.safeParse(validProductData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProductData);
      }
    });

    it("should fail with empty data", () => {
      const result = productSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Step 1: Basic Info Validation", () => {
    describe("Name validation", () => {
      it("should accept valid product names", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          name: "Test Product",
        });

        expect(result.success).toBe(true);
      });

      it("should reject too short names", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          name: "AB",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("name");
        }
      });

      it("should reject too long names", () => {
        const longName = "A".repeat(201);
        const result = productStep1Schema.safeParse({
          ...validProductData,
          name: longName,
        });

        expect(result.success).toBe(false);
      });

      it("should handle special characters in names", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          name: "Test Product with & @ symbols!",
        });

        expect(result.success).toBe(true);
      });

      it("should handle Unicode in names", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          name: "उत्पाद Test 测试",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Slug validation", () => {
      it("should accept valid slugs", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          slug: "test-product-123",
        });

        expect(result.success).toBe(true);
      });

      it("should reject slugs with spaces", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          slug: "test product",
        });

        expect(result.success).toBe(false);
      });

      it("should reject slugs with uppercase", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          slug: "Test-Product",
        });

        expect(result.success).toBe(false);
      });

      it("should reject slugs with special characters", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          slug: "test_product@123",
        });

        expect(result.success).toBe(false);
      });

      it("should accept slugs with hyphens and numbers", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          slug: "test-product-123",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Category validation", () => {
      it("should require category ID", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          categoryId: "",
        });

        expect(result.success).toBe(false);
      });

      it("should accept valid category ID", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          categoryId: "cat_123",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Brand validation", () => {
      it("should require brand", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          brand: "",
        });

        expect(result.success).toBe(false);
      });

      it("should accept valid brand names", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          brand: "Nike",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("SKU validation", () => {
      it("should accept valid SKUs", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          sku: "SKU-12345",
        });

        expect(result.success).toBe(true);
      });

      it("should handle optional SKU", () => {
        const data = { ...validProductData };
        delete data.sku;
        const result = productStep1Schema.safeParse(data);

        expect(result.success).toBe(true);
      });

      it("should reject too short SKUs", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          sku: "SK",
        });

        expect(result.success).toBe(false);
      });

      it("should reject too long SKUs", () => {
        const result = productStep1Schema.safeParse({
          ...validProductData,
          sku: "A".repeat(101),
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Step 2: Pricing & Stock Validation", () => {
    describe("Price validation", () => {
      it("should accept valid prices", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          price: 999.99,
        });

        expect(result.success).toBe(true);
      });

      it("should reject negative prices", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          price: -10,
        });

        expect(result.success).toBe(false);
      });

      it("should reject zero prices", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          price: 0,
        });

        expect(result.success).toBe(false);
      });

      it("should reject extremely high prices", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          price: 100000000,
        });

        expect(result.success).toBe(false);
      });

      it("should accept decimal prices", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          price: 19.99,
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Compare at price validation", () => {
      it("should accept valid compare at prices", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          compareAtPrice: 1299.99,
        });

        expect(result.success).toBe(true);
      });

      it("should handle optional compare at price", () => {
        const data = { ...validProductData };
        delete data.compareAtPrice;
        const result = productStep2Schema.safeParse(data);

        expect(result.success).toBe(true);
      });

      it("should reject negative compare at prices", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          compareAtPrice: -100,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Stock count validation", () => {
      it("should accept valid stock counts", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          stockCount: 50,
        });

        expect(result.success).toBe(true);
      });

      it("should accept zero stock", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          stockCount: 0,
        });

        expect(result.success).toBe(true);
      });

      it("should reject negative stock", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          stockCount: -5,
        });

        expect(result.success).toBe(false);
      });

      it("should reject decimal stock counts", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          stockCount: 10.5,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Low stock threshold validation", () => {
      it("should use default value when not provided", () => {
        const data = { ...validProductData };
        delete data.lowStockThreshold;
        const result = productStep2Schema.safeParse(data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.lowStockThreshold).toBe(10);
        }
      });

      it("should accept valid thresholds", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          lowStockThreshold: 5,
        });

        expect(result.success).toBe(true);
      });

      it("should reject negative thresholds", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          lowStockThreshold: -1,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Weight validation", () => {
      it("should accept valid weights", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          weight: 1.5,
        });

        expect(result.success).toBe(true);
      });

      it("should accept zero weight", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          weight: 0,
        });

        expect(result.success).toBe(true);
      });

      it("should reject negative weights", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          weight: -1,
        });

        expect(result.success).toBe(false);
      });

      it("should reject extremely high weights", () => {
        const result = productStep2Schema.safeParse({
          ...validProductData,
          weight: 10001,
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Step 3: Product Details Validation", () => {
    describe("Description validation", () => {
      it("should accept valid descriptions", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          description:
            "This is a valid product description with enough length.",
        });

        expect(result.success).toBe(true);
      });

      it("should reject too short descriptions", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          description: "Short",
        });

        expect(result.success).toBe(false);
      });

      it("should reject too long descriptions", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          description: "A".repeat(10001),
        });

        expect(result.success).toBe(false);
      });

      it("should handle special characters", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          description:
            "Description with special chars: & @ # $ % ^ * ( ) - + = { } [ ] | \\ : ; \" ' < > , . ? /",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Condition validation", () => {
      it("should accept new condition", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          condition: "new",
        });

        expect(result.success).toBe(true);
      });

      it("should accept like-new condition", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          condition: "like-new",
        });

        expect(result.success).toBe(true);
      });

      it("should accept good condition", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          condition: "good",
        });

        expect(result.success).toBe(true);
      });

      it("should accept fair condition", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          condition: "fair",
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid conditions", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          condition: "excellent",
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Features validation", () => {
      it("should accept feature arrays", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          features: ["Feature 1", "Feature 2", "Feature 3"],
        });

        expect(result.success).toBe(true);
      });

      it("should handle optional features", () => {
        const data = { ...validProductData };
        delete data.features;
        const result = productStep3Schema.safeParse(data);

        expect(result.success).toBe(true);
      });

      it("should accept empty feature arrays", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          features: [],
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Specifications validation", () => {
      it("should accept specification objects", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          specifications: { Color: "Red", Size: "Large", Weight: "1kg" },
        });

        expect(result.success).toBe(true);
      });

      it("should handle optional specifications", () => {
        const data = { ...validProductData };
        delete data.specifications;
        const result = productStep3Schema.safeParse(data);

        expect(result.success).toBe(true);
      });

      it("should accept empty specification objects", () => {
        const result = productStep3Schema.safeParse({
          ...validProductData,
          specifications: {},
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Step 4: Media Validation", () => {
    describe("Images validation", () => {
      it("should require at least one image", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          images: [],
        });

        expect(result.success).toBe(false);
      });

      it("should accept valid image URLs", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          images: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
          ],
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid URLs", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          images: ["not-a-url"],
        });

        expect(result.success).toBe(false);
      });

      it("should reject too many images", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          images: Array(21).fill("https://example.com/image.jpg"),
        });

        expect(result.success).toBe(false);
      });

      it("should accept maximum allowed images", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          images: Array(10).fill("https://example.com/image.jpg"),
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Videos validation", () => {
      it("should accept valid video URLs", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          videos: ["https://example.com/video.mp4"],
        });

        expect(result.success).toBe(true);
      });

      it("should handle optional videos", () => {
        const data = { ...validProductData };
        delete data.videos;
        const result = productStep4Schema.safeParse(data);

        expect(result.success).toBe(true);
      });

      it("should reject too many videos", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          videos: Array(6).fill("https://example.com/video.mp4"),
        });

        expect(result.success).toBe(false);
      });

      it("should reject invalid video URLs", () => {
        const result = productStep4Schema.safeParse({
          ...validProductData,
          videos: ["invalid-url"],
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Step 5: Shipping & Policies Validation", () => {
    describe("Shipping class validation", () => {
      it("should accept standard shipping", () => {
        const result = productStep5Schema.safeParse({
          ...validProductData,
          shippingClass: "standard",
        });

        expect(result.success).toBe(true);
      });

      it("should accept express shipping", () => {
        const result = productStep5Schema.safeParse({
          ...validProductData,
          shippingClass: "express",
        });

        expect(result.success).toBe(true);
      });

      it("should accept overnight shipping", () => {
        const result = productStep5Schema.safeParse({
          ...validProductData,
          shippingClass: "overnight",
        });

        expect(result.success).toBe(true);
      });

      it("should accept free shipping", () => {
        const result = productStep5Schema.safeParse({
          ...validProductData,
          shippingClass: "free",
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid shipping classes", () => {
        const result = productStep5Schema.safeParse({
          ...validProductData,
          shippingClass: "super-fast",
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Policies validation", () => {
      it("should accept return policy", () => {
        const result = productStep5Schema.safeParse({
          ...validProductData,
          returnPolicy: "30-day return policy",
        });

        expect(result.success).toBe(true);
      });

      it("should accept warranty info", () => {
        const result = productStep5Schema.safeParse({
          ...validProductData,
          warrantyInfo: "1-year warranty",
        });

        expect(result.success).toBe(true);
      });

      it("should handle optional policies", () => {
        const data = { ...validProductData };
        delete data.returnPolicy;
        delete data.warrantyInfo;
        const result = productStep5Schema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Step 6: SEO & Publish Validation", () => {
    describe("Meta title validation", () => {
      it("should accept valid meta titles", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          metaTitle: "Test Product - Buy Now",
        });

        expect(result.success).toBe(true);
      });

      it("should reject too long meta titles", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          metaTitle: "A".repeat(61),
        });

        expect(result.success).toBe(false);
      });

      it("should handle optional meta titles", () => {
        const data = { ...validProductData };
        delete data.metaTitle;
        const result = productStep6Schema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    describe("Meta description validation", () => {
      it("should accept valid meta descriptions", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          metaDescription: "Buy our amazing test product",
        });

        expect(result.success).toBe(true);
      });

      it("should reject too long meta descriptions", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          metaDescription: "A".repeat(161),
        });

        expect(result.success).toBe(false);
      });

      it("should handle optional meta descriptions", () => {
        const data = { ...validProductData };
        delete data.metaDescription;
        const result = productStep6Schema.safeParse(data);

        expect(result.success).toBe(true);
      });
    });

    describe("Featured flag validation", () => {
      it("should accept featured true", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          featured: true,
        });

        expect(result.success).toBe(true);
      });

      it("should accept featured false", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          featured: false,
        });

        expect(result.success).toBe(true);
      });

      it("should default to false", () => {
        const data = { ...validProductData };
        delete data.featured;
        const result = productStep6Schema.safeParse(data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.featured).toBe(false);
        }
      });
    });

    describe("Status validation", () => {
      it("should accept draft status", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          status: "draft",
        });

        expect(result.success).toBe(true);
      });

      it("should accept published status", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          status: "published",
        });

        expect(result.success).toBe(true);
      });

      it("should accept archived status", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          status: "archived",
        });

        expect(result.success).toBe(true);
      });

      it("should reject invalid statuses", () => {
        const result = productStep6Schema.safeParse({
          ...validProductData,
          status: "pending",
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Shop ID Validation", () => {
    it("should require shop ID", () => {
      const result = productSchema.safeParse({
        ...validProductData,
        shopId: "",
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid shop IDs", () => {
      const result = productSchema.safeParse({
        ...validProductData,
        shopId: "shop_123",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Product Update Schema", () => {
    it("should allow partial updates", () => {
      const result = productUpdateSchema.safeParse({
        name: "Updated Name",
        price: 1499.99,
      });

      expect(result.success).toBe(true);
    });

    it("should validate partial data", () => {
      const result = productUpdateSchema.safeParse({
        name: "AB", // Too short
      });

      expect(result.success).toBe(false);
    });

    it("should accept empty updates", () => {
      const result = productUpdateSchema.safeParse({});

      expect(result.success).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long valid names", () => {
      const result = productSchema.safeParse({
        ...validProductData,
        name: "A".repeat(200),
      });

      expect(result.success).toBe(true);
    });

    it("should handle minimum valid price", () => {
      const result = productSchema.safeParse({
        ...validProductData,
        price: 1,
      });

      expect(result.success).toBe(true);
    });

    it("should handle maximum stock count", () => {
      const result = productSchema.safeParse({
        ...validProductData,
        stockCount: 999999,
      });

      expect(result.success).toBe(true);
    });

    it("should handle all optional fields missing", () => {
      const minimalData = {
        name: "Test Product",
        slug: "test-product",
        categoryId: "cat_123",
        brand: "Test Brand",
        price: 999.99,
        stockCount: 50,
        lowStockThreshold: 10,
        weight: 1.5,
        description: "This is a test product description that is long enough.",
        condition: "new",
        images: ["https://example.com/image.jpg"],
        shippingClass: "standard",
        featured: false,
        status: "draft",
        shopId: "shop_123",
      };

      const result = productSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
    });
  });
});
