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
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
  count: number;
}

/**
 * Offset-based pagination metadata
 */
export interface OffsetPaginationMeta {
  page: number;
  limit: number;
  total?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  success: boolean;
  data: T[];
  count: number;
  pagination: PaginationMeta;
}

// ==================== SORTING ====================

/**
 * Sort Parameters
 */
export interface SortParams<T = any> {
  field: SortField<T>;
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
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Filter Group (AND/OR)
 */
export interface FilterGroup {
  operator: "AND" | "OR";
  filters: (Filter | FilterGroup)[];
}

/**
 * Search Parameters
 */
export interface SearchParams {
  query?: string;
  fields?: string[];
}

// ==================== COMMON FILTER SETS ====================

/**
 * Date Filter Parameters
 */
export interface DateFilter {
  from?: string; // ISO timestamp
  to?: string; // ISO timestamp
}

/**
 * Price Filter Parameters
 */
export interface PriceFilter {
  min?: number;
  max?: number;
}

/**
 * Status Filter Parameters
 */
export interface StatusFilter {
  status?: string | string[];
}

/**
 * Category Filter Parameters
 */
export interface CategoryFilter {
  categoryId?: string;
  categoryIds?: string[];
  includeSubcategories?: boolean;
}

/**
 * User Filter Parameters
 */
export interface UserFilter {
  userId?: string;
  userIds?: string[];
  role?: string;
}

/**
 * Shop Filter Parameters
 */
export interface ShopFilter {
  shopId?: string;
  shopIds?: string[];
}

// ==================== COMBINED QUERY PARAMETERS ====================

/**
 * List Query Parameters (combines all query options)
 */
export interface ListQueryParams {
  // Pagination
  page?: number;
  limit?: number;
  offset?: number;

  // Sorting
  sortBy?: string;
  sortOrder?: SortOrder;

  // Search
  search?: string;
  searchFields?: string[];

  // Filters (as query params)
  [key: string]: any;
}

/**
 * Advanced Query Parameters (structured filters)
 */
export interface AdvancedQueryParams extends PaginationParams {
  sort?: SortParams;
  search?: SearchParams;
  filters?: FilterGroup;
}
