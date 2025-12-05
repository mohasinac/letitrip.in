/**
 * @fileoverview Type Definitions
 * @module src/types/shared/pagination.types
 * @description This file contains TypeScript type definitions for pagination
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * PAGINATION AND FILTERING TYPES
 * Used for list responses and search queries
 */

import { SortOrder, SortField } from "./common.types";

// ==================== PAGINATION ====================

/**
 * Pagination Parameters (Request)
 */
export interface PaginationParams {
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
  /** Offset */
  offset?: number;
}

/**
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta {
  /** Limit */
  limit: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Next Cursor */
  nextCursor: string | null;
  /** Count */
  count: number;
}

/**
 * Offset-based pagination metadata
 */
export interface OffsetPaginationMeta {
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Total */
  total?: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Has Prev Page */
  hasPrevPage: boolean;
  /** Total Pages */
  totalPages?: number;
}

/**
 * Pagination Metadata (Response) - Union of cursor and offset types
 */
export type PaginationMeta = CursorPaginationMeta | OffsetPaginationMeta;

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  /** Success */
  success: boolean;
  /** Data */
  data: T[];
  /** Count */
  count: number;
  /** Pagination */
  pagination: PaginationMeta;
}

// ==================== SORTING ====================

/**
 * Sort Parameters
 */
export interface SortParams<T = any> {
  /** Field */
  field: SortField<T>;
  /** Order */
  order: SortOrder;
}

// ==================== FILTERING ====================

/**
 * Filter Operator
 */
export type FilterOperator =
  | "eq" // equals
  | "ne" // not equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "in" // in array
  | "nin" // not in array
  | "contains" // string contains
  | "starts" // string starts with
  | "ends"; // string ends with

/**
 * Single Filter
 */
export interface Filter {
  /** Field */
  field: string;
  /** Operator */
  operator: FilterOperator;
  /** Value */
  value: any;
}

/**
 * Filter Group (AND/OR)
 */
export interface FilterGroup {
  /** Operator */
  operator: "AND" | "OR";
  /** Filters */
  filters: (Filter | FilterGroup)[];
}

/**
 * Search Parameters
 */
export interface SearchParams {
  /** Query */
  query?: string;
  /** Fields */
  fields?: string[];
}

// ==================== COMMON FILTER SETS ====================

/**
 * Date Filter Parameters
 */
export interface DateFilter {
  /** From */
  from?: string; // ISO timestamp
  /** To */
  to?: string; // ISO timestamp
}

/**
 * Price Filter Parameters
 */
export interface PriceFilter {
  /** Min */
  min?: number;
  /** Max */
  max?: number;
}

/**
 * Status Filter Parameters
 */
export interface StatusFilter {
  /** Status */
  status?: string | string[];
}

/**
 * Category Filter Parameters
 */
export interface CategoryFilter {
  /** Category Id */
  categoryId?: string;
  /** Category Ids */
  categoryIds?: string[];
  /** Include Subcategories */
  includeSubcategories?: boolean;
}

/**
 * User Filter Parameters
 */
export interface UserFilter {
  /** User Id */
  userId?: string;
  /** User Ids */
  userIds?: string[];
  /** Role */
  role?: string;
}

/**
 * Shop Filter Parameters
 */
export interface ShopFilter {
  /** Shop Id */
  shopId?: string;
  /** Shop Ids */
  shopIds?: string[];
}

// ==================== COMBINED QUERY PARAMETERS ====================

/**
 * List Query Parameters (combines all query options)
 */
export interface ListQueryParams {
  // Pagination
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
  /** Offset */
  offset?: number;

  // Sorting
  /** Sort By */
  sortBy?: string;
  /** Sort Order */
  sortOrder?: SortOrder;

  // Search
  /** Search */
  search?: string;
  /** Search Fields */
  searchFields?: string[];

  // Filters (as query params)
  [key: string]: any;
}

/**
 * Advanced Query Parameters (structured filters)
 */
export interface AdvancedQueryParams extends PaginationParams {
  /** Sort */
  sort?: SortParams;
  /** Search */
  search?: SearchParams;
  /** Filters */
  filters?: FilterGroup;
}
