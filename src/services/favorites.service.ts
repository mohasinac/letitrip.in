import type { ProductCardFE } from "@/types/frontend/product.types";
import { logServiceError } from "@letitrip/react-library";
import { apiService } from "./api.service";

interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  product: ProductCardFE;
  addedAt: Date;
}

class FavoritesService {
  // Get user favorites by type
  async listByType(type: "product" | "shop" | "category" | "auction"): Promise<{
    success: boolean;
    data: FavoriteItem[];
  }> {
    try {
      return await apiService.get<{ success: boolean; data: FavoriteItem[] }>(
        `/api/favorites/list/${type}`,
      );
    } catch (error) {
      logServiceError("FavoritesService", "listByType", error as Error);
      return { success: false, data: [] };
    }
  }

  // Get user favorites (products only - legacy)
  async list(): Promise<FavoriteItem[]> {
    return apiService.get<FavoriteItem[]>("/favorites");
  }

  // Add product to favorites
  async add(productId: string): Promise<FavoriteItem> {
    return apiService.post<FavoriteItem>("/favorites", { productId });
  }

  // Remove favorite by type and ID
  async removeByType(
    type: "product" | "shop" | "category" | "auction",
    itemId: string,
  ): Promise<{ success: boolean }> {
    try {
      await apiService.delete<{ success: boolean }>(
        `/api/favorites/${type}/${itemId}`,
      );
      return { success: true };
    } catch (error) {
      logServiceError("FavoritesService", "removeByType", error as Error);
      return { success: false };
    }
  }

  // Remove product from favorites (legacy)
  async remove(favoriteId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/favorites/${favoriteId}`);
  }

  // Remove by product ID
  async removeByProductId(productId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(
      `/favorites/product/${productId}`,
    );
  }

  // Check if product is favorited
  async isFavorited(
    productId: string,
  ): Promise<{ isFavorited: boolean; favoriteId?: string }> {
    return apiService.get<{ isFavorited: boolean; favoriteId?: string }>(
      `/favorites/check/${productId}`,
    );
  }

  // Get favorites count
  async getCount(): Promise<{ count: number }> {
    return apiService.get<{ count: number }>("/favorites/count");
  }

  // Clear all favorites
  async clear(): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>("/favorites");
  }

  // Local storage helpers for guest favorites
  private readonly GUEST_FAVORITES_KEY = "guest_favorites";

  getGuestFavorites(): string[] {
    if (typeof window === "undefined") return [];

    try {
      const favorites = localStorage.getItem(this.GUEST_FAVORITES_KEY);
      const parsed = favorites ? JSON.parse(favorites) : [];

      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        console.error(
          "[Favorites] Invalid favorites data in localStorage, resetting",
        );
        this.clearGuestFavorites();
        return [];
      }

      // Validate all items are strings
      const validFavorites = parsed.filter(
        (item) => typeof item === "string" && item.length > 0,
      );
      if (validFavorites.length !== parsed.length) {
        console.warn("[Favorites] Removed invalid product IDs from favorites");
        this.setGuestFavorites(validFavorites);
      }

      return validFavorites;
    } catch (error) {
      console.error(
        "[Favorites] Failed to parse favorites from localStorage:",
        error,
      );
      this.clearGuestFavorites();
      return [];
    }
  }

  setGuestFavorites(productIds: string[]): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.GUEST_FAVORITES_KEY, JSON.stringify(productIds));
  }

  addToGuestFavorites(productId: string): void {
    // Validate input - check type first
    if (typeof productId !== "string") {
      throw new Error("[Favorites] Invalid product ID");
    }

    const cleanProductId = productId.trim();
    if (cleanProductId.length === 0) {
      throw new Error("[Favorites] Product ID cannot be empty");
    }

    const favorites = this.getGuestFavorites();

    if (!favorites.includes(cleanProductId)) {
      favorites.push(cleanProductId);
      this.setGuestFavorites(favorites);
    }
  }

  removeFromGuestFavorites(productId: string): void {
    // Validate input
    if (!productId || typeof productId !== "string") {
      throw new Error("[Favorites] Invalid product ID");
    }

    const cleanProductId = productId.trim();

    const favorites = this.getGuestFavorites();
    const filtered = favorites.filter((id) => id !== cleanProductId);
    this.setGuestFavorites(filtered);
  }

  isGuestFavorited(productId: string): boolean {
    const cleanProductId = productId.trim();
    const favorites = this.getGuestFavorites();
    return favorites.includes(cleanProductId);
  }

  clearGuestFavorites(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.GUEST_FAVORITES_KEY);
  }

  getGuestFavoritesCount(): number {
    return this.getGuestFavorites().length;
  }

  // Sync guest favorites to user account (on login)
  async syncGuestFavorites(): Promise<{ synced: number }> {
    const guestFavorites = this.getGuestFavorites();

    if (guestFavorites.length === 0) {
      return { synced: 0 };
    }

    try {
      const result = await apiService.post<{ synced: number }>(
        "/favorites/sync",
        {
          productIds: guestFavorites,
        },
      );

      // Clear guest favorites after sync
      this.clearGuestFavorites();

      return result;
    } catch (error) {
      logServiceError("FavoritesService", "syncGuestFavorites", error as Error);
      return { synced: 0 };
    }
  }
}

export const favoritesService = new FavoritesService();
export type { FavoriteItem };
