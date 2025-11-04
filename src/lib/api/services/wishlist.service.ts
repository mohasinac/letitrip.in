/**
 * Wishlist Service
 * Handles all wishlist-related API operations
 */

import { apiClient } from "../client";
import type { WishlistItem } from '@/lib/contexts/WishlistContext";

export interface WishlistData {
  items: WishlistItem[];
  itemCount: number;
}

export class WishlistService {
  /**
   * Get user's wishlist
   */
  static async getWishlist(): Promise<WishlistData> {
    try {
      const response = await apiClient.get<WishlistData>("/api/wishlist");
      return response;
    } catch (error) {
      console.error("WishlistService.getWishlist error:", error);
      throw error;
    }
  }

  /**
   * Add item to wishlist
   */
  static async addItem(item: WishlistItem): Promise<WishlistData> {
    try {
      const response = await apiClient.post<WishlistData>("/api/wishlist", {
        action: "add",
        item,
      });
      return response;
    } catch (error) {
      console.error("WishlistService.addItem error:", error);
      throw error;
    }
  }

  /**
   * Remove item from wishlist
   */
  static async removeItem(itemId: string): Promise<WishlistData> {
    try {
      const response = await apiClient.delete<WishlistData>(
        `/api/wishlist?itemId=${itemId}`
      );
      return response;
    } catch (error) {
      console.error("WishlistService.removeItem error:", error);
      throw error;
    }
  }

  /**
   * Clear wishlist
   */
  static async clearWishlist(): Promise<WishlistData> {
    try {
      const response = await apiClient.delete<WishlistData>("/api/wishlist");
      return response;
    } catch (error) {
      console.error("WishlistService.clearWishlist error:", error);
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  static async isInWishlist(productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.items.some((item) => item.productId === productId);
    } catch (error) {
      console.error("WishlistService.isInWishlist error:", error);
      return false;
    }
  }
}

export default WishlistService;
