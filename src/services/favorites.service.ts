import { apiService } from "./api.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { logServiceError } from "@/lib/error-logger";

interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  product: ProductCardFE;
  addedAt: Date;
}

class FavoritesService {
  // Get user favorites
  async list(): Promise<FavoriteItem[]> {
    return apiService.get<FavoriteItem[]>("/favorites");
  }

  // Add product to favorites
  async add(productId: string): Promise<FavoriteItem> {
    return apiService.post<FavoriteItem>("/favorites", { productId });
  }

  // Remove product from favorites
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
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  }

  setGuestFavorites(productIds: string[]): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.GUEST_FAVORITES_KEY, JSON.stringify(productIds));
  }

  addToGuestFavorites(productId: string): void {
    const favorites = this.getGuestFavorites();

    if (!favorites.includes(productId)) {
      favorites.push(productId);
      this.setGuestFavorites(favorites);
    }
  }

  removeFromGuestFavorites(productId: string): void {
    const favorites = this.getGuestFavorites();
    const filtered = favorites.filter((id) => id !== productId);
    this.setGuestFavorites(filtered);
  }

  isGuestFavorited(productId: string): boolean {
    const favorites = this.getGuestFavorites();
    return favorites.includes(productId);
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
