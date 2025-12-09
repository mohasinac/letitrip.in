/**
 * Favorites Service Unit Tests
 * Tests favorites management including guest and authenticated user functionality
 */

import { apiService } from "@/services/api.service";
import {
  favoritesService,
  type FavoriteItem,
} from "@/services/favorites.service";
import type { ProductCardFE } from "@/types/frontend/product.types";

jest.mock("@/services/api.service");
jest.mock("@/lib/error-logger");

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe("FavoritesService", () => {
  const mockProduct: ProductCardFE = {
    id: "prod-1",
    name: "Test Product",
    slug: "test-product",
    price: 1000,
    images: ["/test.jpg"],
    shopId: "shop-1",
    shopName: "Test Shop",
    shopSlug: "test-shop",
    rating: 4.5,
    reviewCount: 10,
    inStock: true,
    condition: "new",
    category: "Electronics",
    categorySlug: "electronics",
  } as ProductCardFE;

  const mockFavorite: FavoriteItem = {
    id: "fav-1",
    userId: "user-1",
    productId: "prod-1",
    product: mockProduct,
    addedAt: new Date(),
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    // Setup default mocks
    mockApiService.get = jest.fn();
    mockApiService.post = jest.fn();
    mockApiService.delete = jest.fn();
  });

  describe("API Methods - Authenticated Users", () => {
    describe("listByType", () => {
      it("should list favorites by type", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          success: true,
          data: [mockFavorite],
        });

        const result = await favoritesService.listByType("product");

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(apiService.get).toHaveBeenCalledWith(
          "/api/favorites/list/product"
        );
      });

      it("should handle shop favorites", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          success: true,
          data: [],
        });

        await favoritesService.listByType("shop");

        expect(apiService.get).toHaveBeenCalledWith("/api/favorites/list/shop");
      });

      it("should handle category favorites", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          success: true,
          data: [],
        });

        await favoritesService.listByType("category");

        expect(apiService.get).toHaveBeenCalledWith(
          "/api/favorites/list/category"
        );
      });

      it("should handle auction favorites", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          success: true,
          data: [],
        });

        await favoritesService.listByType("auction");

        expect(apiService.get).toHaveBeenCalledWith(
          "/api/favorites/list/auction"
        );
      });

      it("should handle API errors gracefully", async () => {
        (apiService.get as jest.Mock).mockRejectedValue(
          new Error("Network error")
        );

        const result = await favoritesService.listByType("product");

        expect(result.success).toBe(false);
        expect(result.data).toEqual([]);
      });

      it("should handle empty results", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          success: true,
          data: [],
        });

        const result = await favoritesService.listByType("product");

        expect(result.data).toEqual([]);
      });
    });

    describe("list (legacy)", () => {
      it("should list all product favorites", async () => {
        (apiService.get as jest.Mock).mockResolvedValue([mockFavorite]);

        const result = await favoritesService.list();

        expect(result).toHaveLength(1);
        expect(apiService.get).toHaveBeenCalledWith("/favorites");
      });

      it("should handle errors from API", async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));

        await expect(favoritesService.list()).rejects.toThrow("API error");
      });
    });

    describe("add", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should add product to favorites", async () => {
        (apiService.post as jest.Mock).mockResolvedValue(mockFavorite);

        const result = await favoritesService.add("prod-1");

        expect(result).toEqual(mockFavorite);
        expect(apiService.post).toHaveBeenCalledWith("/favorites", {
          productId: "prod-1",
        });
      });

      it("should handle duplicate additions", async () => {
        (apiService.post as jest.Mock).mockRejectedValue(
          new Error("Already favorited")
        );

        await expect(favoritesService.add("prod-1")).rejects.toThrow(
          "Already favorited"
        );
      });

      it("should handle invalid product ID", async () => {
        (apiService.post as jest.Mock).mockRejectedValue(
          new Error("Product not found")
        );

        await expect(favoritesService.add("invalid")).rejects.toThrow(
          "Product not found"
        );
      });
    });

    describe("removeByType", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should remove favorite by type and ID", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

        const result = await favoritesService.removeByType("product", "prod-1");

        expect(result.success).toBe(true);
        expect(apiService.delete).toHaveBeenCalledWith(
          "/api/favorites/product/prod-1"
        );
      });

      it("should handle removal errors gracefully", async () => {
        (apiService.delete as jest.Mock).mockRejectedValue(
          new Error("Not found")
        );

        const result = await favoritesService.removeByType("product", "prod-1");

        expect(result.success).toBe(false);
      });

      it("should handle different types", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

        await favoritesService.removeByType("shop", "shop-1");
        expect(apiService.delete).toHaveBeenCalledWith(
          "/api/favorites/shop/shop-1"
        );

        await favoritesService.removeByType("category", "cat-1");
        expect(apiService.delete).toHaveBeenCalledWith(
          "/api/favorites/category/cat-1"
        );

        await favoritesService.removeByType("auction", "auction-1");
        expect(apiService.delete).toHaveBeenCalledWith(
          "/api/favorites/auction/auction-1"
        );
      });
    });

    describe("remove (legacy)", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should remove favorite by ID", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({
          message: "Removed",
        });

        const result = await favoritesService.remove("fav-1");

        expect(result.message).toBe("Removed");
        expect(apiService.delete).toHaveBeenCalledWith("/favorites/fav-1");
      });
    });

    describe("removeByProductId", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should remove favorite by product ID", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({
          message: "Removed",
        });

        const result = await favoritesService.removeByProductId("prod-1");

        expect(result.message).toBe("Removed");
        expect(apiService.delete).toHaveBeenCalledWith(
          "/favorites/product/prod-1"
        );
      });
    });

    describe("isFavorited", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should check if product is favorited", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          isFavorited: true,
          favoriteId: "fav-1",
        });

        const result = await favoritesService.isFavorited("prod-1");

        expect(result.isFavorited).toBe(true);
        expect(result.favoriteId).toBe("fav-1");
        expect(apiService.get).toHaveBeenCalledWith("/favorites/check/prod-1");
      });

      it("should return false for non-favorited products", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          isFavorited: false,
        });

        const result = await favoritesService.isFavorited("prod-2");

        expect(result.isFavorited).toBe(false);
        expect(result.favoriteId).toBeUndefined();
      });
    });

    describe("getCount", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should get favorites count", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ count: 5 });

        const result = await favoritesService.getCount();

        expect(result.count).toBe(5);
        expect(apiService.get).toHaveBeenCalledWith("/favorites/count");
      });

      it("should handle zero favorites", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ count: 0 });

        const result = await favoritesService.getCount();

        expect(result.count).toBe(0);
      });
    });

    describe("clear", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should clear all favorites", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({
          message: "Cleared",
        });

        const result = await favoritesService.clear();

        expect(result.message).toBe("Cleared");
        expect(apiService.delete).toHaveBeenCalledWith("/favorites");
      });
    });
  });

  describe("Guest Favorites - LocalStorage", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getGuestFavorites", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should return empty array when no favorites", () => {
        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual([]);
      });

      it("should return stored favorites", () => {
        localStorage.setItem(
          "guest_favorites",
          JSON.stringify(["prod-1", "prod-2"])
        );

        const favorites = favoritesService.getGuestFavorites();

        expect(favorites).toEqual(["prod-1", "prod-2"]);
      });

      it("should handle JSON parse errors", () => {
        localStorage.setItem("guest_favorites", "invalid-json");

        const favorites = favoritesService.getGuestFavorites();

        expect(favorites).toEqual([]);
      });

      it("should handle localStorage errors", () => {
        const originalGetItem = Storage.prototype.getItem;
        Storage.prototype.getItem = jest.fn(() => {
          throw new Error("Storage error");
        });

        const favorites = favoritesService.getGuestFavorites();

        expect(favorites).toEqual([]);

        Storage.prototype.getItem = originalGetItem;
      });
    });

    describe("setGuestFavorites", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should set guest favorites", () => {
        favoritesService.setGuestFavorites(["prod-1", "prod-2"]);

        const stored = localStorage.getItem("guest_favorites");
        expect(JSON.parse(stored!)).toEqual(["prod-1", "prod-2"]);
      });

      it("should overwrite existing favorites", () => {
        localStorage.setItem("guest_favorites", JSON.stringify(["prod-1"]));

        favoritesService.setGuestFavorites(["prod-3", "prod-4"]);

        const stored = localStorage.getItem("guest_favorites");
        expect(JSON.parse(stored!)).toEqual(["prod-3", "prod-4"]);
      });

      it("should handle empty array", () => {
        favoritesService.setGuestFavorites([]);

        const stored = localStorage.getItem("guest_favorites");
        expect(JSON.parse(stored!)).toEqual([]);
      });
    });

    describe("addToGuestFavorites", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should add product to empty favorites", () => {
        favoritesService.addToGuestFavorites("prod-1");

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual(["prod-1"]);
      });

      it("should add product to existing favorites", () => {
        favoritesService.setGuestFavorites(["prod-1"]);

        favoritesService.addToGuestFavorites("prod-2");

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual(["prod-1", "prod-2"]);
      });

      it("should not add duplicate products", () => {
        favoritesService.setGuestFavorites(["prod-1"]);

        favoritesService.addToGuestFavorites("prod-1");

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual(["prod-1"]);
      });

      it("should handle multiple additions", () => {
        favoritesService.addToGuestFavorites("prod-1");
        favoritesService.addToGuestFavorites("prod-2");
        favoritesService.addToGuestFavorites("prod-3");

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toHaveLength(3);
      });
    });

    describe("removeFromGuestFavorites", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should remove product from favorites", () => {
        favoritesService.setGuestFavorites(["prod-1", "prod-2", "prod-3"]);

        favoritesService.removeFromGuestFavorites("prod-2");

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual(["prod-1", "prod-3"]);
      });

      it("should handle removing non-existent product", () => {
        favoritesService.setGuestFavorites(["prod-1"]);

        favoritesService.removeFromGuestFavorites("prod-2");

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual(["prod-1"]);
      });

      it("should handle empty favorites", () => {
        favoritesService.removeFromGuestFavorites("prod-1");

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual([]);
      });
    });

    describe("isGuestFavorited", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should return true for favorited product", () => {
        favoritesService.setGuestFavorites(["prod-1", "prod-2"]);

        expect(favoritesService.isGuestFavorited("prod-1")).toBe(true);
      });

      it("should return false for non-favorited product", () => {
        favoritesService.setGuestFavorites(["prod-1"]);

        expect(favoritesService.isGuestFavorited("prod-2")).toBe(false);
      });

      it("should return false for empty favorites", () => {
        expect(favoritesService.isGuestFavorited("prod-1")).toBe(false);
      });
    });

    describe("clearGuestFavorites", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should clear all guest favorites", () => {
        favoritesService.setGuestFavorites(["prod-1", "prod-2"]);

        favoritesService.clearGuestFavorites();

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual([]);
      });

      it("should handle already empty favorites", () => {
        favoritesService.clearGuestFavorites();

        const favorites = favoritesService.getGuestFavorites();
        expect(favorites).toEqual([]);
      });
    });

    describe("getGuestFavoritesCount", () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it("should return count of guest favorites", () => {
        favoritesService.setGuestFavorites(["prod-1", "prod-2", "prod-3"]);

        expect(favoritesService.getGuestFavoritesCount()).toBe(3);
      });

      it("should return 0 for empty favorites", () => {
        expect(favoritesService.getGuestFavoritesCount()).toBe(0);
      });
    });
  });

  describe("syncGuestFavorites", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should sync guest favorites to user account", async () => {
      favoritesService.setGuestFavorites(["prod-1", "prod-2", "prod-3"]);

      (apiService.post as jest.Mock).mockResolvedValue({ synced: 3 });

      const result = await favoritesService.syncGuestFavorites();

      expect(result.synced).toBe(3);
      expect(apiService.post).toHaveBeenCalledWith("/favorites/sync", {
        productIds: ["prod-1", "prod-2", "prod-3"],
      });

      // Should clear guest favorites after sync
      expect(favoritesService.getGuestFavorites()).toEqual([]);
    });

    it("should return 0 when no guest favorites", async () => {
      const result = await favoritesService.syncGuestFavorites();

      expect(result.synced).toBe(0);
      expect(apiService.post).not.toHaveBeenCalled();
    });

    it("should handle sync errors gracefully", async () => {
      favoritesService.setGuestFavorites(["prod-1"]);

      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Sync failed")
      );

      const result = await favoritesService.syncGuestFavorites();

      expect(result.synced).toBe(0);
      // Guest favorites should not be cleared on error
      expect(favoritesService.getGuestFavorites()).toEqual(["prod-1"]);
    });

    it("should handle partial sync", async () => {
      favoritesService.setGuestFavorites(["prod-1", "prod-2", "prod-3"]);

      (apiService.post as jest.Mock).mockResolvedValue({ synced: 2 });

      const result = await favoritesService.syncGuestFavorites();

      expect(result.synced).toBe(2);
      expect(favoritesService.getGuestFavorites()).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should handle rapid operations", () => {
      for (let i = 0; i < 100; i++) {
        favoritesService.addToGuestFavorites(`prod-${i}`);
      }

      const favorites = favoritesService.getGuestFavorites();
      expect(favorites).toHaveLength(100);
    });

    it("should maintain data integrity", () => {
      favoritesService.addToGuestFavorites("prod-1");
      expect(favoritesService.isGuestFavorited("prod-1")).toBe(true);

      favoritesService.removeFromGuestFavorites("prod-1");
      expect(favoritesService.isGuestFavorited("prod-1")).toBe(false);

      favoritesService.addToGuestFavorites("prod-2");
      expect(favoritesService.getGuestFavoritesCount()).toBe(1);
    });

    it("should handle concurrent API calls", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockFavorite);

      const promises = [
        favoritesService.add("prod-1"),
        favoritesService.add("prod-2"),
        favoritesService.add("prod-3"),
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it("should handle localStorage quota exceeded", () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("QuotaExceededError");
      });

      // localStorage errors will throw since service doesn't catch them
      expect(() => favoritesService.setGuestFavorites(["prod-1"])).toThrow(
        "QuotaExceededError"
      );

      Storage.prototype.setItem = originalSetItem;
    });
  });
});
