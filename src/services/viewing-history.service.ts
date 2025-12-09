/**
 * Viewing History Service
 * Client-side localStorage service for managing recently viewed products
 */

import {
  VIEWING_HISTORY_CONFIG,
  type ViewingHistoryItem,
} from "@/constants/navigation";

class ViewingHistoryService {
  private getStorageKey(): string {
    return VIEWING_HISTORY_CONFIG.STORAGE_KEY;
  }

  /**
   * Get all viewing history items from localStorage
   */
  getHistory(): ViewingHistoryItem[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return [];

      const items = JSON.parse(stored) as ViewingHistoryItem[];

      // Filter out expired items
      const now = Date.now();
      const expiryMs = VIEWING_HISTORY_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const validItems = items.filter(
        (item) => now - item.viewed_at < expiryMs
      );

      // If any items were filtered, update storage
      if (validItems.length !== items.length) {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(validItems));
      }

      return validItems;
    } catch {
      return [];
    }
  }

  /**
   * Get recently viewed items with a limit
   */
  getRecentlyViewed(limit: number = 8): ViewingHistoryItem[] {
    return this.getHistory().slice(0, limit);
  }

  /**
   * Add an item to viewing history
   * If item already exists, it's moved to the top with updated timestamp
   */
  addToHistory(item: Omit<ViewingHistoryItem, "viewed_at">): void {
    if (typeof window === "undefined") return;

    // Validate item has required fields
    // BUG FIX #20: Check 'name' not 'title' (correct field per interface)
    if (
      !item.id ||
      item.id.trim() === "" ||
      !item.name ||
      !item.slug ||
      typeof item.price !== "number"
    ) {
      return;
    }

    try {
      let history = this.getHistory();

      // Remove existing entry if present (to move to top)
      history = history.filter((h) => h.id !== item.id);

      // Add new item at the beginning
      const newItem: ViewingHistoryItem = {
        ...item,
        viewed_at: Date.now(),
      };

      history.unshift(newItem);

      // Trim to max items
      if (history.length > VIEWING_HISTORY_CONFIG.MAX_ITEMS) {
        history = history.slice(0, VIEWING_HISTORY_CONFIG.MAX_ITEMS);
      }

      localStorage.setItem(this.getStorageKey(), JSON.stringify(history));
    } catch {
      // Ignore errors
    }
  }

  /**
   * Remove an item from history
   */
  removeFromHistory(itemId: string): void {
    if (typeof window === "undefined") return;

    try {
      const history = this.getHistory();
      const filtered = history.filter((item) => item.id !== itemId);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(filtered));
    } catch {
      // Ignore errors
    }
  }

  /**
   * Clear all viewing history
   */
  clearHistory(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.getStorageKey());
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get count of items in history
   */
  getCount(): number {
    return this.getHistory().length;
  }

  /**
   * Check if an item is in history
   */
  isInHistory(itemId: string): boolean {
    return this.getHistory().some((item) => item.id === itemId);
  }
}

export const viewingHistoryService = new ViewingHistoryService();
