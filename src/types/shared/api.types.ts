/**
 * API TYPES - Request and Response Structures
 */

import { ValidationError } from "./common.types";
import { PaginatedResponse } from "./pagination.types";

// ==================== API RESPONSE ====================

/**
 * Standard API Response (Success)
 */
export interface APIResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * API Error Response
 */
export interface APIErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  statusCode?: number;
  validation?: ValidationError[];
  timestamp?: string;
}

/**
 * API Response Union Type
 */
export type APIResult<T> = APIResponse<T> | APIErrorResponse;

// ==================== API REQUEST ====================

/**
 * Create Request (POST)
 */
export interface CreateRequest<T> {
  data: T;
}

/**
 * Update Request (PATCH/PUT)
 */
export interface UpdateRequest<T> {
  data: Partial<T>;
}

/**
 * Delete Request (DELETE)
 */
export interface DeleteRequest {
  id: string;
  permanent?: boolean;
}

/**
 * Bulk Operation Request
 */
export interface BulkOperationRequest<T = any> {
  ids: string[];
  action: string;
  data?: T;
}

// ==================== HTTP METHODS ====================

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ==================== API CLIENT CONFIG ====================

/**
 * Request Configuration
 */
export interface RequestConfig {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retry?: number;
  cache?: boolean;
  cacheTTL?: number;
}

/**
 * API Client Configuration
 */
export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: number;
  retryDelay?: number;
}

// ==================== ERROR TYPES ====================

/**
 * API Error
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public validation?: ValidationError[],
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Network Error
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Validation Error
 */
export class ValidationErrorClass extends Error {
  constructor(
    message: string,
    public errors: ValidationError[],
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ==================== TYPE GUARDS ====================

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(
  response: APIResult<T>,
): response is APIResponse<T> {
  return response.success === true;
}

/**
 * Check if response is an error
 */
export function isErrorResponse(
  response: APIResult<any>,
): response is APIErrorResponse {
  return response.success === false;
}

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(
  data: any,
): data is PaginatedResponse<T> {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.data) &&
    data.pagination &&
    typeof data.pagination === "object"
  );
}
