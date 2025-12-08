import { apiService } from "../api.service";
import { favoritesService } from "../favorites.service";

// Mock the api service
jest.mock("../api.service");

// Mock error logger
jest.mock("@/lib/error-logger", () => ({
  logServiceError: jest.fn(),
}));

describe("FavoritesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listByType", () => {
    it("fetches product favorites successfully", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: "fav-1",
            userId: "user-1",
            productId: "prod-1",
            product: { id: "prod-1", name: "Product 1" },
            addedAt: new Date(),
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.listByType("product");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(apiService.get).toHaveBeenCalledWith(
        "/api/favorites/list/product"
      );
    });

    it("fetches shop favorites", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "fav-1", userId: "user-1", shopId: "shop-1" }],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.listByType("shop");

      expect(result.success).toBe(true);
      expect(apiService.get).toHaveBeenCalledWith("/api/favorites/list/shop");
    });

    it("handles empty favorites", async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.listByType("product");

      expect(result.data).toHaveLength(0);
    });

    it("handles errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch favorites")
      );

      const result = await favoritesService.listByType("product");

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });
  });

  describe("list", () => {
    it("fetches all favorites successfully", async () => {
      const mockFavorites = [
        {
          id: "fav-1",
          userId: "user-1",
          productId: "prod-1",
          product: { id: "prod-1", name: "Product 1" },
          addedAt: new Date(),
        },
        {
          id: "fav-2",
          userId: "user-1",
          productId: "prod-2",
          product: { id: "prod-2", name: "Product 2" },
          addedAt: new Date(),
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await favoritesService.list();

      expect(result).toHaveLength(2);
      expect(apiService.get).toHaveBeenCalledWith("/favorites");
    });
  });

  describe("add", () => {
    it("adds product to favorites successfully", async () => {
      const mockFavorite = {
        id: "fav-1",
        userId: "user-1",
        productId: "prod-1",
        product: { id: "prod-1", name: "Product 1" },
        addedAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await favoritesService.add("prod-1");

      expect(result).toEqual(mockFavorite);
      expect(apiService.post).toHaveBeenCalledWith("/favorites", {
        productId: "prod-1",
      });
    });

    it("handles duplicate favorite error", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Product already in favorites")
      );

      await expect(favoritesService.add("prod-1")).rejects.toThrow(
        "Product already in favorites"
      );
    });
  });

  describe("removeByType", () => {
    it("removes product favorite successfully", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

      const result = await favoritesService.removeByType("product", "prod-1");

      expect(result.success).toBe(true);
      expect(apiService.delete).toHaveBeenCalledWith(
        "/api/favorites/product/prod-1"
      );
    });

    it("removes shop favorite", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

      const result = await favoritesService.removeByType("shop", "shop-1");

      expect(result.success).toBe(true);
      expect(apiService.delete).toHaveBeenCalledWith(
        "/api/favorites/shop/shop-1"
      );
    });

    it("handles errors gracefully", async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error("Failed to remove favorite")
      );

      const result = await favoritesService.removeByType("product", "prod-1");

      expect(result.success).toBe(false);
    });
  });

  describe("remove", () => {
    it("removes favorite by ID successfully", async () => {
      const mockResponse = { message: "Favorite removed successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.remove("fav-1");

      expect(result).toEqual(mockResponse);
      expect(apiService.delete).toHaveBeenCalledWith("/favorites/fav-1");
    });
  });

  describe("removeByProductId", () => {
    it("removes favorite by product ID successfully", async () => {
      const mockResponse = { message: "Favorite removed successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.removeByProductId("prod-1");

      expect(result).toEqual(mockResponse);
      expect(apiService.delete).toHaveBeenCalledWith(
        "/favorites/product/prod-1"
      );
    });
  });

  describe("isFavorited", () => {
    it("returns true when product is favorited", async () => {
      const mockResponse = {
        isFavorited: true,
        favoriteId: "fav-1",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.isFavorited("prod-1");

      expect(result.isFavorited).toBe(true);
      expect(result.favoriteId).toBe("fav-1");
      expect(apiService.get).toHaveBeenCalledWith("/favorites/check/prod-1");
    });

    it("returns false when product is not favorited", async () => {
      const mockResponse = {
        isFavorited: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.isFavorited("prod-1");

      expect(result.isFavorited).toBe(false);
      expect(result.favoriteId).toBeUndefined();
    });
  });

  describe("getCount", () => {
    it("returns favorites count", async () => {
      const mockResponse = { count: 5 };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.getCount();

      expect(result.count).toBe(5);
      expect(apiService.get).toHaveBeenCalledWith("/favorites/count");
    });

    it("returns zero when no favorites", async () => {
      const mockResponse = { count: 0 };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await favoritesService.getCount();

      expect(result.count).toBe(0);
    });
  });
});
