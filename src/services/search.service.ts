/**
 * Search Service
 * 
 * Advanced search service with:
 * - Fuzzy search for typo tolerance
 * - Autocomplete suggestions
 * - Advanced filtering (price, category, rating, etc.)
 * - Search history and trending searches
 * - Real-time search suggestions
 * 
 * Enhanced with Task 12.1 (January 11, 2026):
 * - Fuzzy matching algorithm
 * - Autocomplete with debouncing
 * - Multi-field search (products, shops, categories)
 * - Advanced filters (price range, ratings, availability)
 * - Search analytics and tracking
 */

import { logServiceError } from "@/lib/error-logger";
import type {
  SearchFiltersFE,
  SearchResultFE,
} from "@/types/frontend/search.types";
import { apiService } from "./api.service";

// ============================================================================
// TYPES
// ============================================================================

export interface AdvancedSearchFilters extends SearchFiltersFE {
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Rating filters
  minRating?: number;
  
  // Availability
  inStock?: boolean;
  
  // Category
  categoryId?: string;
  
  // Shop
  shopId?: string;
  
  // Sorting
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Search options
  fuzzy?: boolean; // Enable fuzzy matching
  exact?: boolean; // Exact match only
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'shop' | 'category' | 'keyword';
  highlight?: string;
  count?: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export interface TrendingSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  clickedResults: string[];
  timestamp: Date;
}

// ============================================================================
// SEARCH SERVICE
// ============================================================================

class SearchService {
  private searchHistory: SearchHistoryItem[] = [];
  private readonly MAX_HISTORY = 50;
  private readonly HISTORY_STORAGE_KEY = 'search_history';
  
  constructor() {
    // Load search history from localStorage
    this.loadSearchHistory();
  }

  /**
   * Advanced search with fuzzy matching and filters
   */
  async advancedSearch(filters: AdvancedSearchFilters): Promise<SearchResultFE> {
    // Validate query parameter
    if (!filters.q || filters.q.trim() === "") {
      return {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };
    }

    const cleanQuery = filters.q.trim();

    // Validate query length
    if (cleanQuery.length > 500) {
      throw new Error(
        "[Search] Query too long. Maximum 500 characters allowed."
      );
    }
    if (cleanQuery.length < 2) {
      throw new Error(
        "[Search] Query too short. Minimum 2 characters required."
      );
    }

    try {
      const params = new URLSearchParams();
      params.append("q", cleanQuery);
      
      // Type filter
      if (filters.type) params.append("type", filters.type);
      
      // Price filters
      if (filters.minPrice !== undefined) {
        params.append("minPrice", filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params.append("maxPrice", filters.maxPrice.toString());
      }
      
      // Rating filter
      if (filters.minRating !== undefined) {
        params.append("minRating", filters.minRating.toString());
      }
      
      // Availability filter
      if (filters.inStock !== undefined) {
        params.append("inStock", filters.inStock.toString());
      }
      
      // Category filter
      if (filters.categoryId) {
        params.append("categoryId", filters.categoryId);
      }
      
      // Shop filter
      if (filters.shopId) {
        params.append("shopId", filters.shopId);
      }
      
      // Sorting
      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }
      
      // Pagination
      if (filters.page && filters.page > 0) {
        params.append("page", filters.page.toString());
      }
      if (filters.limit && filters.limit > 0) {
        const safeLimit = Math.min(filters.limit, 100);
        params.append("limit", safeLimit.toString());
      }
      
      // Search options
      if (filters.fuzzy) {
        params.append("fuzzy", "true");
      }
      if (filters.exact) {
        params.append("exact", "true");
      }

      const result = await apiService.get<SearchResultFE>(
        `/search/advanced?${params.toString()}`
      );

      // Save to search history
      this.addToHistory(cleanQuery, result.total || 0);
      
      // Track analytics
      this.trackSearch(cleanQuery, result.total || 0);

      return {
        products: result?.products || [],
        shops: result?.shops || [],
        categories: result?.categories || [],
        total: result?.total || 0,
      };
    } catch (error) {
      logServiceError("SearchService", "advancedSearch", error as Error);
      return {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };
    }
  }

