/**
 * @fileoverview Type Definitions
 * @module src/types/shared/api.types
 * @description This file contains TypeScript type definitions for api
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Success */
  success: true;
  /** Data */
  data: T;
  /** Message */
  message?: string;
  /** Timestamp */
  timestamp?: string;
}

/**
 * API Error Response
 */
export interface APIErrorResponse {
  /** Success */
  success: false;
  /** Error */
  error: string;
  /** Message */
  message: string;
  /** Code */
  code?: string;
  /** Status Code */
  statusCode?: number;
  /** Validation */
  validation?: ValidationError[];
  /** Timestamp */
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
  /** Data */
  data: T;
}

/**
 * Update Request (PATCH/PUT)
 */
export interface UpdateRequest<T> {
  /** Data */
  data: Partial<T>;
}

/**
 * Delete Request (DELETE)
 */
export interface DeleteRequest {
  /** Id */
  id: string;
  /** Permanent */
  permanent?: boolean;
}

/**
 * Bulk Operation Request
 */
export interface BulkOperationRequest<T = any> {
  /** Ids */
  ids: string[];
  /** Action */
  action: string;
  /** Data */
  data?: T;
}

// ==================== HTTP METHODS ====================

/**
 * HTTPMethod type
 * 
 * @typedef {Object} HTTPMethod
 * @description Type definition for HTTPMethod
 */
export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ==================== API CLIENT CONFIG ====================

/**
 * Request Configuration
 */
export interface RequestConfig {
  /** Method */
  method?: HTTPMethod;
  /** Headers */
  headers?: Record<string, string>;
  /** Params */
  params?: Record<string, any>;
  /** Data */
  data?: any;
  /** Timeout */
  timeout?: number;
  /** Retry */
  retry?: number;
  /** Cache */
  cache?: boolean;
  /** Cache T T L */
  cacheTTL?: number;
}

/**
 * API Client Configuration
 */
export interface APIClientConfig {
  /** Base U R L */
  baseURL: string;
  /** Timeout */
  timeout?: number;
  /** Headers */
  headers?: Record<string, string>;
  /** Retry */
  retry?: number;
  /** Retry Delay */
  retryDelay?: number;
}

// ==================== ERROR TYPES ====================

/**
 * API Error
 */
export class APIError extends Error {
  constructor(
    /** Message */
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
    /** Message */
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
/**
 * Checks if success response
 *
 * @param {APIResult<T>} response - The response
 *
 * @returns {any} The issuccessresponse result
 *
 * @example
 * isSuccessResponse(response);
 */

/**
 * Checks if success response
 *
 * @param {APIResult<T>} /** Response */
  response - The /**  response */
  response
 *
 * @returns {any} The issuccessresponse result
 *
 * @example
 * isSuccessResponse(/** Response */
  response);
 */

export function isSuccessResponse<T>(
  /** Response */
  response: APIResult<T>,
): response is APIResponse<T> {
  return response.success === true;
}

/**
 * Check if response is an error
 */
/**
 * Checks if error response
 *
 * @param {APIResult<any>} response - The response
 *
 * @returns {any} The iserrorresponse result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isErrorResponse(response);
 */

/**
 * Checks if error response
 *
 * @param {APIResult<any>} /** Response */
  response - The /**  response */
  response
 *
 * @returns {any} The iserrorresponse result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isErrorResponse(/** Response */
  response);
 */

export function isErrorResponse(
  /** Response */
  response: APIResult<any>,
): response is APIErrorResponse {
  return response.success === false;
}

/**
 * Check if response is paginated
 */
/**
 * Checks if paginated response
 *
 * @param {any} data - Data object containing information
 *
 * @returns {any} The ispaginatedresponse result
 *
 * @example
 * isPaginatedResponse(data);
 */

/**
 * Checks if paginated response
 *
 * @param {any} /** Data */
  data - The /**  data */
  data
 *
 * @returns {any} The ispaginatedresponse result
 *
 * @example
 * isPaginatedResponse(/** Data */
  data);
 */

export function isPaginatedResponse<T>(
  /** Data */
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
