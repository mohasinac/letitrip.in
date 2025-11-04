/**
 * Search Service
 * Handles universal search across products, categories, and stores
 */

import { apiClient } from "../client";
import type { Product } from "./product.service";
import type { Category } from "./category.service";

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

export interface SearchResults {
  products: Product[];
  categories: Category[];
  stores: Store[];
  query: string;
}

export class SearchService {
  /**
   * Universal search across all entities
   */
  static async search(query: string): Promise<SearchResults> {
    try {
      if (!query || query.trim().length < 2) {
        return {
          products: [],
          categories: [],
          stores: [],
          query: query.trim()
        };
      }

      const response = await apiClient.get<SearchResults>(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      
      return response;
    } catch (error) {
      console.error("SearchService.search error:", error);
      throw error;
    }
  }

  /**
   * Search only products
   */
  static async searchProducts(query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }): Promise<Product[]> {
    try {
      const params = new URLSearchParams({ search: query });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await apiClient.get<{ products: Product[] }>(
        `/api/products?${params.toString()}`
      );
      
      return response.products;
    } catch (error) {
      console.error("SearchService.searchProducts error:", error);
      throw error;
    }
  }
}

export default SearchService;