  /**
   * Basic search (backwards compatibility)
   */
  async search(filters: SearchFiltersFE): Promise<SearchResultFE> {
    // Validate query parameter (outside try-catch so validation errors are thrown)
    if (!filters.q || filters.q.trim() === "") {
      return {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };
    }

    const cleanQuery = filters.q.trim();

    // Validate query length to prevent DoS
    if (cleanQuery.length > 500) {
      throw new Error(
        "[Search] Query too long. Maximum 500 characters allowed."
      );
    }
    if (cleanQuery.length < 2) {
      throw new Error(
        "[Search] Query too short. Minimum 2 characters required."
      );
    }

    try {
      const params = new URLSearchParams();
      params.append("q", cleanQuery);
      if (filters.type) params.append("type", filters.type);
      if (filters.limit && filters.limit > 0) {
        // Cap limit at 100 to prevent performance issues
        const safeLimit = Math.min(filters.limit, 100);
        params.append("limit", safeLimit.toString());
      }

      const result = await apiService.get<SearchResultFE>(
        `/search?${params.toString()}`
      );

      // Handle null/undefined results
      return {
        products: result?.products || [],
        shops: result?.shops || [],
        categories: result?.categories || [],
        total: result?.total || 0,
      };
    } catch (error) {
      logServiceError("SearchService", "search", error as Error);
      // Return empty results on API error instead of throwing
      return {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };
    }
  }

  /**
   * Quick search for autocomplete (limited results)
   */
  async quickSearch(query: string): Promise<SearchResultFE> {
    return this.search({ q: query, limit: 5 });
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams();
      params.append("q", query.trim());
      params.append("limit", "10");

      const suggestions = await apiService.get<SearchSuggestion[]>(
        `/search/autocomplete?${params.toString()}`
      );

      return suggestions || [];
    } catch (error) {
      logServiceError("SearchService", "getAutocompleteSuggestions", error as Error);
      return [];
    }
  }

  /**
   * Search with fuzzy matching for typo tolerance
   */
  async fuzzySearch(query: string, filters?: Omit<AdvancedSearchFilters, 'q' | 'fuzzy'>): Promise<SearchResultFE> {
    return this.advancedSearch({
      q: query,
      fuzzy: true,
      ...filters
    });
  }

  /**
   * Get search history
   */
  getSearchHistory(): SearchHistoryItem[] {
    return [...this.searchHistory].reverse(); // Most recent first
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.searchHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.HISTORY_STORAGE_KEY);
    }
  }

  /**
   * Remove a specific item from history
   */
  removeFromHistory(query: string): void {
    this.searchHistory = this.searchHistory.filter(
      item => item.query !== query
    );
    this.saveSearchHistory();
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit: number = 10): Promise<TrendingSearch[]> {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());

      const trending = await apiService.get<TrendingSearch[]>(
        `/search/trending?${params.toString()}`
      );

      return trending || [];
    } catch (error) {
      logServiceError("SearchService", "getTrendingSearches", error as Error);
      return [];
    }
  }

  /**
   * Get popular searches in a category
   */
  async getPopularSearches(categoryId?: string, limit: number = 10): Promise<string[]> {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (categoryId) {
        params.append("categoryId", categoryId);
      }

      const popular = await apiService.get<string[]>(
        `/search/popular?${params.toString()}`
      );

      return popular || [];
    } catch (error) {
      logServiceError("SearchService", "getPopularSearches", error as Error);
      return [];
    }
  }

  /**
   * Track search analytics
   */
  private async trackSearch(query: string, resultsCount: number): Promise<void> {
    try {
      await apiService.post('/search/analytics', {
        query,
        resultsCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Silently fail analytics tracking
      console.error("Failed to track search:", error);
    }
  }

  /**
   * Track search result click
   */
  async trackClick(query: string, resultId: string, resultType: 'product' | 'shop' | 'category'): Promise<void> {
    try {
      await apiService.post('/search/click', {
        query,
        resultId,
        resultType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Silently fail analytics tracking
      console.error("Failed to track click:", error);
    }
  }

  /**
   * Add to search history
   */
  private addToHistory(query: string, resultsCount: number): void {
    // Remove duplicate if exists
    this.searchHistory = this.searchHistory.filter(
      item => item.query !== query
    );

    // Add new item
    this.searchHistory.push({
      query,
      timestamp: new Date(),
      resultsCount,
    });

    // Limit history size
    if (this.searchHistory.length > this.MAX_HISTORY) {
      this.searchHistory.shift();
    }

    // Save to localStorage
    this.saveSearchHistory();
  }

  /**
   * Load search history from localStorage
   */
  private loadSearchHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.searchHistory = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
      this.searchHistory = [];
    }
  }

  /**
   * Save search history to localStorage
   */
  private saveSearchHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        this.HISTORY_STORAGE_KEY,
        JSON.stringify(this.searchHistory)
      );
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   * @private
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Check if two strings are similar (fuzzy match)
   * @private
   */
  private isFuzzyMatch(query: string, target: string, threshold: number = 0.7): boolean {
    const distance = this.levenshteinDistance(
      query.toLowerCase(),
      target.toLowerCase()
    );
    const maxLength = Math.max(query.length, target.length);
    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
  }
}

export const searchService = new SearchService();
