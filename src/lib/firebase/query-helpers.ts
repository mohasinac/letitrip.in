/**
 * Firebase Query Helpers
 *
 * Provides reusable pagination utilities for Firestore queries.
 * Implements cursor-based pagination for optimal performance.
 *
 * @module firebase/query-helpers
 */

import {
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  orderBy,
  where,
  WhereFilterOp,
  OrderByDirection,
} from "firebase/firestore";

// ============================================================================
// Types
// ============================================================================

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Number of items per page */
  pageSize: number;
  /** Cursor for the next page (document snapshot) */
  afterCursor?: QueryDocumentSnapshot<DocumentData>;
  /** Cursor for the previous page (document snapshot) */
  beforeCursor?: QueryDocumentSnapshot<DocumentData>;
  /** Sort field */
  sortField?: string;
  /** Sort direction */
  sortDirection?: OrderByDirection;
}

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
  /** Array of documents */
  data: T[];
  /** Cursor for the next page */
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  /** Cursor for the previous page */
  prevCursor: QueryDocumentSnapshot<DocumentData> | null;
  /** Whether there are more pages */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
  /** Total count (if available) */
  totalCount?: number;
  /** Current page size */
  pageSize: number;
}

/**
 * Filter configuration for queries
 */
export interface QueryFilter {
  /** Field to filter on */
  field: string;
  /** Operator (==, !=, <, <=, >, >=, in, not-in, array-contains, array-contains-any) */
  operator: WhereFilterOp;
  /** Value to compare */
  value: unknown;
}

/**
 * Sort configuration for queries
 */
export interface QuerySort {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: OrderByDirection;
}

/**
 * Complete query configuration
 */
export interface QueryConfig {
  /** Filters to apply */
  filters?: QueryFilter[];
  /** Sort orders to apply */
  sorts?: QuerySort[];
  /** Pagination config */
  pagination?: PaginationConfig;
}

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Build pagination constraints for a query
 *
 * @param config - Pagination configuration
 * @returns Array of query constraints
 *
 * @example
 * ```typescript
 * const constraints = buildPaginationConstraints({
 *   pageSize: 20,
 *   afterCursor: lastDoc,
 *   sortField: 'created_at',
 *   sortDirection: 'desc'
 * });
 * ```
 */
export function buildPaginationConstraints(
  config: PaginationConfig,
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  // Add sort order if specified
  if (config.sortField) {
    constraints.push(orderBy(config.sortField, config.sortDirection || "desc"));
  }

  // Add cursor-based pagination
  if (config.afterCursor) {
    // Next page
    constraints.push(startAfter(config.afterCursor));
    constraints.push(limit(config.pageSize));
  } else if (config.beforeCursor) {
    // Previous page (reversed)
    constraints.push(endBefore(config.beforeCursor));
    constraints.push(limitToLast(config.pageSize));
  } else {
    // First page
    constraints.push(limit(config.pageSize));
  }

  return constraints;
}

/**
 * Build filter constraints for a query
 *
 * @param filters - Array of filter configurations
 * @returns Array of query constraints
 *
 * @example
 * ```typescript
 * const constraints = buildFilterConstraints([
 *   { field: 'status', operator: '==', value: 'active' },
 *   { field: 'price', operator: '>', value: 100 }
 * ]);
 * ```
 */
export function buildFilterConstraints(
  filters: QueryFilter[],
): QueryConstraint[] {
  return filters.map((filter) =>
    where(filter.field, filter.operator, filter.value),
  );
}

/**
 * Build sort constraints for a query
 *
 * @param sorts - Array of sort configurations
 * @returns Array of query constraints
 *
 * @example
 * ```typescript
 * const constraints = buildSortConstraints([
 *   { field: 'created_at', direction: 'desc' },
 *   { field: 'name', direction: 'asc' }
 * ]);
 * ```
 */
