/**
 * @fileoverview Service Module
 * @module src/services/favorites.service
 * @description This file contains service functions for favorites operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { logServiceError } from "@/lib/error-logger";
import type { ProductCardFE } from "@/types/frontend/product.types";
import { apiService } from "./api.service";

/**
 * FavoriteItem interface
 * 
 * @interface
 * @description Defines the structure and contract for FavoriteItem
 */
interface FavoriteItem {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Product Id */
  productId: string;
  /** Product */
  product: ProductCardFE;
  /** Added At */
  addedAt: Date;
}

/**
 * FavoritesService class
 * 
 * @class
 * @description Description of FavoritesService class functionality
 */
class FavoritesService {
  // Get user favorites by type
  async listByType(type: "product" | "shop" | "category" | "auction"): Promise<{
    /** Success */
    success: boolean;
    /** Data */
    data: FavoriteItem[];
  }> {
    try {
      return await apiService.get<{ success: boolean; data: FavoriteItem[] }>(
        `/api/favorites/list/${type}`
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
    /** Type */
    type: "product" | "shop" | "category" | "auction",
    /** Item Id */
    itemId: string
  ): Promise<{ success: boolean }> {
    try {
      await apiService.delete<{ success: boolean }>(
        `/api/favorites/${type}/${itemId}`
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
      `/favorites/product/${productId}`
    );
  }

  // Check if product is favorited
  async isFavorited(
    /** Product Id */
    productId: string
  ): Promise<{ isFavorited: boolean; favoriteId?: string }> {
    return apiService.get<{ isFavorited: boolean; favoriteId?: string }>(
      `/favorites/check/${productId}`
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
    /**
 * Performs filtered operation
 *
 * @param {any} (id - The (id
 *
 * @returns {any} The filtered result
 *
 */
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
          /** Product Ids */
          productIds: guestFavorites,
        }
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
