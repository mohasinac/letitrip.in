/**
 * Service Adapter Type Definitions
 */

export interface ServiceAdapterOptions {
  /**
   * Whether to throw errors or handle them silently
   * @default true
   */
  throwOnError?: boolean;

  /**
   * Number of retry attempts on failure
   * @default 0
   */
  retryAttempts?: number;

  /**
   * Callback when loading state changes
   */
  onLoadingChange?: (loading: boolean) => void;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when operation succeeds
   */
  onSuccess?: (data: any) => void;
}

export interface AdapterState {
  loading: boolean;
  error: Error | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Filter parameters (generic)
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Standard list query parameters
 */
export interface ListQueryParams extends PaginationParams, SortParams {
  search?: string;
  filters?: FilterParams;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}