export function buildSortConstraints(sorts: QuerySort[]): QueryConstraint[] {
  return sorts.map((sort) => orderBy(sort.field, sort.direction));
}

/**
 * Build complete query constraints from configuration
 *
 * @param config - Query configuration
 * @returns Array of query constraints
 *
 * @example
 * ```typescript
 * const constraints = buildQueryConstraints({
 *   filters: [{ field: 'status', operator: '==', value: 'active' }],
 *   sorts: [{ field: 'created_at', direction: 'desc' }],
 *   pagination: { pageSize: 20, afterCursor: lastDoc }
 * });
 * ```
 */
export function buildQueryConstraints(config: QueryConfig): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  // Add filters
  if (config.filters && config.filters.length > 0) {
    constraints.push(...buildFilterConstraints(config.filters));
  }

  // Add sorts (if not using pagination with sortField)
  if (
    config.sorts &&
    config.sorts.length > 0 &&
    !config.pagination?.sortField
  ) {
    constraints.push(...buildSortConstraints(config.sorts));
  }

  // Add pagination
  if (config.pagination) {
    constraints.push(...buildPaginationConstraints(config.pagination));
  }

  return constraints;
}

/**
 * Process query results into a paginated result
 *
 * @param docs - Query document snapshots
 * @param pageSize - Number of items per page
 * @param hasPrevCursor - Whether a previous cursor was provided
 * @returns Paginated result
 *
 * @example
 * ```typescript
 * const result = processPaginatedResults(
 *   querySnapshot.docs,
 *   20,
 *   false
 * );
 * ```
 */
export function processPaginatedResults<T>(
  docs: QueryDocumentSnapshot<DocumentData>[],
  pageSize: number,
  hasPrevCursor: boolean = false,
): PaginatedResult<T> {
  const data = docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);

  const hasNextPage = docs.length === pageSize;
  const hasPrevPage = hasPrevCursor || docs.length > 0;

  const nextCursor = hasNextPage ? (docs.at(-1) ?? null) : null;

  const prevCursor = docs.at(0) ?? null;

  return {
    data,
    nextCursor,
    prevCursor,
    hasNextPage,
    hasPrevPage,
    pageSize,
  };
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a pagination config for the first page
 *
 * @param pageSize - Number of items per page
 * @param sortField - Optional sort field
 * @param sortDirection - Optional sort direction
 * @returns Pagination configuration
 *
 * @example
 * ```typescript
 * const config = firstPage(20, 'created_at', 'desc');
 * ```
 */
export function firstPage(
  pageSize: number = 20,
  sortField?: string,
  sortDirection?: OrderByDirection,
): PaginationConfig {
  return {
    pageSize,
    sortField,
    sortDirection,
  };
}

/**
 * Create a pagination config for the next page
 *
 * @param pageSize - Number of items per page
 * @param cursor - Document snapshot from the last item of current page
 * @param sortField - Optional sort field
 * @param sortDirection - Optional sort direction
 * @returns Pagination configuration
 *
 * @example
 * ```typescript
 * const config = nextPage(20, lastDoc, 'created_at', 'desc');
 * ```
 */
export function nextPage(
  pageSize: number,
  cursor: QueryDocumentSnapshot<DocumentData>,
  sortField?: string,
  sortDirection?: OrderByDirection,
): PaginationConfig {
  return {
    pageSize,
    afterCursor: cursor,
    sortField,
    sortDirection,
  };
}

/**
 * Create a pagination config for the previous page
 *
 * @param pageSize - Number of items per page
 * @param cursor - Document snapshot from the first item of current page
 * @param sortField - Optional sort field
 * @param sortDirection - Optional sort direction
 * @returns Pagination configuration
 *
 * @example
 * ```typescript
 * const config = prevPage(20, firstDoc, 'created_at', 'desc');
 * ```
 */
