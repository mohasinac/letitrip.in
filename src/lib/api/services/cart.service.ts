/**
 * Cart Service
 * Handles all cart-related API operations
 */

import { apiClient } from "../client";
import type { CartItem } from "@/contexts/CartContext";

export interface CartData {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface CartSyncResult {
  cart: CartData;
  changes: Array<{
    itemId: string;
    type: "price_change" | "stock_change" | "unavailable";
    message: string;
  }>;
}

export class CartService {
  /**
   * Get user's cart
   */
  static async getCart(): Promise<CartData> {
    try {
      const response = await apiClient.get<CartData>("/api/cart");
      return response;
    } catch (error) {
      console.error("CartService.getCart error:", error);
      throw error;
    }
  }

  /**
   * Sync cart with latest prices and availability
   */
  static async syncCart(): Promise<CartSyncResult> {
    try {
      const response = await apiClient.get<CartSyncResult>("/api/cart?sync=true");
      return response;
    } catch (error) {
      console.error("CartService.syncCart error:", error);
      throw error;
    }
  }

  /**
   * Save/update entire cart
   */
  static async saveCart(items: CartItem[]): Promise<CartData> {
    try {
      const response = await apiClient.post<CartData>("/api/cart", { items });
      return response;
    } catch (error) {
      console.error("CartService.saveCart error:", error);
      throw error;
    }
  }

  /**
   * Add single item to cart
   */
  static async addItem(item: CartItem): Promise<CartData> {
    try {
      const response = await apiClient.post<CartData>("/api/cart", {
        action: "add",
        item,
      });
      return response;
    } catch (error) {
      console.error("CartService.addItem error:", error);
      throw error;
    }
  }

  /**
   * Merge guest cart with user cart
   */
  static async mergeGuestCart(guestCartItems: CartItem[]): Promise<CartData> {
    try {
      const response = await apiClient.post<CartData>("/api/cart", {
        action: "merge",
        guestCartItems,
      });
      return response;
    } catch (error) {
      console.error("CartService.mergeGuestCart error:", error);
      throw error;
    }
  }

  /**
   * Clear cart
   */
  static async clearCart(): Promise<CartData> {
    try {
      const response = await apiClient.delete<CartData>("/api/cart");
      return response;
    } catch (error) {
      console.error("CartService.clearCart error:", error);
      throw error;
    }
  }
}

export default CartService;
