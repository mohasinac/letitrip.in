/**
 * FAQ Constants Tests
 *
 * Tests FAQ categories and items configuration
 * Coverage: 100%
 */

import { FAQ_CATEGORIES, FAQ_ITEMS, FAQCategory, FAQItem } from "../faq";

describe("FAQ Constants", () => {
  describe("FAQ_CATEGORIES", () => {
    it("should export FAQ_CATEGORIES array", () => {
      expect(FAQ_CATEGORIES).toBeDefined();
      expect(Array.isArray(FAQ_CATEGORIES)).toBe(true);
    });

    it("should have 8 categories", () => {
      expect(FAQ_CATEGORIES).toHaveLength(8);
    });

    it("should have all required category properties", () => {
      FAQ_CATEGORIES.forEach((category: FAQCategory) => {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("icon");
        expect(category).toHaveProperty("description");
        expect(typeof category.id).toBe("string");
        expect(typeof category.name).toBe("string");
        expect(typeof category.icon).toBe("string");
        expect(typeof category.description).toBe("string");
        expect(category.id.length).toBeGreaterThan(0);
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.icon.length).toBeGreaterThan(0);
        expect(category.description.length).toBeGreaterThan(0);
      });
    });

    it("should have unique category ids", () => {
      const ids = FAQ_CATEGORIES.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have getting-started category", () => {
      const gettingStarted = FAQ_CATEGORIES.find(
        (c) => c.id === "getting-started"
      );
      expect(gettingStarted).toBeDefined();
      expect(gettingStarted?.name).toBe("Getting Started");
      expect(gettingStarted?.icon).toBe("rocket");
      expect(gettingStarted?.description).toBe("New to Let It Rip? Start here");
    });

    it("should have shopping category", () => {
      const shopping = FAQ_CATEGORIES.find((c) => c.id === "shopping");
      expect(shopping).toBeDefined();
      expect(shopping?.name).toBe("Shopping & Orders");
      expect(shopping?.icon).toBe("shopping-cart");
    });

    it("should have auctions category", () => {
      const auctions = FAQ_CATEGORIES.find((c) => c.id === "auctions");
      expect(auctions).toBeDefined();
      expect(auctions?.name).toBe("Auctions");
      expect(auctions?.icon).toBe("gavel");
    });

    it("should have payments category", () => {
      const payments = FAQ_CATEGORIES.find((c) => c.id === "payments");
      expect(payments).toBeDefined();
      expect(payments?.name).toBe("Payments & Fees");
      expect(payments?.icon).toBe("credit-card");
    });

    it("should have shipping category", () => {
      const shipping = FAQ_CATEGORIES.find((c) => c.id === "shipping");
      expect(shipping).toBeDefined();
      expect(shipping?.name).toBe("Shipping & Delivery");
      expect(shipping?.icon).toBe("truck");
    });

    it("should have returns category", () => {
      const returns = FAQ_CATEGORIES.find((c) => c.id === "returns");
      expect(returns).toBeDefined();
      expect(returns?.name).toBe("Returns & Refunds");
      expect(returns?.icon).toBe("rotate-ccw");
    });

    it("should have account category", () => {
      const account = FAQ_CATEGORIES.find((c) => c.id === "account");
      expect(account).toBeDefined();
      expect(account?.name).toBe("Account & Security");
      expect(account?.icon).toBe("user");
    });

    it("should have seller category", () => {
      const seller = FAQ_CATEGORIES.find((c) => c.id === "seller");
      expect(seller).toBeDefined();
      expect(seller?.name).toBe("Selling");
      expect(seller?.icon).toBe("store");
    });
  });

  describe("FAQ_ITEMS", () => {
    it("should export FAQ_ITEMS array", () => {
      expect(FAQ_ITEMS).toBeDefined();
      expect(Array.isArray(FAQ_ITEMS)).toBe(true);
    });

    it("should have multiple FAQ items", () => {
      expect(FAQ_ITEMS.length).toBeGreaterThan(0);
    });

    it("should have all required item properties", () => {
      FAQ_ITEMS.forEach((item: FAQItem) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("question");
        expect(item).toHaveProperty("answer");
        expect(item).toHaveProperty("category");
        expect(typeof item.id).toBe("string");
        expect(typeof item.question).toBe("string");
        expect(typeof item.answer).toBe("string");
        expect(typeof item.category).toBe("string");
        expect(item.id.length).toBeGreaterThan(0);
        expect(item.question.length).toBeGreaterThan(0);
        expect(item.answer.length).toBeGreaterThan(0);
        expect(item.category.length).toBeGreaterThan(0);
      });
    });

    it("should have unique item ids", () => {
      const ids = FAQ_ITEMS.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should reference valid categories", () => {
      const validCategories = FAQ_CATEGORIES.map((c) => c.id);
      FAQ_ITEMS.forEach((item) => {
        expect(validCategories).toContain(item.category);
      });
    });

    it("should have getting-started items", () => {
      const items = FAQ_ITEMS.filter((i) => i.category === "getting-started");
      expect(items.length).toBeGreaterThan(0);
    });

    it("should have what-is-letitrip FAQ", () => {
      const item = FAQ_ITEMS.find((i) => i.id === "what-is-letitrip");
      expect(item).toBeDefined();
      expect(item?.question).toBe("What is Let It Rip?");
      expect(item?.category).toBe("getting-started");
      expect(item?.answer).toContain("India's trusted seller");
      expect(item?.answer).toContain("Beyblades");
      expect(item?.answer).toContain("Pokemon");
    });

    it("should have how-to-start FAQ", () => {
      const item = FAQ_ITEMS.find((i) => i.id === "how-to-start");
      expect(item).toBeDefined();
      expect(item?.question).toBe("How do I get started?");
      expect(item?.category).toBe("getting-started");
    });

    it("should have create-account FAQ", () => {
      const item = FAQ_ITEMS.find((i) => i.id === "create-account");
      expect(item).toBeDefined();
      expect(item?.question).toBe("Do I need an account to shop?");
      expect(item?.category).toBe("getting-started");
      expect(item?.answer).toContain("18+ years old");
    });

    it("should have india-shipping FAQ", () => {
      const item = FAQ_ITEMS.find((i) => i.id === "india-shipping");
      expect(item).toBeDefined();
      expect(item?.question).toBe("Do you ship to all parts of India?");
      expect(item?.category).toBe("getting-started");
      expect(item?.answer).toContain("Delhi");
      expect(item?.answer).toContain("Mumbai");
      expect(item?.answer).toContain("Bangalore");
    });

    it("should have items for all categories", () => {
      const categories = FAQ_CATEGORIES.map((c) => c.id);
      categories.forEach((categoryId) => {
        const items = FAQ_ITEMS.filter((i) => i.category === categoryId);
        // Each category should have at least one FAQ item
        expect(items.length).toBeGreaterThan(0);
      });
    });

    it("should have descriptive questions", () => {
      FAQ_ITEMS.forEach((item) => {
        // Questions should end with ? and be at least 10 chars
        expect(item.question.endsWith("?")).toBe(true);
        expect(item.question.length).toBeGreaterThanOrEqual(10);
      });
    });

    it("should have meaningful answers", () => {
      FAQ_ITEMS.forEach((item) => {
        // Answers should be at least 20 characters
        expect(item.answer.length).toBeGreaterThanOrEqual(20);
      });
    });

    it("should maintain consistent naming conventions", () => {
      FAQ_ITEMS.forEach((item) => {
        // IDs should be kebab-case
        expect(item.id).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it("should group items by category correctly", () => {
      const itemsByCategory = FAQ_ITEMS.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, FAQItem[]>);

      // All categories should have items
      FAQ_CATEGORIES.forEach((category) => {
        expect(itemsByCategory[category.id]).toBeDefined();
        expect(itemsByCategory[category.id].length).toBeGreaterThan(0);
      });
    });
  });

  describe("Type Definitions", () => {
    it("should have valid FAQCategory type", () => {
      const testCategory: FAQCategory = {
        id: "test",
        name: "Test Category",
        icon: "test-icon",
        description: "Test description",
      };

      expect(testCategory.id).toBe("test");
      expect(testCategory.name).toBe("Test Category");
      expect(testCategory.icon).toBe("test-icon");
      expect(testCategory.description).toBe("Test description");
    });

    it("should have valid FAQItem type", () => {
      const testItem: FAQItem = {
        id: "test-item",
        question: "Test question?",
        answer: "Test answer",
        category: "getting-started",
      };

      expect(testItem.id).toBe("test-item");
      expect(testItem.question).toBe("Test question?");
      expect(testItem.answer).toBe("Test answer");
      expect(testItem.category).toBe("getting-started");
    });
  });

  describe("Data Consistency", () => {
    it("should have no duplicate questions", () => {
      const questions = FAQ_ITEMS.map((i) => i.question.toLowerCase());
      const uniqueQuestions = new Set(questions);
      expect(uniqueQuestions.size).toBe(questions.length);
    });

    it("should have no empty strings", () => {
      FAQ_ITEMS.forEach((item) => {
        expect(item.id.trim()).toBe(item.id);
        expect(item.question.trim()).toBe(item.question);
        expect(item.answer.trim()).toBe(item.answer);
        expect(item.category.trim()).toBe(item.category);
      });

      FAQ_CATEGORIES.forEach((category) => {
        expect(category.id.trim()).toBe(category.id);
        expect(category.name.trim()).toBe(category.name);
        expect(category.icon.trim()).toBe(category.icon);
        expect(category.description.trim()).toBe(category.description);
      });
    });

    it("should maintain proper text formatting", () => {
      FAQ_ITEMS.forEach((item) => {
        // Question should start with capital letter
        expect(item.question[0]).toMatch(/[A-Z]/);

        // Answer should start with capital letter
        expect(item.answer[0]).toMatch(/[A-Z]/);
      });
    });
  });
});
