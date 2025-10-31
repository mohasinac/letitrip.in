/**
 * Unified API Types
 * Standard types for API requests and responses
 */

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: ValidationError[];
  meta?: ResponseMeta;
}

/**
 * Response metadata (pagination, etc.)
 */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
  [key: string]: any;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * API Error shape
 */
export interface ApiError {
  success: false;
  error: string;
  message: string;
  status: number;
  errors?: ValidationError[];
}

/**
 * Validation Error for specific fields
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * API Request Configuration
 */
export interface ApiRequestConfig {
  skipCache?: boolean;
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
  headers?: Record<string, string>;
}

/**
 * HTTP Methods
 */
export enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * HTTP Status Codes
 */
export enum ApiStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Query Parameters for list endpoints
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

/**
 * Common DTO interfaces
 */

export interface CreateDto {
  // Base interface for create DTOs
  [key: string]: any;
}

export interface UpdateDto {
  // Base interface for update DTOs
  [key: string]: any;
}

export interface DeleteResponse {
  success: true;
  message: string;
  id: string;
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
  success: true;
  file: {
    url: string;
    name: string;
    size: number;
    type: string;
    path?: string;
  };
}

/**
 * Bulk Operation Response
 */
export interface BulkOperationResponse {
  success: true;
  processed: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services?: Record<string, 'up' | 'down'>;
}

/**
 * Type guard for API Response
 */
export function isApiResponse<T>(value: any): value is ApiResponse<T> {
  return (
    value &&
    typeof value === 'object' &&
    'success' in value &&
    typeof value.success === 'boolean'
  );
}

/**
 * Type guard for API Error
 */
export function isApiError(value: any): value is ApiError {
  return (
    value &&
    typeof value === 'object' &&
    'success' in value &&
    value.success === false &&
    'error' in value
  );
}

/**
 * Type guard for Paginated Response
 */
export function isPaginatedResponse<T>(
  value: any
): value is PaginatedResponse<T> {
  return (
    value &&
    typeof value === 'object' &&
    'success' in value &&
    value.success === true &&
    'data' in value &&
    Array.isArray(value.data) &&
    'meta' in value &&
    typeof value.meta === 'object' &&
    'page' in value.meta &&
    'total' in value.meta
  );
}
