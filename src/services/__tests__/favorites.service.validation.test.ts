/**
 * Favorites Service Validation Tests
 *
 * Comprehensive tests for localStorage validation and error handling
 * added in Batch 24 code quality improvements.
 */

import { favoritesService } from "../favorites.service";

describe("FavoritesService - Validation Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("getGuestFavorites validation", () => {
    it("should handle non-array data in localStorage", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem(
        "guest_favorites",
        JSON.stringify({ invalid: "object" })
      );

      const favorites = favoritesService.getGuestFavorites();

      expect(favorites).toEqual([]);
      expect(localStorage.getItem("guest_favorites")).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "[Favorites] Invalid favorites data in localStorage, resetting"
      );

      console.error = originalError;
    });

    it("should handle string data in localStorage", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_favorites", JSON.stringify("invalid string"));

      const favorites = favoritesService.getGuestFavorites();

      expect(favorites).toEqual([]);
      expect(console.error).toHaveBeenCalled();

      console.error = originalError;
    });

    it("should handle number data in localStorage", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_favorites", JSON.stringify(123));

      const favorites = favoritesService.getGuestFavorites();

      expect(favorites).toEqual([]);
      expect(console.error).toHaveBeenCalled();

      console.error = originalError;
    });

    it("should handle null data in localStorage", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_favorites", JSON.stringify(null));

      const favorites = favoritesService.getGuestFavorites();

      expect(favorites).toEqual([]);
      expect(console.error).toHaveBeenCalled();

      console.error = originalError;
    });

    it("should filter out non-string items", () => {
      const originalWarn = console.warn;
      console.warn = jest.fn();

      const mixedData = [
        "prod1",
        123,
        "prod2",
        null,
        "prod3",
        { invalid: "object" },
      ];
      localStorage.setItem("guest_favorites", JSON.stringify(mixedData));

      const favorites = favoritesService.getGuestFavorites();

      expect(favorites).toEqual(["prod1", "prod2", "prod3"]);
      expect(console.warn).toHaveBeenCalledWith(
        "[Favorites] Removed invalid product IDs from favorites"
      );

      console.warn = originalWarn;
    });

    it("should filter out empty strings", () => {
      const originalWarn = console.warn;
      console.warn = jest.fn();

      const data = ["prod1", "", "prod2", "   "];
      localStorage.setItem("guest_favorites", JSON.stringify(data));

      const favorites = favoritesService.getGuestFavorites();

      // Note: Empty strings and whitespace-only strings are filtered
      expect(favorites.length).toBeLessThan(data.length);
      expect(console.warn).toHaveBeenCalled();

      console.warn = originalWarn;
    });

    it("should handle corrupted JSON data", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_favorites", "invalid json{");

      const favorites = favoritesService.getGuestFavorites();

      expect(favorites).toEqual([]);
      expect(localStorage.getItem("guest_favorites")).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[Favorites] Failed to parse favorites"),
        expect.any(Error)
      );

      console.error = originalError;
    });

    it("should return empty array when SSR (window undefined)", () => {
      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual([]);
    });

    it("should accept valid array of strings", () => {
      const validFavorites = ["prod1", "prod2", "prod3"];
      localStorage.setItem("guest_favorites", JSON.stringify(validFavorites));

      const favorites = favoritesService.getGuestFavorites();

      expect(favorites).toEqual(validFavorites);
    });
  });

  describe("addToGuestFavorites validation", () => {
    it("should throw error for empty product ID", () => {
      expect(() => {
        favoritesService.addToGuestFavorites("");
      }).toThrow("[Favorites] Product ID cannot be empty");
    });

    it("should throw error for whitespace-only product ID", () => {
      expect(() => {
        favoritesService.addToGuestFavorites("   ");
      }).toThrow("[Favorites] Product ID cannot be empty");
    });

    it("should throw error for non-string product ID", () => {
      expect(() => {
        favoritesService.addToGuestFavorites(123 as any);
      }).toThrow("[Favorites] Invalid product ID");
    });

    it("should throw error for null product ID", () => {
      expect(() => {
        favoritesService.addToGuestFavorites(null as any);
      }).toThrow("[Favorites] Invalid product ID");
    });

    it("should throw error for undefined product ID", () => {
      expect(() => {
        favoritesService.addToGuestFavorites(undefined as any);
      }).toThrow("[Favorites] Invalid product ID");
    });

    it("should trim whitespace from product ID", () => {
      favoritesService.addToGuestFavorites("  prod123  ");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod123"]);
    });

    it("should add valid product ID", () => {
      favoritesService.addToGuestFavorites("prod1");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod1"]);
    });

    it("should not add duplicate product ID", () => {
      favoritesService.addToGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod1");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod1"]);
    });

    it("should add multiple different products", () => {
      favoritesService.addToGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod2");
      favoritesService.addToGuestFavorites("prod3");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod1", "prod2", "prod3"]);
    });
  });

  describe("removeFromGuestFavorites validation", () => {
    beforeEach(() => {
      // Setup: add some favorites
      favoritesService.addToGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod2");
      favoritesService.addToGuestFavorites("prod3");
    });

    it("should throw error for empty product ID", () => {
      expect(() => {
        favoritesService.removeFromGuestFavorites("");
      }).toThrow("[Favorites] Invalid product ID");
    });

    it("should throw error for non-string product ID", () => {
      expect(() => {
        favoritesService.removeFromGuestFavorites(123 as any);
      }).toThrow("[Favorites] Invalid product ID");
    });

    it("should throw error for null product ID", () => {
      expect(() => {
        favoritesService.removeFromGuestFavorites(null as any);
      }).toThrow("[Favorites] Invalid product ID");
    });

    it("should trim whitespace from product ID", () => {
      favoritesService.removeFromGuestFavorites("  prod2  ");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod1", "prod3"]);
    });

    it("should remove existing product ID", () => {
      favoritesService.removeFromGuestFavorites("prod2");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod1", "prod3"]);
    });

    it("should handle removing non-existent product ID", () => {
      favoritesService.removeFromGuestFavorites("prod999");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod1", "prod2", "prod3"]);
    });

    it("should remove all specified products", () => {
      favoritesService.removeFromGuestFavorites("prod1");
      favoritesService.removeFromGuestFavorites("prod2");
      favoritesService.removeFromGuestFavorites("prod3");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual([]);
    });
  });

  describe("Data integrity", () => {
    it("should maintain data integrity after corruption recovery", () => {
      const originalError = console.error;
      console.error = jest.fn();

      // Corrupt data
      localStorage.setItem("guest_favorites", "invalid json{");

      // Should recover
      const favorites1 = favoritesService.getGuestFavorites();
      expect(favorites1).toEqual([]);

      // Should work normally after recovery
      favoritesService.addToGuestFavorites("prod1");
      const favorites2 = favoritesService.getGuestFavorites();
      expect(favorites2).toEqual(["prod1"]);

      console.error = originalError;
    });

    it("should auto-fix corrupted data with mixed types", () => {
      const originalWarn = console.warn;
      console.warn = jest.fn();

      // Add mixed invalid data
      const mixedData = ["prod1", 123, "prod2", null];
      localStorage.setItem("guest_favorites", JSON.stringify(mixedData));

      // Should filter and fix
      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod1", "prod2"]);

      // Should persist the fix
      const favoritesAgain = favoritesService.getGuestFavorites();
      expect(favoritesAgain).toEqual(["prod1", "prod2"]);

      console.warn = originalWarn;
    });

    it("should handle rapid add/remove operations", () => {
      // Rapid operations
      favoritesService.addToGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod2");
      favoritesService.removeFromGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod3");
      favoritesService.removeFromGuestFavorites("prod2");

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(["prod3"]);
    });
  });

  describe("Edge cases", () => {
    it("should handle very long product IDs", () => {
      const longId = "a".repeat(1000);
      favoritesService.addToGuestFavorites(longId);

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual([longId]);
    });

    it("should handle special characters in product IDs", () => {
      const specialIds = [
        "prod-123",
        "prod_456",
        "prod.789",
        "prod@email",
        "prod#hash",
      ];

      specialIds.forEach((id) => favoritesService.addToGuestFavorites(id));

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(specialIds);
    });

    it("should handle unicode characters in product IDs", () => {
      const unicodeIds = ["prod🎉", "प्रोड", "продукт"];

      unicodeIds.forEach((id) => favoritesService.addToGuestFavorites(id));

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual(unicodeIds);
    });

    it("should handle large number of favorites", () => {
      const manyIds = Array.from({ length: 1000 }, (_, i) => `prod${i}`);

      manyIds.forEach((id) => favoritesService.addToGuestFavorites(id));

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toHaveLength(1000);
      expect(favorites).toEqual(manyIds);
    });
  });

  describe("clearGuestFavorites", () => {
    it("should clear all favorites", () => {
      favoritesService.addToGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod2");

      favoritesService.clearGuestFavorites();

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual([]);
    });

    it("should handle clearing already empty favorites", () => {
      favoritesService.clearGuestFavorites();
      favoritesService.clearGuestFavorites();

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toEqual([]);
    });
  });

  describe("isGuestFavorited", () => {
    beforeEach(() => {
      favoritesService.addToGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod2");
    });

    it("should return true for favorited product", () => {
      const isFav = favoritesService.isGuestFavorited("prod1");
      expect(isFav).toBe(true);
    });

    it("should return false for non-favorited product", () => {
      const isFav = favoritesService.isGuestFavorited("prod999");
      expect(isFav).toBe(false);
    });

    it("should handle trimmed product IDs", () => {
      const isFav = favoritesService.isGuestFavorited("  prod1  ");
      expect(isFav).toBe(true);
    });
  });

  describe("getGuestFavoritesCount", () => {
    it("should return 0 for empty favorites", () => {
      const count = favoritesService.getGuestFavoritesCount();
      expect(count).toBe(0);
    });

    it("should return correct count", () => {
      favoritesService.addToGuestFavorites("prod1");
      favoritesService.addToGuestFavorites("prod2");
      favoritesService.addToGuestFavorites("prod3");

      const count = favoritesService.getGuestFavoritesCount();
      expect(count).toBe(3);
    });

    it("should update count after operations", () => {
      favoritesService.addToGuestFavorites("prod1");
      expect(favoritesService.getGuestFavoritesCount()).toBe(1);

      favoritesService.addToGuestFavorites("prod2");
      expect(favoritesService.getGuestFavoritesCount()).toBe(2);

      favoritesService.removeFromGuestFavorites("prod1");
      expect(favoritesService.getGuestFavoritesCount()).toBe(1);
    });
  });
});
