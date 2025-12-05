/**
 * @fileoverview TypeScript Module
 * @module src/lib/firebase/query-helpers
 * @description This file contains functionality related to query-helpers
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
import { logError } from "@/lib/firebase-error-logger";

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
/**
 * Performs build pagination constraints operation
 *
 * @param {PaginationConfig} config - The config
 *
 * @returns {any} The buildpaginationconstraints result
 *
 * @example
 * buildPaginationConstraints(config);
 */

/**
 * Performs build pagination constraints operation
 *
 * @param {PaginationConfig} /** Config */
  config - The /**  config */
  config
 *
 * @returns {any} The buildpaginationconstraints result
 *
 * @example
 * buildPaginationConstraints(/** Config */
  config);
 */

/**
 * Builds pagination constraints
 *
 * @param {PaginationConfig} config - The config
 *
 * @returns {QueryConstraint[]} The buildpaginationconstraints result
 *
 * @example
 * buildPaginationConstraints(config);
 */
export function buildPaginationConstraints(
  /** Config */
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
/**
 * Performs build filter constraints operation
 *
 * @param {QueryFilter[]} filters - The filters
 *
 * @returns {any} The buildfilterconstraints result
 *
 * @example
 * buildFilterConstraints(filters);
 */

/**
 * Performs build filter constraints oper/**
 * Builds filter constraints
 *
 * @param {QueryFilter[]} filters - The filters
 *
 * @returns {QueryConstraint[]} The buildfilterconstraints result
 *
 * @example
 * buildFilterConstraints([]);
 */
ation
 *
 * @param {QueryFilter[]} /** Filters */
  filters - The /**  filters */
  filters
 *
 * @returns {any} The buildfilterconstraints result
 *
 * @example
 * buildFilterConstraints(/** Filters */
  filters);
 */

export function buildFilterConstraints(
  /** Filters */
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
/**
 * Performs build sort constraints operation
 *
 * @param {QuerySort[]} sorts - The sorts
 *
 * @returns {any} The buildsortconstraints result
 *
 * @example
 * buildSortConstraints(sorts);
 */

/**
 * Performs build sort constraints operation
 *
 * @param {QuerySort[]} sorts - The sorts
 *
 * @returns {any} The buildsortconstraints result
 *
 * @example
 * buildSortConstraints(sorts);
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
/**
 * Performs build query constraints operation
 *
 * @param {QueryConfig} config - The config
 *
 * @returns {any} The buildqueryconstraints result
 *
 * @example
 * buildQueryConstraints(config);
 */

/**
 * Performs build query constraints operation
 *
 * @param {QueryConfig} config - The config
 *
 * @returns {any} The buildqueryconstraints result
 *
 * @example
 * buildQueryConstraints(config);
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
/**
 * Performs process paginated results operation
 *
 * @param {QueryDocumentSnapshot<DocumentData>[]} docs - The docs
 * @param {number} pageSize - The page size
 * @param {boolean} [hasPrevCursor] - Whether has prev cursor
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * processPaginatedResults(docs, 123, true);
 */

/**
 * Performs process paginated results operation
 *
 * @returns {number} The processpaginatedresults result
 *
 * @example
 * processPaginatedResults();
 */

export function processPaginatedResults<T>(
  /** Docs */
  docs: QueryDocumentSnapshot<DocumentData>[],
  /** Page Size */
  pageSize: number,
  /** Has Prev Cursor */
  hasPrevCursor: boolean = false,
): PaginatedResult<T> {
  /**
 * Performs data operation
 *
 * @param {any} (doc - The (doc
 *
 * @returns {any} The data result
 *
 */
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
/**
 * Performs first page operation
 *
 * @param {number} [pageSize] - The page size
 * @param {string} [sortField] - The sort field
 * @param {OrderByDirection} [sortDirection] - The sort direction
 *
 * @returns {string} The firstpage result
 *
 * @example
 * firstPage(123, "example", sortDirection);
 */

/**
 * Performs first page operation
 *
 * @returns {string} The firstpage result
 *
 * @example
 * firstPage();
 */

export function firstPage(
  /** Page Size */
  pageSize: number = 20,
  /** Sort Field */
  sortField?: string,
  /** Sort Direction */
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
/**
 * Performs next page operation
 *
 * @returns {string} The nextpage result
 *
 * @example
 * nextPage();
 */

/**
 * Performs next page operation
 *
 * @returns {number} The nextpage result
 *
 * @example
 * nextPage();
 */

export function nextPage(
  /** Page Size */
  pageSize: number,
  /** Cursor */
  cursor: QueryDocumentSnapshot<DocumentData>,
  /** Sort Field */
  sortField?: string,
  /** Sort Direction */
  sortDirection?: OrderByDirection,
): PaginationConfig {
  return {
    pageSize,
    /** After Cursor */
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
/**
 * Performs prev page operation
 *
 * @returns {string} The prevpage result
 *
 * @example
 * prevPage();
 */

/**
 * Performs prev page operation
 *
 * @returns {number} The prevpage result
 *
 * @example
 * prevPage();
 */

export function prevPage(
  /** Page Size */
  pageSize: number,
  /** Cursor */
  cursor: QueryDocumentSnapshot<DocumentData>,
  /** Sort Field */
  sortField?: string,
  /** Sort Direction */
  sortDirection?: OrderByDirection,
): PaginationConfig {
  return {
    pageSize,
    /** Before Cursor */
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
/**
 * Performs status filter operation
 *
 * @param {string} status - The status
 *
 * @returns {string} The statusfilter result
 *
 * @example
 * statusFilter("example");
 */

/**
 * Performs status filter operation
 *
 * @param {string} status - The status
 *
 * @returns {string} The statusfilter result
 *
 * @example
 * statusFilter("example");
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
/**
 * Custom React hook for user filter
 *
 * @param {string} userId - user identifier
 *
 * @returns {string} The userfilter result
 *
 * @example
 * userFilter("example");
 */

/**
 * Custom React hook for user filter
 *
 * @param {string} userId - user identifier
 *
 * @returns {string} The userfilter result
 *
 * @example
 * userFilter("example");
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
/**
 * Performs shop filter operation
 *
 * @param {string} shopId - shop identifier
 *
 * @returns {string} The shopfilter result
 *
 * @example
 * shopFilter("example");
 */

/**
 * Performs shop filter operation
 *
 * @param {string} shopId - shop identifier
 *
 * @returns {string} The shopfilter result
 *
 * @example
 * shopFilter("example");
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
/**
 * Performs category filter operation
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {string} The categoryfilter result
 *
 * @example
 * categoryFilter("example");
 */

/**
 * Performs category filter operation
 *
 * @param {string} categoryId - category identifier
 *
 * @returns {string} The categoryfilter result
 *
 * @example
 * categoryFilter("example");
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
/**
 * Performs date range filter operation
 *
 * @param {string} field - The field
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 *
 * @returns {string} The daterangefilter result
 *
 * @example
 * dateRangeFilter("example", startDate, endDate);
 */

/**
 * Performs date range filter operation
 *
 * @returns {string} The daterangefilter result
 *
 * @example
 * dateRangeFilter();
 */

export function dateRangeFilter(
  /** Field */
  field: string,
  /** Start Date */
  startDate: Date,
  /** End Date */
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
/**
 * Sorts by created desc
 *
 * @returns {any} The sortbycreateddesc result
 *
 * @example
 * sortByCreatedDesc();
 */

/**
 * Sorts by created desc
 *
 * @returns {any} The sortbycreateddesc result
 *
 * @example
 * sortByCreatedDesc();
 */

export function sortByCreatedDesc(): QuerySort {
  return { field: "created_at", direction: "desc" };
}

/**
 * Create sort by creation date (ascending)
 *
 * @returns Query sort
 */
/**
 * Sorts by created asc
 *
 * @returns {any} The sortbycreatedasc result
 *
 * @example
 * sortByCreatedAsc();
 */

/**
 * Sorts by created asc
 *
 * @returns {any} The sortbycreatedasc result
 *
 * @example
 * sortByCreatedAsc();
 */

export function sortByCreatedAsc(): QuerySort {
  return { field: "created_at", direction: "asc" };
}

/**
 * Create sort by update date (descending)
 *
 * @returns Query sort
 */
/**
 * Sorts by updated desc
 *
 * @returns {any} The sortbyupdateddesc result
 *
 * @example
 * sortByUpdatedDesc();
 */

/**
 * Sorts by updated desc
 *
 * @returns {any} The sortbyupdateddesc result
 *
 * @example
 * sortByUpdatedDesc();
 */

export function sortByUpdatedDesc(): QuerySort {
  return { field: "updated_at", direction: "desc" };
}

/**
 * Create sort by price (ascending)
 *
 * @returns Query sort
 */
/**
 * Sorts by price asc
 *
 * @returns {any} The sortbypriceasc result
 *
 * @example
 * sortByPriceAsc();
 */

/**
 * Sorts by price asc
 *
 * @returns {any} The sortbypriceasc result
 *
 * @example
 * sortByPriceAsc();
 */

export function sortByPriceAsc(): QuerySort {
  return { field: "price", direction: "asc" };
}

/**
 * Create sort by price (descending)
 *
 * @returns Query sort
 */
/**
 * Sorts by price desc
 *
 * @returns {any} The sortbypricedesc result
 *
 * @example
 * sortByPriceDesc();
 */

/**
 * Sorts by price desc
 *
 * @returns {any} The sortbypricedesc result
 *
 * @example
 * sortByPriceDesc();
 */

export function sortByPriceDesc(): QuerySort {
  return { field: "price", direction: "desc" };
}

/**
 * Create sort by popularity (view count descending)
 *
 * @returns Query sort
 */
/**
 * Sorts by popularity
 *
 * @returns {any} The sortbypopularity result
 *
 * @example
 * sortByPopularity();
 */

/**
 * Sorts by popularity
 *
 * @returns {any} The sortbypopularity result
 *
 * @example
 * sortByPopularity();
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
/**
 * Performs encode cursor oper/**
 * Performs encode cursor operation
 *
 * @param {QueryDocumentSnapshot<DocumentData>} cursor - The cursor
 *
 * @returns {string} The encodecursor result
 *
 * @example
 * encodeCursor(cursor);
 */
ation
 *
 * @param {QueryDocumentSnapshot<DocumentData>} cursor - The cursor
 *
 * @returns {string} The encodecursor result
 *
 * @example
 * encodeCursor(cursor);
 */

/**
 * Performs encode cursor operation
 *
 * @param {QueryDocumentSnapshot<DocumentData>} /** Cursor */
  cursor - The /**  cursor */
  cursor
 *
 * @returns {string} The encodecursor result
 *
 * @example
 * encodeCursor(/** Cursor */
  cursor);
 */

export function encodeCursor(
  /** Cursor */
  cursor: QueryDocumentSnapshot<DocumentData>,
): string {
  try {
    const cursorData = {
      /** Id */
      id: cursor.id,
      /** Path */
      path: cursor.ref.path,
    };
    return Buffer.from(JSON.stringify(cursorData)).toString("base64");
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "encodeCursor",
      /** Metadata */
      metadata: { cursorId: cursor.id },
    });
    return "";
  }
}

/**
 * Check if pagination result has more data
 *
 * @param result - Paginated result
 * @returns True if there are more pages
 */
/**
 * Checks if more pages
 *
 * @param {PaginatedResult<T>} result - The result
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasMorePages(result);
 */

/**
 * Checks if more pages
 *
 * @param {PaginatedResult<T>} result - The result
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasMorePages(result);
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
/**
 * Retrieves page info
 *
 * @param {PaginatedResult<T>} result - The result
 *
 * @returns {string} The pageinfo result
 *
 * @example
 * getPageInfo(result);
 */

/**
 * Retrieves page info
 *
 * @param {PaginatedResult<T>} result - The result
 *
 * @returns {string} The pageinfo result
 *
 * @example
 * getPageInfo(result);
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
/**
 * Performs estimate pages operation
 *
 * @param {number} totalCount - Number of total
 * @param {number} pageSize - The page size
 *
 * @returns {number} The estimatepages result
 *
 * @example
 * estimatePages(123, 123);
 */

/**
 * Performs estimate pages operation
 *
 * @param {number} totalCount - Number of total
 * @param {number} pageSize - The page size
 *
 * @returns {number} The estimatepages result
 *
 * @example
 * estimatePages(123, 123);
 */

export function estimatePages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}
