/**
 * Product Comparison Service
 * Client-side localStorage service for managing product comparison
 */

import { COMPARISON_CONFIG } from "@/constants/comparison";
import type { ProductCardProps } from "@letitrip/react-library";

export type ComparisonProduct = Pick<
  ProductCardProps,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "originalPrice"
  | "image"
  | "rating"
  | "reviewCount"
  | "shopName"
  | "shopSlug"
  | "inStock"
  | "condition"
>;

class ComparisonService {
  private getStorageKey(): string {
    return COMPARISON_CONFIG.STORAGE_KEY;
  }

  /**
   * Get all products in comparison from localStorage
   */
  getComparisonProducts(): ComparisonProduct[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      // BUG FIX #28: Handle null from JSON.parse (when stored value is "null")
      if (!parsed || !Array.isArray(parsed)) return [];

      return parsed as ComparisonProduct[];
    } catch (error) {
      // BUG FIX #28: Log parsing error for debugging
      console.error("[Comparison] Failed to parse comparison products:", error);
      return [];
    }
  }

  /**
   * Get product IDs in comparison
   */
  getComparisonProductIds(): string[] {
    return this.getComparisonProducts().map((p) => p.id);
  }

  /**
   * Add a product to comparison
   * @returns true if added, false if already exists or max reached
   */
  addToComparison(product: ComparisonProduct): boolean {
    if (typeof window === "undefined") return false;

    try {
      const products = this.getComparisonProducts();

      // Check if already in comparison
      if (products.some((p) => p.id === product.id)) {
        return false;
      }

      // Check if max reached
      if (products.length >= COMPARISON_CONFIG.MAX_PRODUCTS) {
        return false;
      }

      products.push(product);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(products));
      return true;
    } catch (error) {
      // BUG FIX #28: Log error when adding to comparison fails
      console.error("[Comparison] Failed to add product to comparison:", error);
      return false;
    }
  }

  /**
   * Remove a product from comparison
   */
  removeFromComparison(productId: string): void {
    if (typeof window === "undefined") return;

    try {
      const products = this.getComparisonProducts();
      const filtered = products.filter((p) => p.id !== productId);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(filtered));
    } catch {
      // Ignore errors
    }
  }

  /**
   * Clear all products from comparison
   */
  clearComparison(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.getStorageKey());
    } catch {
      // Ignore errors
    }
  }

  /**
   * Check if a product is in comparison
   */
  isInComparison(productId: string): boolean {
    return this.getComparisonProducts().some((p) => p.id === productId);
  }

  /**
   * Get count of products in comparison
   */
  getComparisonCount(): number {
    return this.getComparisonProducts().length;
  }

  /**
   * Check if more products can be added
   */
  canAddMore(): boolean {
    return this.getComparisonCount() < COMPARISON_CONFIG.MAX_PRODUCTS;
  }

  /**
   * Check if comparison can be viewed (min products met)
   */
  canCompare(): boolean {
    return this.getComparisonCount() >= COMPARISON_CONFIG.MIN_PRODUCTS;
  }
}

export const comparisonService = new ComparisonService();
