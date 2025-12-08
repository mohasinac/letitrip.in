import { shopSchema } from "../shop.schema";

describe("Shop Validation Schema", () => {
  const validShopData = {
    name: "My Awesome Shop",
    slug: "my-awesome-shop",
    description:
      "This is a detailed description of my shop with all the necessary information about what we sell.",
  };

  describe("Full Shop Schema", () => {
    it("should validate complete valid shop data", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should fail with empty data", () => {
      const result = shopSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept shop with all optional fields", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        logo: "https://example.com/logo.png",
        banner: "https://example.com/banner.jpg",
        phone: "9876543210",
        email: "shop@example.com",
        address: {
          line1: "123 Main Street",
          line2: "Suite 100",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        policies: {
          shipping: "Free shipping on orders over ₹500",
          returns: "30-day return policy",
          privacy: "We protect your data",
        },
        isActive: true,
        isVerified: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Name validation", () => {
    it("should require shop name", () => {
      const { name, ...data } = validShopData;
      const result = shopSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid shop names", () => {
      const validNames = [
        "Shop Name",
        "The Best Shop Ever",
        "Shop123",
        "Shop & Co.",
      ];

      validNames.forEach((name) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          name,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject too short names", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        name: "AB",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long names", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        name: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should accept minimum length name", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        name: "Abc",
      });
      expect(result.success).toBe(true);
    });

    it("should accept maximum length name", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        name: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Slug validation", () => {
    it("should require slug", () => {
      const { slug, ...data } = validShopData;
      const result = shopSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid slugs", () => {
      const validSlugs = [
        "my-shop",
        "shop-123",
        "the-best-shop",
        "shop-name-2024",
      ];

      validSlugs.forEach((slug) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          slug,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject slugs with spaces", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        slug: "my shop",
      });
      expect(result.success).toBe(false);
    });

    it("should reject slugs with uppercase", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        slug: "My-Shop",
      });
      expect(result.success).toBe(false);
    });

    it("should reject slugs with special characters", () => {
      const invalidSlugs = ["shop@123", "shop_name", "shop.com", "shop/name"];

      invalidSlugs.forEach((slug) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          slug,
        });
        expect(result.success).toBe(false);
      });
    });

    it("should reject too short slugs", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        slug: "ab",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long slugs", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        slug: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Description validation", () => {
    it("should require description", () => {
      const { description, ...data } = validShopData;
      const result = shopSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid descriptions", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        description:
          "This is a valid shop description with enough characters to meet the minimum requirement.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject too short descriptions", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        description: "Too short",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long descriptions", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        description: "A".repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it("should accept minimum length description", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        description: "A".repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it("should accept maximum length description", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        description: "A".repeat(2000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Logo validation", () => {
    it("should handle optional logo", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should accept valid logo URLs", () => {
      const validURLs = [
        "https://example.com/logo.png",
        "http://cdn.example.com/logo.jpg",
        "https://storage.example.com/images/logo.svg",
      ];

      validURLs.forEach((logo) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          logo,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid logo URLs", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        logo: "not-a-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Banner validation", () => {
    it("should handle optional banner", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should accept valid banner URLs", () => {
      const validURLs = [
        "https://example.com/banner.jpg",
        "http://cdn.example.com/banner.png",
      ];

      validURLs.forEach((banner) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          banner,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid banner URLs", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        banner: "invalid-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Phone validation", () => {
    it("should handle optional phone", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should accept valid Indian phone numbers", () => {
      const validPhones = [
        "9876543210",
        "8123456789",
        "7012345678",
        "6543210987",
      ];

      validPhones.forEach((phone) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid phone formats", () => {
      const invalidPhones = [
        "123456789", // too short
        "12345678901", // too long
        "5123456789", // starts with 5
        "abcd123456", // contains letters
      ];

      invalidPhones.forEach((phone) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          phone,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Email validation", () => {
    it("should handle optional email", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should accept valid email addresses", () => {
      const validEmails = [
        "shop@example.com",
        "contact@myshop.co.in",
        "info+shop@example.com",
      ];

      validEmails.forEach((email) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          email,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "shop@",
        "shop @example.com",
      ];

      invalidEmails.forEach((email) => {
        const result = shopSchema.safeParse({
          ...validShopData,
          email,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Address validation", () => {
    const validAddress = {
      line1: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    };

    it("should handle optional address", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should accept valid addresses", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        address: validAddress,
      });
      expect(result.success).toBe(true);
    });

    it("should accept address with optional line2", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        address: {
          ...validAddress,
          line2: "Suite 100",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should default country to India", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        address: validAddress,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.address?.country).toBe("India");
      }
    });

    describe("Line1 validation", () => {
      it("should reject too short line1", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          address: {
            ...validAddress,
            line1: "123",
          },
        });
        expect(result.success).toBe(false);
      });

      it("should accept minimum length line1", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          address: {
            ...validAddress,
            line1: "12345",
          },
        });
        expect(result.success).toBe(true);
      });
    });

    describe("City validation", () => {
      it("should reject too short city", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          address: {
            ...validAddress,
            city: "A",
          },
        });
        expect(result.success).toBe(false);
      });

      it("should accept valid cities", () => {
        const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai"];

        cities.forEach((city) => {
          const result = shopSchema.safeParse({
            ...validShopData,
            address: {
              ...validAddress,
              city,
            },
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe("State validation", () => {
      it("should reject too short state", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          address: {
            ...validAddress,
            state: "A",
          },
        });
        expect(result.success).toBe(false);
      });

      it("should accept valid states", () => {
        const states = [
          "Maharashtra",
          "Karnataka",
          "Tamil Nadu",
          "West Bengal",
        ];

        states.forEach((state) => {
          const result = shopSchema.safeParse({
            ...validShopData,
            address: {
              ...validAddress,
              state,
            },
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe("Pincode validation", () => {
      it("should accept valid pincodes", () => {
        const validPincodes = [
          "400001",
          "110001",
          "560001",
          "600001",
          "700001",
        ];

        validPincodes.forEach((pincode) => {
          const result = shopSchema.safeParse({
            ...validShopData,
            address: {
              ...validAddress,
              pincode,
            },
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid pincode formats", () => {
        const invalidPincodes = [
          "12345", // too short
          "1234567", // too long
          "abcdef", // letters
          "40000A", // alphanumeric
        ];

        invalidPincodes.forEach((pincode) => {
          const result = shopSchema.safeParse({
            ...validShopData,
            address: {
              ...validAddress,
              pincode,
            },
          });
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe("Policies validation", () => {
    it("should handle optional policies", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should accept valid policies", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        policies: {
          shipping: "Free shipping on orders over ₹500",
          returns: "30-day return policy",
          privacy: "We protect your data",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should accept partial policies", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        policies: {
          shipping: "Free shipping policy",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty policies object", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        policies: {},
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Status flags validation", () => {
    describe("isActive validation", () => {
      it("should default to true", () => {
        const result = shopSchema.safeParse(validShopData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isActive).toBe(true);
        }
      });

      it("should accept explicit true", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          isActive: true,
        });
        expect(result.success).toBe(true);
      });

      it("should accept explicit false", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          isActive: false,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("isVerified validation", () => {
      it("should default to false", () => {
        const result = shopSchema.safeParse(validShopData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isVerified).toBe(false);
        }
      });

      it("should accept explicit true", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          isVerified: true,
        });
        expect(result.success).toBe(true);
      });

      it("should accept explicit false", () => {
        const result = shopSchema.safeParse({
          ...validShopData,
          isVerified: false,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle all optional fields missing", () => {
      const result = shopSchema.safeParse(validShopData);
      expect(result.success).toBe(true);
    });

    it("should handle special characters in name", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        name: "Shop & Co. - The Best!",
      });
      expect(result.success).toBe(true);
    });

    it("should handle Unicode in description", () => {
      const result = shopSchema.safeParse({
        ...validShopData,
        description:
          "Welcome to our shop! We sell amazing products. भारत में सर्वश्रेष्ठ दुकान।",
      });
      expect(result.success).toBe(true);
    });

    it("should handle minimum valid shop", () => {
      const result = shopSchema.safeParse({
        name: "Abc",
        slug: "abc",
        description: "A".repeat(20),
      });
      expect(result.success).toBe(true);
    });
  });
});
