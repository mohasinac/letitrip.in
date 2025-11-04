/**
 * Guest Cart Utilities
 * Handle guest cart storage and merging with user cart on login
 */

import { CartItem } from '@/lib/contexts/CartContext";
import { cookieStorage } from "@/lib/storage/cookieStorage";

const GUEST_CART_COOKIE = "guest_cart";
const GUEST_CART_LOCALSTORAGE = "shopping_cart";

export const GuestCartManager = {
  /**
   * Save guest cart to cookies and localStorage
   */
  save(items: CartItem[]): void {
    try {
      const cartData = JSON.stringify(items);
      
      // Save to cookie (max 4KB, so limit to essential data)
      const compactItems = items.map(item => ({
        id: item.productId,
        q: item.quantity,
      }));
      cookieStorage.setJson(GUEST_CART_COOKIE, compactItems, { expires: 30 }); // 30 days
      
      // Save full data to localStorage
      localStorage.setItem(GUEST_CART_LOCALSTORAGE, cartData);
    } catch (error) {
      console.error("Failed to save guest cart:", error);
    }
  },

  /**
   * Load guest cart from cookies/localStorage
   */
  load(): CartItem[] {
    try {
      // Try localStorage first (has full data)
      const localData = localStorage.getItem(GUEST_CART_LOCALSTORAGE);
      if (localData) {
        return JSON.parse(localData);
      }
      
      // Fallback to cookie (limited data)
      const cookieData = cookieStorage.getJson<Array<{id: string, q: number}>>(GUEST_CART_COOKIE);
      if (cookieData) {
        // Convert compact format back to full CartItem format
        // Note: This will only have basic info, full product details will need to be fetched
        return cookieData.map(item => ({
          id: `cart_${item.id}`,
          productId: item.id,
          quantity: item.q,
          name: "",
          image: "",
          price: 0,
          stock: 0,
          sellerId: "",
          sellerName: "",
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Failed to load guest cart:", error);
      return [];
    }
  },

  /**
   * Clear guest cart
   */
  clear(): void {
    try {
      cookieStorage.remove(GUEST_CART_COOKIE);
      localStorage.removeItem(GUEST_CART_LOCALSTORAGE);
    } catch (error) {
      console.error("Failed to clear guest cart:", error);
    }
  },

  /**
   * Merge guest cart with user cart
   * Returns merged cart items with duplicates handled (quantities added)
   */
  merge(guestCart: CartItem[], userCart: CartItem[]): CartItem[] {
    const merged: CartItem[] = [...userCart];
    
    guestCart.forEach(guestItem => {
      const existingIndex = merged.findIndex(
        item => item.productId === guestItem.productId
      );
      
      if (existingIndex >= 0) {
        // Item exists in user cart - add quantities
        const existing = merged[existingIndex];
        merged[existingIndex] = {
          ...existing,
          quantity: Math.min(
            existing.quantity + guestItem.quantity,
            existing.stock || 999
          ),
        };
      } else {
        // New item - add to cart
        merged.push(guestItem);
      }
    });
    
    return merged;
  },

  /**
   * Check if there's a guest cart
   */
  hasCart(): boolean {
    return (
      cookieStorage.has(GUEST_CART_COOKIE) ||
      !!localStorage.getItem(GUEST_CART_LOCALSTORAGE)
    );
  },
};
