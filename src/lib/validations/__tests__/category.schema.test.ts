import { categorySchema } from "../category.schema";

describe("Category Validation Schema", () => {
  const validCategoryData = {
    name: "Electronics",
    slug: "electronics",
  };

  describe("Full category validation", () => {
    it("should accept valid category data", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should require mandatory fields", () => {
      const result = categorySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept category with all optional fields", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        description: "All electronic items and gadgets",
        parentIds: ["parent_123"],
        icon: "electronics-icon",
        image: "https://example.com/category.jpg",
        banner: "https://example.com/banner.jpg",
        isActive: true,
        featured: true,
        sortOrder: 10,
        metaTitle: "Electronics - Best Deals",
        metaDescription: "Browse our wide range of electronics",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Name validation", () => {
    it("should require name", () => {
      const { name, ...data } = validCategoryData;
      const result = categorySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid names", () => {
      const validNames = [
        "Electronics",
        "Home & Kitchen",
        "Fashion",
        "Sports Equipment",
      ];

      validNames.forEach((name) => {
        const result = categorySchema.safeParse({
          ...validCategoryData,
          name,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject too short names", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        name: "A",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long names", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        name: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should accept minimum length name", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        name: "AB",
      });
      expect(result.success).toBe(true);
    });

    it("should accept maximum length name", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        name: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Slug validation", () => {
    it("should require slug", () => {
      const { slug, ...data } = validCategoryData;
      const result = categorySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid slugs", () => {
      const validSlugs = [
        "electronics",
        "home-kitchen",
        "fashion-2024",
        "category-123",
      ];

      validSlugs.forEach((slug) => {
        const result = categorySchema.safeParse({
          ...validCategoryData,
          slug,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject slugs with spaces", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        slug: "my category",
      });
      expect(result.success).toBe(false);
    });

    it("should reject slugs with uppercase", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        slug: "My-Category",
      });
      expect(result.success).toBe(false);
    });

    it("should reject slugs with special characters", () => {
      const invalidSlugs = [
        "category@123",
        "category_name",
        "category.com",
        "category/name",
      ];

      invalidSlugs.forEach((slug) => {
        const result = categorySchema.safeParse({
          ...validCategoryData,
          slug,
        });
        expect(result.success).toBe(false);
      });
    });

    it("should reject too short slugs", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        slug: "ab",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long slugs", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        slug: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Description validation", () => {
    it("should handle optional description", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should accept valid descriptions", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        description: "Browse our wide range of electronics",
      });
      expect(result.success).toBe(true);
    });

    it("should reject too long descriptions", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        description: "A".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it("should accept maximum length description", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        description: "A".repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty description", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        description: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Parent IDs validation", () => {
    it("should handle optional parent IDs", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should accept single parent ID", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        parentIds: ["parent_123"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple parent IDs", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        parentIds: ["parent_123", "parent_456", "parent_789"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty parent IDs array", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        parentIds: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Icon validation", () => {
    it("should handle optional icon", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should accept valid icons", () => {
      const validIcons = [
        "electronics",
        "home-icon",
        "fashion-icon",
        "icon-123",
      ];

      validIcons.forEach((icon) => {
        const result = categorySchema.safeParse({
          ...validCategoryData,
          icon,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject too long icons", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        icon: "A".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("should accept maximum length icon", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        icon: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Image validation", () => {
    it("should handle optional image", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should accept valid image URLs", () => {
      const validURLs = [
        "https://example.com/image.jpg",
        "http://cdn.example.com/category.png",
      ];

      validURLs.forEach((image) => {
        const result = categorySchema.safeParse({
          ...validCategoryData,
          image,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid image URLs", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        image: "not-a-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Banner validation", () => {
    it("should handle optional banner", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should accept valid banner URLs", () => {
      const validURLs = [
        "https://example.com/banner.jpg",
        "http://cdn.example.com/banner.png",
      ];

      validURLs.forEach((banner) => {
        const result = categorySchema.safeParse({
          ...validCategoryData,
          banner,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid banner URLs", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        banner: "invalid-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("isActive validation", () => {
    it("should default to true", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });

    it("should accept explicit true", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it("should accept explicit false", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        isActive: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Featured validation", () => {
    it("should default to false", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.featured).toBe(false);
      }
    });

    it("should accept explicit true", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        featured: true,
      });
      expect(result.success).toBe(true);
    });

    it("should accept explicit false", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        featured: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Sort order validation", () => {
    it("should default to 0", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sortOrder).toBe(0);
      }
    });

    it("should accept valid sort orders", () => {
      const validOrders = [0, 1, 10, 100, 1000];

      validOrders.forEach((sortOrder) => {
        const result = categorySchema.safeParse({
          ...validCategoryData,
          sortOrder,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject negative sort order", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        sortOrder: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should reject decimal sort order", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        sortOrder: 1.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Meta title validation", () => {
    it("should handle optional meta title", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should accept valid meta titles", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        metaTitle: "Electronics - Best Deals Online",
      });
      expect(result.success).toBe(true);
    });

    it("should reject too long meta titles", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        metaTitle: "A".repeat(61),
      });
      expect(result.success).toBe(false);
    });

    it("should accept maximum length meta title", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        metaTitle: "A".repeat(60),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Meta description validation", () => {
    it("should handle optional meta description", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });

    it("should accept valid meta descriptions", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        metaDescription:
          "Browse our wide range of electronics at the best prices",
      });
      expect(result.success).toBe(true);
    });

    it("should reject too long meta descriptions", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        metaDescription: "A".repeat(161),
      });
      expect(result.success).toBe(false);
    });

    it("should accept maximum length meta description", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        metaDescription: "A".repeat(160),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum valid category", () => {
      const result = categorySchema.safeParse({
        name: "AB",
        slug: "abc",
      });
      expect(result.success).toBe(true);
    });

    it("should handle special characters in name", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        name: "Electronics & Gadgets",
      });
      expect(result.success).toBe(true);
    });

    it("should handle Unicode in name", () => {
      const result = categorySchema.safeParse({
        ...validCategoryData,
        name: "इलेक्ट्रॉनिक्स",
      });
      expect(result.success).toBe(true);
    });

    it("should handle all optional fields missing", () => {
      const result = categorySchema.safeParse(validCategoryData);
      expect(result.success).toBe(true);
    });
  });
});