export function prevPage(
  pageSize: number,
  cursor: QueryDocumentSnapshot<DocumentData>,
  sortField?: string,
  sortDirection?: OrderByDirection,
): PaginationConfig {
  return {
    pageSize,
    beforeCursor: cursor,
    sortField,
    sortDirection,
  };
}

// ============================================================================
// Common Query Patterns
// ============================================================================

/**
 * Create filter for active/inactive items
 *
 * @param status - Status value ('active', 'inactive', etc.)
 * @returns Query filter
 */
export function statusFilter(status: string): QueryFilter {
  return { field: "status", operator: "==", value: status };
}

/**
 * Create filter for items belonging to a user
 *
 * @param userId - User ID
 * @returns Query filter
 */
export function userFilter(userId: string): QueryFilter {
  return { field: "user_id", operator: "==", value: userId };
}

/**
 * Create filter for items belonging to a shop
 *
 * @param shopId - Shop ID
 * @returns Query filter
 */
export function shopFilter(shopId: string): QueryFilter {
  return { field: "shop_id", operator: "==", value: shopId };
}

/**
 * Create filter for items in a category
 *
 * @param categoryId - Category ID
 * @returns Query filter
 */
export function categoryFilter(categoryId: string): QueryFilter {
  return { field: "category_id", operator: "==", value: categoryId };
}

/**
 * Create filter for date range
 *
 * @param field - Date field name
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of query filters
 */
export function dateRangeFilter(
  field: string,
  startDate: Date,
  endDate: Date,
): QueryFilter[] {
  return [
    { field, operator: ">=", value: startDate },
    { field, operator: "<=", value: endDate },
  ];
}

/**
 * Create sort by creation date (descending)
 *
 * @returns Query sort
 */
export function sortByCreatedDesc(): QuerySort {
  return { field: "created_at", direction: "desc" };
}

/**
 * Create sort by creation date (ascending)
 *
 * @returns Query sort
 */
export function sortByCreatedAsc(): QuerySort {
  return { field: "created_at", direction: "asc" };
}

/**
 * Create sort by update date (descending)
 *
 * @returns Query sort
 */
export function sortByUpdatedDesc(): QuerySort {
  return { field: "updated_at", direction: "desc" };
}

/**
 * Create sort by price (ascending)
 *
 * @returns Query sort
 */
export function sortByPriceAsc(): QuerySort {
  return { field: "price", direction: "asc" };
}

/**
 * Create sort by price (descending)
 *
 * @returns Query sort
 */
export function sortByPriceDesc(): QuerySort {
  return { field: "price", direction: "desc" };
}

/**
 * Create sort by popularity (view count descending)
 *
 * @returns Query sort
 */
export function sortByPopularity(): QuerySort {
  return { field: "view_count", direction: "desc" };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert cursor to base64 string for URL/API usage
 *
 * @param cursor - Document snapshot
 * @returns Base64 encoded cursor string
 */
export function encodeCursor(
  cursor: QueryDocumentSnapshot<DocumentData>,
): string {
  try {
    const cursorData = {
      id: cursor.id,
      path: cursor.ref.path,
    };
    return Buffer.from(JSON.stringify(cursorData)).toString("base64");
  } catch (error) {
    console.error("Failed to encode cursor:", error);
    return "";
  }
}

/**
 * Check if pagination result has more data
 *
 * @param result - Paginated result
 * @returns True if there are more pages
 */
export function hasMorePages<T>(result: PaginatedResult<T>): boolean {
  return result.hasNextPage;
}

/**
 * Get page info summary
 *
 * @param result - Paginated result
 * @returns Human-readable page info
 */
export function getPageInfo<T>(result: PaginatedResult<T>): string {
  const itemCount = result.data.length;
  const more = result.hasNextPage ? " (more available)" : "";
  return `Showing ${itemCount} items${more}`;
}

/**
 * Calculate estimated total pages
 *
 * @param totalCount - Total count of items
 * @param pageSize - Items per page
 * @returns Estimated number of pages
 */
export function estimatePages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}
