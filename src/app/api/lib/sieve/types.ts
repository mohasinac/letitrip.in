/**
 * @fileoverview Type Definitions
 * @module src/app/api/lib/sieve/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Sieve Pagination & Filtering Types
 * Epic: E026 - Sieve-style Pagination
 *
 * Inspired by: https://github.com/Biarity/Sieve
 *
 * Query Format:
 * - Pagination: ?page=1&pageSize=20
 * - Sorting: ?sorts=-createdAt,price (- prefix = desc)
 * - Filtering: ?filters=status==published,price>100
 */

// ==================== FILTER OPERATORS ====================

/**
 * Supported filter operators
 */
export type FilterOperator =
  | "==" // Equals
  | "!=" // Not equals
  | ">" // Greater than
  | ">=" // Greater than or equal
  | "<" // Less than
  | "<=" // Less than or equal
  | "@=" // Contains (case-insensitive)
  | "_=" // Starts with
  | "_-=" // Ends with
  | "!@=" // Does not contain
  | "!_=" // Does not start with
  | "!_-=" // Does not end with
  | "@=*" // Contains (case-insensitive explicit)
  | "_=*" // Starts with (case-insensitive)
  | "==*" // Equals (case-insensitive)
  | "==null" // Is null/undefined
  | "!=null"; // Is not null/undefined

/**
 * Filter value types
 */
export type FilterValue = string | number | boolean | null;

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

// ==================== PARSED STRUCTURES ====================

/**
 * Parsed filter condition
 */
export interface FilterCondition {
  /** Field */
  field: string;
  /** Operator */
  operator: FilterOperator;
  /** Value */
  value: FilterValue;
  /** Is Negated */
  isNegated?: boolean;
  /** Is Case Insensitive */
  isCaseInsensitive?: boolean;
}

/**
 * Parsed sort field
 */
export interface SortField {
  /** Field */
  field: string;
  /** Direction */
  direction: SortDirection;
}

/**
 * Complete parsed sieve query
 */
export interface SieveQuery {
  /** Page */
  page: number;
  /** Page Size */
  pageSize: number;
  /** Sorts */
  sorts: SortField[];
  /** Filters */
  filters: FilterCondition[];
}

// ==================== CONFIGURATION ====================

/**
 * Field configuration for filtering
 */
export interface FilterableField {
  /** Field name in query */
  field: string;
  /** Allowed operators for this field */
  operators: FilterOperator[];
  /** Field type for value parsing */
  type: "string" | "number" | "boolean" | "date";
  /** Mapped database field (if different from query field) */
  dbField?: string;
}

/**
 * Resource sieve configuration
 */
export interface SieveConfig {
  /** Resource identifier */
  resource: string;
  /** Fields that can be sorted */
  sortableFields: string[];
  /** Fields that can be filtered with their operators */
  filterableFields: FilterableField[];
  /** Default sort when none specified */
  defaultSort: SortField;
  /** Maximum page size (default: 100) */
  maxPageSize?: number;
  /** Default page size (default: 20) */
  defaultPageSize?: number;
  /** Field mappings from query field to database field */
  fieldMappings?: Record<string, string>;
}

// ==================== RESPONSE STRUCTURES ====================

/**
 * Sieve pagination metadata
 */
export interface SievePaginationMeta {
  /** Page */
  page: number;
  /** Page Size */
  pageSize: number;
  /** Total Count */
  totalCount: number;
  /** Total Pages */
  totalPages: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Has Previous Page */
  hasPreviousPage: boolean;
}

/**
 * Applied query metadata (for debugging/transparency)
 */
export interface SieveAppliedMeta {
  /** Applied Filters */
  appliedFilters: FilterCondition[];
  /** Applied Sorts */
  appliedSorts: SortField[];
  /** Warnings */
  warnings?: string[];
}

/**
 * Sieve paginated response
 */
export interface SievePaginatedResponse<T> {
  /** Success */
  success: boolean;
  /** Data */
  data: T[];
  /** Pagination */
  pagination: SievePaginationMeta;
  /** Meta */
  meta?: SieveAppliedMeta;
}

// ==================== ERRORS ====================

/**
 * Sieve parsing error
 */
export interface SieveError {
  /** Type */
  type:
    | "invalid_filter"
    | "invalid_sort"
    | "invalid_pagination"
    | "unknown_field";
  /** Field */
  field?: string;
  /** Message */
  message: string;
}

/**
 * Sieve parse result (may contain errors)
 */
export interface SieveParseResult {
  /** Query */
  query: SieveQuery;
  /** Errors */
  errors: SieveError[];
  /** Warnings */
  warnings: string[];
}

// ==================== FIRESTORE SPECIFIC ====================

/**
 * Firestore operator mapping
 */
export type FirestoreOperator =
  | "=="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "array-contains"
  | "array-contains-any"
  | "in"
  | "not-in";

/**
 * Firestore filter that can be applied directly
 */
export interface FirestoreFilter {
  /** Field */
  field: string;
  /** Operator */
  operator: FirestoreOperator;
  /** Value */
  value: FilterValue;
}

/**
 * Filter that requires client-side processing
 * (Firestore doesn't support these natively)
 */
export interface ClientSideFilter {
  /** Condition */
  condition: FilterCondition;
  /** Reason */
  reason: string;
}

/**
 * Result of adapting sieve to Firestore
 */
export interface FirestoreAdapterResult {
  /** Filters that can be applied to Firestore query */
  firestoreFilters: FirestoreFilter[];
  /** Filters that must be applied client-side after fetch */
  clientSideFilters: ClientSideFilter[];
  /** Sorts to apply */
  sorts: SortField[];
  /** Pagination offset (calculated from page) */
  offset: number;
  /** Limit (page size) */
  limit: number;
}
