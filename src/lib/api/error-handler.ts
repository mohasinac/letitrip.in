/**
 * Centralized Error Handler
 * Consistent error handling and formatting across the application
 */

import { AxiosError } from 'axios';
import { ApiError, ApiResponse, ValidationError } from '@/types/api';

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message;
  }

  if (isApiError(error)) {
    return error.message || error.error;
  }

  return 'An unexpected error occurred';
}

/**
 * Extract validation errors from API response
 */
export function getValidationErrors(error: unknown): ValidationError[] {
  if (isAxiosError(error)) {
    return error.response?.data?.errors || [];
  }

  if (isApiError(error)) {
    return error.errors || [];
  }

  return [];
}

/**
 * Extract HTTP status code from error
 */
export function getErrorStatus(error: unknown): number {
  if (isAxiosError(error)) {
    return error.response?.status || 500;
  }

  if (isApiError(error)) {
    return error.status;
  }

  return 500;
}

/**
 * Format error for display
 */
export function formatError(error: unknown): {
  message: string;
  status: number;
  errors?: ValidationError[];
} {
  return {
    message: getErrorMessage(error),
    status: getErrorStatus(error),
    errors: getValidationErrors(error),
  };
}

/**
 * Check if error is an Axios error
 */
export function isAxiosError(error: any): error is AxiosError<ApiResponse> {
  return error?.isAxiosError === true;
}

/**
 * Check if error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === 'object' &&
    'success' in error &&
    error.success === false &&
    'error' in error
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response && error.message === 'Network Error';
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  }
  return false;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  return getErrorStatus(error) === 401;
}

/**
 * Check if error is a permission error (403)
 */
export function isPermissionError(error: unknown): boolean {
  return getErrorStatus(error) === 403;
}

/**
 * Check if error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
  return getErrorStatus(error) === 404;
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status === 422 || status === 400;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status >= 500 && status < 600;
}

/**
 * Log error appropriately based on type
 */
export function logError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : '';
  const formatted = formatError(error);

  if (isServerError(error)) {
    console.error(`${prefix} Server Error [${formatted.status}]:`, formatted.message);
  } else if (isValidationError(error)) {
    console.warn(`${prefix} Validation Error:`, formatted.message, formatted.errors);
  } else if (isNetworkError(error)) {
    console.error(`${prefix} Network Error:`, formatted.message);
  } else if (isAuthError(error)) {
    console.warn(`${prefix} Authentication Error:`, formatted.message);
  } else {
    console.error(`${prefix} Error [${formatted.status}]:`, formatted.message);
  }
}

/**
 * Create a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }

  if (isAuthError(error)) {
    return 'You need to be logged in to perform this action.';
  }

  if (isPermissionError(error)) {
    return 'You don\'t have permission to perform this action.';
  }

  if (isNotFoundError(error)) {
    return 'The requested resource was not found.';
  }

  if (isServerError(error)) {
    return 'Something went wrong on our end. Please try again later.';
  }

  return getErrorMessage(error);
}

/**
 * Create standardized ApiError from any error
 */
export function toApiError(error: unknown): ApiError {
  const formatted = formatError(error);

  return {
    success: false,
    error: formatted.message,
    message: getUserFriendlyMessage(error),
    status: formatted.status,
    errors: formatted.errors,
  };
}

/**
 * Error handler for React components
 * Returns a tuple of [error message, validation errors]
 */
export function handleComponentError(
  error: unknown
): [string, ValidationError[] | undefined] {
  const formatted = formatError(error);
  const userMessage = getUserFriendlyMessage(error);

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    logError(error, 'ComponentError');
  }

  return [userMessage, formatted.errors];
}

/**
 * Error handler for API routes (server-side)
 * Logs error and returns appropriate response
 */
export function handleApiRouteError(error: unknown): ApiError {
  // Log all errors on server
  logError(error, 'APIRoute');

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && isServerError(error)) {
    return {
      success: false,
      error: 'Internal Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      status: 500,
    };
  }

  return toApiError(error);
}

/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = (error) => isServerError(error) || isNetworkError(error) || isTimeoutError(error),
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt or if we shouldn't retry this error
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay with backoff, but don't exceed maxDelay
      delay = Math.min(delay * backoffFactor, maxDelay);

      // Log retry attempt
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      }
    }
  }

  throw lastError;
}

export default {
  getErrorMessage,
  getValidationErrors,
  getErrorStatus,
  formatError,
  getUserFriendlyMessage,
  toApiError,
  handleComponentError,
  handleApiRouteError,
  logError,
  isAxiosError,
  isApiError,
  isNetworkError,
  isTimeoutError,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  isValidationError,
  isServerError,
  retryWithBackoff,
};
