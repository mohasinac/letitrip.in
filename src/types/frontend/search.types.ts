/**
 * Search Types
 * Frontend type definitions for search functionality
 */

import type { ProductCardFE } from "./product.types";
import type { ShopCardFE } from "./shop.types";
import type { CategoryCardFE } from "./category.types";

/**
 * Search result containing products, shops, and categories
 */
export interface SearchResultFE {
  products: ProductCardFE[];
  shops: ShopCardFE[];
  categories: CategoryCardFE[];
  total: number;
}

/**
 * Search filters for global search
 */
export interface SearchFiltersFE {
  /** Search query string */
  q: string;
  /** Type of results to search for */
  type?: "products" | "shops" | "categories" | "all";
  /** Maximum number of results per type */
  limit?: number;
}

/**
 * Recent search history item
 */
export interface RecentSearchFE {
  query: string;
  timestamp: string;
  type?: "products" | "shops" | "categories" | "all";
}

/**
 * Search suggestion for autocomplete
 */
export interface SearchSuggestionFE {
  text: string;
  type: "product" | "shop" | "category" | "query";
  id?: string;
  imageUrl?: string;
}
