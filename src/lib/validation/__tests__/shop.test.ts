/**
 * Tests for Shop Validation Schemas
 */

import {
  banShopSchema,
  createShopSchema,
  featureShopSchema,
  shopQuerySchema,
  updateShopSchema,
  verifyShopSchema,
} from "../shop";

describe("Shop Validation Schemas", () => {
  describe("createShopSchema", () => {
    const baseShop = {
      name: "Test Shop",
      slug: "test-shop",
    };

    it("should validate valid shop", () => {
      const result = createShopSchema.parse(baseShop);

      expect(result.name).toBe("Test Shop");
      expect(result.slug).toBe("test-shop");
    });

    it("should reject name less than 3 chars", () => {
      const shop = { ...baseShop, name: "AB" };

      expect(() => createShopSchema.parse(shop)).toThrow(
        /at least 3 characters/
      );
    });

    it("should reject name exceeding 100 chars", () => {
      const shop = { ...baseShop, name: "a".repeat(101) };

      expect(() => createShopSchema.parse(shop)).toThrow(
        /not exceed 100 characters/
      );
    });

    it("should validate slug pattern", () => {
      const validSlugs = ["test-shop", "shop123", "my-test-shop-2024"];

      validSlugs.forEach((slug) => {
        const shop = { ...baseShop, slug };
        expect(() => createShopSchema.parse(shop)).not.toThrow();
      });
    });

    it("should reject invalid slug patterns", () => {
      const invalidSlugs = ["Test Shop", "test_shop", "SHOP", "test shop"];

      invalidSlugs.forEach((slug) => {
        const shop = { ...baseShop, slug };
        expect(() => createShopSchema.parse(shop)).toThrow(
          /lowercase letters, numbers, and hyphens/
        );
      });
    });

    it("should validate optional description", () => {
      const shop = {
        ...baseShop,
        description: "A".repeat(50),
      };

      const result = createShopSchema.parse(shop);

      expect(result.description).toBeDefined();
    });

    it("should reject description less than 50 chars", () => {
      const shop = {
        ...baseShop,
        description: "Short",
      };

      expect(() => createShopSchema.parse(shop)).toThrow(
        /at least 50 characters/
      );
    });

    it("should reject description exceeding 2000 chars", () => {
      const shop = {
        ...baseShop,
        description: "a".repeat(2001),
      };

      expect(() => createShopSchema.parse(shop)).toThrow(
        /not exceed 2000 characters/
      );
    });

    it("should validate email format", () => {
      const shop = {
        ...baseShop,
        email: "test@example.com",
      };

      const result = createShopSchema.parse(shop);

      expect(result.email).toBe("test@example.com");
    });

    it("should reject invalid email", () => {
      const shop = {
        ...baseShop,
        email: "invalid-email",
      };

      expect(() => createShopSchema.parse(shop)).toThrow(/Invalid email/);
    });

    it("should validate Indian phone number", () => {
      const validPhones = ["9876543210", "+919876543210"];

      validPhones.forEach((phone) => {
        const shop = { ...baseShop, phone };
        expect(() => createShopSchema.parse(shop)).not.toThrow();
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidPhones = ["123456", "5876543210", "abcdefghij"];

      invalidPhones.forEach((phone) => {
        const shop = { ...baseShop, phone };
        expect(() => createShopSchema.parse(shop)).toThrow(
          /Invalid phone number/
        );
      });
    });

    it("should validate address object", () => {
      const shop = {
        ...baseShop,
        address: {
          line1: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
      };

      const result = createShopSchema.parse(shop);

      expect(result.address?.city).toBe("Mumbai");
      expect(result.address?.country).toBe("India");
    });

    it("should reject invalid pincode format", () => {
      const shop = {
        ...baseShop,
        address: {
          line1: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "12345",
        },
      };

      expect(() => createShopSchema.parse(shop)).toThrow(
        /Pincode must be 6 digits/
      );
    });

    it("should reject non-numeric pincode", () => {
      const shop = {
        ...baseShop,
        address: {
          line1: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "ABCDEF",
        },
      };

      expect(() => createShopSchema.parse(shop)).toThrow(
        /Pincode must contain only digits/
      );
    });

    it("should validate GST number format", () => {
      const shop = {
        ...baseShop,
        gst: "27AAPFU0939F1ZV",
      };

      const result = createShopSchema.parse(shop);

      expect(result.gst).toBe("27AAPFU0939F1ZV");
    });

    it("should reject invalid GST format", () => {
      const shop = {
        ...baseShop,
        gst: "INVALID-GST",
      };

      expect(() => createShopSchema.parse(shop)).toThrow(/Invalid GST number/);
    });

    it("should validate PAN number format", () => {
      const shop = {
        ...baseShop,
        pan: "ABCDE1234F",
      };

      const result = createShopSchema.parse(shop);

      expect(result.pan).toBe("ABCDE1234F");
    });

    it("should reject invalid PAN format", () => {
      const shop = {
        ...baseShop,
        pan: "INVALID",
      };

      expect(() => createShopSchema.parse(shop)).toThrow(/Invalid PAN number/);
    });

    it("should validate bank details", () => {
      const shop = {
        ...baseShop,
        bankDetails: {
          accountHolderName: "John Doe",
          accountNumber: "12345678901234",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
        },
      };

      const result = createShopSchema.parse(shop);

      expect(result.bankDetails?.accountHolderName).toBe("John Doe");
    });

    it("should reject invalid IFSC code", () => {
      const shop = {
        ...baseShop,
        bankDetails: {
          accountHolderName: "John Doe",
          accountNumber: "12345678901234",
          ifscCode: "INVALID",
          bankName: "State Bank of India",
        },
      };

      expect(() => createShopSchema.parse(shop)).toThrow(/Invalid IFSC code/);
    });

    it("should validate UPI ID format", () => {
      const shop = {
        ...baseShop,
        upiId: "user@paytm",
      };

      const result = createShopSchema.parse(shop);

      expect(result.upiId).toBe("user@paytm");
    });

    it("should reject invalid UPI ID", () => {
      const shop = {
        ...baseShop,
        upiId: "invalid-upi",
      };

      expect(() => createShopSchema.parse(shop)).toThrow(/Invalid UPI ID/);
    });

    it("should validate social media URLs", () => {
      const shop = {
        ...baseShop,
        website: "https://example.com",
        facebook: "https://facebook.com/shop",
        instagram: "https://instagram.com/shop",
        twitter: "https://twitter.com/shop",
      };

      const result = createShopSchema.parse(shop);

      expect(result.website).toBe("https://example.com");
    });

    it("should default isVerified to false", () => {
      const result = createShopSchema.parse(baseShop);

      expect(result.isVerified).toBe(false);
    });

    it("should default featured to false", () => {
      const result = createShopSchema.parse(baseShop);

      expect(result.featured).toBe(false);
    });

    it("should default isBanned to false", () => {
      const result = createShopSchema.parse(baseShop);

      expect(result.isBanned).toBe(false);
    });
  });

  describe("updateShopSchema", () => {
    it("should allow partial updates", () => {
      const update = { name: "Updated Shop Name" };

      const result = updateShopSchema.parse(update);

      expect(result.name).toBe("Updated Shop Name");
    });

    it("should allow slug update", () => {
      const update = { slug: "new-shop-slug" };

      const result = updateShopSchema.parse(update);

      expect(result.slug).toBe("new-shop-slug");
    });

    it("should validate slug pattern in update", () => {
      const update = { slug: "INVALID SLUG" };

      expect(() => updateShopSchema.parse(update)).toThrow();
    });
  });

  describe("shopQuerySchema", () => {
    it("should validate query with defaults", () => {
      const result = shopQuerySchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe("createdAt");
      expect(result.sortOrder).toBe("desc");
    });

    it("should parse string numbers", () => {
      const query = { page: "2", limit: "50" };

      const result = shopQuerySchema.parse(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("should handle filter options", () => {
      const query = {
        isVerified: "true",
        featured: "true",
        isBanned: "false",
        category: "electronics",
        location: "Mumbai",
        search: "test",
        ownerId: "user123",
      };

      const result = shopQuerySchema.parse(query);

      expect(result.isVerified).toBe(true);
      expect(result.featured).toBe(true);
      expect(result.category).toBe("electronics");
      expect(result.ownerId).toBe("user123");
    });

    it("should accept valid sortBy values", () => {
      const validSorts = ["name", "createdAt", "rating", "productCount"];

      validSorts.forEach((sortBy) => {
        const query = { sortBy };
        expect(() => shopQuerySchema.parse(query)).not.toThrow();
      });
    });
  });

  describe("verifyShopSchema", () => {
    it("should validate verification", () => {
      const verify = {
        isVerified: true,
        verificationNotes: "All documents verified",
      };

      const result = verifyShopSchema.parse(verify);

      expect(result.isVerified).toBe(true);
      expect(result.verificationNotes).toBe("All documents verified");
    });

    it("should reject notes exceeding 500 chars", () => {
      const verify = {
        isVerified: true,
        verificationNotes: "a".repeat(501),
      };

      expect(() => verifyShopSchema.parse(verify)).toThrow();
    });
  });

  describe("banShopSchema", () => {
    it("should validate ban", () => {
      const ban = {
        isBanned: true,
        banReason: "Violated terms of service",
      };

      const result = banShopSchema.parse(ban);

      expect(result.isBanned).toBe(true);
      expect(result.banReason).toBe("Violated terms of service");
    });

    it("should require ban reason of at least 10 chars", () => {
      const ban = {
        isBanned: true,
        banReason: "Short",
      };

      expect(() => banShopSchema.parse(ban)).toThrow(/at least 10 characters/);
    });

    it("should allow unban without reason", () => {
      const ban = {
        isBanned: false,
      };

      const result = banShopSchema.parse(ban);

      expect(result.isBanned).toBe(false);
    });
  });

  describe("featureShopSchema", () => {
    it("should validate feature shop", () => {
      const feature = {
        featured: true,
        featuredPriority: 75,
      };

      const result = featureShopSchema.parse(feature);

      expect(result.featured).toBe(true);
      expect(result.featuredPriority).toBe(75);
    });

    it("should reject priority exceeding 100", () => {
      const feature = {
        featured: true,
        featuredPriority: 101,
      };

      expect(() => featureShopSchema.parse(feature)).toThrow();
    });

    it("should reject negative priority", () => {
      const feature = {
        featured: true,
        featuredPriority: -1,
      };

      expect(() => featureShopSchema.parse(feature)).toThrow();
    });
  });
});
