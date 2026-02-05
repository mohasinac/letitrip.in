/**
 * Error Codes Constants
 * 
 * Centralized error codes for consistent error handling across the application.
 * Use these codes with error classes for structured error responses.
 * 
 * @example
 * ```ts
 * import { ERROR_CODES, ERROR_MESSAGES } from '@/lib/errors';
 * throw new ApiError(401, ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]);
 * ```
 */

export const ERROR_CODES = {
  // Authentication (AUTH_XXX)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_UNAUTHORIZED: 'AUTH_003',
  AUTH_SESSION_EXPIRED: 'AUTH_004',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_005',
  
  // Validation (VAL_XXX)
  VALIDATION_INVALID_EMAIL: 'VAL_001',
  VALIDATION_REQUIRED_FIELD: 'VAL_002',
  VALIDATION_INVALID_PHONE: 'VAL_003',
  VALIDATION_PASSWORD_WEAK: 'VAL_004',
  VALIDATION_PASSWORD_MISMATCH: 'VAL_005',
  VALIDATION_INVALID_INPUT: 'VAL_006',
  
  // User (USER_XXX)
  USER_NOT_FOUND: 'USER_001',
  USER_ALREADY_EXISTS: 'USER_002',
  USER_UPDATE_FAILED: 'USER_003',
  USER_DELETE_FAILED: 'USER_004',
  
  // Database (DB_XXX)
  DB_CONNECTION_FAILED: 'DB_001',
  DB_QUERY_FAILED: 'DB_002',
  DB_TRANSACTION_FAILED: 'DB_003',
  
  // Email (EMAIL_XXX)
  EMAIL_SEND_FAILED: 'EMAIL_001',
  EMAIL_INVALID_TOKEN: 'EMAIL_002',
  EMAIL_TOKEN_EXPIRED: 'EMAIL_003',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_004',
  
  // Password (PWD_XXX)
  PASSWORD_INCORRECT: 'PWD_001',
  PASSWORD_RESET_FAILED: 'PWD_002',
  PASSWORD_TOKEN_INVALID: 'PWD_003',
  PASSWORD_TOKEN_EXPIRED: 'PWD_004',
  PASSWORD_TOKEN_USED: 'PWD_005',
  
  // Authorization (AUTHZ_XXX)
  AUTHZ_FORBIDDEN: 'AUTHZ_001',
  AUTHZ_INSUFFICIENT_PERMISSIONS: 'AUTHZ_002',
  
  // Generic (GEN_XXX)
  GEN_INTERNAL_ERROR: 'GEN_001',
  GEN_NOT_FOUND: 'GEN_002',
  GEN_BAD_REQUEST: 'GEN_003',
  GEN_NETWORK_ERROR: 'GEN_004',
  GEN_TIMEOUT: 'GEN_005',
  GEN_UNKNOWN: 'GEN_999',
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Your session has expired',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'You must be logged in to access this resource',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please login again',
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address to continue',
  
  // Validation
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 'Please enter a valid email address',
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'This field is required',
  [ERROR_CODES.VALIDATION_INVALID_PHONE]: 'Please enter a valid phone number',
  [ERROR_CODES.VALIDATION_PASSWORD_WEAK]: 'Password does not meet security requirements',
  [ERROR_CODES.VALIDATION_PASSWORD_MISMATCH]: 'Passwords do not match',
  [ERROR_CODES.VALIDATION_INVALID_INPUT]: 'Invalid input provided',
  
  // User
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.USER_ALREADY_EXISTS]: 'A user with this email already exists',
  [ERROR_CODES.USER_UPDATE_FAILED]: 'Failed to update user profile',
  [ERROR_CODES.USER_DELETE_FAILED]: 'Failed to delete user',
  
  // Database
  [ERROR_CODES.DB_CONNECTION_FAILED]: 'Database connection failed',
  [ERROR_CODES.DB_QUERY_FAILED]: 'Database query failed',
  [ERROR_CODES.DB_TRANSACTION_FAILED]: 'Database transaction failed',
  
  // Email
  [ERROR_CODES.EMAIL_SEND_FAILED]: 'Failed to send email',
  [ERROR_CODES.EMAIL_INVALID_TOKEN]: 'Invalid verification token',
  [ERROR_CODES.EMAIL_TOKEN_EXPIRED]: 'Verification token has expired',
  [ERROR_CODES.EMAIL_ALREADY_VERIFIED]: 'Email is already verified',
  
  // Password
  [ERROR_CODES.PASSWORD_INCORRECT]: 'Current password is incorrect',
  [ERROR_CODES.PASSWORD_RESET_FAILED]: 'Failed to reset password',
  [ERROR_CODES.PASSWORD_TOKEN_INVALID]: 'Invalid reset token',
  [ERROR_CODES.PASSWORD_TOKEN_EXPIRED]: 'Reset token has expired',
  [ERROR_CODES.PASSWORD_TOKEN_USED]: 'Reset token has already been used',
  
  // Authorization
  [ERROR_CODES.AUTHZ_FORBIDDEN]: 'You do not have permission to access this resource',
  [ERROR_CODES.AUTHZ_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  
  // Generic
  [ERROR_CODES.GEN_INTERNAL_ERROR]: 'An unexpected error occurred',
  [ERROR_CODES.GEN_NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.GEN_BAD_REQUEST]: 'Invalid request',
  [ERROR_CODES.GEN_NETWORK_ERROR]: 'Network error. Please check your connection',
  [ERROR_CODES.GEN_TIMEOUT]: 'Request timed out',
  [ERROR_CODES.GEN_UNKNOWN]: 'An unknown error occurred',
} as const;
