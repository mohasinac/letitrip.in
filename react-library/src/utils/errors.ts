/**
 * Error handling utilities and custom error classes
 * Framework-agnostic error types for consistent error handling
 */

export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_FIELD = "MISSING_FIELD",

  // Authentication errors (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",

  // Authorization errors (403)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Resource errors (404)
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

  // Conflict errors (409)
  CONFLICT = "CONFLICT",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Server errors (500)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",

  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",

  // Business logic errors
  BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  AUCTION_ENDED = "AUCTION_ENDED",
  PRODUCT_OUT_OF_STOCK = "PRODUCT_OUT_OF_STOCK",

  // Generic
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    context?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.isOperational = isOperational;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors?: Record<string, string[]>,
    context?: Record<string, any>
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, context);
    this.errors = errors;
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    context?: Record<string, any>
  ) {
    super(message, code, 401, context);
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "Access forbidden",
    context?: Record<string, any>
  ) {
    super(message, ErrorCode.FORBIDDEN, 403, context);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    code: ErrorCode = ErrorCode.NOT_FOUND,
    context?: Record<string, any>
  ) {
    super(message, code, 404, context);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource conflict",
    code: ErrorCode = ErrorCode.CONFLICT,
    context?: Record<string, any>
  ) {
    super(message, code, 409, context);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = "Rate limit exceeded",
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, context);
    this.retryAfter = retryAfter;
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error", context?: Record<string, any>) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, context, false);
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(
    message: string = "Network error occurred",
    code: ErrorCode = ErrorCode.NETWORK_ERROR,
    context?: Record<string, any>
  ) {
    super(message, code, 503, context);
  }
}

/**
 * Business logic error
 */
export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.BUSINESS_LOGIC_ERROR,
    context?: Record<string, any>
  ) {
    super(message, code, 422, context);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is operational
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Extract user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Extract error code from any error
 */
export function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof AppError) {
    return error.code;
  }

  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Extract status code from any error
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  return 500;
}

/**
 * Create error response object
 */
export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  statusCode: number;
  context?: Record<string, any>;
  errors?: Record<string, string[]>;
}

export function createErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ValidationError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      errors: error.errors,
    };
  }

  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
    };
  }

  return {
    error: getErrorMessage(error),
    code: ErrorCode.UNKNOWN_ERROR,
    statusCode: 500,
  };
}
