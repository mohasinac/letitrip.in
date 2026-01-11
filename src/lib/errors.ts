/**
 * Typed Error Classes for Application
 *
 * Provides structured error handling with error codes and HTTP status codes.
 * All errors extend from AppError base class.
 */

/**
 * Error codes for different error types
 */
export const ErrorCode = {
  // Validation Errors (1000-1999)
  VALIDATION_ERROR: 1000,
  INVALID_INPUT: 1001,
  MISSING_REQUIRED_FIELD: 1002,
  INVALID_FORMAT: 1003,

  // Authentication Errors (2000-2999)
  AUTH_ERROR: 2000,
  UNAUTHORIZED: 2001,
  INVALID_CREDENTIALS: 2002,
  TOKEN_EXPIRED: 2003,
  INVALID_TOKEN: 2004,
  SESSION_EXPIRED: 2005,
  ACCOUNT_LOCKED: 2006,
  EMAIL_NOT_VERIFIED: 2007,

  // Authorization Errors (3000-3999)
  FORBIDDEN: 3000,
  INSUFFICIENT_PERMISSIONS: 3001,
  RESOURCE_ACCESS_DENIED: 3002,

  // Not Found Errors (4000-4999)
  NOT_FOUND: 4000,
  USER_NOT_FOUND: 4001,
  PRODUCT_NOT_FOUND: 4002,
  ORDER_NOT_FOUND: 4003,
  SHOP_NOT_FOUND: 4004,
  RESOURCE_NOT_FOUND: 4005,

  // Network Errors (5000-5999)
  NETWORK_ERROR: 5000,
  REQUEST_FAILED: 5001,
  TIMEOUT: 5002,
  CONNECTION_ERROR: 5003,

  // Server Errors (6000-6999)
  INTERNAL_ERROR: 6000,
  DATABASE_ERROR: 6001,
  EXTERNAL_SERVICE_ERROR: 6002,

  // Business Logic Errors (7000-7999)
  BUSINESS_ERROR: 7000,
  INSUFFICIENT_STOCK: 7001,
  PAYMENT_FAILED: 7002,
  ORDER_CANCELLED: 7003,
  DUPLICATE_ENTRY: 7004,
  OPERATION_NOT_ALLOWED: 7005,
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: ErrorCodeType,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON representation
   */
  toJSON() {
    const result: Record<string, any> = {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
    };
    if (this.details) {
      result.details = this.details;
    }
    return result;
  }
}

/**
 * Validation error - for invalid input data
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    code: ErrorCodeType = ErrorCode.VALIDATION_ERROR,
    details?: unknown
  ) {
    super(message, code, 400, true, details);
  }
}

/**
 * Authentication error - for auth failures
 */
export class AuthError extends AppError {
  constructor(
    message: string = "Authentication failed",
    code: ErrorCodeType = ErrorCode.AUTH_ERROR,
    details?: unknown
  ) {
    super(message, code, 401, true, details);
  }
}

/**
 * Authorization error - for permission issues
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "Access denied",
    code: ErrorCodeType = ErrorCode.FORBIDDEN,
    details?: unknown
  ) {
    super(message, code, 403, true, details);
  }
}

/**
 * Not found error - for missing resources
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    code: ErrorCodeType = ErrorCode.NOT_FOUND,
    details?: unknown
  ) {
    super(message, code, 404, true, details);
  }
}

/**
 * Network error - for network/connectivity issues
 */
export class NetworkError extends AppError {
  constructor(
    message: string = "Network request failed",
    code: ErrorCodeType = ErrorCode.NETWORK_ERROR,
    details?: unknown
  ) {
    super(message, code, 503, true, details);
  }
}

/**
 * Database error - for database operation failures
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    code: ErrorCodeType = ErrorCode.DATABASE_ERROR,
    details?: unknown
  ) {
    super(message, code, 500, false, details);
  }
}

/**
 * Business logic error - for domain-specific errors
 */
export class BusinessError extends AppError {
  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.BUSINESS_ERROR,
    statusCode: number = 400,
    details?: unknown
  ) {
    super(message, code, statusCode, true, details);
  }
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard for ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard for AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Type guard for AuthorizationError
 */
export function isAuthorizationError(
  error: unknown
): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Type guard for NotFoundError
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Type guard for NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard for DatabaseError
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Type guard for BusinessError
 */
export function isBusinessError(error: unknown): error is BusinessError {
  return error instanceof BusinessError;
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.INTERNAL_ERROR, 500, false, {
      originalError: error.name,
    });
  }

  return new AppError(
    "An unknown error occurred",
    ErrorCode.INTERNAL_ERROR,
    500,
    false,
    { originalError: error }
  );
}

/**
 * Error handler utility for consistent error responses
 */
export function handleError(error: unknown): {
  message: string;
  code: ErrorCodeType;
  statusCode: number;
  details?: unknown;
} {
  const appError = toAppError(error);

  const result: {
    message: string;
    code: ErrorCodeType;
    statusCode: number;
    details?: unknown;
  } = {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
  };
  if (appError.details) {
    result.details = appError.details;
  }
  return result;
}
