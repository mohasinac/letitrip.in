/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/search.types
 * @description This file contains TypeScript type definitions for search
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Products */
  products: ProductCardFE[];
  /** Shops */
  shops: ShopCardFE[];
  /** Categories */
  categories: CategoryCardFE[];
  /** Total */
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
  /** Query */
  query: string;
  /** Timestamp */
  timestamp: string;
  /** Type */
  type?: "products" | "shops" | "categories" | "all";
}

/**
 * Search suggestion for autocomplete
 */
export interface SearchSuggestionFE {
  /** Text */
  text: string;
  /** Type */
  type: "product" | "shop" | "category" | "query";
  /** Id */
  id?: string;
  /** Image Url */
  imageUrl?: string;
}
