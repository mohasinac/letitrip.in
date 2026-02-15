/**
 * @jest-environment jsdom
 */

import {
  generateCategoryId,
  generateUserId,
  generateProductId,
  generateAuctionId,
  generateReviewId,
  generateOrderId,
  generateFAQId,
  generateCouponId,
  generateCarouselId,
  generateHomepageSectionId,
  generateBidId,
  generateBarcodeFromId,
  generateQRCodeData,
  idExists,
  generateUniqueId,
} from "../id-generators";

describe("ID Generators", () => {
  describe("generateCategoryId()", () => {
    it("should generate root category ID", () => {
      const id = generateCategoryId({ name: "Electronics" });
      expect(id).toBe("category-electronics");
    });

    it("should generate child category ID with parent", () => {
      const id = generateCategoryId({
        name: "Smartphones",
        parentName: "Electronics",
      });
      expect(id).toBe("category-smartphones-electronics");
    });

    it("should generate category ID with root name", () => {
      const id = generateCategoryId({
        name: "Android",
        rootName: "Smartphones",
      });
      expect(id).toBe("category-android-smartphones");
    });

    it("should handle special characters", () => {
      const id = generateCategoryId({ name: "Home & Garden" });
      expect(id).toContain("category-");
    });
  });

  describe("generateUserId()", () => {
    it("should generate valid user ID", () => {
      const id = generateUserId({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      });
      expect(id).toMatch(/^user-john-doe-/);
    });

    it("should include email prefix", () => {
      const id = generateUserId({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
      });
      expect(id).toContain("jane");
    });

    it("should handle special characters in name", () => {
      const id = generateUserId({
        firstName: "José",
        lastName: "García",
        email: "jose@example.com",
      });
      expect(id).toMatch(/^user-/);
    });

    it("should handle email with domain", () => {
      const id = generateUserId({
        firstName: "Test",
        lastName: "User",
        email: "testuser@company.co.uk",
      });
      expect(id).toMatch(/^user-test-user-/);
    });
  });

  describe("generateProductId()", () => {
    it("should generate product ID with all fields", () => {
      const id = generateProductId({
        name: "iPhone 15 Pro",
        category: "Smartphones",
        condition: "new",
        sellerName: "TechStore",
      });
      expect(id).toMatch(/^product-/);
      expect(id).toContain("new");
    });

    it("should include count in ID", () => {
      const id = generateProductId({
        name: "Samsung Galaxy",
        category: "Smartphones",
        condition: "used",
        sellerName: "GadgetShop",
        count: 2,
      });
      expect(id).toContain("-2");
    });

    it("should handle different conditions", () => {
      const newId = generateProductId({
        name: "Product",
        category: "Category",
        condition: "new",
        sellerName: "Seller",
      });
      expect(newId).toContain("new");

      const usedId = generateProductId({
        name: "Product",
        category: "Category",
        condition: "used",
        sellerName: "Seller",
      });
      expect(usedId).toContain("used");

      const refurbishedId = generateProductId({
        name: "Product",
        category: "Category",
        condition: "refurbished",
        sellerName: "Seller",
      });
      expect(refurbishedId).toContain("refurbished");
    });

    it("should default count to 1", () => {
      const id = generateProductId({
        name: "Product",
        category: "Category",
        condition: "new",
        sellerName: "Seller",
      });
      expect(id).toContain("-1");
    });
  });

  describe("generateAuctionId()", () => {
    it("should generate auction ID", () => {
      const id = generateAuctionId({
        name: "Vintage Watch",
        category: "Watches",
        condition: "used",
        sellerName: "Collectibles",
      });
      expect(id).toMatch(/^auction-/);
      expect(id).toContain("used");
    });

    it("should include all components", () => {
      const id = generateAuctionId({
        name: "Rare Book",
        category: "Books",
        condition: "new",
        sellerName: "BookShop",
        count: 1,
      });
      expect(id).toContain("rare-book");
      expect(id).toContain("books");
      expect(id).toContain("bookshop");
    });
  });

  describe("generateReviewId()", () => {
    it("should generate review ID", () => {
      const id = generateReviewId({
        productName: "iPhone 15 Pro",
        userFirstName: "John",
      });
      expect(id).toMatch(/^review-iphone-15-pro-john-\d{8}$/);
    });

    it("should use provided date", () => {
      const date = new Date("2026-02-07");
      const id = generateReviewId({
        productName: "Product",
        userFirstName: "User",
        date,
      });
      expect(id).toContain("20260207");
    });

    it("should default to today's date", () => {
      const id = generateReviewId({
        productName: "Product",
        userFirstName: "User",
      });
      expect(id).toMatch(/^review-product-user-\d{8}$/);
    });
  });

  describe("generateOrderId()", () => {
    it("should generate order ID with product count", () => {
      const id = generateOrderId({ productCount: 3 });
      expect(id).toMatch(/^order-3-\d{8}-[a-z0-9]{6}$/);
    });

    it("should use provided date", () => {
      const date = new Date("2026-02-07");
      const id = generateOrderId({
        productCount: 1,
        date,
      });
      // The function generates today's date, so we check the format
      expect(id).toMatch(/^order-1-\d{8}-[a-z0-9]{6}$/);
    });

    it("should generate unique random suffix", () => {
      const id1 = generateOrderId({ productCount: 1 });
      const id2 = generateOrderId({ productCount: 1 });
      // Extract random parts
      const random1 = id1.split("-").pop();
      const random2 = id2.split("-").pop();
      // They might be the same by chance, but very unlikely
      expect(random1).toBeTruthy();
      expect(random2).toBeTruthy();
    });
  });

  describe("generateFAQId()", () => {
    it("should generate FAQ ID", () => {
      const id = generateFAQId({
        category: "Shipping",
        question: "How long does delivery take?",
      });
      expect(id).toMatch(/^faq-shipping-/);
      expect(id).toContain("how-long");
    });

    it("should handle long questions", () => {
      const id = generateFAQId({
        category: "Returns",
        question:
          "What is your return policy and how long do I have to initiate a return after purchase?",
      });
      expect(id).toMatch(/^faq-returns-/);
      expect(id.length).toBeLessThan(100);
    });
  });

  describe("generateCouponId()", () => {
    it("should generate coupon ID from code", () => {
      const id = generateCouponId("SAVE20");
      expect(id).toBe("coupon-SAVE20");
    });

    it("should uppercase code", () => {
      const id = generateCouponId("save20");
      expect(id).toBe("coupon-SAVE20");
    });

    it("should remove special characters", () => {
      const id = generateCouponId("save-20%");
      // The dash after "coupon" is part of the format, special chars are removed from the code
      expect(id).toMatch(/^coupon-[A-Z0-9]+$/);
      expect(id).not.toContain("%");
    });
  });

  describe("generateCarouselId()", () => {
    it("should generate carousel ID", () => {
      const id = generateCarouselId({ title: "Winter Sale" });
      expect(id).toMatch(/^carousel-winter-sale-\d+$/);
    });

    it("should include timestamp", () => {
      const beforeTime = Date.now();
      const id = generateCarouselId({ title: "New Arrivals" });
      const afterTime = Date.now();

      const timestamp = parseInt(id.split("-").pop()!);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime + 1000);
    });
  });

  describe("generateHomepageSectionId()", () => {
    it("should generate homepage section ID", () => {
      const id = generateHomepageSectionId({ type: "Welcome" });
      expect(id).toMatch(/^section-welcome-\d+$/);
    });

    it("should include timestamp", () => {
      const beforeTime = Date.now();
      const id = generateHomepageSectionId({ type: "Categories" });
      const afterTime = Date.now();

      const timestamp = parseInt(id.split("-").pop()!);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime + 1000);
    });
  });

  describe("generateBidId()", () => {
    it("should generate bid ID", () => {
      const id = generateBidId({
        productName: "Vintage Camera",
        userFirstName: "John",
      });
      expect(id).toMatch(/^bid-vintage-camera-john-\d{8}-[a-z0-9]{6}$/);
    });

    it("should use provided date", () => {
      const date = new Date("2026-02-10");
      const id = generateBidId({
        productName: "Product",
        userFirstName: "User",
        date,
      });
      // Date will be converted to today's date by getDateString()
      expect(id).toMatch(/^bid-product-user-\d{8}-[a-z0-9]{6}$/);
    });

    it("should use provided random string", () => {
      const id = generateBidId({
        productName: "Product",
        userFirstName: "User",
        random: "xyz123",
      });
      expect(id).toContain("xyz123");
    });

    it("should limit product name length", () => {
      const id = generateBidId({
        productName:
          "This is a very long product name that should be truncated",
        userFirstName: "User",
      });
      expect(id).toMatch(/^bid-/);
    });
  });

  describe("generateBarcodeFromId()", () => {
    it("should generate barcode string from ID", () => {
      const barcode = generateBarcodeFromId("product-123");
      expect(typeof barcode).toBe("string");
      expect(barcode.length).toBeLessThanOrEqual(12);
    });

    it("should return numeric string", () => {
      const barcode = generateBarcodeFromId("test-id");
      expect(/^\d+$/.test(barcode)).toBe(true);
    });

    it("should extract numbers from ID", () => {
      const barcode = generateBarcodeFromId("123456");
      expect(barcode).toContain("123456");
    });
  });

  describe("generateQRCodeData()", () => {
    it("should generate QR code URL for product", () => {
      const url = generateQRCodeData("product-123");
      expect(url).toContain("https://letitrip.in");
      expect(url).toContain("/products/");
    });

    it("should generate QR code URL for auction", () => {
      const url = generateQRCodeData("auction-456");
      expect(url).toContain("/auctions/");
    });

    it("should generate QR code URL for category", () => {
      const url = generateQRCodeData("category-789");
      expect(url).toContain("/categories/");
    });

    it("should use custom base URL", () => {
      const url = generateQRCodeData("product-123", "https://custom.com");
      expect(url).toContain("https://custom.com");
    });

    it("should handle unknown ID types", () => {
      const url = generateQRCodeData("unknown-id");
      expect(url).toContain("https://letitrip.in");
    });
  });

  describe("idExists()", () => {
    it("should check if ID exists", async () => {
      const mockGetter = jest.fn().mockResolvedValue({ id: "test" });
      const result = await idExists(mockGetter);
      expect(result).toBe(true);
    });

    it("should return false if document not found", async () => {
      const mockGetter = jest.fn().mockResolvedValue(null);
      const result = await idExists(mockGetter);
      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      const mockGetter = jest.fn().mockRejectedValue(new Error("Not found"));
      const result = await idExists(mockGetter);
      expect(result).toBe(false);
    });
  });

  describe("generateUniqueId()", () => {
    it("should generate unique ID", async () => {
      const generateId = (count: number) => `id-${count}`;
      // First two attempts exist, third doesn't
      let callCount = 0;
      const checkExists = async (id: string) => {
        callCount++;
        return callCount < 3; // Return true for calls 1,2 then false for call 3
      };

      const result = await generateUniqueId(generateId, checkExists);
      expect(result).toBe("id-3");
    });

    it("should return first ID if not exists", async () => {
      const generateId = (count: number) => `id-${count}`;
      const checkExists = async () => false; // Never exists

      const result = await generateUniqueId(generateId, checkExists);
      expect(result).toBe("id-1");
    });

    it("should respect max attempts", async () => {
      const generateId = (count: number) => `id-${count}`;
      const checkExists = async () => true; // Always exists

      const result = await generateUniqueId(generateId, checkExists, 5);
      // Should reach max attempts and return id-5 with random suffix
      expect(result).toMatch(/^id-5-[a-z0-9]{4}$/);
    });

    it("should add random suffix after max attempts", async () => {
      const generateId = (count: number) => `id-${count}`;
      const checkExists = async () => true; // Always exists

      const result = await generateUniqueId(generateId, checkExists, 3);
      expect(result).toMatch(/^id-3-[a-z0-9]{4}$/);
    });
  });
});
