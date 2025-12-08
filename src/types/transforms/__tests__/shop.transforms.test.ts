/**
 * SHOP TRANSFORMATION TESTS
 *
 * Tests for shop type transformations between Backend and Frontend
 */

import { Timestamp } from "firebase/firestore";
import { ShopBE } from "../../backend/shop.types";
import { ShopFormFE } from "../../frontend/shop.types";
import { Status } from "../../shared/common.types";
import {
  toBECreateShopRequest,
  toFEShop,
  toFEShopCard,
  toFEShopCards,
  toFEShops,
} from "../shop.transforms";

describe("Shop Transformations", () => {
  const mockTimestamp = Timestamp.fromDate(new Date("2024-01-15T10:30:00Z"));

  const mockShopBE: ShopBE = {
    id: "shop_123",
    name: "Test Shop",
    slug: "test-shop",
    description: "A test shop for testing",
    logo: "https://example.com/logo.jpg",
    banner: "https://example.com/banner.jpg",
    ownerId: "owner_123",
    email: "shop@example.com",
    phone: "+919876543210",
    address: "123 Shop Street",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    rating: 4.7,
    reviewCount: 150,
    totalProducts: 250,
    totalSales: 500000,
    totalOrders: 1500,
    isVerified: true,
    status: Status.PUBLISHED,
    settings: {
      minOrderAmount: 500,
      shippingCharge: 100,
      freeShippingThreshold: 2000,
      returnWindow: 7,
      allowCOD: true,
    },
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    metadata: {
      website: "https://testshop.com",
      socialLinks: {
        facebook: "https://facebook.com/testshop",
        instagram: "https://instagram.com/testshop",
      },
      gst: "GST123456",
      pan: "PAN123456",
      upiId: "testshop@upi",
      featured: true,
    },
  };

  describe("toFEShop", () => {
    it("should transform basic shop fields correctly", () => {
      const result = toFEShop(mockShopBE);

      expect(result.id).toBe("shop_123");
      expect(result.name).toBe("Test Shop");
      expect(result.slug).toBe("test-shop");
      expect(result.description).toBe("A test shop for testing");
      expect(result.logo).toBe("https://example.com/logo.jpg");
      expect(result.banner).toBe("https://example.com/banner.jpg");
      expect(result.ownerId).toBe("owner_123");
    });

    it("should transform contact information", () => {
      const result = toFEShop(mockShopBE);

      expect(result.email).toBe("shop@example.com");
      expect(result.phone).toBe("+919876543210");
      expect(result.address).toBe("123 Shop Street");
      expect(result.city).toBe("Mumbai");
      expect(result.state).toBe("Maharashtra");
      expect(result.postalCode).toBe("400001");
      expect(result.country).toBe("India");
    });

    it("should transform dates correctly", () => {
      const result = toFEShop(mockShopBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should format total sales as price", () => {
      const result = toFEShop(mockShopBE);

      expect(result.formattedTotalSales).toContain("5,00,000");
      expect(result.formattedTotalSales).toContain("₹");
    });

    it("should format settings prices", () => {
      const result = toFEShop(mockShopBE);

      expect(result.formattedMinOrderAmount).toContain("500");
      expect(result.formattedShippingCharge).toContain("100");
    });

    it("should format rating display with reviews", () => {
      const result = toFEShop(mockShopBE);

      expect(result.ratingDisplay).toBe("4.7 (150)");
    });

    it("should format rating display with no reviews", () => {
      const shopWithNoReviews = { ...mockShopBE, reviewCount: 0 };
      const result = toFEShop(shopWithNoReviews);

      expect(result.ratingDisplay).toBe("No reviews");
    });

    it("should generate URL path", () => {
      const result = toFEShop(mockShopBE);

      expect(result.urlPath).toBe("/shops/test-shop");
    });

    it("should set isActive flag for published shops", () => {
      const result = toFEShop(mockShopBE);

      expect(result.isActive).toBe(true);
    });

    it("should set isActive flag for draft shops", () => {
      const draftShop = { ...mockShopBE, status: Status.DRAFT };
      const result = toFEShop(draftShop);

      expect(result.isActive).toBe(false);
    });

    it("should set hasProducts flag correctly", () => {
      const result = toFEShop(mockShopBE);

      expect(result.hasProducts).toBe(true);
    });

    it("should set hasProducts to false when no products", () => {
      const shopWithoutProducts = { ...mockShopBE, totalProducts: 0 };
      const result = toFEShop(shopWithoutProducts);

      expect(result.hasProducts).toBe(false);
    });

    it("should generate badges for verified shops", () => {
      const result = toFEShop(mockShopBE);

      expect(result.badges).toContain("Verified");
    });

    it("should generate badges for top rated shops", () => {
      const result = toFEShop(mockShopBE);

      expect(result.badges).toContain("Top Rated");
    });

    it("should generate badges for large catalog", () => {
      const result = toFEShop(mockShopBE);

      expect(result.badges).toContain("Large Catalog");
    });

    it("should not add top rated badge for low rating", () => {
      const lowRatedShop = { ...mockShopBE, rating: 3.5 };
      const result = toFEShop(lowRatedShop);

      expect(result.badges).not.toContain("Top Rated");
    });

    it("should not add large catalog badge for small shops", () => {
      const smallShop = { ...mockShopBE, totalProducts: 50 };
      const result = toFEShop(smallShop);

      expect(result.badges).not.toContain("Large Catalog");
    });

    it("should extract metadata fields", () => {
      const result = toFEShop(mockShopBE);

      expect(result.website).toBe("https://testshop.com");
      expect(result.socialLinks).toEqual({
        facebook: "https://facebook.com/testshop",
        instagram: "https://instagram.com/testshop",
      });
      expect(result.gst).toBe("GST123456");
      expect(result.pan).toBe("PAN123456");
      expect(result.upiId).toBe("testshop@upi");
    });

    it("should handle missing metadata fields", () => {
      const shopWithoutMetadata = { ...mockShopBE, metadata: {} };
      const result = toFEShop(shopWithoutMetadata);

      expect(result.website).toBeNull();
      expect(result.socialLinks).toBeUndefined();
      expect(result.gst).toBeNull();
      expect(result.pan).toBeNull();
      expect(result.upiId).toBeNull();
    });

    it("should include backwards compatibility fields", () => {
      const result = toFEShop(mockShopBE);

      expect(result.productCount).toBe(250);
      expect(result.follower_count).toBe(0);
      expect(result.featured).toBe(true);
      expect(result.isBanned).toBe(false);
      expect(result.banReason).toBeNull();
    });

    it("should set isBanned for archived shops", () => {
      const archivedShop = { ...mockShopBE, status: Status.ARCHIVED };
      const result = toFEShop(archivedShop);

      expect(result.isBanned).toBe(true);
    });

    it("should handle ban reason from metadata", () => {
      const bannedShop = {
        ...mockShopBE,
        status: Status.ARCHIVED,
        metadata: { ...mockShopBE.metadata, banReason: "Policy violation" },
      };
      const result = toFEShop(bannedShop);

      expect(result.isBanned).toBe(true);
      expect(result.banReason).toBe("Policy violation");
    });
  });

  describe("toBECreateShopRequest", () => {
    const mockFormData: ShopFormFE = {
      name: "New Shop",
      slug: "new-shop",
      description: "A new shop",
      logo: "https://example.com/logo.jpg",
      banner: "https://example.com/banner.jpg",
      email: "newshop@example.com",
      phone: "+919876543210",
      address: "456 New Street",
      city: "Delhi",
      state: "Delhi",
      postalCode: "110001",
    };

    it("should transform form data to BE request", () => {
      const result = toBECreateShopRequest(mockFormData);

      expect(result.name).toBe("New Shop");
      expect(result.slug).toBe("new-shop");
      expect(result.description).toBe("A new shop");
      expect(result.logo).toBe("https://example.com/logo.jpg");
      expect(result.banner).toBe("https://example.com/banner.jpg");
      expect(result.email).toBe("newshop@example.com");
      expect(result.phone).toBe("+919876543210");
      expect(result.address).toBe("456 New Street");
      expect(result.city).toBe("Delhi");
      expect(result.state).toBe("Delhi");
      expect(result.postalCode).toBe("110001");
    });

    it("should handle optional fields", () => {
      const minimalForm: ShopFormFE = {
        name: "Minimal Shop",
        slug: "minimal-shop",
        email: "minimal@example.com",
      };
      const result = toBECreateShopRequest(minimalForm);

      expect(result.name).toBe("Minimal Shop");
      expect(result.slug).toBe("minimal-shop");
      expect(result.email).toBe("minimal@example.com");
      expect(result.description).toBeUndefined();
      expect(result.logo).toBeUndefined();
      expect(result.banner).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.address).toBeUndefined();
      expect(result.city).toBeUndefined();
      expect(result.state).toBeUndefined();
      expect(result.postalCode).toBeUndefined();
    });
  });

  describe("toFEShopCard", () => {
    it("should transform shop to card", () => {
      const result = toFEShopCard(mockShopBE);

      expect(result.id).toBe("shop_123");
      expect(result.name).toBe("Test Shop");
      expect(result.slug).toBe("test-shop");
      expect(result.logo).toBe("https://example.com/logo.jpg");
      expect(result.rating).toBe(4.7);
      expect(result.totalProducts).toBe(250);
      expect(result.isVerified).toBe(true);
    });

    it("should generate URL path", () => {
      const result = toFEShopCard(mockShopBE);

      expect(result.urlPath).toBe("/shops/test-shop");
    });

    it("should format rating display", () => {
      const result = toFEShopCard(mockShopBE);

      expect(result.ratingDisplay).toBe("4.7 (150)");
    });

    it("should generate badges", () => {
      const result = toFEShopCard(mockShopBE);

      expect(result.badges).toContain("Verified");
      expect(result.badges).toContain("Top Rated");
      expect(result.badges).toContain("Large Catalog");
    });

    it("should format location", () => {
      const result = toFEShopCard(mockShopBE);

      expect(result.location).toBe("Mumbai, Maharashtra");
    });

    it("should handle missing city and state", () => {
      const shopWithoutLocation = {
        ...mockShopBE,
        city: null,
        state: null,
      };
      const result = toFEShopCard(shopWithoutLocation);

      expect(result.location).toBeUndefined();
    });

    it("should handle only city", () => {
      const shopWithOnlyCity = { ...mockShopBE, state: null };
      const result = toFEShopCard(shopWithOnlyCity);

      expect(result.location).toBe("Mumbai");
    });

    it("should include backwards compatibility fields", () => {
      const result = toFEShopCard(mockShopBE);

      expect(result.email).toBe("shop@example.com");
      expect(result.featured).toBe(true);
      expect(result.isBanned).toBe(false);
      expect(result.productCount).toBe(250);
      expect(result.reviewCount).toBe(150);
      expect(result.ownerId).toBe("owner_123");
      expect(result.description).toBe("A test shop for testing");
      expect(result.banner).toBe("https://example.com/banner.jpg");
      expect(result.createdAt).toBeTruthy();
    });

    it("should handle null description and banner", () => {
      const shopWithoutDescriptionAndBanner = {
        ...mockShopBE,
        description: null,
        banner: null,
      };
      const result = toFEShopCard(shopWithoutDescriptionAndBanner);

      expect(result.description).toBeNull();
      expect(result.banner).toBeNull();
    });
  });

  describe("Batch transformations", () => {
    it("should transform multiple shops", () => {
      const shops = [mockShopBE, { ...mockShopBE, id: "shop_456" }];
      const result = toFEShops(shops);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("shop_123");
      expect(result[1].id).toBe("shop_456");
    });

    it("should transform multiple shop cards", () => {
      const shops = [mockShopBE, { ...mockShopBE, id: "shop_456" }];
      const result = toFEShopCards(shops);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("shop_123");
      expect(result[1].id).toBe("shop_456");
    });

    it("should handle empty arrays", () => {
      expect(toFEShops([])).toEqual([]);
      expect(toFEShopCards([])).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle shops with exact threshold values", () => {
      const thresholdShop = {
        ...mockShopBE,
        rating: 4.5,
        totalProducts: 100,
      };
      const result = toFEShop(thresholdShop);

      expect(result.badges).toContain("Top Rated");
      expect(result.badges).toContain("Large Catalog");
    });

    it("should handle shops with zero rating", () => {
      const zeroRatingShop = {
        ...mockShopBE,
        rating: 0,
        reviewCount: 0,
      };
      const result = toFEShop(zeroRatingShop);

      expect(result.ratingDisplay).toBe("No reviews");
      expect(result.badges).not.toContain("Top Rated");
    });

    it("should handle shops with special characters in name", () => {
      const shopWithSpecialChars = {
        ...mockShopBE,
        name: "Test & Shop's Store",
        description: "A shop with 'special' characters & symbols",
      };
      const result = toFEShop(shopWithSpecialChars);

      expect(result.name).toContain("&");
      expect(result.name).toContain("'");
      expect(result.description).toContain("'special'");
    });

    it("should handle shops with Unicode in name", () => {
      const shopWithUnicode = {
        ...mockShopBE,
        name: "टेस्ट शॉप",
        description: "A shop with हिंदी text",
      };
      const result = toFEShop(shopWithUnicode);

      expect(result.name).toBe("टेस्ट शॉप");
      expect(result.description).toContain("हिंदी");
    });

    it("should handle shops with very high numbers", () => {
      const highVolumeShop = {
        ...mockShopBE,
        totalProducts: 10000,
        totalSales: 10000000,
        totalOrders: 50000,
        reviewCount: 5000,
      };
      const result = toFEShop(highVolumeShop);

      expect(result.totalProducts).toBe(10000);
      expect(result.formattedTotalSales).toContain("1,00,00,000");
      expect(result.ratingDisplay).toContain("(5000)");
    });

    it("should handle shops with all metadata fields", () => {
      const shopWithFullMetadata = {
        ...mockShopBE,
        metadata: {
          website: "https://testshop.com",
          socialLinks: {
            facebook: "https://facebook.com/testshop",
            instagram: "https://instagram.com/testshop",
            twitter: "https://twitter.com/testshop",
            youtube: "https://youtube.com/testshop",
          },
          gst: "GST123456",
          pan: "PAN123456",
          policies: {
            returnPolicy: "7 days return",
            shippingPolicy: "Ships within 24 hours",
          },
          bankDetails: {
            accountNumber: "1234567890",
            ifscCode: "IFSC0001234",
          },
          upiId: "testshop@upi",
          featured: true,
          banReason: null,
        },
      };
      const result = toFEShop(shopWithFullMetadata);

      expect(result.website).toBe("https://testshop.com");
      expect(result.socialLinks?.facebook).toBe(
        "https://facebook.com/testshop"
      );
      expect(result.policies).toBeDefined();
      expect(result.bankDetails).toBeDefined();
    });

    it("should handle shops with minimal settings", () => {
      const shopWithMinimalSettings = {
        ...mockShopBE,
        settings: {
          minOrderAmount: 0,
          shippingCharge: 0,
          freeShippingThreshold: 0,
          returnWindow: 0,
          allowCOD: false,
        },
      };
      const result = toFEShop(shopWithMinimalSettings);

      expect(result.settings.minOrderAmount).toBe(0);
      expect(result.settings.shippingCharge).toBe(0);
      expect(result.settings.allowCOD).toBe(false);
    });
  });
});
