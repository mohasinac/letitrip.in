/**
 * Viewing History Manager
 *
 * Manages recently viewed products and auctions with:
 * - LocalStorage persistence
 * - Automatic expiry
 * - Deduplication
 * - Type safety
 *
 * Usage:
 * ```typescript
 * // Add to history
 * ViewingHistory.add({
 *   id: "prod-123",
 *   type: "product",
 *   title: "Product Name",
 *   slug: "product-name",
 *   image: "/images/product.jpg",
 *   price: 1999,
 *   shop_id: "shop-1",
 *   shop_name: "Shop Name",
 *   viewed_at: Date.now()
 * });
 *
 * // Get all history
 * const history = ViewingHistory.getAll();
 *
 * // Get by type
 * const products = ViewingHistory.getByType("product");
 * const auctions = ViewingHistory.getByType("auction");
 *
 * // Clear history
 * ViewingHistory.clear();
 * ```
 */

import {
  VIEWING_HISTORY_CONFIG,
  ViewingHistoryItem,
} from "@/constants/navigation";

class ViewingHistoryManager {
  private storageKey: string;
  private maxItems: number;
  private expiryMs: number;

  constructor() {
    this.storageKey = VIEWING_HISTORY_CONFIG.STORAGE_KEY;
    this.maxItems = VIEWING_HISTORY_CONFIG.MAX_ITEMS;
    this.expiryMs = VIEWING_HISTORY_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get all history items from localStorage
   */
  private getStoredHistory(): ViewingHistoryItem[] {
    if (!this.isStorageAvailable()) return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const items: ViewingHistoryItem[] = JSON.parse(stored);
      return items.filter((item) => this.isValid(item));
    } catch (error) {
      console.error("Error reading viewing history:", error);
      return [];
    }
  }

  /**
   * Save history items to localStorage
   */
  private saveHistory(items: ViewingHistoryItem[]): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving viewing history:", error);
    }
  }

  /**
   * Check if history item is valid and not expired
   */
  private isValid(item: ViewingHistoryItem): boolean {
    const now = Date.now();
    const age = now - item.viewed_at;
    return age < this.expiryMs;
  }

  /**
   * Add item to viewing history
   * - Removes duplicates (same id and type)
   * - Moves to front if already exists
   * - Limits to MAX_ITEMS
   * - Removes expired items
   */
  add(
    item: Omit<ViewingHistoryItem, "viewed_at"> & { viewed_at?: number },
  ): void {
    const history = this.getStoredHistory();

    // Add timestamp if not provided
    const newItem: ViewingHistoryItem = {
      ...item,
      viewed_at: item.viewed_at || Date.now(),
    };

    // Remove existing item with same id and type
    const filtered = history.filter(
      (h) => !(h.id === newItem.id && h.type === newItem.type),
    );

    // Add to front
    filtered.unshift(newItem);

    // Limit to max items
    const limited = filtered.slice(0, this.maxItems);

    this.saveHistory(limited);
  }

  /**
   * Get all viewing history (sorted by most recent)
   */
  getAll(): ViewingHistoryItem[] {
    return this.getStoredHistory();
  }

  /**
   * Get history items by type (product or auction)
   */
  getByType(type: "product" | "auction"): ViewingHistoryItem[] {
    return this.getStoredHistory().filter((item) => item.type === type);
  }

  /**
   * Get recent items (limit to n items)
   */
  getRecent(limit: number = 10): ViewingHistoryItem[] {
    return this.getStoredHistory().slice(0, limit);
  }

  /**
   * Get recent items by type with limit
   */
  getRecentByType(
    type: "product" | "auction",
    limit: number = 10,
  ): ViewingHistoryItem[] {
    return this.getByType(type).slice(0, limit);
  }

  /**
   * Check if item exists in history
   */
  has(id: string, type: "product" | "auction"): boolean {
    return this.getStoredHistory().some(
      (item) => item.id === id && item.type === type,
    );
  }

  /**
   * Remove item from history
   */
  remove(id: string, type: "product" | "auction"): void {
    const history = this.getStoredHistory();
    const filtered = history.filter(
      (item) => !(item.id === id && item.type === type),
    );
    this.saveHistory(filtered);
  }

  /**
   * Clear all viewing history
   */
  clear(): void {
    if (this.isStorageAvailable()) {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Get history count
   */
  count(): number {
    return this.getStoredHistory().length;
  }

  /**
   * Get history count by type
   */
  countByType(type: "product" | "auction"): number {
    return this.getByType(type).length;
  }

  /**
   * Clean expired items
   */
  cleanExpired(): void {
    const history = this.getStoredHistory();
    // getStoredHistory already filters expired items
    this.saveHistory(history);
  }
}

// Export singleton instance
export const ViewingHistory = new ViewingHistoryManager();

// Export class for testing
export { ViewingHistoryManager };
