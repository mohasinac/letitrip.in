/**
 * Standard API Response Types
 * Ensures consistent response format across all API endpoints
 */

/**
 * Standard success response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>; // Validation errors by field
  details?: any; // Additional error context
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

/**
 * Combined response type
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated response data
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Common filter parameters
 */
export interface FilterParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Helper to create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, any>
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Helper to create error response
 */
export function createErrorResponse(
  error: string,
  errors?: Record<string, string[]>,
  details?: any,
  meta?: Record<string, any>
): ApiErrorResponse {
  return {
    success: false,
    error,
    errors,
    details,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): ApiSuccessResponse<PaginatedData<T>> {
  return createSuccessResponse(
    {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
    message
  );
}

/**
 * Type guard to check if response is success
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is error
 */
export function isErrorResponse(
  response: ApiResponse<any>
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Extract data from response or throw error
 */
export function extractData<T>(response: ApiResponse<T>): T {
  if (isSuccessResponse(response)) {
    return response.data;
  }
  throw new Error(response.error || 'Unknown error');
}

/**
 * Extract paginated data
 */
export function extractPaginatedData<T>(
  response: ApiResponse<PaginatedData<T>>
): PaginatedData<T> {
  return extractData(response);
}
