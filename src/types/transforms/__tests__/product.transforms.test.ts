/**
 * PRODUCT TRANSFORMATION TESTS
 * Tests for FE/BE transformation functions
 */

import { ProductBE, ProductListItemBE } from "../../backend/product.types";
import { ProductFormFE } from "../../frontend/product.types";
import { ProductStatus } from "../../shared/common.types";
import {
  toBEProductCreate,
  toBEProductUpdate,
  toFEProduct,
  toFEProductCard,
  toFEProductCards,
  toFEProducts,
} from "../product.transforms";

describe("Product Transformations", () => {
  const mockProductBE: ProductBE = {
    id: "prod-123",
    name: "Test Product",
    slug: "test-product",
    sku: "SKU-123",
    description: "This is a test product",
    categoryId: "cat-123",
    categoryIds: ["cat-123", "cat-456"],
    brand: "Test Brand",
    tags: ["electronics", "gadgets"],
    price: 10000,
    compareAtPrice: 15000,
    stockCount: 50,
    lowStockThreshold: 10,
    weight: 500,
    dimensions: { length: 10, width: 5, height: 2 },
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
    videos: ["https://example.com/video1.mp4"],
    status: ProductStatus.PUBLISHED,
    condition: "new",
    featured: true,
    isReturnable: true,
    shopId: "shop-123",
    sellerId: "seller-123",
    shippingClass: "standard",
    returnWindowDays: 7,
    returnPolicy: "7 days return policy",
    warrantyInfo: "1 year warranty",
    features: ["Feature 1", "Feature 2"],
    specifications: { color: "Black", size: "Medium" },
    metaTitle: "Test Product SEO",
    metaDescription: "Test product meta description",
    viewCount: 100,
    salesCount: 25,
    favoriteCount: 10,
    reviewCount: 15,
    averageRating: 4.5,
    countryOfOrigin: "India",
    manufacturer: "Test Manufacturer",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
  };

  describe("toFEProduct", () => {
    it("should transform backend product to frontend product", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.id).toBe("prod-123");
      expect(result.name).toBe("Test Product");
      expect(result.slug).toBe("test-product");
      expect(result.sku).toBe("SKU-123");
      expect(result.description).toBe("This is a test product");
    });

    it("should calculate discount correctly", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.discount).toBe(5000);
      expect(result.discountPercentage).toBe(33);
    });

    it("should return null discount when compareAtPrice is not set", () => {
      const product: ProductBE = {
        ...mockProductBE,
        compareAtPrice: undefined,
      };

      const result = toFEProduct(product);

      expect(result.discount).toBeNull();
      expect(result.discountPercentage).toBeNull();
    });

    it("should return null discount when compareAtPrice is less than price", () => {
      const product: ProductBE = {
        ...mockProductBE,
        price: 15000,
        compareAtPrice: 10000,
      };

      const result = toFEProduct(product);

      expect(result.discount).toBeNull();
      expect(result.discountPercentage).toBeNull();
    });

    it("should format prices correctly", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.formattedPrice).toContain("10,000");
      expect(result.formattedCompareAtPrice).toContain("15,000");
    });

    it("should determine stock status correctly - in stock", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.isInStock).toBe(true);
      expect(result.isLowStock).toBe(false);
      expect(result.stockStatus).toBe("in-stock");
    });

    it("should determine stock status correctly - low stock", () => {
      const product: ProductBE = {
        ...mockProductBE,
        stockCount: 5,
        lowStockThreshold: 10,
      };

      const result = toFEProduct(product);

      expect(result.isInStock).toBe(true);
      expect(result.isLowStock).toBe(true);
      expect(result.stockStatus).toBe("low-stock");
    });

    it("should determine stock status correctly - out of stock", () => {
      const product: ProductBE = {
        ...mockProductBE,
        stockCount: 0,
      };

      const result = toFEProduct(product);

      expect(result.isInStock).toBe(false);
      expect(result.isLowStock).toBe(false);
      expect(result.stockStatus).toBe("out-of-stock");
    });

    it("should round rating to nearest 0.5", () => {
      const product: ProductBE = {
        ...mockProductBE,
        averageRating: 4.3,
      };

      const result = toFEProduct(product);

      expect(result.ratingStars).toBe(4.5);
    });

    it("should set isNew flag for products within 30 days", () => {
      const newProduct: ProductBE = {
        ...mockProductBE,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      };

      const result = toFEProduct(newProduct);

      expect(result.isNew).toBe(true);
    });

    it("should not set isNew flag for products older than 30 days", () => {
      const oldProduct: ProductBE = {
        ...mockProductBE,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      };

      const result = toFEProduct(oldProduct);

      expect(result.isNew).toBe(false);
    });

    it("should set isTrending flag for products with high sales", () => {
      const trendingProduct: ProductBE = {
        ...mockProductBE,
        salesCount: 150,
      };

      const result = toFEProduct(trendingProduct);

      expect(result.isTrending).toBe(true);
    });

    it("should generate badges correctly", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.badges).toBeDefined();
      expect(Array.isArray(result.badges)).toBe(true);
    });

    it("should include 'New' badge for new products", () => {
      const newProduct: ProductBE = {
        ...mockProductBE,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      };

      const result = toFEProduct(newProduct);
      const newBadge = result.badges.find((b) => b.type === "new");

      expect(newBadge).toBeDefined();
      expect(newBadge?.label).toBe("New");
      expect(newBadge?.color).toBe("blue");
    });

    it("should include sale badge with discount percentage", () => {
      const result = toFEProduct(mockProductBE);
      const saleBadge = result.badges.find((b) => b.type === "sale");

      expect(saleBadge).toBeDefined();
      expect(saleBadge?.label).toBe("33% OFF");
      expect(saleBadge?.color).toBe("red");
    });

    it("should include featured badge for featured products", () => {
      const result = toFEProduct(mockProductBE);
      const featuredBadge = result.badges.find((b) => b.type === "featured");

      expect(featuredBadge).toBeDefined();
      expect(featuredBadge?.label).toBe("Featured");
      expect(featuredBadge?.color).toBe("purple");
    });

    it("should include low-stock badge", () => {
      const product: ProductBE = {
        ...mockProductBE,
        stockCount: 3,
        lowStockThreshold: 5,
      };

      const result = toFEProduct(product);
      const lowStockBadge = result.badges.find((b) => b.type === "low-stock");

      expect(lowStockBadge).toBeDefined();
      expect(lowStockBadge?.label).toBe("Low Stock");
      expect(lowStockBadge?.color).toBe("yellow");
    });

    it("should include out-of-stock badge", () => {
      const product: ProductBE = {
        ...mockProductBE,
        stockCount: 0,
      };

      const result = toFEProduct(product);
      const outOfStockBadge = result.badges.find(
        (b) => b.type === "out-of-stock"
      );

      expect(outOfStockBadge).toBeDefined();
      expect(outOfStockBadge?.label).toBe("Out of Stock");
      expect(outOfStockBadge?.color).toBe("red");
    });

    it("should include trending badge for high sales", () => {
      const product: ProductBE = {
        ...mockProductBE,
        salesCount: 150,
      };

      const result = toFEProduct(product);
      const trendingBadge = result.badges.find((b) => b.type === "trending");

      expect(trendingBadge).toBeDefined();
      expect(trendingBadge?.label).toBe("Trending");
      expect(trendingBadge?.color).toBe("green");
    });

    it("should set primary image correctly", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.primaryImage).toBe("https://example.com/image1.jpg");
    });

    it("should use placeholder when no images available", () => {
      const product: ProductBE = {
        ...mockProductBE,
        images: [],
      };

      const result = toFEProduct(product);

      expect(result.primaryImage).toBe("/placeholder-product.jpg");
    });

    it("should set isPublished flag correctly", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.isPublished).toBe(true);
    });

    it("should handle unpublished product", () => {
      const product: ProductBE = {
        ...mockProductBE,
        status: ProductStatus.DRAFT,
      };

      const result = toFEProduct(product);

      expect(result.isPublished).toBe(false);
    });

    it("should handle hasReviews flag correctly", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.hasReviews).toBe(true);
    });

    it("should handle no reviews", () => {
      const product: ProductBE = {
        ...mockProductBE,
        reviewCount: 0,
      };

      const result = toFEProduct(product);

      expect(result.hasReviews).toBe(false);
    });

    it("should handle missing optional fields", () => {
      const minimalProduct: ProductBE = {
        id: "prod-min",
        name: "Minimal Product",
        slug: "minimal-product",
        sku: "SKU-MIN",
        description: "",
        categoryId: "cat-123",
        price: 5000,
        stockCount: 10,
        status: ProductStatus.PUBLISHED,
        condition: "new",
        shopId: "shop-123",
        sellerId: "seller-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        categoryIds: [],
        brand: "",
        tags: [],
        compareAtPrice: undefined,
        lowStockThreshold: 5,
        weight: null,
        dimensions: null,
        images: [],
        videos: [],
        featured: false,
        isReturnable: true,
        shippingClass: "standard",
        returnWindowDays: 7,
        returnPolicy: "",
        warrantyInfo: "",
        features: [],
        specifications: {},
        metaTitle: "",
        metaDescription: "",
        viewCount: 0,
        salesCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
        countryOfOrigin: "India",
        manufacturer: "",
      };

      const result = toFEProduct(minimalProduct);

      expect(result.id).toBe("prod-min");
      expect(result.discount).toBeNull();
      expect(result.images).toEqual([]);
      expect(result.videos).toEqual([]);
    });

    it("should handle Firestore timestamp format", () => {
      const product: ProductBE = {
        ...mockProductBE,
        createdAt: { _seconds: 1704103200 } as any, // 2024-01-01 10:00:00 UTC
        updatedAt: { _seconds: 1705315200 } as any,
      };

      const result = toFEProduct(product);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle ISO string dates", () => {
      const product: ProductBE = {
        ...mockProductBE,
        createdAt: "2024-01-01T10:00:00Z" as any,
        updatedAt: "2024-01-15T10:00:00Z" as any,
      };

      const result = toFEProduct(product);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle alternative property names (created_at/updated_at)", () => {
      const product: any = {
        ...mockProductBE,
        created_at: new Date("2024-01-01T10:00:00Z"),
        updated_at: new Date("2024-01-15T10:00:00Z"),
      };
      delete product.createdAt;
      delete product.updatedAt;

      const result = toFEProduct(product);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should include backwards compatibility aliases", () => {
      const result = toFEProduct(mockProductBE);

      expect(result.costPrice).toBe(15000);
      expect(result.originalPrice).toBe(15000);
      expect(result.rating).toBe(4.5);
    });
  });

  describe("toFEProductCard", () => {
    const mockProductListItemBE: ProductListItemBE = {
      id: "prod-123",
      name: "Test Product",
      slug: "test-product",
      sku: "SKU-123",
      price: 10000,
      compareAtPrice: 15000,
      images: ["https://example.com/image1.jpg"],
      videos: [],
      status: ProductStatus.PUBLISHED,
      stockCount: 50,
      stockStatus: "in-stock",
      averageRating: 4.5,
      reviewCount: 15,
      shopId: "shop-123",
      brand: "Test Brand",
      featured: true,
      categoryId: "cat-123",
      salesCount: 25,
      lowStockThreshold: 10,
      createdAt: new Date("2024-01-01T10:00:00Z"),
    };

    it("should transform backend product list item to frontend card", () => {
      const result = toFEProductCard(mockProductListItemBE);

      expect(result.id).toBe("prod-123");
      expect(result.name).toBe("Test Product");
      expect(result.slug).toBe("test-product");
      expect(result.price).toBe(10000);
    });

    it("should calculate discount correctly", () => {
      const result = toFEProductCard(mockProductListItemBE);

      expect(result.discount).toBe(5000);
      expect(result.discountPercentage).toBe(33);
    });

    it("should format price correctly", () => {
      const result = toFEProductCard(mockProductListItemBE);

      expect(result.formattedPrice).toContain("10,000");
    });

    it("should round rating to nearest 0.5", () => {
      const result = toFEProductCard(mockProductListItemBE);

      expect(result.ratingStars).toBe(4.5);
    });

    it("should set primary image correctly", () => {
      const result = toFEProductCard(mockProductListItemBE);

      expect(result.primaryImage).toBe("https://example.com/image1.jpg");
    });

    it("should use placeholder when no images", () => {
      const product: ProductListItemBE = {
        ...mockProductListItemBE,
        images: [],
      };

      const result = toFEProductCard(product);

      expect(result.primaryImage).toBe("/placeholder-product.jpg");
    });

    it("should generate badges correctly", () => {
      const result = toFEProductCard(mockProductListItemBE);

      expect(result.badges).toBeDefined();
      expect(Array.isArray(result.badges)).toBe(true);
    });

    it("should include backwards compatibility aliases", () => {
      const result = toFEProductCard(mockProductListItemBE);

      expect(result.originalPrice).toBe(15000);
      expect(result.rating).toBe(4.5);
      expect(result.condition).toBe("new");
    });
  });

  describe("toBEProductCreate", () => {
    const mockFormFE: ProductFormFE = {
      name: "New Product",
      slug: "new-product",
      sku: "SKU-NEW",
      description: "New product description",
      categoryId: "cat-123",
      brand: "Brand New",
      price: 8000,
      compareAtPrice: 10000,
      stockCount: 100,
      lowStockThreshold: 15,
      weight: 750,
      images: ["https://example.com/new-image.jpg"],
      videos: ["https://example.com/new-video.mp4"],
      status: ProductStatus.DRAFT,
      condition: "new",
      shopId: "shop-123",
      shippingClass: "express",
      returnPolicy: "14 days return",
      warrantyInfo: "2 years warranty",
      features: ["New Feature 1", "New Feature 2"],
      specifications: { color: "White", size: "Large" },
      metaTitle: "New Product SEO",
      metaDescription: "New product meta",
      featured: false,
    };

    it("should transform frontend form to backend create request", () => {
      const result = toBEProductCreate(mockFormFE);

      expect(result.name).toBe("New Product");
      expect(result.slug).toBe("new-product");
      expect(result.sku).toBe("SKU-NEW");
      expect(result.description).toBe("New product description");
      expect(result.categoryId).toBe("cat-123");
      expect(result.brand).toBe("Brand New");
      expect(result.price).toBe(8000);
      expect(result.compareAtPrice).toBe(10000);
      expect(result.stockCount).toBe(100);
      expect(result.lowStockThreshold).toBe(15);
    });

    it("should set default values correctly", () => {
      const result = toBEProductCreate(mockFormFE);

      expect(result.isReturnable).toBe(true);
      expect(result.countryOfOrigin).toBe("India");
      expect(result.trackInventory).toBe(true);
    });

    it("should handle empty optional fields", () => {
      const minimalForm: ProductFormFE = {
        ...mockFormFE,
        brand: "",
        description: "",
        compareAtPrice: undefined,
        weight: undefined,
        images: [],
        videos: [],
        returnPolicy: "",
        warrantyInfo: "",
        features: [],
        specifications: {},
        metaTitle: "",
        metaDescription: "",
      };

      const result = toBEProductCreate(minimalForm);

      expect(result.brand).toBe("");
      expect(result.description).toBe("");
      expect(result.compareAtPrice).toBeUndefined();
    });
  });

  describe("toBEProductUpdate", () => {
    it("should transform partial form to backend update request", () => {
      const partialForm: Partial<ProductFormFE> = {
        name: "Updated Name",
        price: 12000,
        stockCount: 75,
      };

      const result = toBEProductUpdate(partialForm);

      expect(result.name).toBe("Updated Name");
      expect(result.price).toBe(12000);
      expect(result.stockCount).toBe(75);
      expect(result.description).toBeUndefined();
      expect(result.brand).toBeUndefined();
    });

    it("should only include provided fields", () => {
      const partialForm: Partial<ProductFormFE> = {
        featured: true,
      };

      const result = toBEProductUpdate(partialForm);

      expect(result.featured).toBe(true);
      expect(Object.keys(result)).toHaveLength(1);
    });

    it("should handle all possible update fields", () => {
      const fullForm: Partial<ProductFormFE> = {
        name: "Updated",
        slug: "updated",
        description: "Updated desc",
        categoryId: "cat-new",
        brand: "Updated Brand",
        price: 9000,
        compareAtPrice: 11000,
        stockCount: 60,
        lowStockThreshold: 8,
        weight: 600,
        images: ["new-image.jpg"],
        videos: ["new-video.mp4"],
        status: ProductStatus.PUBLISHED,
        condition: "used",
        shippingClass: "premium",
        returnPolicy: "New return policy",
        warrantyInfo: "New warranty",
        features: ["New feature"],
        specifications: { newSpec: "value" },
        metaTitle: "New SEO",
        metaDescription: "New meta",
        featured: true,
      };

      const result = toBEProductUpdate(fullForm);

      expect(Object.keys(result).length).toBeGreaterThan(15);
      expect(result.name).toBe("Updated");
      expect(result.featured).toBe(true);
    });
  });

  describe("toFEProducts (batch)", () => {
    it("should transform array of backend products", () => {
      const products: ProductBE[] = [
        mockProductBE,
        { ...mockProductBE, id: "prod-456", name: "Product 2" },
      ];

      const result = toFEProducts(products);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("prod-123");
      expect(result[1].id).toBe("prod-456");
      expect(result[1].name).toBe("Product 2");
    });

    it("should handle empty array", () => {
      const result = toFEProducts([]);

      expect(result).toEqual([]);
    });
  });

  describe("toFEProductCards (batch)", () => {
    it("should transform array of backend product list items", () => {
      const products: ProductListItemBE[] = [
        {
          id: "prod-123",
          name: "Product 1",
          slug: "product-1",
          sku: "SKU-1",
          price: 5000,
          compareAtPrice: null,
          images: [],
          videos: [],
          status: ProductStatus.PUBLISHED,
          stockCount: 10,
          stockStatus: "in-stock",
          averageRating: 4.0,
          reviewCount: 5,
          shopId: "shop-123",
          brand: "Brand A",
          featured: false,
          categoryId: "cat-123",
          salesCount: 10,
          lowStockThreshold: 5,
          createdAt: new Date(),
        },
        {
          id: "prod-456",
          name: "Product 2",
          slug: "product-2",
          sku: "SKU-2",
          price: 7000,
          compareAtPrice: null,
          images: [],
          videos: [],
          status: ProductStatus.PUBLISHED,
          stockCount: 20,
          stockStatus: "in-stock",
          averageRating: 3.5,
          reviewCount: 8,
          shopId: "shop-123",
          brand: "Brand B",
          featured: true,
          categoryId: "cat-456",
          salesCount: 15,
          lowStockThreshold: 5,
          createdAt: new Date(),
        },
      ];

      const result = toFEProductCards(products);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("prod-123");
      expect(result[1].id).toBe("prod-456");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle zero values correctly", () => {
      const product: ProductBE = {
        ...mockProductBE,
        price: 0,
        stockCount: 0,
        viewCount: 0,
        salesCount: 0,
        favoriteCount: 0,
        reviewCount: 0,
        averageRating: 0,
      };

      const result = toFEProduct(product);

      expect(result.price).toBe(0);
      expect(result.stockCount).toBe(0);
      expect(result.isInStock).toBe(false);
      expect(result.hasReviews).toBe(false);
    });

    it("should handle very large numbers", () => {
      const product: ProductBE = {
        ...mockProductBE,
        price: 9999999,
        compareAtPrice: 19999999,
        stockCount: 999999,
        viewCount: 1000000,
        salesCount: 500000,
      };

      const result = toFEProduct(product);

      expect(result.price).toBe(9999999);
      expect(result.formattedPrice).toBeTruthy();
      expect(result.isTrending).toBe(true);
    });

    it("should handle null/undefined safely", () => {
      const product: ProductBE = {
        ...mockProductBE,
        brand: null as any,
        tags: null as any,
        weight: null,
        dimensions: null,
        videos: null as any,
        features: null as any,
        specifications: null as any,
        metaTitle: null as any,
        metaDescription: null as any,
        viewCount: null as any,
        salesCount: null as any,
        favoriteCount: null as any,
        reviewCount: null as any,
        averageRating: null as any,
      };

      const result = toFEProduct(product);

      expect(result.brand).toBe("");
      expect(result.tags).toEqual([]);
      expect(result.viewCount).toBe(0);
      expect(result.salesCount).toBe(0);
    });

    it("should handle decimal ratings correctly", () => {
      const testCases = [
        { input: 4.1, expected: 4.0 },
        { input: 4.3, expected: 4.5 },
        { input: 4.5, expected: 4.5 },
        { input: 4.7, expected: 4.5 },
        { input: 4.9, expected: 5.0 },
      ];

      testCases.forEach(({ input, expected }) => {
        const product: ProductBE = {
          ...mockProductBE,
          averageRating: input,
        };
        const result = toFEProduct(product);
        expect(result.ratingStars).toBe(expected);
      });
    });
  });
});
